
import React, { useState } from 'react'
import { FiEyeOff } from "react-icons/fi";
import { FiEye } from "react-icons/fi";
import toast from 'react-hot-toast';
// import axios from "axios"
import { Link } from 'react-router-dom';
import Axios from '../../utils/Axios';
import SummaryApi from '../config/summaryApi';
import AxiosToastError from '../../utils/AxiosToastError';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const navigate = useNavigate()
    const [data,setData]=useState({
        email:"",
        
    })
    const handleChange = (e) =>{
        const {name,value} = e.target;
        setData((prev)=>{
            return{ ...prev,
            [name]:value}
        })
    }
    const validValue = Object.values(data).every(el => el)
    // console.log(Object.values(data))
    // console.log(validValue)

    const handleSubmit= async(e)=>{
        e.preventDefault();    
        try{
            const payload = {
                ...data,
                email: data.email.toLowerCase().trim()
            };
            const response = await Axios({
                ...SummaryApi.forgot_password,
                data:payload,
            })
            if(response.data.error){
                toast.error(response.data.message)
            }
            if(response.data.success){
                toast.success(response.data.message)
                navigate("/verify-forgot-password-otp",{
                    state:data
                });
                setData({             
                    email:""
                })
                
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
            '>Forgot Password</p>

            <form className='grid gap-5 py-8' onSubmit={handleSubmit}>
                
                <div className='grid gap-1'>
                    <label htmlFor="email">Email</label>
                    <input  
                            id='email'
                            type="email"
                            className='bg-blue-50 p-2 border-[1.55px]  outline-none rounded focus:border-green-700'
                            value={data.email}
                            placeholder='Enter Your Email'

                            name='email'
                            onChange={handleChange}
                    />
                </div>
                

                <button disabled={!validValue} className={`${validValue ?"bg-violet-700" :"bg-gray-500"} hover:cursor-pointer text-white py-3 rounded mx-auto px-5 font-semibold my-3 tracking-wider`}>Forgot Password</button>
            </form>

            <p>Already Have an Account? <Link to={"/login"} className='font-semibold text-green-800 underline'>Login</Link></p>
        </div>
    </section>
  )
}

export default ForgotPassword