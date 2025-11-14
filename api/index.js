import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import connectDB from '../server/config/connectDB.js';
import userRouter from '../server/route/user.route.js';
import categoryRouter from '../server/route/category.route.js';
import uploadImageRouter from '../server/route/uploadImage.router.js';
import subCatergoryRouter from '../server/route/subCategory.route.js';
import productRouter from '../server/route/product.route.js';
import cartRouter from '../server/route/cartProduct.route.js';
import addressRouter from '../server/route/address.route.js';
import orderRouter from '../server/route/order.route.js';

const app = express();

app.use(cors({
    credentials: true, // to access the cookie in frontend
    origin: process.env.FRONTEND_URL || 'http://localhost:5174' // Default to Vite dev server port
}));

// Stripe webhook needs raw body for signature verification - MUST be before express.json()
app.use('/api/order/webhook', express.raw({ type: 'application/json' }));

// All other routes use JSON
app.use(express.json());
app.use(cookieParser());
app.use(morgan());
app.use(helmet({
    crossOriginResourcePolicy: false // or throws a error when frontend and backend in different domain
}));

// Connect to database (mongoose connection is cached, so this is safe for serverless)
connectDB().catch(err => {
    console.error('Database connection error:', err);
});

// Test route to verify function is working
app.get("/api/test", (req, res) => {
    res.json({ message: "API function is working", timestamp: new Date().toISOString() });
});

// Root route
app.get("/", (req, res) => {
    res.json({ message: "Hello there, server is running" });
});

// API routes
app.use('/api/user', userRouter);
app.use('/api/category', categoryRouter);
app.use('/api/file', uploadImageRouter);
app.use('/api/subcategory', subCatergoryRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use("/api/order", orderRouter);

// 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).json({ 
        error: true, 
        message: "Route not found",
        path: req.path 
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: true, 
        message: err.message || "Internal server error" 
    });
});

// Export app for Vercel serverless
export default app;

