import {Router} from "express"
import auth from "../middleware/auth.js"
import { AddSubCategoryController, deleteSubCategory, getSubCategoryController, updateSubCategoryController } from "../controllers/subCategory.controller.js"

const subCatergoryRouter = Router()
subCatergoryRouter.post('/create',auth,AddSubCategoryController)
subCatergoryRouter.post('/get',getSubCategoryController)
subCatergoryRouter.put('/update',auth,updateSubCategoryController)
subCatergoryRouter.delete('/delete',auth,deleteSubCategory)

deleteSubCategory

export default subCatergoryRouter