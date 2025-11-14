import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Axios from "../../utils/Axios";
import SummaryApi from '../config/summaryApi';
import AxiosToastError from "../../utils/AxiosToastError";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6"
import { FiZoomIn } from "react-icons/fi"
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io"
import { PulseLoader } from 'react-spinners'
import displayIndianPrice from "../../utils/displayIndianPrice"
import Divider from "../../components/Divider.jsx"
import { PriceWithDiscount } from '../../utils/PriceWithDiscount.js';
import AddToCartButton from '../../components/AddToCartButton.jsx';



const ProductDisplayPage = () => {
  const params = useParams()
  let productId = params?.product?.split("-")?.slice(-1)[0]
  
  const [data, setData] = useState({
    name: "",
    description: "",
    price: 0,
    image: []
  });
  
  const imageContainer = useRef()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [zoomMode, setZoomMode] = useState(false)

  const fetchProductDetails = async() => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getProductDetails,
        data: { productId: productId }
      })
      const { data: responseData } = response
      if (responseData.success) {
        setData(responseData.data)
      }
    } catch(error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleScrollRight = () => {
    imageContainer.current.scrollLeft += 120
  }

  const handleScrollLeft = () => {
    imageContainer.current.scrollLeft -= 120
  }

  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === data.image.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? data.image.length - 1 : prev - 1
    )
  }

  useEffect(() => {
    fetchProductDetails()
  }, [params])

  if (loading) {
    return (
      <div className="container mx-auto p-4 min-h-[60vh] flex items-center justify-center">
        <PulseLoader color="#3B82F6" size={15} />
      </div>
    )
  }

  if (!data.image || data.image.length === 0) {
    return (
      <div className="container mx-auto p-4 min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">No product images available</p>
      </div>
    )
  }
  console.log(data)
  return (
    <section className='container mx-auto p-4'>
      <div className='grid lg:grid-cols-2 gap-8'>
        {/* Image Gallery Section */}
        <div className='space-y-4'>
          {/* Main Image */}
          <div className='relative bg-white rounded-lg overflow-hidden shadow-md aspect-square'>
            <img 
              src={data.image[currentImageIndex]} 
              alt="Product" 
              className={`w-full h-full object-contain cursor-${zoomMode ? 'zoom-out' : 'zoom-in'}`}
              onClick={() => setZoomMode(!zoomMode)}
            />
            
            {zoomMode && (
              <div className="absolute inset-0 bg-white flex items-center justify-center p-4">
                <img 
                  src={data.image[currentImageIndex]} 
                  alt="Zoomed Product" 
                  className="object-contain w-full h-full"
                />
              </div>
            )}
            
            <button 
              className="absolute top-2 right-2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
              onClick={() => setZoomMode(!zoomMode)}
              aria-label={zoomMode ? "Zoom out" : "Zoom in"}
            >
              <FiZoomIn className="text-gray-700" />
            </button>
            
            {data.image.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
                  aria-label="Previous image"
                >
                  <IoIosArrowDropleft className="text-gray-700 text-xl" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
                  aria-label="Next image"
                >
                  <IoIosArrowDropright className="text-gray-700 text-xl" />
                </button>
              </>
            )}
          </div>
          
          {/* Image Indicator Dots */}
          {data.image.length > 1 && (
            <div className='flex items-center justify-center gap-2'>
              {data.image.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${index === currentImageIndex ? "bg-blue-600" : "bg-gray-300 hover:bg-gray-400"}`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
          
          {/* Thumbnail Scrollable Gallery */}
          {data.image.length > 1 && (
            <div className='relative'>
              <div 
                ref={imageContainer} 
                className="flex gap-3 w-full overflow-x-auto scrollbar-hide py-2 px-1"
              >
                {data.image.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${index === currentImageIndex ? 'border-blue-500' : 'border-transparent hover:border-gray-300'}`}
                    aria-current={index === currentImageIndex ? "true" : "false"}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              
              <button 
                onClick={handleScrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-50"
                aria-label="Scroll thumbnails left"
              >
                <FaAngleLeft className="text-gray-700" />
              </button>
              <button 
                onClick={handleScrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-50"
                aria-label="Scroll thumbnails right"
              >
                <FaAngleRight className="text-gray-700" />
              </button>
            </div>
          )}
        </div>
        
        {/* Product Info Section - Placeholder for your future implementation */}
          <div className='p-4 lg:pl-7 text-base lg:text-lg'>
            <p className='hidden lg:block bg-violet-400 rounded-full w-fit px-3 text-white'>Estimated Delivery Time: 10 Min</p>
            <p className='block lg:hidden bg-violet-400 rounded-full w-fit px-3 text-white'>10 Min</p>
            <h2 className='text-lg font-semibold lg:text-3xl'>{data.name || "Product Name"}</h2>
            <p className='  px-2 rounded-full flex text-slate-400'>Net Qty: <p className='font-medium text-slate-500'>{data.unit|| "Product Unit"} </p></p>
            <Divider></Divider>
          
          
          <div>

          <div className='flex items-center gap-4'>
            <div className="text-3xl font-semibold text-violet-600">
             {displayIndianPrice(PriceWithDiscount(data.price || "0.00",data.discount))}
           </div> 
            
           {
              Boolean(data.discount) && (
              <p className='text-base font-medium text-green-500 '>{data.discount}% Off</p>
              )
           }
          
           
           </div>  
           <div className=''>
            {
              Boolean(data.discount ) && (
                <p className=' flex gap-2 text-base'>MRP:  <p className='line-through font-medium'>{displayIndianPrice(data.price)} </p> (incl. of all taxes)</p>
              )
            }
            </div> 
          </div>

          {/* <Divider></Divider>÷ */}
          <div>
            <p>{data.description || ""}</p>
            {
              data.stock===0 ? (
                <p className='text-xl mt-10 font-semibold text-red-500'>Out Of Stock</p>
              ):(
                  <div className='my-4 w-fit min-w-36'>
                    <AddToCartButton data={data}/>

                  </div>
                // <button  className='my-4 px-4 py-1 bg-green-400 hover:bg-green-600 cursor-pointer font-medium rounded text-white'>Add To Cart</button>
              )
            }
          </div>
          {console.log(data)}
          {
            data?.more_details && (
              <>
              <Divider></Divider> 
              {
            Object.keys(data?.more_details).map((element,index) => {
                return(
                  <div >
                    <p className='font-semibold'>{element}</p>
                    <p className='text-base'>{data?.more_details[element]}</p>
                  </div>
                )
              })
              }
              
              </>
              
            )
          }
          </div>
      </div>
    </section>
  )
}

export default ProductDisplayPage


// <div className="space-y-4">
//           <h1 className="text-3xl font-bold text-gray-900">{data.name || "Product Name"}</h1>
//           <div className="text-2xl font-semibold text-blue-600">
//             ${data.price?.toFixed(2) || "0.00"}
//           </div>
          
//           <div className="border-t border-gray-200 pt-4">
//             <h2 className="text-lg font-medium text-gray-900">Description</h2>
//             <p className="mt-2 text-gray-600">
//               {data.description || "Product description will appear here."}
//             </p>
//           </div>
          
//           {/* Add to cart button placeholder */}
//           <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors">
//             Add to Cart
//           </button>
//         </div>