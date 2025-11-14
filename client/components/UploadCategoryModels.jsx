import React,{useState} from 'react'
import { IoMdClose } from "react-icons/io";
import uploadImage from '../utils/UploadImage.js';
import Axios from '../utils/Axios.js';
import SummaryApi from '../src/config/summaryApi.js';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError.js';


const UploadCategoryModels = ({close , fetchData}) => {
    const handleOnChange = (e)=>{
        const {name , value}=e.target;
        setData((preve)=>{
            return{
                ...preve,
                [name]:value
            }
        })
    }

    const handleUploadCategoryImages = async(e)=>{
        const file = e.target.files[0];

        if(!file){
            return
        }
        const response = await uploadImage(file);
        const {data : ImageResponse} = response

        setData((preve)=>{
            return{
                ...preve,
                image:ImageResponse.data.url
            }
        })

    }
    const [loading,setLoading]=useState(false)
    const handleSubmit = async(e) =>{
        e.preventDefault();
        try{
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.addCategory,
                data:data
            })

            const {data :responseData} = response;
            if(responseData.success){
                toast.success(responseData.message)
                close()
                fetchData()
            }
        }catch(error){
            AxiosToastError(error)
        }finally{
            setLoading(false)
        }
    }
    const [data,setData] = useState({
        name:"",
        image:"",
    })

  return (
    <section className='fixed top-0 bottom-0 left-0 right-0 p-4 bg-neutral-800/60 flex items-center justify-center '>
        <div className='bg-white max-w-4xl w-full p-4 rounded '>
            <div className='flex items-center justify-between'>
                <h1 className='font-semibold'>Category</h1>
                <button onClick={close} className='cursor-pointer w-fit block ml-auto'>
                    <IoMdClose size={25}/>
                </button>
            </div>
            <form onSubmit={handleSubmit} action="" className='my-3 grid gap-3'>
                <div className='grid gap-1'>
                    <label htmlFor="categoryName">Name</label>
                    <input type="text"  
                    id="categoryName" 
                    placeholder='Enter Category Name'
                    value={data.name}
                    name="name"
                    onChange={handleOnChange}
                    className='bg-blue-50 p-2 border border-blue-100 rounded outline-none focus-within:border-violet-400'
                    />
                </div>
                <div className='grid gap-2'>
                    <p>Images</p>
                    <div className='flex gap-4 flex-col lg:flex-row items-center'>
                        <div className='border rounded flex items-center justify-center border-[0.2p]
                         bg-blue-50 h-36 lg:w-36 w-full'>
                            {
                                data.image ? (
                                    <img src={data.image} alt="category"
                                    className='w-full h-full object-scale-down'
                                    />
                                ):(
                                    <p className='text-sm text-neutral-500'>No Image</p>
                                )
                            }
                        </div>
                        <label htmlFor="uploadCategory">
                            <div  className={`
                                ${!data.name ? "bg-gray-400" :" bg-violet-400"}
                                px-4 py-2 rounded cursor-pointer font-semibold
                            `}>Upload Image</div>
                            <input
                            disabled={!data.name} 
                            onChange={handleUploadCategoryImages}
                            className='hidden' type="file" id="uploadCategory" />
                        </label>
                        
                    </div>
                    
                </div>

                <button className={
                 `
                    ${data.name && data.image ? "bg-green-500":"bg-gray-400"}
                    py-1 px-3 font-semibold cursor-pointer hover:bg-green-600
                    `
                }>Add Category</button>
            </form>
        </div>
    </section>
  )
}

export default UploadCategoryModels