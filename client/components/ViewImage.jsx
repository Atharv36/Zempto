import React from "react";
import { IoMdClose } from "react-icons/io";

/**
 * A modal component to display an image in a centered, full-screen overlay.
 * @param {object} props - The component props.
 * @param {string} props.url - The URL of the image to display.
 * @param {Function} props.close - The function to call when closing the modal.
 */
const ViewImage = ({ url, close }) => {
  return (
    <div className='fixed inset-0 bg-neutral-900/70 flex items-center justify-center z-50'>
      
      
      <div className='bg-white shadow-lg rounded-lg p-4 w-full max-w-md max-h-[90vh] flex flex-col'>
        
        <button 
          onClick={close} 
          className='cursor-pointer self-end mb-2 text-gray-600 hover:text-red-600 transition-colors'
          aria-label="Close image view"
        >
          <IoMdClose size={30} />
        </button>
        
        <div className="flex-grow overflow-auto">
           <img
            src={url}
            alt="Full-screen view"
            className='w-full h-auto object-contain'
          />
        </div>

      </div>
    </div>
  );
};

export default ViewImage;
