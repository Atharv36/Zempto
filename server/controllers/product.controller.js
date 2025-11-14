import ProductModel from "../models/product.model.js"

export const createProductController =  async(req,res)=>{
    try{
        const {name ,
        image,
        category,
        subCategory,
        unit,
        stock,
        price,
        discount,
        description,
        more_details,
        } = req.body
        if(!name || !image[0] || !category[0] || !subCategory[0] || !unit || !price || !description){
            return res.status(400).json({
                message:"Enter Required Fields",
                success:false,
                error:true
            })
        }
        const product = new ProductModel({
            name ,
        image,
        category,
        subCategory,
        unit,
        stock,
        price,
        discount,
        description,
        more_details
        })
        const save = await product.save();
        return res.json({
            message:"Product Creaqted Successfully",
            error:false,
            success:true,
            data:save
            
        })
    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}

export const getProductController = async(req,res)=>{
    try{
        let {page,limit,search} = req.body
        
        //product 
        //total Number of product
        
        if (!page){
            page=1
        }
        if(!limit){
            limit=10
        }
        //in productModel - using regex instead of $text to avoid index requirement
        const query = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        }:{

        }
        //pagenation
        const skip = (page-1) * limit
        const [data,totalCount] = await Promise.all([
            ProductModel.find(query).sort({createdAt:-1}).skip(skip).limit(limit),
            ProductModel.countDocuments(query)    
        ])
        return res.json({
            message:"Process Successfull",
            error:false,
            success:true,
            totalCount:totalCount,
            totalNoPage:Math.ceil(totalCount/limit),
            data:data
        })
    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false,
        })
    }
}

export const deleteProductController = async (req, res) => {
    try {
        // Get the product ID from the request body
        const { _id } = req.body;

        // Check if an ID was provided
        if (!_id) {
            return res.status(400).json({
                message: "Product ID is required to delete.",
                error: true,
                success: false
            });
        }

        // Find the product by its ID and delete it
        const deletedProduct = await ProductModel.findByIdAndDelete(_id);

        // If no product was found with that ID
        if (!deletedProduct) {
            return res.status(404).json({
                message: "Product not found.",
                error: true,
                success: false
            });
        }

        return res.json({
            message: "Product deleted successfully!",
            success: true,
            error: false,
            data: deletedProduct // Optionally return the deleted item
        });

    } catch (error) {
        // Handle any other errors (e.g., server or database errors)
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const getProductByCategory = async(req,res)=>{
    try{    
        const {id}=req.body;
        if(!id){
            return res.status(400).json({
                message:"Provide Category Id",
                error:true,
                success:false
            })
        }
        const product = await ProductModel.find({
            category:{$in:id}
        }).limit(15)
        return res.json({
            message:"Category Product List",
            error:false,
            success:true,
            data:product
        })
    }catch(error){
        return res.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
    }
}



export const getProductByCategoryAndSubCategory = async (req, res) => {
  try {
    let { categoryId, subCategoryId, page, limit } = req.body;

    if (!categoryId || !subCategoryId) {
      return res.status(400).json({
        message: "Provide subCategory and Category Id",
        error: true,
        success: false,
      });
    }

    page = page || 1;
    limit = limit || 10;

    const skip = (page - 1) * limit;

    const query = {
      category: { $in: [categoryId] },
      subCategory: { $in: [subCategoryId] },
    };

    const [data, dataCount] = await Promise.all([
      ProductModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ProductModel.countDocuments(query),
    ]);

    return res.json({
      message: "Product List",
      data: data,
      totalCount: dataCount,
      page: page,
      limit: limit,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};


export const getProductDetails = async(req,res)=>{
    try{
        const {productId}=req.body;
        const product = await ProductModel.findOne({_id:productId});

        return res.json({
            message:"Product Details",
            data:product,
            error:false,
            success:true
        })
    }catch(error){
        return res.status(500).json({
        message: error.message || error,
        error: true,
        success: false,
    });
    }
}

export const updateProductDetails = async(request,response)=>{
    try {
        const { _id } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "provide product _id",
                error : true,
                success : false
            })
        }

        const updateProduct = await ProductModel.updateOne({ _id : _id },{
            ...request.body
        })

        return response.json({
            message : "updated successfully",
            data : updateProduct,
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}



//searchProduct

export const searchProduct = async(req,res)=>{
    try{
        let {search,page,limit}=req.body;

        if(!page){
            page=1
        }
        if(!limit){
            limit=10
        }
        
        // Escape special regex characters to prevent regex injection and improve search
        const escapeRegex = (text) => {
            return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        
        // Using regex instead of $text to avoid index requirement
        // Escape special characters and create a pattern that matches partial words
        const query = search ? {
            $or: [
                { name: { $regex: escapeRegex(search.trim()), $options: 'i' } },
                { description: { $regex: escapeRegex(search.trim()), $options: 'i' } }
            ]
        }:{}

        const skip = (page-1)* limit

        const [data,dataCount]= await Promise.all([
            ProductModel.find(query).sort({createdAt:-1}).skip(skip).limit(limit).populate('category subCategory'),
            ProductModel.countDocuments(query)
        ])

        return res.json({
            message:"Product Data",
            success:true,
            error:false,
            data:data,
            totalCount:dataCount,
            totalPage:Math.ceil(dataCount/limit),
            page:page,
            limit:limit
        })
    }catch(error){
        return res.status(500).json({
            message:error.message||error,
            success:false,
            error:true
        })
    }
    
}