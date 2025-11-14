//4,30,00


import { Outlet, useLocation } from 'react-router-dom'
import './App.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import  { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import fetchUserDetails from '../utils/fetchUserDetails';
import { setUserDetails } from '../store/userSlice';
import { useDispatch } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from './config/summaryApi';
import { setAllCategory , setAllSubCategory,setLoadingCategory } from '../store/productSlice';
import AxiosToastError from '../utils/AxiosToastError';
import { handleAddItemCart } from '../store/cartProduct.js';
import GlobalProvider from './provider/GlobalProvider.jsx';
import CartMobile from "../components/CartMobile.jsx"

function App() {
  const dispatch = useDispatch();
  const location = useLocation()

  const fetchUser = async() =>{
    try {
      const userData = await fetchUserDetails()
      // console.log("User deta::::",userData.data)
      if(userData && userData.data) {
        dispatch(setUserDetails(userData.data))
      }
    } catch(error) {
      console.error('Error fetching user details:', error)
      // User might not be logged in, which is fine
    }
  }
  
     const fetchCategory = async()=>{
          try{
            dispatch(setLoadingCategory(true))
              const response = await Axios({
                  ...SummaryApi.getCategory,
              })
              const {data:responseData}=response
              console.log('Category API Response:', responseData)
              if(responseData.success){
                  // setCategoryData(responseData.data)
                  console.log("Category Data:", responseData.data)
                  dispatch(setAllCategory(responseData.data))
                } else {
                  console.error('Category API failed:', responseData.message)
                }
  
              // console.log(responseData)
          }catch(error){
            console.error('Error fetching categories:', error)
            AxiosToastError(error)
          }finally{
              dispatch(setLoadingCategory(false))

              
          }
      }
    const fetchSubCategory = async()=>{
          try{
              const response = await Axios({
                  ...SummaryApi.getSubCategory,
              })
              const {data:responseData}=response
              console.log('SubCategory API Response:', responseData)
              if(responseData.success){
                  // setCategoryData(responseData.data)
                  console.log("SubCategory Data:", responseData.data)
                  dispatch(setAllSubCategory(responseData.data))
                } else {
                  console.error('SubCategory API failed:', responseData.message)
                }
  
              // console.log(responseData)
          }catch(error){
              console.error('Error fetching subcategories:', error)
              AxiosToastError(error)

          }
          // finally{

              
          // }
      }
      
  useEffect(()=>{
    fetchUser()
    fetchCategory()
    fetchSubCategory();
    // fetchCartItems()
  },[])

  // console.log("App is rendering!");
  return (
    <GlobalProvider>
      <Header></Header>
      <main className ='min-h-[82vh]'>
        <Outlet />
      </main>

      <Footer></Footer>
      {
        (location.pathname !== '/checkout') && (
          < CartMobile/>
          
        )
      }
      <Toaster />
    </GlobalProvider>
      
  
  )
}

export default App
