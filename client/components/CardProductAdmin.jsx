import React from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { DisplayPriceInRupees } from "../../server/utils/displayIndianPrice";
import EditProductAdmin from "./EditProductAdmin";

const CardProductAdmin = ({ data, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-square p-4 bg-gray-50">
        <img 
          src={data?.image?.[0] || '/placeholder-product.jpg'} 
          alt={data.name} 
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>

      <div className="p-3">
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
          {data.name}
        </h3>
        <p className="text-gray-600 text-sm mb-2">
          {DisplayPriceInRupees(data.price)}
        </p>
        <p className="text-xs text-gray-500 mb-3">
          {data.unit}
        </p>

        <div className="flex justify-between border-t pt-3">
          <button 
            onClick={() => onEdit(data)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
          >
            <FiEdit size={14} />
            <span>Edit</span>
          </button>
          <button 
            onClick={() => onDelete(data._id)}
            className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
          >
            <FiTrash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardProductAdmin;
