import React, { useState, useEffect } from 'react';
import SummaryApi from '../config/summaryApi';
import AxiosToastError from '../../utils/AxiosToastError';
import Axios from '../../utils/Axios';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import { CiSearch } from "react-icons/ci";
import Swal from 'sweetalert2';
import CardProduct from '../../components/CardProduct';
import EditProductAdmin from '../../components/EditProductAdmin';
import CardProductAdmin from '../../components/CardProductAdmin';


const ProductAdmin = () => {
  const [productData, setProductData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editProductData, setEditProductData] = useState(null); // ✅ minimal addition

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getProduct,
        data: {
          page,
          limit: 10,
          search,
        },
      });
      const { data: responseData } = response;
      if (responseData.success) {
        setTotalPageCount(responseData.totalNoPage);
        setProductData(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductData();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, page]);

  const handleDeleteProduct = async (productId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await Axios({
            ...SummaryApi.deleteProduct,
            data: { _id: productId },
          });
          if (response.data.success) {
            toast.success(response.data.message);
            fetchProductData();
          }
        } catch (error) {
          AxiosToastError(error);
        }
      }
    });
  };

  return (
    <section className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
            <div className="relative w-full md:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CiSearch className="text-gray-400" size={20} />
              </div>
              <input
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                value={search}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white"
                type="text"
                placeholder="Search products..."
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Loading />
          </div>
        ) : (
          <>
            {productData.length > 0 ? (
              <>
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {productData.map((product) => (
                    <CardProductAdmin 
  key={product._id}
  data={product}
  onEdit={() => setEditProductData(product)}
  onDelete={handleDeleteProduct}
/>
                  ))}
                </div>

                {totalPageCount > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className={`px-4 py-2 rounded-md border ${
                        page === 1
                          ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                          : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      Previous
                    </button>
                    <span className="font-medium text-gray-700">
                      Page {page} of {totalPageCount}
                    </span>
                    <button
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPageCount))}
                      disabled={page === totalPageCount}
                      className={`px-4 py-2 rounded-md border ${
                        page === totalPageCount
                          ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                          : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 text-lg">No products found</p>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="mt-4 text-blue-600 hover:text-blue-800"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ✅ Only show modal when needed */}
      {editProductData && (
        <EditProductAdmin
          data={editProductData}
          fetchProductData={fetchProductData}
          close={() => setEditProductData(null)}
        />
      )}
    </section>
  );
};

export default ProductAdmin;
