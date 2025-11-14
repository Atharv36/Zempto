import subCategoryModel from "../models/subcategory.model.js";

export const AddSubCategoryController = async(req,res)=>{
    try{
        const {name , image ,category} = req.body;

        if(!name || !image || !category || !category.length===0){
            return res.status(400).json({
                message:"Provide Name,Image And Category",
                success:false,
                error:true
            })
        }

        const payload ={
            name,
            image,
            category
        }
        const createSubCategory = new subCategoryModel(payload)
        const save = await createSubCategory.save()

        return res.json({
            message:"SubCategory Created",
            data:save,
            success:true,
            error:false
        })

    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            success:false,
            error:true
        })
    }
}



export const getSubCategoryController = async(req,res)=>{
    try{
        const data = await subCategoryModel.find().sort({name:1}).populate('category');
        return  res.json({
            message:"SubCategory Data",
            data:data,
            success:true,
            error:false
        })


    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            success:false,
            error:true
        })
    }
}

export const updateSubCategoryController = async(req,res)=>{
    try{
        const {_id , name , image , category} = req.body
        const checkSub = await subCategoryModel.findById(_id)
         
        if(!checkSub){ 
            return res.json({
                message:"SubCategory is not available,check _id",
                error:true,
                success:false
            })
        }
        const updateSubCategory = await subCategoryModel.findByIdAndUpdate(_id , {
            name,
            image,
            category
        })
        return res.json({
            message:"Update Successful",
            data:updateSubCategory,
            success:true,
            error:false
        })

    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            success:false,
            error:true
        })
    }
}

export const deleteSubCategory = async(req,res)=>{
    try{
        const {_id} = req.body
        const deleteSub = await subCategoryModel.findByIdAndDelete(_id)

        return res.json({
            message:"Deleted Successfully",
            data:deleteSub,
            error:false,
            success:true
        })
    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            success:false,
            error:true
        })
    }
}