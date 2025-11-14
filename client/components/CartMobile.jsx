import React from 'react'
import { IoCart } from "react-icons/io5";
import { useGlobalContext } from "../src/provider/GlobalProvider";
import DisplayPriceInRupees from '../utils/displayIndianPrice';
import { FaCaretRight } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';


const CartMobile = () => {
    const { totalPrice, totalQty } = useGlobalContext()
    const cartItem = useSelector(state => state.cartItem.cart)
    return (
        <>
            {
                cartItem[0] && (
                    <div className='sticky bottom-4 p-2'>
                        <Link to={'/cart'} className='lg:hidden flex items-center justify-between gap-3 bg-green-600 px-2 py-1 rounded text-white text-sm'>
                            <div className='flex items-center gap-2'>
                                <div className='p-2 bg-green-500 rounded w-fit'>
                                    <IoCart />
                                </div>
                                <div>
                                    <p>{totalQty} Items</p>
                                    <p>{DisplayPriceInRupees(totalPrice)}</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-1' >
                                <span className='text-sm'>View Cart</span>
                                <FaCaretRight />
                            </div>
                        </Link>
                    </div>
                )

            }
        </>

    )
}

export default CartMobile