import { addAddressController, deleteAddressController, getAddressController, updateAddressController } from "../controllers/address.contrroller.js";
import {Router} from "express"
import auth from "../middleware/auth.js";

const addressRouter = Router();

addressRouter.post('/create',auth,addAddressController)
addressRouter.get('/get',auth,getAddressController)
addressRouter.put('/edit',auth,updateAddressController)
addressRouter.delete('/delete',auth,deleteAddressController)






export default addressRouter