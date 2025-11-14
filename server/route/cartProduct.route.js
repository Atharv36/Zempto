import {Router} from "express";
import auth from "../middleware/auth.js"
import { addToCartItemController, deleteCartItem, getCartItemController, updateCartItemQtyController } from "../controllers/cart.controller.js";
const cartRouter = Router();

//change auth?
cartRouter.post('/create',auth,addToCartItemController)
cartRouter.get('/get',auth,getCartItemController)
cartRouter.put('/update-qty',auth,updateCartItemQtyController)
cartRouter.delete('/delete-cart-item',auth,deleteCartItem)

export default cartRouter