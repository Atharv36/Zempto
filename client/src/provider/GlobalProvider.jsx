import { createContext, useContext, useEffect, useState } from "react";
import SummaryApi from "../config/summaryApi";
import Axios from "../../utils/Axios";
import { handleAddItemCart } from "../../store/cartProduct";
import { useDispatch, useSelector } from "react-redux";
import AxiosToastError from "../../utils/AxiosToastError";
import toast from "react-hot-toast";
import React from "react";
import { PriceWithDiscount } from "../../utils/PriceWithDiscount";
import { handleAddAddress } from "../../store/addressSlice";
import { setOrder } from "../../store/orderSlice";

export const GlobalContext = createContext(null);

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

// Fixed discount calculation helper


const GlobalProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [totalPrice, setTotalPrice] = useState(0);
  const [notDiscountTotalPrice, setNotDiscountTotalPrice] = useState(0);
  const user= useSelector(state => state?.user)
  const [totalQty, setTotalQty] = useState(0);
  const cartItem = useSelector(state => state.cartItem.cart);

  const fetchCartItems = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getCartItem
      });
      const { data: responseData } = response;
      if (responseData.success) {
        dispatch(handleAddItemCart(responseData.data));
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchOrder = async()=>{
    try{
      const response = await Axios({
        ...SummaryApi.getOrderItems,
      })
      const {data:responseData}=response;
      if(responseData.success){
        dispatch(setOrder(responseData.data))
      }
    }catch(error){
      console.log(error)
    }
  }
  const updateCartItem = async (id, qty) => {
    try {
      const response = await Axios({
        ...SummaryApi.updateCartItemQty,
        data: {
          _id: id,
          qty: qty
        }
      });

      const { data: responseData } = response;
      if (responseData.success) {
        // toast.success(responseData.message);
        fetchCartItems();
        return responseData
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const fetchAddress = async() =>{
    try{
      const response = await Axios({
        ...SummaryApi.getAddress
      })
      const {data:responseData}=response;
      if(responseData.success){
        dispatch(handleAddAddress(responseData.data))
      }
    }catch(error){
      AxiosToastError(error)
    }
  }
  const deleteCartItem = async (cartId) => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteCartItem,
        data: {
          _id: cartId
        }
      });
      const { data: responseData } = response;

      if (responseData.success) {
        // toast.success(responseData.message);
        fetchCartItems();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  // useEffect(() => {
  //   fetchCartItems();
  // }, []);
    const handleLogout = () =>{
    localStorage.clear();
    dispatch(handleAddItemCart([]))
  }
  useEffect(() => {
    if (cartItem.length > 0) {
      const qty = cartItem.reduce((prev, cur) => prev + cur.quantity, 0);
      setTotalQty(qty);

      const tPrice = cartItem.reduce((total, item) => {
        const priceAfterDiscount = PriceWithDiscount(
          item?.productId?.price,
          item?.productId?.discount
        );
        return total + (priceAfterDiscount * item.quantity);
      }, 0);
      setTotalPrice(tPrice);

      const originalTotalPrice = cartItem.reduce(
        (total, item) => total + (item?.productId?.price * item.quantity),
        0
      );
      setNotDiscountTotalPrice(originalTotalPrice);
    } else {
      setTotalPrice(0);
      setNotDiscountTotalPrice(0);
      setTotalQty(0);
    }
  }, [cartItem]);
  useEffect(()=>{
    fetchCartItems()
    handleLogout()
    fetchAddress()
    fetchOrder()
  },[user])
  
  return (
    <GlobalContext.Provider
      value={{
        fetchCartItems,
        updateCartItem,
        deleteCartItem,
        fetchAddress,
        totalPrice,
        totalQty,
        notDiscountTotalPrice,
        fetchOrder
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;