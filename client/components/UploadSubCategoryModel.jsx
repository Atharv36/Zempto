import React, { useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

// Assuming these utilities are in the correct path
import Axios from '../utils/Axios';
import uploadImage from '../utils/UploadImage';
import AxiosToastError from '../utils/AxiosToastError';
import SummaryApi from '../src/config/summaryApi';
import Loading from './Loading'; // Added for better UX

// The component now accepts `onSuccess` as a prop
const UploadSubCategoryModel = ({ close, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imgLoading, setImgLoading] = useState(false);
    // This state now controls the value of the select dropdown
    const [selectedCategory, setSelectedCategory] = useState("");
    const [subCategoryData, setSubCategoryData] = useState({
        name: "",
        image: "",
        category: []
    });

    const allCategory = useSelector(state => state.product.allCategory || []);

    const handleRemoveCategorySelected = (catIdToRemove) => {
        setSubCategoryData(prev => ({
            ...prev,
            category: prev.category.filter(cat => cat._id !== catIdToRemove)
        }));
    };

    const handleUploadSubCategoryImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImgLoading(true);
        try {
            const response = await uploadImage(file);
            const imageUrl = response?.data?.data?.url;
            if (imageUrl) {
                toast.success("Image uploaded!");
                setSubCategoryData(prev => ({ ...prev, image: imageUrl }));
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setImgLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSubCategoryData(prev => ({ ...prev, [name]: value }));
    };
    
    // FIXED: The handler now correctly manages the controlled select component
    const handleCategorySelect = (e) => {
        const selectedId = e.target.value;
        setSelectedCategory(selectedId); // Update the select's value via state

        if (!selectedId) return;

        const categoryDetails = allCategory.find(el => el._id === selectedId);
        if (categoryDetails && !subCategoryData.category.some(cat => cat._id === categoryDetails._id)) {
            setSubCategoryData(prev => ({
                ...prev,
                category: [...prev.category, categoryDetails]
            }));
        }
        
        // Immediately reset the dropdown to the placeholder after selection
        setSelectedCategory("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await Axios({
                ...SummaryApi.createSubCategory,
                data: subCategoryData
            });
            const { data: responseData } = res;

            if (responseData.success) {
                toast.success(responseData.message);
                close(); // Close the modal
                if (onSuccess) {
                    console.log("CHILD (UploadSubCategoryModel): Calling onSuccess to refresh parent data.");
                    onSuccess();
                }
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = subCategoryData.name && subCategoryData.image && subCategoryData.category.length > 0;

    return (
        <section className='fixed inset-0 bg-neutral-800/70 flex items-center justify-center p-4 z-50'>
            <div className='w-full max-w-2xl bg-white p-4 rounded-lg shadow-lg'>
                <div className='flex justify-between items-center border-b pb-3 mb-4'>
                    <h1 className='text-xl font-semibold text-gray-800'>Add Sub-Category</h1>
                    <button onClick={close} className='text-gray-600 hover:text-red-500'>
                        <IoMdClose size={25} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label htmlFor="name" className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
                        <input type="text" id='name' name='name' value={subCategoryData.name} onChange={handleChange} autoFocus className='w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500' />
                    </div>
                    
                    <div>
                        <p className='block text-sm font-medium text-gray-700 mb-2'>Image</p>
                        <div className='flex items-center gap-4'>
                            <div className='w-32 h-32 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50'>
                                {imgLoading ? <Loading/> : subCategoryData.image ? <img src={subCategoryData.image} alt="sub category" className='w-full h-full object-cover rounded-md' /> : <p className='text-xs text-gray-500'>No Image</p>}
                            </div>
                            <label htmlFor="uploadSubCategoryImage" className='cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50'>
                                <span>Upload Image</span>
                            </label>
                            <input type="file" id='uploadSubCategoryImage' hidden onChange={handleUploadSubCategoryImage} accept="image/*" />
                        </div>
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Select Category</label>
                        <div className='border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-green-500'>
                            <div className='flex flex-wrap gap-2 p-2 min-h-[44px]'>
                                {subCategoryData.category.map((cat) => (
                                    <div key={cat._id} className='bg-green-100 text-green-800 text-sm font-medium px-2.5 py-1 rounded-full flex items-center gap-2'>
                                        {cat.name}
                                        <button type="button" onClick={() => handleRemoveCategorySelected(cat._id)} className="text-green-600 hover:text-green-800"><IoMdClose size={16} /></button>
                                    </div>
                                ))}
                            </div>
                            {/* FIXED: The select element is now controlled by the `selectedCategory` state */}
                            <select 
                                id="categorySelect" 
                                value={selectedCategory} 
                                onChange={handleCategorySelect} 
                                className='w-full bg-transparent border-t p-2 outline-none'
                            >
                                <option value="">-- Add a category --</option>
                                {allCategory.map((cat) => (!subCategoryData.category.some(selected => selected._id === cat._id) && <option key={cat._id} value={cat._id}>{cat.name}</option>))}
                            </select>
                        </div>
                    </div>

                    <button type="submit" disabled={!isFormValid || isSubmitting} className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${isFormValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50`}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default UploadSubCategoryModel;
