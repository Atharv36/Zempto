import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Divider from "./Divider";
import Axios from "../utils/Axios"
import SummaryApi from "../src/config/summaryApi";
import { logout } from "../store/userSlice";
import toast from "react-hot-toast"
import AxiosToastError from "../utils/AxiosToastError"
import { GoLinkExternal } from "react-icons/go";
import isAdmin from "../utils/isAdmin";


const UserMenu = ({close}) => {
    const user= useSelector((state)=>state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const handleLogOut = async() =>{
      try{
          const response = await Axios({
            ...SummaryApi.logout
          })
          if(response.data.success){
            if(close){
              close()
            }
            dispatch(logout());
            localStorage.clear()
            toast.success(response.data.message)
            navigate("/")
          }

      }catch(error){
        AxiosToastError(error)

      }
    }
    const handleClose = () =>{
      if(close){
        close()
      }
    }

  return (
    <div>
        <div className="font-semibold text-xl">My Account</div>
        <div className="text-m flex items-center gap-1">
          <span className="max-w-52 truncate line-clamp-1">
          {user.name || user.mobile}

          </span>
          <Link onClick={handleClose} to={"/dashboard/profile"} className="p-1 w-fit h-fit hover:bg-violet-700 hover:text-white"><GoLinkExternal size={15}/></Link>
          {
            user.role==="ADMIN" && (
            <span className="text-red-400">(Admin)</span> 

            )
          }
          </div>

        <Divider/>

        <div className="text-sm grid gap-2">
            {
              isAdmin(user.role) && (
                <>
                  <Link onClick={handleClose} to={"/dashboard/category"} 
                  className="px-2 py-1 hover:bg-violet-100">Category</Link>
                  <Link onClick={handleClose} to={"/dashboard/subcategory"} 
                  className="px-2 py-1 hover:bg-violet-100">Sub Category</Link>
                  <Link onClick={handleClose} to={"/dashboard/upload-product"} 
                  className="px-2 py-1 hover:bg-violet-100">Upload Product</Link>
                  <Link onClick={handleClose} to={"/dashboard/product"} 
                  className="px-2 py-1 hover:bg-violet-100">Product</Link>
                  
                  </>
              )
            }
            
            

            <Link onClick={handleClose} to={"/dashboard/myorders"} className="px-2 py-1 hover:bg-violet-100">My Orders</Link>
            <Link onClick={handleClose} to={"/dashboard/address"} className="px-2  py-1 hover:bg-violet-100">Saved Address</Link>
            <button onClick={handleLogOut} className="mt-4 text-left px-2 rounded w-fit py-1.5 bg-red-500 text-white">LogOut</button>    
        </div>
    </div>
  );
};

export default UserMenu;
