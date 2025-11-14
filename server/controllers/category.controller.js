import CategoryModel from "../models/category.model.js"
import subCategoryModel from "../models/subcategory.model.js"
import ProductModel from "../models/product.model.js"


export const addCategoryController = async(req,res)=>{
    try{
        const {name,image}=req.body;

        if(!name  || !image){
            return res.status(400).json({
                message:"Enter Required Fields",
                error:true,
                success:false
            })
        }

        const addCategory = new CategoryModel({
            name,
            image
        })
        const saveCategory = await addCategory.save()

        if(!saveCategory){
            return res.status(500).json({
                message:"Not Created",
                error:true,
                success:false
            })
        }

        return res.json({
            message:"Uploaded Successfully",
            data:saveCategory,
            success:true,
            error:false,
        })


    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}


export const getCategoryController = async(req,res)=>{
    try{
        const data = await CategoryModel.find().sort({name:1});

        return res.json({
            data:data,
            error:false,
            success:true
        })
    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}

export const updateCategoryController = async(req,res)=>{
    try{
        // Destructure _id from req.body as sent by the frontend
        const {_id, name, image} = req.body;

        // Use findByIdAndUpdate to get the updated document back, if needed
        // Or use updateOne if you just need confirmation of update
        const updatedCategory = await CategoryModel.findByIdAndUpdate(_id, {
            name,
            image
        }, { new: true }); // { new: true } returns the updated document

        if (!updatedCategory) {
            return res.status(404).json({
                message: "Category not found.",
                success: false,
                error: true
            });
        }

        return res.json({
            message:"Category updated successfully",
            success:true,
            error:false,
            data: updatedCategory // Now 'updatedCategory' is defined and holds the updated document
        });

    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            success:false,
            error:true
        });
    }
};



export const deleteCategoryController = async (req,res)=>{
    try{
        const{_id} =req.body;
        
        const checkSubCategory = await subCategoryModel.find({
            category : {
                "$in" :[_id]
            }
        }).countDocuments()

        const checkProduct = await ProductModel.find({
            category : {
                "$in" :[_id]
            }
        }).countDocuments()


        if(checkProduct > 0 || checkSubCategory>0){
            return res.status(400).json({
                message:"Category is already used cannot delete",
                error:true,
                success:false
            })
        }

        const deleteCategory = await CategoryModel.deleteOne({_id:_id});

        return res.json({
            message:"Deleted Category Successfully",
            data:deleteCategory,
            error:false,
            success:true
        })


        return res.json({
            
        })
    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            success:false,
            error:true
        })
    }
}