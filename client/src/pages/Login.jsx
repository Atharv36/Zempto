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
import fetchUserDetails from '../../utils/fetchUserDetails'
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../../store/userSlice';

const Login = () => {
    const [showPassword,setShowPassword] = useState(false) 
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [data,setData]=useState({
        email:"",
        password:"",
        
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
                ...SummaryApi.login,
                data:payload,
            })
            if(response.data.error){
                toast.error(response.data.message)
            }
            if(response.data.success){
                toast.success(response.data.message)
                localStorage.setItem('accessToken',response.data.data.accessToken)
                localStorage.setItem('refreshToken',response.data.data.refreshToken)

                const userDetails = await fetchUserDetails()
                dispatch(setUserDetails(userDetails.data))

                setData({             
                    email:"",
                    password:"",
                })
                navigate("/");
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
            '>Login</p>

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
                <div className='grid gap-2'>
                    <label htmlFor="password">Password</label>
                    <div className='bg-blue-50 p-2 border-[1.55px] rounded flex items-center focus-within:border-green-700 '>
                        <input  
                            id='password'
                            type={showPassword?"text":"password"}
                            className='w-full outline-none'
                            value={data.password}
                            placeholder='Enter Your Password'

                            name='password'
                            onChange={handleChange}
                            />
                        <div onClick={()=>{setShowPassword(prev => !prev)}} className='hover:cursor-pointer'>
                            {
                                showPassword ? (<FiEye/>):(<FiEyeOff/>)
                            }
                            
                        </div>
                    </div>
                        <Link to={"/forgot-password"} className='text-[1.1rem] block ml-auto hover:text-violet-700 underline'>Forgot Password?</Link>
                </div>

                <button disabled={!validValue} className={`${validValue ?"bg-violet-700" :"bg-gray-500"} hover:cursor-pointer text-white py-3 rounded mx-auto px-5 font-semibold my-3 tracking-wider`}>Login</button>
            </form>

            <p>Don't Have an Account? <Link to={"/register"} className='font-semibold text-green-800 underline'>Register</Link></p>
        </div>
    </section>
  )
}

export default Login