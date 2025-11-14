import UserModel from "../models/user.model.js";
import bcryptjs, { genSalt }  from 'bcryptjs'
import sendEmail from "../config/sendEmail.js";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import { response } from "express";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";
import generateOtp from "../utils/generateOtp.js";
import forgotPasswordTemplate from "../utils/forgotPassswordTemplate.js";
import jwt from "jsonwebtoken";


export async function registerUserController(req,res) {
    try{
        const {name,email,password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({
                message:"Provide field",
                error:true,
                success:false
            })
        }
        // Normalize email and name to lowercase
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedName = name.trim();
        const user = await UserModel.findOne({email: normalizedEmail})

        if(user){
            return res.json({
                message:"Already Registered",
                error:true,
                success:false
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(password,salt)

        const payLoad = {
            name: normalizedName,
            email: normalizedEmail,
            password:hashPassword
        }
        const newUser = new UserModel(payLoad);
        const save = await newUser.save();

        const VerifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${save._id}`

        const verifyEmail = await sendEmail({
            sendTo:normalizedEmail,
            subject:"Verify Your Email",
            html:verifyEmailTemplate({
                name: normalizedName,
                url : VerifyEmailUrl
            })
        })

        return res.json({
            message:"User created Successfully",
            error : false ,
            success : true,
            data : save
        })
    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}

export async function verifyEmailController(req,res) {
    try{
        const {code} = req.body;
        const user = await UserModel.findOne({_id : code});

        if(!user){
            return res.status(400).json({
                message:"Invalid code ie userId",
                error:true,
                success:false
            })
        }
        const updateUser = await UserModel.updateOne({_id:code},{verify_email:true});
        return res.json({message:"Verification Done",success:true,error:false})

    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:true//
        })
    }
    
}


//login controller

export async function loginController(req,res){
    try{
        const {email,password} =req.body;
        // Normalize email to lowercase
        const normalizedEmail = email ? email.toLowerCase().trim() : email;
        const user = await UserModel.findOne({email: normalizedEmail});


        if(!normalizedEmail || !password){
            return res.status(400).json({
                message:"Provide email and password",
                error:true,
                success:false
            })
        }

        if(!user){
            return res.status(400).json({message:"User not register",error:true,success:false})
        }
        
        if(user.status !== "Active"){
            return res.status(400).json({
                message:"Contact Admin to make Your account active again",
                error : true,
                success:false            
            })
        }
        const checkPassword = await bcryptjs.compare(password,user.password);
        if(!checkPassword){
            return res.status(400).json({
                message:"Check Password",
                error:true,
                success:false
            })
        }

        const accessToken = await generateAccessToken(user._id);
        const refreshToken = await generateRefreshToken(user._id);

        const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
            last_login_date: new Date()
        })

        const cookieOption  = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }
        res.cookie('accessToken',accessToken,cookieOption);
        res.cookie('refreshToken',refreshToken,cookieOption);

        return res.json({
            message:"Login Successful",
            error:false,
            success:true,
            data:{
                accessToken,
                refreshToken
            }
        })

    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            error : true,
            success:false
        })
    }
}
//logout Controller
export async function logoutController(req,res){
    try{
        const userid = req.userId//middleware
        const cookieOption  = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }
        res.clearCookie("accessToken",cookieOption)
        res.clearCookie("refreshToken",cookieOption)

        await UserModel.findByIdAndUpdate(userid,{refresh_token:""});
        
        return res.json({
            message:"Logout successfully",
            error:false,
            success:true
        })
    }catch(error){
        return res.status(500).json({
            message:error.message|| error,
            error:true,
            success:false
        })
    }
}

//upload avatar

export async function uploadAvatar(req,res){
    try{
        const userId = req.userId;//from auth middleware
        const image = req.file;//from multer middleware
        const upload = await uploadImageCloudinary(image);


        const updateUser = await UserModel.findByIdAndUpdate(userId,{
            avatar: upload.url
        })
        return res.json({
            message:"uploaded avatar",
            success:true,
            error:false,
            data:{
                _id:userId,
                avatar:upload.url
            }
        })
    }catch(error){
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
    
}

//update user details

export async function updateUserDetails(req,res) {
    try{
        const userId=req.userId;//from auth middlee=ware
        
        const {name,email,mobile,password}=req.body;
        let hashPassword=""
        if(password){
            const salt = await bcryptjs.genSalt(10)
            hashPassword = await bcryptjs.hash(password,salt)
        }
        // Normalize email and name to lowercase
        const normalizedEmail = email ? email.toLowerCase().trim() : email;
        const normalizedName = name ? name.trim() : name;
        const updateUser = await UserModel.updateOne({_id:userId},{
            ...(normalizedName && {name:normalizedName}),
            ...(normalizedEmail && {email:normalizedEmail}),
            ...(mobile && {mobile:mobile}),
            ...(password && {password:hashPassword})

        })

        return res.json({
            message:"Updated User Successfully",
            error:false,
            success:true,
            data:updateUser
        })

    }catch(error){
        return res.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
    }
    
}

//forget Password => send emil(otp) => verify Otp controller => reset Password controller(update)

//forgotPasswordController when not loged in
export async function forgotPasswordController(req,res) {
    try{
        const {email} = req.body;
        // Normalize email to lowercase
        const normalizedEmail = email ? email.toLowerCase().trim() : email;
        const user = await UserModel.findOne({email: normalizedEmail});

        if(!user){
            return res.status(400).json({
                message:"Email not registered",
                error:true,
                success:false
            })
        }

        const otp = generateOtp();
        const expireTime = new Date() + 60 * 60 *1000 //1hr
//const expireTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
        const update = await UserModel.findByIdAndUpdate(user._id,{
            forgot_password_otp:otp,
            forgot_password_expiry:new Date(expireTime).toISOString()
        });

        await sendEmail({
            sendTo:normalizedEmail,
            subject:"Otp For Zempto",
            html:forgotPasswordTemplate({
                name:user.name,
                otp:otp
            })
        })
        return res.json({
            message:"Check Email",
            error:false,
            success:true
        })


    }catch(error){
        return res.json({
            message:error.message||error,
            error:true,
            success:false
        })
    }
    
}

//to check otp

export async function verifyForgotPasswordOtp(req,res) {
    try{
        const {email , otp} = req.body;
        // Normalize email to lowercase
        const normalizedEmail = email ? email.toLowerCase().trim() : email;
        const user = await UserModel.findOne({email: normalizedEmail});

        if(!normalizedEmail || !otp){
            return res.status(400).json({
                message:"Provide Email and Otp",
                error:true,
                success:false
            })
        }

        if(!user){
            return res.status(400).json({
                message:"Email not registered",
                error:true,
                success:false
            })
        }

        const currentTime = new Date().toISOString();
        if(user.forgot_password_expiry < currentTime){
            return res.status(400).json({
                message:"OTP expired",
                error:true,
                success:false
            })
        }
        if(otp !== user.forgot_password_otp){
            return res.status(400).json({
                message:"Wrong Otp entered",
                error:true,
                success:false
            })
        }
        

        //if otp === user.forgot_password_otp
        const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
            forgot_password_expiry:"",
            forgot_password_otp:""
        })
        return res.json({
                message:"Verified Successfully",
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


//reset Password

export async function resetPassword(req,res) {
    try{

        const {email,newPassword,confirmPassword} = req.body;
        
        // Normalize email to lowercase
        const normalizedEmail = email ? email.toLowerCase().trim() : email;
        
        if(!normalizedEmail || !newPassword || !confirmPassword){
            return res.status(400).json({
                message:"Provide Required Fields",
            })
        }

        const user = await UserModel.findOne({email: normalizedEmail});
        if(!user){
            return res.status(400).json({
                message:"User not registered",
                error:true,
                success:false
            })
        }

        if(newPassword !== confirmPassword){
            return res.status(400).json({
                message:"Password Not Matched",
                error:true,
                success:false
            })
        }

        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(newPassword,salt);
        const update = await UserModel.findOneAndUpdate(user._id,{
            password:hashPassword
        })

        return res.json({
            message:"Password Updated Successfully",
            error : false,
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

//refresh Token controller

export async function refreshToken(req,res) {
    try{
        const refreshToken = req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1]
    
    if(!refreshToken){
        return res.status(400).json({
                message:"Invalid Token,Please Login/Register to proceed ",
                error:true,
                success:false
            }) 
    }
    // console.log("refresh Token",refreshToken)
    
    const verifyToken = await jwt.verify(refreshToken,process.env.SECRET_KEY_REFRESH_TOKEN)


    if(!verifyToken){
        res.status(400).json({
                message:"Token is expired , login again",
                error:true,
                success:false
            }) 
    }
const cookieOption  = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }
    const userId = verifyToken?.id

    const newAccessToken = await generateAccessToken(userId);
    res.cookie('accessToken',newAccessToken,cookieOption)

    return res.json({
                message:"New Access Token generated",
                error:false,
                success:true,
                data:{
                    accessToken:newAccessToken
                }
            }) 
    }catch(error){
        return res.status(500).json({
                message:error.message || error,
                error:true,
                success:false
            }) 
    }
    
}



//get user details
export async function userDetails(req,res) {
    try{
        const userId = req.userId
        const user = await UserModel.findById(userId).select('-password -refresh_token')
        
        return res.json({
            message:"User Details",
            data:user,
            error:false,
            success:true,
        })
    
    }catch(error){
        response.status(500).json({
            message:"DB error",
            success:false,
            error:true
        })
    }
}