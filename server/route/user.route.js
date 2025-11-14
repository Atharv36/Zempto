import {Router} from 'express';
import { forgotPasswordController, logoutController, refreshToken, registerUserController, resetPassword, userDetails, verifyForgotPasswordOtp } from '../controllers/user.controllers.js';
import { verifyEmailController } from '../controllers/user.controllers.js';
import { loginController } from '../controllers/user.controllers.js';
import { updateUserDetails } from '../controllers/user.controllers.js';
import { uploadAvatar } from '../controllers/user.controllers.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const userRouter = Router();

userRouter.post('/register',registerUserController)
userRouter.post('/verify-email',verifyEmailController)
userRouter.post('/login',loginController)
userRouter.get('/logout',auth,logoutController)
userRouter.put('/upload-avatar',auth,upload.single('avatar'),uploadAvatar)
userRouter.put('/update-user',auth,updateUserDetails)
userRouter.put('/forgot-password',forgotPasswordController);
userRouter.put('/verify-forgot-password-otp',verifyForgotPasswordOtp)
userRouter.put('/reset-password',resetPassword)
userRouter.post('/refresh-token',refreshToken)
userRouter.get('/user-details',auth,userDetails)


export default userRouter