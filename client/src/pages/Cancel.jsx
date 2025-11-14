import React from 'react'
import { Link } from 'react-router-dom'

const Cancel = () => {
  return (
    <div className='mx-auto flex flex-col items-center justify-center gap-4 rounded m-2 py-5 w-full max-w-sm bg-red-300 p-4'>
        <p className='text-red-700 font-medium text-lg text-center'>Order Cancel</p>
        <Link to={"/"}  className='text-center border-2 cursor-pointer hover:bg-red-700 hover:text-white transition-colors hover:border-red-500 border-red-700 px-4 py-1'>Go To Home</Link>
    </div>
  )
}

export default Cancel