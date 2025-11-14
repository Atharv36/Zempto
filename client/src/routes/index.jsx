import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home.jsx";
import SearchPage from "../pages/SearchPage.jsx";
import ForgotPassword from "../pages/ForgotPassword.jsx"
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Verify_otp from "../pages/Verify_otp.jsx";
import ResetPassword from "../pages/ResetPassword.jsx";
import UsersMenuMobile from "../pages/UsersMenuMobile.jsx";
import Dashboard from "../layout/Dashboard.jsx";
import Profile from "../pages/Profile.jsx";
import MyOrder from "../pages/MyOrder.jsx";
import Addresses from "../pages/Addresses.jsx";
import CategoryPage from "../pages/CategoryPage.jsx";
import SubCategory from "../pages/SubCategory.jsx";
import UploadProduct from "../pages/UploadProduct.jsx";
import ProductAdmin from "../pages/ProductAdmin.jsx";
import AdminPermission from "../layout/AdminPermission.jsx";
import ProductList from "../pages/ProductList.jsx";
import ProductDisplayPage from "../pages/ProductDisplayPage.jsx";
import DisplayCartItems from "../../components/DisplayCartItems.jsx";
import CheckoutPage from "../pages/CheckoutPage.jsx";
import Success from "../pages/Success.jsx";
import Cancel from "../pages/Cancel.jsx";

const router = createBrowserRouter([
    {
        path:"/",
        element: <App/>,
        children:[
            {
                path:"",
                element:<Home/>
            },
            {
                path:"search",
                element: <SearchPage />
            },
            {
                path:"login",
                element: <Login />
            },
            {
                path:"register",
                element: <Register/>
            },
            {
                path:"forgot-password",
                element:<ForgotPassword />
            },
            {
                path:"verify-forgot-password-otp",
                element:<Verify_otp/>
            },
            {
                path:"reset-password",
                element:<ResetPassword/>
            },
            {
                path:"user",
                element:<UsersMenuMobile/>
            },
            {
                path:'dashboard',
                element:<Dashboard/>,
                children:[
                    {
                        path:"profile",
                        element:<Profile/>
                    },
                    {
                        path:"myorders",
                        element:<MyOrder/>
                    },
                    {
                        path:"address",
                        element:<Addresses/>
                    },
                    {
                        // wrap the children inside admin perm
                        path:'category',
                        element: <AdminPermission><CategoryPage/></AdminPermission> 
                    },
                    {
                        path:'subcategory',
                        element: <AdminPermission><SubCategory/></AdminPermission> 
                    },
                    {
                        path:'upload-product',
                        element: <AdminPermission><UploadProduct/></AdminPermission> 
                    },
                    {
                        path:'product',
                        element:<AdminPermission><ProductAdmin/></AdminPermission> 
                    },


                ]
            },
            {
                path:":category",
                children : [
                    {
                        path:":subCategory",
                        element:<ProductList/>
                    }
                ]
            },
            {
                path:"product/:product",
                element:<ProductDisplayPage/>
            },
            {
                path:'cart',
                element:<DisplayCartItems/>
            },
            {
                path:'checkout',
                element: <CheckoutPage/>
            },
            {
                path:"success",
                element:<Success/>
            },
            {
                path:"cancel",
                element: <Cancel/>
            }
        ]
    }
]);


export default router;