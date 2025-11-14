import React from 'react'
import { IoIosClose } from "react-icons/io";
import { Link, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../src/provider/GlobalProvider';
import DisplayPriceInRupees from '../utils/displayIndianPrice';
import { GoTriangleRight } from "react-icons/go";
import { useSelector } from 'react-redux';
import AddToCartButton from './AddToCartButton';
import { PriceWithDiscount } from '../utils/PriceWithDiscount';
import EmptyCart from "../src/assets/empty_cart.webp"
import toast from 'react-hot-toast';

const DisplayCartItems = ({close}) => {
    const {notDiscountTotalPrice , totalPrice,totalQty} = useGlobalContext();
    const cartItem = useSelector(state => state.cartItem.cart);
    const user = useSelector(state => state.user);
    // console.log(user)
    const navigate = useNavigate()
    const redirectToCheckout = () =>{
        if(user?._id){
            navigate("/checkout");
            if(close)close()
            return;
        }else{
            toast.error("Please Login")
        }
    }
  return (
    <section className='bg-neutral-800/60   fixed z-50 top-0 bottom-0 left-0 right-0'>
        <div className='ml-auto  bg-white w-full max-w-sm min-h-screen max-h-screen'>
            <div className='flex py-3 items-center gap-3 p-2 justify-between shadow-md '>
                <h2 className='font-semibold text-lg'>Cart</h2>
                <Link to={"/"} className='block lg:hidden'>
                    <IoIosClose size={30}/>
                </Link>
                <button className='cursor-pointer  hidden lg:block' onClick={close}>
                        <IoIosClose size={30}/>
                </button>
                
            </div>
            <div className='px-4 min-h-[78vh] bg-blue-50  h-full lg:min-h-[82vh] max-h-[calc(100vh-120px)] p-2 flex flex-col gap-4'>
                {/* DisplasyItems */}
                {
                    cartItem[0] ? (
                        <>
                            <div className='items-center p-2 text-violet-500 bg-violet-200 rounded flex justify-between'>
                    <p>Your Total Savings :     </p>
                    <p>{DisplayPriceInRupees(notDiscountTotalPrice - totalPrice)}</p>
                </div>
                <div className='bg-white rounded p-2 grid gap-5 overflow-auto'>
                    {
                        cartItem[0] && (
                            cartItem.map((p,index)=>{
                                return(
                                    <div key={index} className='flex gap-3 w-full'>
                                        {/* img */}
                                        <div className='w-16 h-16 min-h-16 min-w-16 bg-red-400 border-[0.9px]'>
                                            <img src={p?.productId?.image[0]} 
                                            className='object-scale-down'
                                            />
                                        </div>
                                        <div className='w-full max-w-sm'>
                                            <p className='text-sm text-ellipsis line-clamp-2' >{p.productId.name}</p>
                                            <p  className='text-xs text-slate-500'>{p.productId.unit}</p>
                                            <p className='font-medium'>{DisplayPriceInRupees(PriceWithDiscount(p.productId.price,p.productId.discount))}</p>
                                        </div>
                                        <div>
                                            <AddToCartButton data={p.productId}/>
                                        </div>
                                    </div>
                                )
                            })
                        )
                    }
                </div>
                <div className='bg-white p-4 '>
                    <h3 className='font-semibold'>Bill Details:</h3>
                    <div className='flex gap-4 justify-between'>
                        <p>Items Total :</p> 
                        <p  className='flex items-center gap-2'><span className='text-neutral-400 line-through'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span><span>{DisplayPriceInRupees(totalPrice)}</span></p>
                    </div>
                    <div className='flex gap-4 justify-between'>
                        <p>Quantity :</p> 
                        <p  className='flex items-center gap-2'><span>{totalQty} items</span></p>
                    </div>
                    <div className='flex gap-4 justify-between'>
                        <p>Delivery Charges :</p> 
                        <p  className='flex items-center gap-2'>
                                    <span className='text-neutral-400 line-through'>{Math.trunc(totalPrice/6)}</span>
                                    <span>Free</span>
                        </p>
                    </div>
                        <div className='flex gap-4 justify-between'>
                        <p className='font-semibold'>Grand Total :</p> 
                        <p  className='flex items-center gap-2 font-semibold'>
                            {DisplayPriceInRupees(totalPrice)}
                        </p>
                    </div>
                    </div>
                        </>
                    ) :(
                        <div className='bg-white flex flex-col justify-center items-center '>
                            <img className='w-full h-full object-scale-down' src={EmptyCart} alt="" />
                            <Link onClick={close} to={"/"} className='bg-violet-500 hover:bg-violet-600 px-4 py-2 mb-2 text-white rounded text cursor-pointer' >Shop Now</Link>
                        </div>
                    )
                }
                
                
            </div>
            {/* proceedToPay */}
            {
            cartItem[0] && (
            <div className='p-2'>
                <div className= ' py-3 flex items-center gap-4 justify-between rounded p-2 sticky bottom-2 bg-violet-700 hover:bg-violet-800 cursor-pointer text-white'>
                    <div>
                        {DisplayPriceInRupees(totalPrice)}
                    </div>
                    
                    <button onClick={redirectToCheckout} className='flex items-center font-semibold'>Proceed<GoTriangleRight size={25}/></button>
                </div>
            </div>
                )
            }
            
        </div>
    </section>
  )
}

export default DisplayCartItems