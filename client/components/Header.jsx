import React, { useEffect, useState } from 'react'
import logo from "../src/assets/Drawing.png"
import Search from './Search'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaRegUserCircle } from "react-icons/fa";
import UseMobile from '../src/hooks/useMobile';
import { IoCart } from "react-icons/io5";
import { useSelector } from 'react-redux';
import { GoTriangleDown } from "react-icons/go";
import { GoTriangleUp } from "react-icons/go";
import UserMenu from "./UserMenu.jsx";
import displayIndianPrice from "../utils/displayIndianPrice.js"
import { useGlobalContext } from '../src/provider/GlobalProvider.jsx';
import DisplayCartItems from './DisplayCartItems.jsx';

const Header = () => {
    
    const [isMobile] = UseMobile();
    const location = useLocation();
    const user = useSelector((state)=> state?.user)
    const isSearchPage = location.pathname==='/search'
    const [openUserMenu,setOpenUserMenu]=useState(false)
    const [openCartSection,setOpenCartSection]=useState(false)
    
    // const [totalPrice,setTotalPrice]=useState(0)
    // const [totalQty,setTotalQty]=useState(0)
    const {totalPrice,totalQty}=useGlobalContext()
    const cartItem = useSelector(state =>state.cartItem.cart)
    // console.log('user from store',user)
    // console.log(isSearchPage)
    // console.log(location.pathname)
    // console.log(isMobile)
    //  console.log("cartItem",cartItem)
    const handleMobileUsers = () =>{
        if(!user._id){
            navigate("/login");
            return
        }
        navigate("/user")
    }
    const navigate = useNavigate()
    const redirectToLogin = () =>{
        navigate("/login")
    }
    const handleCloseUserMenu = () =>{
        setOpenUserMenu(false)
    }

    //totalItems and totalPrice
    // useEffect(()=>{
    //     const qty = cartItem.reduce((prev,cur)=>{
    //         return prev+cur.quantity
    //     },0)
    //     setTotalQty(qty)
    //     // console.log(qty)
    //     const tPrice = cartItem.reduce((preve,cur)=>{
    //         return preve+(cur.productId.price * cur.quantity)
    //     },0)
    //     setTotalPrice(tPrice)
    // },[cartItem])
    
    return (
    <header className='h-24 lg:h-20 bg-white z-50 lg:shadow-md sticky top-0 flex flex-col justify-center gap-2'>
        {
            !(isSearchPage && isMobile) && (
                <div className='container mx-auto flex justify-between items-center px-2'>
            {/* Logo */}
            <div className='h-full'>
                <Link to={"/"} className='h-full flex justify-center items-center'>
                    <img src={logo} 
                    className="w-[120px] lg:w-[170px] lg:h-[80px] h-[40px]"
                    />
                    

                </Link>
            </div>

            {/* Search */}
            <div className='hidden lg:block'>
                <Search/>
            </div>


            {/* Login myCart */}
            <div className=''>
                {/* MobileVersion User icons */}
                <button className='text-neutral-500 lg:hidden' onClick={handleMobileUsers}>
                    <FaRegUserCircle size={30}/>
                </button>

                {/* dekstop */}
                <div className='hidden lg:flex items-center gap-7'>
                    
                    {
                        user?._id ?(
                            <div className="relative">
                                <div onClick={()=>setOpenUserMenu(preve => !preve)} className="select-none cursor-pointer flex items-center gap-1 ">
                                    <p>Account</p>
                                    {
                                        openUserMenu ?(
                                             <GoTriangleUp size={25}/>
                                            
                                        ):(
                                            <GoTriangleDown size={25}/>
                                        )
                                    }
                                    
                                </div>
                                { openUserMenu && (
                                    <div className='absolute right-0 top-12 '>
                                    <div className="bg-white rounded p-4 min-w-52 lg:shadow-lg">
                                        <UserMenu close={handleCloseUserMenu}></UserMenu>
                                    </div>
                                </div>
                                )}
                                
                            </div>
                        ):(
                            <button className='text-lg px-2 hover:cursor-pointer  w-20 h-9' onClick={redirectToLogin}>Login</button>  
                        )
                    }

                    <button onClick={()=>setOpenCartSection(true)} className='flex items-center gap-3 bg-violet px-4 py-2 rounded hover:cursor-pointer bg-violet-800 hover:bg-violet-900 text-sm text-amber-50'>
                        {/* add2Cart */}
                        <div className='animate-bounce'>   
                            <IoCart size={30}/>
                        </div>
                        <div className='font-medium '>
                            {
                                cartItem[0] ? (
                                    <div>
                                        <p>{totalQty} Items</p>
                                        <p>{displayIndianPrice(totalPrice)}</p>
                                    </div>
                                ):(
                                    <p>My Cart</p>
                                )
                            }
                        </div>
                    </button>
                </div>
            </div>


            </div>
            )
        }
        
        <div className='container mx-auto lg:hidden px-3'>
            <Search></Search>
        </div>
    
    
    {
        openCartSection && (
            <DisplayCartItems close={()=>setOpenCartSection(false)}/>
        )
    }
    
    </header>


  )
}

export default Header