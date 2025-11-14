import React from 'react'
import { useForm} from "react-hook-form"
import { MdClose } from "react-icons/md";
import Axios from '../utils/Axios';
import SummaryApi from '../src/config/summaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import toast from 'react-hot-toast';
import { useGlobalContext } from '../src/provider/GlobalProvider';


const AddAddress = ({close}) => {
    const { register ,handleSubmit,reset} = useForm()
    const {fetchAddress}=useGlobalContext();
    const onSubmit = async(data)=>{
        console.log(data)
        try{
            const response = await Axios({
                ...SummaryApi.createAddress,
                data:{
                    address_line:data.addressline,
                    city:data.city,
                    state:data.state,
                    country:data.country,
                    pincode:data.pincode,
                    mobile:data.mobile
                }
            })
            const {data:responseData}=response;
            if(responseData.success){
                toast.success(responseData.message);
                fetchAddress();
                close();
                reset();
            }
        }catch(error){
            AxiosToastError(error)
        }
    }
  return (
    <section className='overflow-auto h-[100vh] bg-neutral-700/70 z-50 fixed top-0 bottom-0 left-0 right-0'>
        <div className='bg-white p-4 w-full max-w-lg mt-8 mx-auto rounded'>
            <div className='flex items-center justify-between'>
                <h2 className='font-semibold text-xl'>Add Address</h2>
                <MdClose className='cursor-pointer hover:text-red-500' onClick={close} size={26}/>
            </div>
            <form action="" className='grid gap-4 mt-4' onSubmit={handleSubmit(onSubmit)}>
                <div className='grid gap-2'>
                    <label htmlFor="addressline">Address Line:</label>
                    <input 
                        type="text" 
                        name="" 
                        id="addressline" 
                        className='border-[0.9px] bg-blue-50 p-2 rounded focus-within:border-violet-600'
                        {...register("addressline",{required:true})}
                    />
                </div>
                <div className='grid gap-2'>
                    <label htmlFor="city">City :</label>
                    <input 
                        type="text" 
                        name="" 
                        id="city" 
                        className='border-[0.9px] bg-blue-50 p-2 rounded focus-within:border-violet-600'
                        {...register("city",{required:true})}
                    />
                </div>
                <div className='grid gap-2'>
                    <label htmlFor="state">State :</label>
                    <input 
                        type="text" 
                        name="" 
                        id="state" 
                        className='border-[0.9px] bg-blue-50 p-2 rounded focus-within:border-violet-600'
                        {...register("state",{required:true})}
                    />
                </div>
                <div className='grid gap-2'>
                    <label htmlFor="pincode">Pincode :</label>
                    <input 
                        type="text" 
                        name="" 
                        id="pincode" 
                        className='border-[0.9px] bg-blue-50 p-2 rounded focus-within:border-violet-600'
                        {...register("pincode",{required:true})}
                    />
                </div>
                <div className='grid gap-2'>
                    <label htmlFor="country">Country :</label>
                    <input 
                        type="text" 
                        name="" 
                        id="country" 
                        className='border-[0.9px] bg-blue-50 p-2 rounded focus-within:border-violet-600'
                        {...register("country",{required:true})}
                    />
                </div>
                <div className='grid gap-2'>
                    <label htmlFor="mobile">Mobile Number :</label>
                    <input 
                        type="text" 
                        name="" 
                        id="mobile" 
                        className='border-[0.9px] bg-blue-50 p-2 rounded focus-within:border-violet-600'
                        {...register("mobile",{required:true})}
                    />
                </div>
                <button type='submit' className="rounded bg-green-500 text-white cursor-pointer w-full py-2 font-semibold hover:bg-green-600">Submit</button>
            </form>

        </div>
    </section>
  )
}

export default AddAddress