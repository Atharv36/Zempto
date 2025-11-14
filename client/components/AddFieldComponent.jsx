import React from 'react';
import { IoMdClose } from "react-icons/io";

const AddFieldComponent = ({ close, value, onChange, submit }) => {
    return (
        <section className='flex justify-center items-center fixed inset-0 bg-neutral-800/70 z-50'>
            <div className='bg-white rounded-lg w-full max-w-sm p-5 shadow-xl'>
                <div className='flex items-center justify-between mb-4'>
                    <h1 className='text-lg font-semibold text-gray-800'>Add New Detail Field</h1>
                    <button className="text-gray-500 hover:text-red-500" onClick={close}>
                        <IoMdClose size={25} />
                    </button>
                </div>
                <div className='flex flex-col gap-4'>
                    <input
                        autoFocus
                        value={value}
                        onChange={onChange}
                        placeholder='e.g., Color, Material, Warranty'
                        className='bg-slate-100 p-2 border border-gray-300 focus:border-green-500 rounded-md outline-none'
                        type="text"
                        onKeyDown={(e) => e.key === 'Enter' && submit()}
                    />
                    {/* FIXED: `onClic` typo corrected to `onClick` */}
                    <button onClick={submit} className='bg-green-500 text-white font-semibold rounded-md border cursor-pointer py-2 px-3 hover:bg-green-600 transition-colors'>
                        Add Field
                    </button>
                </div>
            </div>
        </section>
    );
}

export default AddFieldComponent;
