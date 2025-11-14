import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaRegUserCircle } from "react-icons/fa";
import UserProfileAvatarEdit from '../../components/UserProfileAvatarEdit';
import SummaryApi from '../config/summaryApi';
import AxiosToastError from '../../utils/AxiosToastError';
import Axios from '../../utils/Axios';
import toast from 'react-hot-toast';
import { setUserDetails } from '../../store/userSlice';
import fetchUserDetails from '../../utils/fetchUserDetails';

const Profile = () => {
    const user = useSelector(state => state.user);
    // console.log("Userssss:",user)
    const dispatch = useDispatch()
    const [openProfileEdit,setProfileEdit] = useState(false)
    const [userData,setUserData] = useState({
        name:user.name  || "",
        email:user.email  || "" ,
        mobile:user.mobile  || "",

    })
    const[loading,setLoading]=useState(false)
    const handleSubmit = async(e) =>{
        e.preventDefault();
        try{
            setLoading(true);
            // Normalize email and name to lowercase
            const payload = {
                ...userData,
                name: userData.name ? userData.name.trim() : userData.name,
                email: userData.email ? userData.email.toLowerCase().trim() : userData.email
            };
            // userDetails
            const response = await Axios({
                ...SummaryApi.updateUserDetails,
                data:payload
            });
            const {data:responseData} =response;
            if(responseData.success){
                toast.success(responseData.message)
                const userData = await fetchUserDetails()
                dispatch(setUserDetails(userData.data))
            }
            
        }catch(error){
            AxiosToastError(error)
        }finally{
            setLoading(false)
        }

    }

    useEffect(()=>{
        setUserData({
            name:user.name || "" ,
        email:user.email || "" ,
        mobile:user.mobile || "" ,
        })
    },[user])

    const handleOnChange = (e) =>{
        const {name,value} = e.target;
        setUserData((preve)=>{
            return{
                ...preve,
                [name]:value
            }
        })
    }
    return (
    <div className='p-4'>
        {/* profile upload display image */}
        <div className='w-20 h-20 bg-red-600 flex items-center justify-center rounded-full overflow-hidden drop-shadow-lg'>
            {
                user.avatar ? (
                    <img src={user.avatar}
                        alt='user-avatar'
                        className='w-full h-full'
                    />
                ):(
                    <FaRegUserCircle size={65}/>
                )
            }
            
        </div>
        <button onClick={()=>setProfileEdit(true)}  className='text-sm min-w-20 
        hover:border-violet-300 hover:bg-violet-700 hover:text-white cursor-pointer border px-3 py-1 rounded-full mt-3 '>Edit</button>
        {
            openProfileEdit && (
                <UserProfileAvatarEdit close={()=>setProfileEdit(false)}/>

            )
        }
        {/* name,mobile , email */}
        <form onSubmit={handleSubmit} className='grid gap-4 my-4'>
            <div className='grid'>
                <label htmlFor="name">Name</label>
                <input type="text"
                    placeholder='Enter Your Name'
                    className='p-2 bg-blue-50 outline-none border rounded focus-within:border-violet-500'
                    value={userData.name}
                    id='name'
                    name='name'
                    onChange={handleOnChange}
                    required
                    />
            </div>


            <div className='grid'>
                <label htmlFor="email">Email</label>
                <input type="email"
                    id='email'
                    required

                    placeholder='Enter Your Email'
                    className='p-2 bg-blue-50 outline-none border rounded focus-within:border-violet-500'
                    value={userData.email}
                    name='email'
                    onChange={handleOnChange}
                    />
            </div>


            <div className='grid'>
                <label htmlFor="mobile">Mobile</label>
                <input type="number"
                    id='mobile'
                    required

                    placeholder='Enter Your Mobile'
                    className='p-2 bg-blue-50 outline-none border rounded focus-within:border-violet-500'
                    value={userData.mobile}
                    name='mobile'
                    onChange={handleOnChange}
                    />
            </div>

            <button className='border px-4 py-2 font-semibold cursor-pointer hover:bg-green-500 hover:text-white'>
                {loading?"Loading....":"Submit"}
            </button>
        </form>
    </div>
  )
}

export default Profile