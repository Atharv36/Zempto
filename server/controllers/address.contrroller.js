import AddressModel from "../models/address.model.js"
import UserModel from "../models/user.model.js"


export const addAddressController = async(req,res)=>{
    try{
        const userId = req.userId
        const { address_line , city,state,pincode,country,mobile } = req.body;

        const createAddress = new AddressModel({
            address_line,
            city,
            state,
            country,
            pincode,
            mobile,
            userId:userId
        })
        const saveAddress = await createAddress.save();

        const addUserAddressId = await UserModel.findByIdAndUpdate(userId,{
            $push:{
                address_details:saveAddress._id
            }
        })
        return res.json({
            message:"Address Created",
            success:true,
            error:false,
            data:saveAddress
        })


    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}

export const getAddressController =async(req,res)=>{
    try{
        const userId = req.userId;
        const data = await AddressModel.find({userId:userId}).sort({createdAt:-1});

        return res.json({
            data:data,
            message:"List of Address",
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

export const updateAddressController = async(req,res)=>{
    try{
        const userId = req.userId;
        const {_id,address_line,city,state,country,pincode,mobile}=req.body;
        const updateAddress = await AddressModel.updateOne({_id:_id,userId:userId},{
            address_line,
            city,
            state,
            country,
            pincode,
            mobile
        });
        return res.json({
            messsage:"Updated Successfully",
            error:false,
            success:true,
            data:updateAddress
        })
    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}


export const deleteAddressController = async(req,res)=>{
    try{
        console.log("req.body",req.body)
        const userId =req.userId;
        const {_id}= req.body;

        const deleteAddress = await AddressModel.deleteOne({_id:_id,userId:userId})
        return res.json({
            message:"Deleted Successfully",
            error:false,
            success:true,
            data:deleteAddress
        })
    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}