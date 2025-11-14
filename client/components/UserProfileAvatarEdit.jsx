import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaRegUserCircle } from "react-icons/fa";
import { useState } from 'react';
import SummaryApi from '../src/config/summaryApi';
import Axios from '../utils/Axios';
import AxiosToastError from '../utils/AxiosToastError';
import { uploadAvatar } from '../store/userSlice';
import { IoMdClose } from "react-icons/io";


const UserProfileAvatarEdit = ({close}) => {
    const dispatch = useDispatch()
  const user = useSelector(state => state.user);
  const [loading,setLoading] = useState(false)
  const handleSubmit=(e)=>{
    e.preventDefault()
  }
    const handleUploadAvatar = async(e)=>{
        const file = e.target.files[0];
        if(!file) return

        const formData = new FormData();
        formData.append('avatar',file);
        
        try{
        setLoading(true)

        const response = await Axios({
            ...SummaryApi.uploadAvatar,
            data:formData
        })
        const {data : responseData} = response
        dispatch(uploadAvatar(responseData.data.avatar))
        // console.log(response)

        }catch(error){
            AxiosToastError(error)
        }finally{

            setLoading(false)
        }
        


  }
  return (
    // Background overlay: semi-transparent dark
    <section className='fixed top-0 bottom-0 left-0 right-0 bg-neutral-900/60 p-4 flex items-center justify-center'>
      
      {/* White popup box: fully opaque */}
      <div className='bg-white max-w-sm w-full flex flex-col items-center justify-center rounded p-4'>
        <button onClick={close} className='cursor-pointer text-neutral-800 w-fit block ml-auto'>
            <IoMdClose  size={25}/>
        </button>
        <div className='w-20 h-20 bg-red-600 flex items-center justify-center rounded-full overflow-hidden drop-shadow-lg'>
          {
            user.avatar ? (
              <img src={user.avatar}
                   alt='user-avatar'
                   className='w-full h-full'
              />
            ) : (
              <FaRegUserCircle size={65} />
            )
          }
        </div>

        <form onSubmit={handleSubmit}>
            <label htmlFor="uploadProfile"><div className='hover:border-violet-300 hover:bg-violet-700 hover:text-white cursor-pointer border px-3 py-1 rounded mt-3 text-sm my-3'>
          {
            loading?"Loading...":"Upload"
          }
        </div></label>
            <input onChange={handleUploadAvatar} className='hidden' id='uploadProfile' type="file" />
        </form>
        
        

      </div>
    </section>
  );
};

export default UserProfileAvatarEdit;
