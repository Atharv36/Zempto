import React from 'react'
import { IoMdClose } from "react-icons/io";

const ConfirmBox = ({cancel,confirm,close}) => {
  return (
    <div className='fixed top-0 bottom-0 right-0 left-0 z-50 p-4 flex justify-center items-center bg-neutral-800/70'>
        <div className="bg-white w-full max-w-md p-4 rounded ">
            <div className='flex justify-between gap-3 items-center'>
                <h1 className='font-semibold'>Want to Permanently Delete ?</h1>
                <button className='cursor-pointer' onClick={close}>

                    <IoMdClose size={25}/>
                </button>
            </div>
            <p className='my-4'> Are You Sure Category will be Permanently Deleted</p>
            <div className='w-fit ml-auto flex gap-3 items-center'>
                <button onClick={cancel} className='px-4 py-1 border border-red-500 text-red-500 cursor-pointer hover:bg-red-500 hover:text-white rounded'>Cancel</button>
                <button onClick={confirm} className='px-4 py-1 border border-green-500 text-green-500 cursor-pointer hover:bg-green-500 hover:text-white rounded'>Confirm</button>
            </div>
        
        </div>
    </div>
  )
}

export default ConfirmBox