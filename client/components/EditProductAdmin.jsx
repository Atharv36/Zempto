import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt } from "react-icons/fa";
import uploadImage from '../utils/UploadImage';
import Loading from '../components/Loading';
import ViewImage from '../components/ViewImage';
import { MdDelete } from "react-icons/md";
import { useSelector } from 'react-redux';
import { IoClose } from "react-icons/io5";
import AddFieldComponent from '../components/AddFieldComponent';
import Axios from '../utils/Axios';
import SummaryApi from '../src/config/summaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import successAlert from '../utils/SuccessAlert';

const EditProductAdmin = ({ close, data: propsData, fetchProductData }) => {
  const [data, setData] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [viewImageURL, setViewImageURL] = useState("");
  const [selectCategory, setSelectCategory] = useState("");
  const [selectSubCategory, setSelectSubCategory] = useState("");
  const [openAddField, setOpenAddField] = useState(false);
  const [fieldName, setFieldName] = useState("");

  const allCategory = useSelector(state => state.product.allCategory);
  const allSubCategory = useSelector(state => state.product.allSubCategory);

  useEffect(() => {
    if (propsData) {
      const mappedCategory = propsData.category?.map(cat =>
        typeof cat === 'string' ? allCategory.find(c => c._id === cat) : cat
      ).filter(Boolean) || [];

      const mappedSubCategory = propsData.subCategory?.map(sub =>
        typeof sub === 'string' ? allSubCategory.find(s => s._id === sub) : sub
      ).filter(Boolean) || [];

      setData({
        _id: propsData._id,
        name: propsData.name || "",
        image: propsData.image || [],
        category: mappedCategory,
        subCategory: mappedSubCategory,
        unit: propsData.unit || "",
        stock: propsData.stock || "",
        price: propsData.price || "",
        discount: propsData.discount || "",
        description: propsData.description || "",
        more_details: propsData.more_details || {},
      });
    }
  }, [propsData, allCategory, allSubCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageLoading(true);
    try {
      const response = await uploadImage(file);
      const imageUrl = response.data.data.url;
      setData(prev => ({ ...prev, image: [...prev.image, imageUrl] }));
    } catch (err) {
      console.error(err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteImage = (index) => {
    const updatedImages = [...data.image];
    updatedImages.splice(index, 1);
    setData(prev => ({ ...prev, image: updatedImages }));
  };

  const handleRemoveCategory = (index) => {
    const updated = [...data.category];
    updated.splice(index, 1);
    setData(prev => ({ ...prev, category: updated }));
  };

  const handleRemoveSubCategory = (index) => {
    const updated = [...data.subCategory];
    updated.splice(index, 1);
    setData(prev => ({ ...prev, subCategory: updated }));
  };

  const handleAddField = () => {
    if (!fieldName.trim()) return;
    setData(prev => ({
      ...prev,
      more_details: {
        ...prev.more_details,
        [fieldName.trim()]: ""
      }
    }));
    setFieldName("");
    setOpenAddField(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await Axios({
        ...SummaryApi.updateProductDetails,
        data: data
      });
      if (response.data.success) {
        successAlert(response.data.message);
        close?.();
        fetchProductData?.();
        setData(null);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  if (!data) return null;

  return (
    <section className="fixed inset-0 bg-black/60 z-50 p-4">
      <div className="bg-white w-full max-w-2xl mx-auto rounded overflow-y-auto h-full max-h-[95vh] p-4">
        <header className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Edit Product</h2>
          <button onClick={close}><IoClose size={20} /></button>
        </header>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <Input label="Name" name="name" value={data.name} onChange={handleChange} />
          <TextArea label="Description" name="description" value={data.description} onChange={handleChange} />

          <div>
            <p className="font-medium mb-1">Image</p>
            <label htmlFor="productImage" className="bg-blue-50 h-24 border rounded flex justify-center items-center cursor-pointer">
              <div className="text-center">
                {imageLoading ? <Loading /> : (<><FaCloudUploadAlt size={35} /><p>Upload Image</p></>)}
              </div>
              <input type="file" id="productImage" className="hidden" accept="image/*" onChange={handleUploadImage} />
            </label>

            <div className="flex flex-wrap gap-3 mt-2">
              {data.image.map((img, index) => (
                <div key={img + index} className="h-20 w-20 bg-blue-50 border relative group">
                  <img
                    src={img}
                    alt="product"
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => setViewImageURL(img)}
                  />
                  <div onClick={() => handleDeleteImage(index)} className="absolute bottom-0 right-0 bg-red-600 text-white p-1 rounded hidden group-hover:block cursor-pointer">
                    <MdDelete />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SelectWithTags
            label="Category"
            options={allCategory}
            value={selectCategory}
            setValue={setSelectCategory}
            selectedList={data.category}
            setSelectedList={(newList) => setData(prev => ({ ...prev, category: newList }))}
            onRemove={handleRemoveCategory}
          />

          <SelectWithTags
            label="Sub Category"
            options={allSubCategory}
            value={selectSubCategory}
            setValue={setSelectSubCategory}
            selectedList={data.subCategory}
            setSelectedList={(newList) => setData(prev => ({ ...prev, subCategory: newList }))}
            onRemove={handleRemoveSubCategory}
          />

          <Input label="Unit" name="unit" value={data.unit} onChange={handleChange} />
          <Input label="Stock" name="stock" value={data.stock} onChange={handleChange} type="number" />
          <Input label="Price" name="price" value={data.price} onChange={handleChange} type="number" />

          {/* 🔻 Discount field NOT required */}
          <Input label="Discount" name="discount" value={data.discount} onChange={handleChange} type="number" required={false} />

          {Object.keys(data.more_details || {}).map((key, index) => (
            <Input
              key={index}
              label={key}
              name={key}
              value={data.more_details[key]}
              onChange={(e) => {
                const value = e.target.value;
                setData(prev => ({
                  ...prev,
                  more_details: {
                    ...prev.more_details,
                    [key]: value
                  }
                }));
              }}
            />
          ))}

          <button
            type="button"
            className="hover:bg-green-500 hover:text-white bg-white py-1 px-3 w-32 text-center font-semibold border border-green-200  cursor-pointer rounded"
            onClick={() => setOpenAddField(true)}
          >
            Add Fields
          </button>

          <button type="submit" className="bg-green-500 hover:bg-green-600 hover:text-white cursor-pointer py-2 rounded font-semibold">
            Update Product
          </button>
        </form>

        {viewImageURL && <ViewImage url={viewImageURL} close={() => setViewImageURL("")} />}
        {openAddField && (
          <AddFieldComponent
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            submit={handleAddField}
            close={() => setOpenAddField(false)}
          />
        )}
      </div>
    </section>
  );
};

// 🔧 Reusable Components
const Input = ({ label, name, value, onChange, type = "text", required = true }) => (
  <div className="grid gap-1">
    <label htmlFor={name} className="font-medium">{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      className="bg-blue-50 p-2 outline-none border rounded"
      required={required}
    />
  </div>
);

const TextArea = ({ label, name, value, onChange }) => (
  <div className="grid gap-1">
    <label htmlFor={name} className="font-medium">{label}</label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      rows={3}
      className="bg-blue-50 p-2 outline-none border rounded resize-none"
      required
    />
  </div>
);

const SelectWithTags = ({ label, options, value, setValue, selectedList, setSelectedList, onRemove }) => {
  const handleAdd = (id) => {
    const selected = options.find(opt => opt._id === id);
    if (!selected || selectedList.some(item => item._id === id)) return;
    setSelectedList([...selectedList, selected]);
    setValue("");
  };

  return (
    <div className="grid gap-1">
      <label className="font-medium">{label}</label>
      <select
        className="bg-blue-50 border w-full p-2 rounded"
        value={value}
        onChange={(e) => handleAdd(e.target.value)}
      >
        <option value="">Select {label}</option>
        {options.map(opt => (
          <option key={opt._id} value={opt._id}>{opt.name}</option>
        ))}
      </select>

      <div className="flex flex-wrap gap-2 mt-2">
        {selectedList.map((item, index) => (
          <div key={item._id} className="bg-blue-50 px-2 py-1 flex items-center rounded">
            <span>{item.name || "Unnamed"}</span>
            <IoClose className="ml-1 cursor-pointer hover:text-red-600" onClick={() => onRemove(index)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditProductAdmin;
