import React, { useState } from "react";
import { DisplayPriceInRupees } from "../../server/utils/displayIndianPrice";
import { Link } from "react-router-dom";
import { validURLConverter } from "../utils/validUrlConverter";
import { PriceWithDiscount } from "../utils/PriceWithDiscount";
import SummaryApi from "../src/config/summaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import Axios from "../utils/Axios";
import toast from "react-hot-toast";
import { useGlobalContext } from "../src/provider/GlobalProvider";
import AddToCartButton from "./AddToCartButton";

const CardProduct = ({ data }) => {
    const url = `/product/${validURLConverter(data.name)}-${data._id}`;
    const [loading,setLoading]=useState(false);

    const {fetchCartItems} = useGlobalContext()
    
    
    return (
        <Link
            to={url}
            className="bg-white border-[0.1px] py-2 lg:p-3 grid gap-1 lg:gap-2 min-w-32 max-w-32 lg:max-w-52 lg:min-w-52 rounded"
        >
            {/* Top bar: 10 min + discount */}
            <div className="flex justify-between gap-2 px-2 text-xs lg:text-sm text-green-600">
                <p className="bg-green-100 rounded px-1 py-0.5">10 min</p>
                {Boolean(data.discount) && (
                    <p className="bg-green-100 rounded px-1 py-0.5">
                        {data.discount}% Off
                    </p>
                )}
            </div>

            {/* Product image */}
            <div className="min-h-20 w-full max-h-24 rounded lg:max-h-32">
                <img
                    src={data.image[0]}
                    alt=""
                    className="w-full h-full object-scale-down "
                />
            </div>

            {/* Price + Unit Row */}
            <div className="flex justify-between items-start px-2 text-sm lg:text-base">
                <div className="flex flex-col">
                    <span className="font-semibold">
                        {DisplayPriceInRupees(PriceWithDiscount(data.price, data.discount))}
                    </span>
                    {Boolean(data.discount) && (
                        <span className="line-through text-gray-500 text-sm lg:text-base font-medium">
                            {DisplayPriceInRupees(data.price)}
                        </span>
                    )}
                </div>
                <div className="text-gray-800 text-xs lg:text-sm pt-0.5">
                    {data.unit}
                </div>
            </div>

            {/* Product title */}
            <div className="px-2 lg:px-0 lg:font-semibold text-base lg:text-lg text-ellipsis line-clamp-2">
                {data.name}
            </div>

            {/* Add to Cart */}
            {data.stock === 0 ? ( 
                <div className="px-2 lg:px-0 mt-1">
                <p className="bg-red-50 border-2 px-1 border-red-600 text-red-800">Out of Stock</p>
            </div>
            ) : (
                <div className="px-2 lg:px-0 mt-1">
               <AddToCartButton data={data} />
            </div>
            )
            }
        </Link>
    );
};

export default CardProduct;
