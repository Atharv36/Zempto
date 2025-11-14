import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet'
import connectDB from './config/connectDB.js';
import userRouter from './route/user.route.js';
import categoryRouter from './route/category.route.js';
import uploadImageRouter from './route/uploadImage.router.js';
import subCatergoryRouter from './route/subCategory.route.js';
import productRouter from "./route/product.route.js"
import cartRouter from './route/cartProduct.route.js';
import addressRouter from './route/address.route.js';
import orderRouter from './route/order.route.js';
const app =express();
app.use(cors({
    credentials:true,// to access the cookie in frontend
    origin: process.env.FRONTEND_URL || 'http://localhost:5174' // Default to Vite dev server port
}))

// Stripe webhook needs raw body for signature verification
app.use('/api/order/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan());
app.use(helmet({
    crossOriginResourcePolicy:false //or throws a error when frontend and backend in different domain
}))

const PORT = 8080 || process.env.PORT;

app.get("/",(req,res)=>{
    res.json({message:"HEllo there,server is running"})
});

app.use('/api/user',userRouter);
app.use('/api/category',categoryRouter);
app.use('/api/file',uploadImageRouter)
app.use('/api/subcategory',subCatergoryRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/address',addressRouter);
app.use("/api/order",orderRouter)

    connectDB().then(()=>{
        app.listen(PORT ,()=>{
    console.log(`SERVER IS LIVE AT ${PORT}`);
    })
    })

