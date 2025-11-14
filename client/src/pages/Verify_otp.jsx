


import React, { useEffect, useRef, useState } from 'react'
import { FiEyeOff } from "react-icons/fi";
import { FiEye } from "react-icons/fi";
import toast from 'react-hot-toast';
// import axios from "axios"
import { Link, useLocation } from 'react-router-dom';
import Axios from '../../utils/Axios';
import SummaryApi from '../config/summaryApi';
import AxiosToastError from '../../utils/AxiosToastError';
import { useNavigate } from 'react-router-dom';

const Verify_otp = () => {
    const navigate = useNavigate()
    const [data,setData]=useState(["","","","","",""])
    
    const validValue = data.every(el => el)
    const inputRef = useRef([null,null,null,null,null,null])
    const location = useLocation();

    console.log("Location",location)
    useEffect(()=>{
      if(!location?.state?.email){
        navigate("/forgot-password")
      }
    },[])
    const handleSubmit= async(e)=>{
        e.preventDefault();    
        try{
            const response = await Axios({
                ...SummaryApi.forgot_password_otp_verification,
                data:{
                  otp:data.join(""),
                  email:location?.state?.email ? location.state.email.toLowerCase().trim() : location?.state?.email
                },
            })
            if(response.data.error){
                toast.error(response.data.message)
            }
            if(response.data.success){
                toast.success(response.data.message)
                setData(["","","","","",""])
                navigate("/reset-password",{
                  state:{
                    data:response.data,
                    email:location?.state?.email,
//
                  }
                });
            }
            console.log("res:",response)

        }catch(error){
            AxiosToastError(error)
        }

    }  
    return (
    <section className='w-full container mx-auto px-2 '>
        <div className='bg-white my-4  w-full max-w-lg mx-auto rounded p-4'>
            <p className='font-semibold text-3xl text-center
            '>Enter OTP</p>

            <form className='grid gap-5 py-8' onSubmit={handleSubmit}>
                
                <div className='grid gap-1'>
                    <label htmlFor="otp">Enter Your OTP</label>
                    <div className="flex gap-6 mx-auto mt-5 ">
                      {
                        data.map((element,index)=>{
                          return(
                            <input  
                            key={"otp"+index}
                            id='otp'
                            value={data[index]}
                            ref={(ref)=>{
                              inputRef.current[index] = ref
                              return ref
                            }}
                            onChange={(e)=>{
                              const value = e.target.value;
                              const newData = [...data]
                              newData[index] = value
                              setData(newData)
                              if(value && index < 5){
                                inputRef.current[index+1].focus()
                              }

                            }}
                            type="text"
                            maxLength={1}
                            className='bg-blue-50 p-2 w-full max-w-25 border-[1.55px] text-center font-semibold  outline-none rounded focus:border-green-700'
                    />
                          )
                        })
                      }
                    </div>
                    {console.log(data)}
                </div>
                

                <button disabled={!validValue} className={`${validValue ?"bg-violet-700" :"bg-gray-500"} hover:cursor-pointer text-white py-3 rounded mx-auto px-5 font-semibold my-3 tracking-wider`}>Verify OTP</button>
            </form>

            <p>Already Have an Account? <Link to={"/login"} className='font-semibold text-green-800 underline'>Login</Link></p>
        </div>
    </section>
  )
}

export default Verify_otp


//verify-forgot-password-otp