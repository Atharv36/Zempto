import React, { useState, useEffect, useRef } from 'react';
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { useSelector } from 'react-redux';

// Assuming these are correctly imported
import uploadImage from '../../utils/UploadImage';
import Loading from '../../components/Loading';
import ViewImage from '../../components/ViewImage';
import AddFieldComponent from '../../components/AddFieldComponent';
import Axios from '../../utils/Axios';
import SummaryApi from '../../src/config/summaryApi';
import AxiosToastError from "../../utils/AxiosToastError.js";
import successAlert from '../../utils/SuccessAlert.js';

// --- NEW REUSABLE SEARCHABLE SELECT COMPONENT ---
const SearchableSelect = ({ options, onSelect, placeholder, selectedItems }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef(null);

    const filteredOptions = options.filter(option => 
        option.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedItems.some(item => item._id === option._id)
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (option) => {
        onSelect(option);
        setSearchTerm("");
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsOpen(true)}
                className="bg-slate-100 w-full p-2 rounded-t-md outline-none border focus:border-green-500"
            />
            {isOpen && (
                <div className="absolute z-10 w-full bg-white border rounded-b-md max-h-60 overflow-y-auto shadow-lg">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(option => (
                            <div
                                key={option._id}
                                onClick={() => handleSelect(option)}
                                className="p-2 hover:bg-slate-100 cursor-pointer"
                            >
                                {option.name}
                            </div>
                        ))
                    ) : (
                        <div className="p-2 text-gray-500">No results found</div>
                    )}
                </div>
            )}
        </div>
    );
};


const initialDataState = {
    name: "",
    image: [],
    category: [],
    subCategory: [],
    unit: "",
    stock: "",
    price: "",
    discount: "",
    description: "",
    more_details: {},
};

const UploadProduct = () => {
    const [imgLoading, setImgLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewImgUrl, setViewImgUrl] = useState("");
    const [openAddField, setOpenAddField] = useState(false);
    const [fieldName, setFieldName] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    const allCategory = useSelector(state => state.product.allCategory || []);
    const allSubCategory = useSelector(state => state.product.allSubCategory || []);
    
    const [data, setData] = useState(initialDataState);

    const processAndUploadImage = async (file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            AxiosToastError({ message: "Please provide an image file." });
            return;
        }
        setImgLoading(true);
        try {
            const response = await uploadImage(file);
            const imageUrl = response?.data?.data?.url;
            if (imageUrl) {
                setData(prev => ({ ...prev, image: [...prev.image, imageUrl] }));
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setImgLoading(false);
        }
    };

    const handleFileSelect = (e) => processAndUploadImage(e.target.files[0]);
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); processAndUploadImage(e.dataTransfer.files[0]); };
    
    const handleDeleteImg = (indexToDelete) => setData(prev => ({ ...prev, image: prev.image.filter((_, index) => index !== indexToDelete) }));
    const handleRemoveCategory = (idToRemove) => setData(prev => ({ ...prev, category: prev.category.filter(cat => cat._id !== idToRemove) }));
    const handleRemoveSubCategory = (idToRemove) => setData(prev => ({ ...prev, subCategory: prev.subCategory.filter(sc => sc._id !== idToRemove) }));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleMoreDetailsChange = (key, value) => setData(prev => ({ ...prev, more_details: { ...prev.more_details, [key]: value } }));
    
    const handleAddField = () => {
        if (fieldName && !data.more_details.hasOwnProperty(fieldName)) {
            setData(prev => ({ ...prev, more_details: { ...prev.more_details, [fieldName]: "" } }));
        }
        setFieldName("");
        setOpenAddField(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await Axios({ ...SummaryApi.createProduct, data: data });
            if (response.data.success) {
                successAlert(response.data.message);
                setData(initialDataState);
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section>
            <div className='p-4 bg-white shadow-md flex items-center justify-between'>
                <h2 className='text-xl font-bold text-gray-700'>Upload Product</h2>
            </div>
            <div className='p-4'>
                <form onSubmit={handleSubmit} className='grid gap-5'>
                    <div className='grid gap-1'>
                        <label htmlFor="name" className='font-medium'>Name</label>
                        <input type="text" name="name" id="name" placeholder='Enter Product Name' value={data.name} onChange={handleChange} required className='bg-slate-100 p-2 rounded-md outline-none border focus:border-green-500' />
                    </div>
                    <div className='grid gap-1'>
                        <label htmlFor="description" className='font-medium'>Description</label>
                        <textarea name="description" id="description" placeholder='Enter Product description' value={data.description} onChange={handleChange} required rows={4} className='resize-none bg-slate-100 p-2 rounded-md outline-none border focus:border-green-500' />
                    </div>
                    <div>
                        <p className='font-medium'>Product Images</p>
                        <div className='mt-2'>
                            <label htmlFor='productImage' className={`bg-slate-100 h-32 border-2 border-dashed rounded-md flex justify-center cursor-pointer items-center transition-colors ${isDragging ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:bg-slate-200'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                                <div className='text-center flex justify-center items-center flex-col text-slate-500 pointer-events-none'>
                                    {imgLoading ? <Loading /> : (isDragging ? <p className='text-green-600 font-semibold'>Drop image here</p> : <><FaCloudUploadAlt size={40} /><p>Drag & Drop or Click to Upload</p></>)}
                                </div>
                            </label>
                            <input id='productImage' accept='image/*' onChange={handleFileSelect} className='hidden' type="file" />
                            <div className='my-4 flex flex-wrap gap-3'>
                                {data.image.map((image, index) => (
                                    <div className='relative group h-24 w-24' key={index + image}>
                                        <img onClick={() => setViewImgUrl(image)} src={image} alt={`product ${index + 1}`} className='cursor-pointer w-full h-full object-cover rounded-md' />
                                        <div onClick={() => handleDeleteImg(index)} className='cursor-pointer hidden group-hover:flex items-center justify-center absolute inset-0 bg-red-600/50 text-white'><MdDelete size={24} /></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Category */}
                    <div className='grid gap-1'>
                        <label htmlFor='category' className='font-medium'>Category</label>
                        <div className='border rounded-md focus-within:border-green-500'>
                            <SearchableSelect
                                options={allCategory}
                                onSelect={(category) => setData(p => ({ ...p, category: [...p.category, category] }))}
                                placeholder="Search and select a category..."
                                selectedItems={data.category}
                            />
                            {data.category.length > 0 && <div className='flex flex-wrap gap-2 p-2 border-t bg-slate-50 rounded-b-md'>{data.category.map(c => <div key={c._id} className='bg-slate-200 text-slate-800 text-sm font-medium px-2.5 py-1 rounded-full flex items-center gap-2'><p>{c.name}</p><button type="button" onClick={() => handleRemoveCategory(c._id)} className="text-slate-500 hover:text-red-500"><IoMdClose /></button></div>)}</div>}
                        </div>
                    </div>
                    {/* Sub-Category */}
                    <div className='grid gap-1'>
                        <label htmlFor='subCategory' className='font-medium'>Sub-Category</label>
                        <div className='border rounded-md focus-within:border-green-500'>
                             <SearchableSelect
                                options={[...allSubCategory].sort((a, b) => a.name.localeCompare(b.name))}
                                onSelect={(subCategory) => setData(p => ({ ...p, subCategory: [...p.subCategory, subCategory] }))}
                                placeholder="Search and select a sub-category..."
                                selectedItems={data.subCategory}
                            />
                            {data.subCategory.length > 0 && <div className='flex flex-wrap gap-2 p-2 border-t bg-slate-50 rounded-b-md'>{data.subCategory.map(sc => <div key={sc._id} className='bg-slate-200 text-slate-800 text-sm font-medium px-2.5 py-1 rounded-full flex items-center gap-2'><p>{sc.name}</p><button type="button" onClick={() => handleRemoveSubCategory(sc._id)} className="text-slate-500 hover:text-red-500"><IoMdClose /></button></div>)}</div>}
                        </div>
                    </div>
                    {/* Corrected Grid Layout for Unit, Stock, Price, Discount */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div className='grid gap-1'><label htmlFor="unit" className='font-medium'>Unit</label><input type="text" name="unit" id="unit" placeholder='e.g., kg, L, piece' value={data.unit} onChange={handleChange} className='bg-slate-100 p-2 rounded-md outline-none border focus:border-green-500' /></div>
                        <div className='grid gap-1'><label htmlFor="stock" className='font-medium'>Stock</label><input type="number" name="stock" id="stock" placeholder='e.g., 100' value={data.stock} onChange={handleChange} className='bg-slate-100 p-2 rounded-md outline-none border focus:border-green-500' /></div>
                        <div className='grid gap-1'><label htmlFor="price" className='font-medium'>Price</label><input type="number" name="price" id="price" placeholder='e.g., 199.99' value={data.price} onChange={handleChange} className='bg-slate-100 p-2 rounded-md outline-none border focus:border-green-500' /></div>
                        <div className='grid gap-1'><label htmlFor="discount" className='font-medium'>Discount (%)</label><input type="number" name="discount" id="discount" placeholder='e.g., 10' value={data.discount} onChange={handleChange} className='bg-slate-100 p-2 rounded-md outline-none border focus:border-green-500' /></div>
                    </div>
                    <div>
                        <h3 className='font-medium mb-2'>More Details</h3>
                        <div className='grid gap-3'>
                            {Object.keys(data.more_details).map((key) => (
                                <div key={key} className='grid gap-1'>
                                    <label htmlFor={key} className='capitalize'>{key}</label>
                                    <input type="text" name={key} id={key} value={data.more_details[key]} onChange={(e) => handleMoreDetailsChange(key, e.target.value)} required className='bg-slate-100 p-2 rounded-md outline-none border focus:border-green-500' />
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={() => setOpenAddField(true)} className='mt-3 bg-white border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white font-semibold py-2 px-4 rounded-md cursor-pointer transition-colors'>
                            Add More Details
                        </button>
                    </div>
                    <button type="submit" disabled={isSubmitting} className='mt-3 bg-green-500 text-white font-semibold py-2 px-4 rounded-md cursor-pointer transition-colors hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed'>
                        {isSubmitting ? 'Submitting...' : 'Submit Product'}
                    </button>
                </form>
            </div>
            {viewImgUrl && <ViewImage url={viewImgUrl} close={() => setViewImgUrl("")} />}
            {openAddField && <AddFieldComponent value={fieldName} onChange={(e) => setFieldName(e.target.value)} submit={handleAddField} close={() => setOpenAddField(false)} />}
        </section>
    );
}

export default UploadProduct;
