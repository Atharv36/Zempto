import { Router } from "express";
import uploadImageController from "../controllers/uploadImage.controller.js";
import upload from "../middleware/multer.js";
import auth from "../middleware/auth.js";

const uploadImageRouter = Router()

uploadImageRouter.post("/upload",auth,upload.single('image'),uploadImageController);


export default uploadImageRouter