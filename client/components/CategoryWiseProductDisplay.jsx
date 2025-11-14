import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AxiosToastError from "../utils/AxiosToastError";
import Axios from "../utils/Axios";
import SummaryApi from "../src/config/summaryApi";
import CardLoading from "./CardLoading";
import CardProduct from "./CardProduct";
import { FaAngleRight } from "react-icons/fa6";
import { FaAngleLeft } from "react-icons/fa6";
import { validURLConverter } from "../utils/validUrlConverter";
import { useSelector } from "react-redux";

const CategoryWiseProductDisplay = ({ id, name }) => {
    const [data, setData] = useState([]);
    const containerRef = useRef();
    const [loading, setLoading] = useState(false);
    const loadingCardNumber = new Array(6).fill(null);
    // const loadingCategory = useSelector(state=>state.product.loadingCategory)
    const subCategoryData = useSelector(state => state.product.allSubCategory)
    const navigate = useNavigate()
    const fetchCategoryWiseProduct = async () => {
        try {
            setLoading(true);
            const response = await Axios({
                ...SummaryApi.getProductByCategory,
                data: {
                    id: id,
                },
            });
            const { data: responseData } = response;
            // console.log(responseData)
            if (responseData.success) {
                setData(responseData.data);
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchCategoryWiseProduct();
    }, []);
    const handleScrollRight = () => {
        containerRef.current.scrollLeft += 800;
    };
    const handleScrollLeft = () => {
        containerRef.current.scrollLeft -= 800;
    };

    
  const handleRedirectProductList = ()=>{
    console.log(id ," " , name) 
    const subCategory = subCategoryData.find(sub=>{
      const filterData =   sub.category.some(c=>{
        return c._id ===id
      })
      return filterData?true:null
    })

    const url = `/${validURLConverter(name)}-${id}/${validURLConverter(subCategory.name)}-${subCategory._id}`
    console.log(url)
    navigate(url)
  }
    // Don't render if no products (after loading is complete)
    if (!loading && (!data || data.length === 0)) {
        return null;
    }

    return (
        <div className="container mx-auto">
            <div className="p-4 flex items-center justify-between gap-4 ">
                <h3 className="font-semibold md:text-xl">{name}</h3>
                <Link onClick={handleRedirectProductList} to={""} className="text-green-600 hover:text-green-400">
                    See All
                </Link>
            </div>

            {/* 1. Create a new parent div and make IT relative. */}
            <div className="relative">
                {/* 2. This div is now ONLY for the scrolling content. It keeps the ref. */}
                <div
                    ref={containerRef}
                    className="flex gap-4 md:gap-6 lg:gap-7 scroll-smooth px-4 overflow-x-scroll scrollbar-none"
                >
                    {loading &&
                        loadingCardNumber.map((_, index) => {
                            return <CardLoading key={index} />;
                        })}
                    {data?.map((p, index) => {
                        return <CardProduct data={p} key={index} />;
                    })}
                </div>

                {/* 3. The button div is now a SIBLING to the scrollable content, so it won't move when you scroll. */}
                <div className="w-full left-0 right-0 container px-2 mx-auto absolute top-1/2 -translate-y-1/2 hidden lg:flex justify-between">
                    <button
                        onClick={handleScrollLeft}
                        className="z-10 cursor-pointer bg-white hover:bg-gray-200 shadow-lg p-2 rounded-full text-lg"
                    >
                        <FaAngleLeft />
                    </button>
                    <button
                        onClick={handleScrollRight}
                        className="z-10 cursor-pointer bg-white hover:bg-gray-200 shadow-lg p-2 rounded-full text-lg"
                    >
                        <FaAngleRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryWiseProductDisplay;
