import React from 'react';
import noDataImg from '../src/assets/nothing here yet.webp'

const NoData = () => {
  return (
    <div className='flex flex-col items-center justify-center p-4 gap-3'>
        <img src={noDataImg} alt="No-data"
        className='w-36'
        />
        <p className='text-neutral-500'>Noting Here Yet</p>
    </div>
  )
}

export default NoData