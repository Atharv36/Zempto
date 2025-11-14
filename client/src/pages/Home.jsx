import React, { useState, useEffect } from 'react'
import banner from "../assets/zempto Banner copy.png"
import bannerMobile from "../assets/banner-mobile.jpg"
import { useSelector } from 'react-redux'
import { validURLConverter } from '../../utils/validUrlConverter'
import { useNavigate } from 'react-router-dom'
import CategoryWiseProductDisplay from '../../components/CategoryWiseProductDisplay'
import Axios from '../../utils/Axios'
import SummaryApi from '../config/summaryApi'

const Home = () => {
  // const [loading,setLoading]=useState(false)
  const loadingCategory = useSelector(state=>state.product.loadingCategory)
  const categoryData = useSelector(state => state.product.allCategory)
  const subCategoryData = useSelector(state => state.product.allSubCategory)
  const navigate = useNavigate()
  const [categoriesWithProducts, setCategoriesWithProducts] = useState([])
  const [checkingProducts, setCheckingProducts] = useState(false)
  
  // Check which categories have products
  useEffect(() => {
    const checkCategoriesWithProducts = async () => {
      if (!categoryData || categoryData.length === 0) {
        setCategoriesWithProducts([])
        setCheckingProducts(false)
        return
      }

      setCheckingProducts(true)
      const categoriesWithProductsList = []
      
      for (const cat of categoryData) {
        try {
          const response = await Axios({
            ...SummaryApi.getProductByCategory,
            data: { id: cat._id }
          })
          if (response.data.success && response.data.data && response.data.data.length > 0) {
            categoriesWithProductsList.push(cat)
          }
        } catch (error) {
          // If error, skip this category
          console.error(`Error checking products for category ${cat.name}:`, error)
        }
      }
      
      setCategoriesWithProducts(categoriesWithProductsList)
      setCheckingProducts(false)
    }

    if (!loadingCategory && categoryData && categoryData.length > 0) {
      checkCategoriesWithProducts()
    } else if (!loadingCategory && (!categoryData || categoryData.length === 0)) {
      setCheckingProducts(false)
    }
  }, [categoryData, loadingCategory])
  
  // Debug: Log category data to see what's being received
  useEffect(() => {
    console.log('Category Data:', categoryData)
    console.log('Loading Category:', loadingCategory)
    console.log('SubCategory Data:', subCategoryData)
    console.log('Categories with products:', categoriesWithProducts.length)
  }, [categoryData, loadingCategory, subCategoryData, categoriesWithProducts])
  
  const handleRedirectProductList = (id,cat)=>{
    // console.log(id ," " , name) 
    const subCategory = subCategoryData?.find(sub=>{
      const filterData =   sub.category?.some(c=>{
        return c._id ===id
      })
      return filterData?true:null
    })

    if(subCategory) {
      const url = `/${validURLConverter(cat)}-${id}/${validURLConverter(subCategory.name)}-${subCategory._id}`
      console.log(url)
      navigate(url)
    }
  }
  
  
  return (
    <section className='bg-white'>
      <div className=' container mx-auto py-4 px-4'>
        <div className={`w-full h-full min-h-36 rounded bg-white ${!banner && " animate-pulse"}`}>
          <img src={banner} className='w-full hidden md:block lg:block  h-full' alt="banner" />
          <img src={bannerMobile} className='w-full block md:hidden lg:hidden  h-full' alt="banner" />
        </div>
        
      </div>
      {/* grid */}
      <div className='bg-white container mx-auto px-4 my-2 grid gap-2 grid-cols-4 lg:grid-cols-10 md:grid-cols-8'>
          {
            loadingCategory || checkingProducts ? (
              new Array(12).fill(null).map((c,index)=>{
              return(
                <div key={index} className='bg-white grid gap-2 p-4  shadow-md animate-pulse rounded p-4 min-h-40'>
                  <div className='bg-blue-100 min-h-24 rounded'></div>
  
                    <div className='bg-blue-100 h-8 rounded'></div>
                  </div>)
            })
            ):(
              categoriesWithProducts && Array.isArray(categoriesWithProducts) && categoriesWithProducts.length > 0 ? (
                categoriesWithProducts.map((cat,index)=>{
                  return(
                    <div key={index} className=' w-full h-full cursor-pointer' onClick={()=>handleRedirectProductList(cat._id,cat.name)}>
                      <div>
                        <img src={cat.image} alt={cat.name}
                        className='w-full h-full object-scale-down' />
                      </div>
                    </div>
                  )
                })
              ) : (
                !loadingCategory && !checkingProducts && (
                  <div className='col-span-full text-center py-8'>
                    <p className='text-gray-500'>No categories with products available</p>
                  </div>
                )
              )
            )
            
          }
      </div>

      {/* display Category Products - only show categories that have products */}

          {
            categoriesWithProducts && Array.isArray(categoriesWithProducts) && categoriesWithProducts.length > 0 ? (
              categoriesWithProducts.map((cat,index)=>{
                return(
                <CategoryWiseProductDisplay key={index} id={cat?._id} name={cat?.name}/>

                )
              })
            ) : null
          }
    </section>
  )
}

export default Home