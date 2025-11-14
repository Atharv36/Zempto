import React, { useEffect, useState } from 'react'
import CardLoading from "../../components/CardLoading.jsx"
import SummaryApi from '../config/summaryApi.js'
import AxiosToastError from "../../utils/AxiosToastError.js"
import InfiniteScroll from "react-infinite-scroll-component"
import Axios from "../../utils/Axios.js"
import CardProduct from '../../components/CardProduct.jsx'
import { useLocation } from 'react-router-dom'
import noData from "../assets/nothing here yet.webp"

const SearchPage = () => {
  const [data,setData]=useState([])
  const [loading,setLoading]=useState(true)
  const loadingArrayCard = new Array(10).fill(null)
  const [page,setPage]=useState(1)
  const [totalPage,setTotalPage]=useState(1);
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const searchText = searchParams.get('q') || ''

  // console.log(params.search.slice(3)) 

  const handleFetchMore =()=>{
    if(totalPage>page){
      setPage(preve=> preve+1)
    }
  }

  const fetchData = async(pageNum, searchQuery)=>{
    try{
      const query = searchQuery
      if(!query || query.trim() === '') {
        setData([])
        setLoading(false)
        return
      }
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.searchProduct,
        data:{
          search:query.trim(),
          page:pageNum
        }
      })
      const {data:responseData}=response;
      if(responseData.success){
        if(responseData.page==1){
          setData(responseData.data)
        }else{
          setData((preve)=>{
            return[
              ...preve,
              ...responseData.data
            ]
          })
        }
        setTotalPage(responseData.totalPage)
        // console.log(responseData)
      }
    }catch(error){
      AxiosToastError(error)
    }finally{
      setLoading(false)
    }
  }
  
  useEffect(()=>{
    // Reset page to 1 and clear data when search text changes
    setPage(1)
    setData([])
    
    // Fetch data with the new search text, explicitly using page 1
    if(searchText && searchText.trim() !== '') {
      fetchData(1, searchText)
    } else {
      setLoading(false)
    }
  },[searchText])

  useEffect(()=>{
    // Fetch more data when page changes (for pagination)
    if(page > 1 && searchText && searchText.trim() !== '') {
      fetchData(page, searchText)
    }
  },[page])
  console.log(page)
  return (
    <section className='bg-white '>
      <div className='container mx-auto p-4 ' >
        <p className='font-semibold'>Search Result : {data.length}</p>
        
          <InfiniteScroll dataLength={data.length}
            hasMore={totalPage > page && !loading}
            next={handleFetchMore}

          >
          {/* loadingData */}
        <div className='grid grid-cols-2 md:grid-cols-3 py-4 lg:grid-cols-5 gap-3 lg:gap-7'>
            {
          data?.map((p,index)=>{
            return(
              <CardProduct data={p} key={index} />
            )
          })
        }
        
          {
            loading && (
              loadingArrayCard.map((_,index)=>{
                return(
                    <CardLoading key={index}></CardLoading>
                )
              })
            )
          }
        </div>
          </InfiniteScroll>
{
          //NOData
          !data[0] && !loading && (
            <div className='flex w-full flex-col justify-center items-center '>
              <h1 className='font-semibold text-4xl'>Nothing Here Yet!!!</h1>
              <img src={noData}alt=""  className=" flex w-full h-full  max-w-sm max-h-sm items-center justify-center" srcset="" />
            </div>
          )
        }
      </div>
    </section>
  )
}

export default SearchPage