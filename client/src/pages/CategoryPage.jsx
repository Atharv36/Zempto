import React, { useEffect, useState } from 'react'
import UploadCategoryModels from '../../components/UploadCategoryModels'
import Loading from '../../components/Loading'
import NoData from '../../components/NoData'
import SummaryApi from '../config/summaryApi'
import Axios from '../../utils/Axios'
import EditCategory from '../../components/EditCategory'
import ConfirmBox from '../../components/ConfirmBox'
import AxiosToastError from '../../utils/AxiosToastError'
import toast from 'react-hot-toast'

const CategoryPage = () => {
    const [openUploadCategory,setOpenUploadCategory] = useState(false)
    const [loading,setLoading]=useState(false)
    const [categoryData,setCategoryData] = useState([])
    const [openEdit,setOpenEdit] = useState(false)
    const [deleteCategory,setDeleteCategory] = useState({
        _id:""
    })
    const [editData , setEditData]=useState({
        name:"",
        image:""
    })
    const [openConfirmBox,setOpenConfirmBox] = useState(false)

    // This function will now handle all data fetching for this component.
    const fetchCategory = async()=>{
        try{
            setLoading(true);
            const response = await Axios({
                ...SummaryApi.getCategory,
            })
            const {data:responseData}=response
            if(responseData.success){
                setCategoryData(responseData.data)
            }
        }catch(error){
            AxiosToastError(error) // Display error toast
        }finally{
            setLoading(false);
        }
    }

    // Fetch the data when the component first loads.
    useEffect(()=>{
        fetchCategory()
    },[])

    const handleDeleteCategory = async()=>{
        try{
            const response = await Axios({
                ...SummaryApi.deleteCategory,
                data:deleteCategory
            })
            const {data:responseData}=response
            if(responseData.success){
                toast.success(responseData.message)
                fetchCategory() // This now works and will refresh the data.
                setOpenConfirmBox(false)
            }
        }catch(error){
            AxiosToastError(error)
        }
    }

    return (
    <section>
        <div className='p-2  bg-white shadow-md flex items-center justify-between'>
            <h2 className='font-semibold'>Category</h2>
            <button onClick={()=>setOpenUploadCategory(true)} className='text-sm border cursor-pointer font-semibold hover:bg-violet-700 hover:text-white py-1 px-3 rounded border-violet-600'>Add Category</button>
        </div>
        {
            !categoryData[0] && !loading && (
                <NoData/>
            )
        }
        <div className='p-4 grid  grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2'>
            {
            categoryData.map((category,index)=>{
                return(
                    <div className='w-32 h-56 rounded shadow-md cursor-pointer overflow-hidden' key={category._id}>
                         <img src={category.image}
                          alt={category.name}
                          className='w-full object-scale-down'
                          />
                          <div className='flex px-1 items-center h-8 justify-center gap-2'>
                            <button onClick={()=>{
                                setOpenEdit(true)
                                setEditData(category)
                                }} className='flex-1 bg-green-100 cursor-pointer hover:bg-green-300  text-green-600 font-medium py-1 rounded'>Edit</button>
                            <button
                            onClick={()=>{
                                setDeleteCategory(category)
                                setOpenConfirmBox(true)
                            }}
                            className='flex-1 bg-red-100 cursor-pointer  hover:bg-red-300 text-red-600 font-medium py-1 rounded px-2'>Delete</button>
                          </div>
                    </div>
                )
            })
        }
        </div>

        {
            loading && <Loading/>
        }

        {
            openUploadCategory && (
                <UploadCategoryModels  fetchData={fetchCategory} close={()=>{setOpenUploadCategory(false)}}/>
            )
        }

        {
            openEdit && (
                <EditCategory data={editData} fetchData={fetchCategory} close={()=>{setOpenEdit(false)}}/>
            )
        }
        {
            openConfirmBox && (
                <ConfirmBox close={()=>setOpenConfirmBox(false)} cancel={()=>setOpenConfirmBox(false)} confirm={handleDeleteCategory}/>
            )
        }
    </section>
  )
}

export default CategoryPage
