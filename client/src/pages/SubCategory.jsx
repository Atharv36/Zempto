import React, { useEffect, useState } from 'react';
import UploadSubCategoryModel from '../../components/UploadSubCategoryModel';
import AxiosToastError from '../../utils/AxiosToastError';
import Axios from '../../utils/Axios';
import SummaryApi from '../config/summaryApi';
import Table from '../../components/Table';
import { createColumnHelper } from "@tanstack/react-table";
import { GoPencil } from "react-icons/go";
import { MdDelete } from "react-icons/md";
import EditSubCategory from '../../components/EditSubCategory';
import ConfirmBox from '../../components/ConfirmBox';
import toast from 'react-hot-toast';
import Loading from '../../components/Loading'; // Added for better user experience

const SubCategory = () => {
  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState({ _id: "" });
  const [openAddSubCategory, setOpenAddSubCategory] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteSubCategory, setDeleteSubCategory] = useState({ _id: "" });
  const [openDeleteConfirmBox, setOpenDeleteConfirmBox] = useState(false);

  const columnHelper = createColumnHelper();

  const fetchSubCategory = async () => {
    // DEBUG: Log when the fetch function starts
    // console.log("PARENT: fetchSubCategory() called. Fetching new data...");
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getSubCategory,
      });
      const { data: responseData } = response;
      if (responseData.success) {
        // DEBUG: Log the data that was received
        // console.log("PARENT: Data fetched successfully.", responseData.data);
        setData(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSub = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteSubCategory,
        data: deleteSubCategory
      });
      const { data: responseData } = response;
      if (responseData.success) {
        toast.success(responseData.message);
        fetchSubCategory(); // Refresh data on successful delete
        setOpenDeleteConfirmBox(false);
        setDeleteSubCategory({ _id: "" });
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  useEffect(() => {
    fetchSubCategory();
  }, []);

  const columns = [
    columnHelper.accessor('name', {
      header: "Name"
    }),
    columnHelper.accessor('image', {
      header: "Image",
      cell: ({ row }) => (
        <div className='flex items-center justify-center'>
          <img 
            src={row.original.image}
            alt={row.original.name}
            className='w-12 h-12 object-contain'
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/F0F0F0/CCC?text=No+Image'; }}
          />
        </div>
      )
    }),
    columnHelper.accessor('category', {
      header: "Category",
      cell: ({ row }) => (
        <div className='flex flex-wrap gap-1'>
          {row.original.category.map((c) => (
            <p key={c._id} className='shadow-md rounded-full text-xs px-2 py-1 bg-slate-100'>{c.name}</p>
          ))}
        </div>
      )
    }),
    columnHelper.accessor('_id', {
      header: "Action",
      cell: ({ row }) => (
        <div className='flex items-center justify-center gap-3'>
          <button onClick={() => {
            setOpenEdit(true);
            setEditData(row.original);
          }} className='p-2 bg-green-100 cursor-pointer rounded-full hover:bg-green-200 hover:text-green-600'>
            <GoPencil size={20} />
          </button>
          <button onClick={() => {
            setOpenDeleteConfirmBox(true);
            setDeleteSubCategory(row.original);
          }} className='p-2 bg-red-100 cursor-pointer rounded-full hover:bg-red-200 hover:text-red-600'>
            <MdDelete size={20} />
          </button>
        </div>
      )
    }),
  ];

  return (
    <section>
      <div className='p-4 bg-white shadow-md flex items-center justify-between'>
        <h2 className='text-xl font-bold text-gray-700'>Sub-Category</h2>
        <button onClick={() => setOpenAddSubCategory(true)} className='text-sm border font-semibold hover:bg-violet-700 hover:text-white py-2 px-4 rounded-md border-violet-600 transition-colors'>
          Add Sub-Category
        </button>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-60'><Loading /></div>
      ) : (
        <div className='overflow-x-auto'>
          <Table data={data} columns={columns} />
        </div>
      )}

      {openAddSubCategory && (
        <UploadSubCategoryModel
          // DEBUG: Wrap the onSuccess prop in a function to log when it's called
          onSuccess={() => {
            console.log("PARENT: onSuccess callback from UploadSubCategoryModel was triggered!");
            fetchSubCategory();
          }}
          close={() => setOpenAddSubCategory(false)}
        />
      )}
      {openEdit && (
        <EditSubCategory
          // DEBUG: Wrap the onSuccess prop in a function to log when it's called
          onSuccess={() => {
            console.log("PARENT: onSuccess callback from EditSubCategory was triggered!");
            fetchSubCategory();
          }}
          data={editData}
          close={() => setOpenEdit(false)}
        />
      )}
      {openDeleteConfirmBox && (
        <ConfirmBox
          cancel={() => setOpenDeleteConfirmBox(false)}
          close={() => setOpenDeleteConfirmBox(false)}
          confirm={handleDeleteSub}
        />
      )}
    </section>
  );
}

export default SubCategory;
