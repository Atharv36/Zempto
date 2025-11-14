import React from 'react';
import { MdDelete } from "react-icons/md";

// Added onDelete prop to handle the click event
const ProductCardAdmin = ({ data, onDelete }) => {
  return (
    // The 'relative' and 'group' classes are key for the hover effect
    <div className='relative group w-40 h-52 p-4 bg-white rounded-lg shadow-md flex flex-col justify-between'>
        <div className='h-2/3'>
            {/* Added onError for image fallback and fixed object-contain */}
            <img 
                className='w-full h-full object-contain' 
                src={data?.image[0]} 
                alt={`${data.name} Image`}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150/F0F0F0/CCC?text=No+Image'; }}
            />
        </div>
        <div className='h-1/3'>
            <p className='text-ellipsis line-clamp-2 font-semibold mt-2'>{data?.name}</p>
            <p className='text-slate-500 text-sm'>{data?.unit}</p>
        </div>

        {/* This overlay appears on hover */}
        <div 
            onClick={onDelete} 
            className='absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center cursor-pointer rounded-lg transition-all'
        >
            <MdDelete size={30} className="text-white" />
        </div>
    </div>
  );
}

export default ProductCardAdmin;
