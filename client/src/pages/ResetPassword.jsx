import React, { useEffect , useState} from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiEyeOff } from "react-icons/fi";
import { FiEye } from "react-icons/fi";
import SummaryApi from '../config/summaryApi';
import Axios from '../../utils/Axios';
import toast from 'react-hot-toast';
const ResetPassword = () => {
    const location = useLocation();
    const [data,setData] = useState({
        email:"",
        newPassword:"",
        confirmPassword:""

    })
        const [showPassword,setShowPassword] = useState(false) 
    
        const validValue = Object.values(data).every(el => el)
        useEffect(()=>{
        if(!location?.state?.data?.success){
            navigate("/") 
        }
        if(location?.state?.email){
            setData((preve)=>{
                return{
                    ...preve,
                    email:location?.state?.email
                }
            })
        }
    },[])
         const handleChange = (e) =>{
        const {name,value} = e.target;
        setData((prev)=>{
            return{ ...prev,
            [name]:value}
        })
    }
const handleSubmit= async(e)=>{
        e.preventDefault();
        
        if(data.newPassword!==data.confirmPassword){
            toast.error("New Password and Confirm Password not same")
            return
        }    
        try{
            const payload = {
                ...data,
                email: data.email.toLowerCase().trim()
            };
            const response = await Axios({
                ...SummaryApi.resetPassword,//change
                data:payload,
            })
            if(response.data.error){
                toast.error(response.data.message)
            }
            if(response.data.success){
                toast.success(response.data.message)
                navigate("/login");
                setData({             
                    email:"",
                    newPassword:"",
                    confirmPassword:""
                })
                
            }
            console.log("res:",response)

        }catch(error){
            AxiosToastError(error)
        }

    }  
    const navigate = useNavigate();
    console.log("location",location)
    
    console.log("data Reset",data)
  return (
    <section className='w-full container mx-auto px-2 '>
        <div className='bg-white my-4  w-full max-w-lg mx-auto rounded p-4'>
            <p className='font-semibold text-3xl text-center
            '>Enter New Password</p>

            <form className='grid gap-5 py-8' onSubmit={handleSubmit}>
                
                <div className='grid gap-5'>
                    <div className='grid gap-2'>
                                        <label htmlFor="newPassword">New Password</label>
                                        <div className='bg-blue-50 p-2 border-[1.55px] rounded flex items-center focus-within:border-green-700 '>
                                            <input  
                                                id='newPassword'
                                                type={showPassword?"text":"password"}
                                                className='w-full outline-none'
                                                value={data.newPassword}
                                                placeholder='Enter Your Password'
                                                name='newPassword'
                                                onChange={handleChange}
                                                />
                                            <div onClick={()=>{setShowPassword(prev => !prev)}} className='hover:cursor-pointer'>
                                                {
                                                    showPassword ? (<FiEye/>):(<FiEyeOff/>)
                                                }
                                                
                                            </div>
                                        </div>
                                    </div>
                                    {/* //confirm */}
                                    <div className='grid gap-2'>
                                        <label htmlFor="confirmPassword">Confirm Password</label>
                                        <div className='bg-blue-50 p-2 border-[1.55px] rounded flex items-center focus-within:border-green-700 '>
                                            <input  
                                                id='confirmPassword'
                                                type={showPassword?"text":"password"}
                                                className='w-full outline-none'
                                                value={data.confirmPassword}
                                                placeholder='Enter Your Password'
                    
                                                name='confirmPassword'
                                                onChange={handleChange}
                                                />
                                            <div onClick={()=>{setShowPassword(prev => !prev)}} className='hover:cursor-pointer'>
                                                {
                                                    showPassword ? (<FiEye/>):(<FiEyeOff/>)
                                                }
                                                
                                            </div>
                                        </div>
                                    </div>
                </div>
                

                <button disabled={!validValue} className={`${validValue ?"bg-violet-700" :"bg-gray-500"} hover:cursor-pointer text-white py-3 rounded mx-auto px-5 font-semibold my-3 tracking-wider`}>Change Password</button>
            </form>

            <p>Already Have an Account? <Link to={"/login"} className='font-semibold text-green-800 underline'>Login</Link></p>
        </div>
    </section>
  )
}

export default ResetPassword