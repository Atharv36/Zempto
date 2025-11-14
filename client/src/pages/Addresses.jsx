import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import AddAddress from '../../components/AddAddress'
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import EditAddressDetails from '../../components/EditAddressDetails';
import AxiosToastError from '../../utils/AxiosToastError';
import Axios from '../../utils/Axios';
import SummaryApi from '../config/summaryApi';
import toast from 'react-hot-toast';
import { useGlobalContext } from '../provider/GlobalProvider';

const Addresses = () => {
  const addressList = useSelector(state=>state.addresses.addressList)
  const [openAddAddress,setOpenAddAddress]=useState(false)
    const { fetchAddress } = useGlobalContext();
  
  const [openEdit,setOpenEdit]=useState(false);
  const [editData,setEditData]=useState({})
  const handleDelete = async (_id) => {
  try {
    const response = await Axios.delete(SummaryApi.deleteAddress.url, {
      data: { _id }
    });
    const responseData = response.data;
    if (responseData.success) {
      toast.success(responseData.message)
      fetchAddress()
    }
  } catch (error) {
    AxiosToastError(error);
  }
}

  // console.log(addressList)
  return (
    <div className='max-w-6xl mx-auto px-4 py-6'>
        
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6 flex justify-between items-center'>
          <div >
            <h1 className='text-2xl font-bold text-gray-800'>Saved address</h1>
            <p className='text-gray-500 mt-1'>view/edit/delete/add your address</p>
            </div>
        <button onClick={()=>setOpenAddAddress(true)} className='text-sm border cursor-pointer font-semibold hover:bg-violet-700 hover:text-white py-1 px-3 rounded border-violet-600'>Add Address</button>

        </div>
        
      <div className='bg-blue-50 p-2 grid gap-5'>
                    {
                        addressList.map((address,index)=>{
                          // console.log(address)
                            return ( 
                                <div key={index} className='bg-white flex gap-3 border-[0.9px] rounded p-3'>
                                    
                                    <div className='w-full'>
                                        <p>{address.address_line}</p>
                                        <p>{address.city}</p>
                                        <p>{address.state}</p>
                                        <p>{address.country}-{address.pincode}</p>
                                        <p>{address.mobile}</p>
                                    </div>
                                    <div className='grid gap-10'>
                                      <button onClick={()=>handleDelete(address._id)} className='bg-red-400 p-1 rounded cursor-pointer hover:bg-red-600 hover:text-white '>
                                        <MdDelete size={20}/>
                                      </button>
                                      <button  onClick={() => {
                                        setOpenEdit(true);
                                        setEditData({
                                          ...address,
                                          addressline: address.address_line
                                        });
                                      }} className='bg-green-300 rounded p-1 text-black hover:text-white cursor-pointer hover:bg-green-600'>
                                        <FaEdit size={20}/>
                                      </button>
                                    </div>
                                </div>
                            )
                            
                        })
                    }
                    {/* <div onClick={()=>setOpenAddAddress(true)} className='rounded cursor-pointer flex justify-center items-center  border-neutral-300  h-16 bg-blue-50 border-2 border-dashed'>
                        Add Address
                    </div> */}
                </div>
                {
                  openAddAddress && (
                    <AddAddress close={()=>setOpenAddAddress(false)}/>
                  )
                }
                {
                  openEdit &&  <EditAddressDetails data={editData} close={()=>setOpenEdit(false)}/>
                }
    </div>
  )
}

export default Addresses