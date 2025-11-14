import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SummaryApi from '../config/summaryApi';
import Axios from "../../utils/Axios";
import AxiosToastError from "../../utils/AxiosToastError.js";
import Loading from "../../components/Loading.jsx";
import CardProduct from '../../components/CardProduct.jsx';
import {useSelector} from "react-redux"
import { validURLConverter } from '../../utils/validUrlConverter.js';

const ProductList = () => {
    const params = useParams();
    const AllsubCategory = useSelector(state=>state.product.allSubCategory)
    const [displaySub,setDisplaySub]=useState([])
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [totalItemCount, setTotalItemCount] = useState(0);
    const [subcategoriesWithProducts, setSubcategoriesWithProducts] = useState([]); 
    
    const subCategorySlugParts = params?.subCategory.split("-");
    const subCategoryName = subCategorySlugParts?.slice(0, subCategorySlugParts.length - 1).join(" ");
    const categoryId = params.category.split("-").slice(-1)[0];
    const subCategoryId = params.subCategory.split("-").slice(-1)[0];

    const fetchProductData = async () => {
        setLoading(true);
        try {            
            const response = await Axios({
                ...SummaryApi.getProductByCategoryAndSubCategory,
                data: {
                    categoryId: categoryId,
                    subCategoryId: subCategoryId,
                    page: page,
                    limit: 8
                }
            });

            const { data: responseData } = response;

            if (responseData.success) {
                if (page === 1) {
                    setData(responseData.data);
                } else {
                    setData(prevData => [...prevData, ...responseData.data]);
                }
                setTotalItemCount(responseData.totalCount || 0);
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        setPage(1); 
        fetchProductData();
    }, [params]);

    useEffect(() => {
        if (page > 1) {
            fetchProductData();
        }
    }, [page]);
    // Check which subcategories have products
    useEffect(() => {
      const checkSubcategoriesWithProducts = async () => {
        if (!AllsubCategory || AllsubCategory.length === 0) {
          setSubcategoriesWithProducts([])
          return
        }

        // First filter subcategories by category
        const sub = AllsubCategory.filter(sub => {
          const filterData = sub.category.some(el => {
            return el._id === categoryId
          })
          return filterData ? filterData : null
        })

        // Then check which ones have products
        const subcategoriesWithProductsList = []
        
        for (const subcat of sub) {
          try {
            const response = await Axios({
              ...SummaryApi.getProductByCategoryAndSubCategory,
              data: {
                categoryId: categoryId,
                subCategoryId: subcat._id,
                page: 1,
                limit: 1  // Just check if any products exist
              }
            })
            if (response.data.success && response.data.data && response.data.data.length > 0) {
              subcategoriesWithProductsList.push(subcat)
            }
          } catch (error) {
            // If error, skip this subcategory
            console.error(`Error checking products for subcategory ${subcat.name}:`, error)
          }
        }
        
        setSubcategoriesWithProducts(subcategoriesWithProductsList)
        setDisplaySub(subcategoriesWithProductsList)
      }

      if (categoryId && AllsubCategory && AllsubCategory.length > 0) {
        checkSubcategoriesWithProducts()
      }
    }, [params, AllsubCategory, categoryId])


    return (
        // 1. Removed all positioning from the main section
        <section>
            <div className='container mx-auto grid grid-cols-[100px_1fr] md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]'>
                
                {/* 2. Made the sidebar sticky so it stays in place on page scroll */}
                <div className='sticky top-24 lg:top-20 min-h-[79vh] max-h-[79vh] overflow-y-scroll scrollbarCustom bg-white py-2 lg:py-4 p-2  gap-1 lg:gap-2 shadow-md'>
                    {
                      displaySub.map((s,index)=>{
                            const url = `/${validURLConverter(s?.category[0]?.name)}-${s?.category[0]?._id}/${validURLConverter(s.name)}-${s._id}`
                        
                         
                        return(
                          <Link to={url} className={`cursor-pointer w-full p-2  hover:bg-slate-200 lg:gap-3 flex-col lg:grid lg:grid-cols-[3rem_1fr] items-center lg:w-full lg:h-16   box-border border-b-[0.9px]
                            ${subCategoryId === s._id ? "bg-slate-200":""}  `}>
                            <div className={`w-fit  max-w-28 mx-auto  lg:mx-0 rounded  bg-white`}>
                              <img 
                                className='w-15 lg:h-13 lg:w-13   h-full object-scale-down'
                              src={s.image} alt="subCategory" />
                            </div>
                            <p className=' -mt-6  lg:text-ellipsis lg:line-clamp-2 lg:mt-0 text-xs text-center lg:text-left lg:ml-7  text-[1rem] lg:text-base'>{s.name}</p>

                          </Link>
                          
                        )
                      })
                    }
                </div>

                {/* product info */}
                <div className=''>
                    <div className='bg-white fixed min-w-[100vw] shadow-md p-2'>
                        <h3 className='font-semibold '>{subCategoryName}</h3>
                    </div>

                    {/* 3. Removed height and overflow limits from the product container */}
                    <div>
                        <div >
                          <div className='mt-9 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 p-4 gap-3 '>
                            {data?.map((p, index) => {
                                return <CardProduct data={p} key={p._id || index} />;
                            })}
                        </div>
                        </div>
                        {loading && <Loading />}
                        {!loading && data.length < totalItemCount && (
                             <div className='text-center my-4'>
                                <button onClick={() => setPage(prevPage => prevPage + 1)} className='bg-red-500 text-white px-4 py-2 rounded'>
                                    Load More
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductList;