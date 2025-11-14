import React, { useState, useEffect } from 'react'
import DisplayPriceInRupees from '../../utils/displayIndianPrice'
import { useGlobalContext } from '../provider/GlobalProvider';
import AddAddress from '../../components/AddAddress';
import { useSelector } from 'react-redux';
import AxiosToastError from '../../utils/AxiosToastError';
import Axios from '../../utils/Axios';
import SummaryApi from '../config/summaryApi';
import toast from 'react-hot-toast';
import {useNavigate} from "react-router-dom"
import {loadStripe } from '@stripe/stripe-js'

const CheckoutPage = () => {
    const { notDiscountTotalPrice, totalPrice,fetchOrder, totalQty ,fetchCartItems } = useGlobalContext();
    const [openAddAddress, setOpenAddAddress] = useState(false)
    const addressList = useSelector(state => state.addresses.addressList)
    // console.log(addressList)
    const [selectedAddress, setSelectedAddress] = useState(addressList && addressList.length > 0 ? 0 : null)
    // const 
    const cartItemsList = useSelector(state => state.cartItem.cart)
    const navigate = useNavigate()
    
    // Update selectedAddress when addressList changes (e.g., when a new address is added)
    useEffect(() => {
        if (addressList && addressList.length > 0 && (selectedAddress === null || !addressList[selectedAddress])) {
            setSelectedAddress(0)
        }
    }, [addressList, selectedAddress])
    
    console.log()
    const handleCashOnDelivery = async() => {
        console.log(addressList[selectedAddress])
        try{
            if (selectedAddress === null || !addressList[selectedAddress]) {
                toast.error("Please select an address")
                return
            }
            const response = await Axios({
                ...SummaryApi.cashOnDelivery,
                data:{
                    list_items:cartItemsList,
                    addressId:addressList[selectedAddress]?._id,
                    subTotalAmt:Math.abs(totalPrice), // Ensure positive value
                    totalAmt : Math.abs(totalPrice), // Ensure positive value
                }
            })

            const {data:responseData}=response;

            if(responseData.success){
                toast.success(responseData.message)
                if(fetchCartItems){ fetchCartItems()}
                if(fetchOrder){fetchOrder()}
                navigate("/success",{
                    state:{
                        text:"Order"
                    }
                })
            }
        }catch(error){
            AxiosToastError(error)
        }
    }
    const handleOnlinePayment = async()=>{
        
       
        

        try{
            if (selectedAddress === null || !addressList[selectedAddress]) {
                toast.error("Please select an address")
                return
            }
            toast.loading("Loading.....")
            const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
            const stripePromise = await loadStripe(stripePublishableKey)
            const response = await Axios({
                ...SummaryApi.payment_url,
                data:{
                    list_items:cartItemsList,
                    addressId:addressList[selectedAddress]?._id,
                    subTotalAmt:Math.abs(totalPrice), // Ensure positive value
                    totalAmt : Math.abs(totalPrice), // Ensure positive value
                }
            })
            const {data:responseData}=response;

            stripePromise.redirectToCheckout({sessionId:responseData.id})
            
            // Note: fetchCartItems and fetchOrder will be called in Success page after payment
        }catch(error){
            AxiosToastError(error)
        }
    }
    return (
        <section className='bg-blue-50'>
            <div className='container  mx-auto p-4 flex flex-col lg:flex-row w-full gap-5 justify-between'>
                <div className='w-full '>
                    {/* Address? */}
                    <h3 className='text-lg font-semibold'>Choose Your Address</h3>
                    <div className='bg-white p-2 grid gap-5'>
                        {
                            addressList.map((address, index) => {
                                return (
                                    <label htmlFor={"address" + index}>
                                        <div key={index} className='cursor-pointer hover:bg-slate-100 flex gap-3 border-[0.9px] rounded p-3'>
                                            <div>
                                                <input type="radio"
                                                    id={"address" + index}
                                                    value={index}
                                                    checked={selectedAddress === index}
                                                    onChange={(e) => setSelectedAddress(Number(e.target.value))}
                                                    name="address"
                                                />
                                            </div>
                                            <div>
                                                <p>{address.address_line}</p>
                                                <p>{address.city}</p>
                                                <p>{address.state}</p>
                                                <p>{address.country}-{address.pincode}</p>
                                                <p>{address.mobile}</p>
                                            </div>
                                        </div>
                                    </label>
                                )

                            })
                        }
                        <div onClick={() => setOpenAddAddress(true)} className='rounded cursor-pointer flex justify-center items-center  border-neutral-300  h-16 bg-blue-50 border-2 border-dashed'>
                            Add Address
                        </div>
                    </div>


                </div>

                <div className='w-full max-w-md bg-white py-4 px-2 '>
                    {/* Details of product */}
                    <h3 className='text-lg font-semibold'>Order Summary</h3>
                    <div className='bg-white p-4 '>
                        <h3 className='font-semibold'>Bill Details:</h3>
                        <div className='flex gap-4 justify-between'>
                            <p>Items Total :</p>
                            <p className='flex items-center gap-2'><span className='text-neutral-400 line-through'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span><span>{DisplayPriceInRupees(totalPrice)}</span></p>
                        </div>
                        <div className='flex gap-4 justify-between'>
                            <p>Quantity :</p>
                            <p className='flex items-center gap-2'><span>{totalQty} items</span></p>
                        </div>
                        <div className='flex gap-4 justify-between'>
                            <p>Delivery Charges :</p>
                            <p className='flex items-center gap-2'>
                                <span className='text-neutral-400 line-through'>{Math.trunc(totalPrice / 6)}</span>
                                <span>Free</span>
                            </p>
                        </div>
                        <div className='flex gap-4 justify-between'>
                            <p className='font-semibold'>Grand Total :</p>
                            <p className='flex items-center gap-2 font-semibold'>
                                {DisplayPriceInRupees(totalPrice)}
                            </p>
                        </div>
                    </div>
                    <div className='w-full max-w-md flex flex-col gap-4'>
                        <button onClick={handleOnlinePayment} className='py-2 px-4 rounded bg-green-500 hover:bg-green-600 cursor-pointer text-white font-semibold'>Online Payment</button>
                        <button onClick={handleCashOnDelivery} className='py-2 px-4 hover:text-white rounded border-2 border-green-500 text-green-500 hover:bg-green-600 cursor-pointer font-semibold'>Cash On Delivery</button>
                    </div>
                </div>
            </div>



            {
                openAddAddress && (
                    <AddAddress close={() => setOpenAddAddress(false)} />
                )
            }
        </section>
    )
}

export default CheckoutPage



