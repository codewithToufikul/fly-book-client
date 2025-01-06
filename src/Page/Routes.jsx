import { createBrowserRouter } from "react-router";
import Home from "./Home/Home";
import Login from "./Login/Login";
import Register from "./Register/Register";
import PrivateRoute from "./PrivateRoute/PrivateRoute";
import Profile from "./Profile/Profile";
import RecoverPass from "./RecoverPass/RecoverPass";
import ResetPassword from "./ResetPassword/ResetPassword";
import ErrorPage from "./ErrorPage/ErrorPage";
import Peoples from "./Peoples/Peoples";
import PublicOpinion from "./PublicOpinion/PublicOpinion";
import UserProfile from "./userProfile/userProfile";
import MyLibrary from "./MyLibrary/MyLibrary";
import MyLibraryBook from "../Components/MyLibraryBook/MyLibraryBook";
import UserLibrary from "./UserLibrary/UserLibrary";
import UserLibraryBook from "../Components/UserLibraryBook/UserLibraryBook";
import MyBookRequest from "../Components/MyBookRequest/MyBookRequest";
import MyRequestBook from "../Components/MyRequestBook/MyRequestBook";
import MyTrans from "../Components/MyTrans/MyTrans";
import MyOnindoLibrary from "../Components/MyOnindoLibrary/MyOnindoLibrary";
import MyOnindoAllBook from "../Components/MyOnindoAllBook/MyOnindoAllBook";
import UserOnindoLibrary from "../Components/UserOnindoLibrary/UserOnindoLibrary";
import MyOnindoRequest from "../Components/MyOnindoRequest/MyOnindoRequest";
import DonateHistory from "./DonateHistory/DonateHistory";
import AdminDashBoard from "./AdminDashBoard/AdminDashBoard";
import AllUsersAdmin from "./DashboardPages/AllUsersAdmin";
import DashboardData from "./DashboardPages/DashboardData";
import AllOpinionAdmin from "./DashboardPages/AllOpinionAdmin";
import AllBooksAdmin from "./DashboardPages/AllBooksAdmin";
import AllTransferDetails from "./DashboardPages/AllTransferDetails";
import AddadminPost from "./DashboardPages/AddadminPost";
import AdminRoute from "./AdminRoute/AdminRoute";
import ScearchPage from "./ScearchPage/ScearchPage";
import ChatsPage from "./ChatsPage/ChatsPage";
import MassegeBox from "../Components/MassegeBox/MassegeBox";
import Notifications from "./Notifications/Notifications";

export const router = createBrowserRouter([
    {
        path: '/',
        element:<Home/>
    },
    {
        path: '/login',
        element: <Login></Login>
    },
    {
        path: '/register',
        element: <Register/>
    },
    {
        path: '/my-profile',
        element: <PrivateRoute><Profile></Profile></PrivateRoute>
    },
    {
        path: '/recover-password',
        element: <RecoverPass/>
    },
    {
        path: '/reset_password/:id/:token',
        element: <ResetPassword></ResetPassword>
    },
    {
        path: '/peoples',
        element: <PrivateRoute><Peoples/></PrivateRoute>
    },
    {
        path: '/public-opinion',
        element: <PrivateRoute><PublicOpinion/></PrivateRoute>
    },
    {
        path: '/profile/:userId',
        element: <PrivateRoute><UserProfile></UserProfile></PrivateRoute>
    },
    {
        path: '/library/:userId',
        element: <PrivateRoute><UserLibrary/></PrivateRoute>,
        children: [
            {
                path: '/library/:userId',
                element: <PrivateRoute><UserLibraryBook/></PrivateRoute>
            },
            
            {
                path: '/library/:userId/onindo',
                element: <PrivateRoute><UserOnindoLibrary/></PrivateRoute>
            }
        ]
    },
    {
        path: '/my-library',
        element: <PrivateRoute><MyLibrary/></PrivateRoute>,
        children: [
            {
                path: '/my-library',
                element: <PrivateRoute><MyLibraryBook/></PrivateRoute>
            },
            {
                path: '/my-library/book-request',
                element: <PrivateRoute><MyBookRequest/></PrivateRoute>
            },
            {
                path: '/my-library/my-request',
                element: <PrivateRoute><MyRequestBook/></PrivateRoute>
            },
            {
                path: '/my-library/transfer-history',
                element: <PrivateRoute><MyTrans/></PrivateRoute>
            },
        ]
    },
    {
        path: '/my-onindo-library',
        element: <PrivateRoute><MyOnindoLibrary/></PrivateRoute>,
        children:[
            {
                path: '/my-onindo-library',
                element: <PrivateRoute><MyOnindoAllBook/></PrivateRoute>
            },
            {
                path: '/my-onindo-library/book-request',
                element: <PrivateRoute><MyOnindoRequest/></PrivateRoute>
            }
        ]
    },
    {
        path: '/donate-history',
        element: <DonateHistory></DonateHistory>
    },
    {
        path: '/dashboard',
        element: <AdminRoute><PrivateRoute><AdminDashBoard/></PrivateRoute></AdminRoute>,
        children: [
            {
                path: '/dashboard',
                element: <AdminRoute><PrivateRoute><DashboardData/></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/all-users',
                element: <AdminRoute><PrivateRoute><AllUsersAdmin/></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/all-opinion',
                element: <AdminRoute><PrivateRoute><AllOpinionAdmin/></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/all-books',
                element: <AdminRoute><PrivateRoute><AllBooksAdmin/></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/transfer-history',
                element: <AdminRoute><PrivateRoute><AllTransferDetails/></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/add-post',
                element: <AdminRoute><PrivateRoute><AddadminPost/></PrivateRoute></AdminRoute>
            },
        ]
    },{
        path: '/search-result',
        element: <PrivateRoute><ScearchPage/></PrivateRoute>
    },{
        path: '/chats',
        element: <PrivateRoute><ChatsPage/></PrivateRoute>,
        children: [
            {
                path: '/chats/:userId',
                element: <PrivateRoute><MassegeBox/></PrivateRoute>
            }
        ]
    },{
        path: "/notifications",
        element: <PrivateRoute><Notifications/></PrivateRoute>
    },
    {
        path: '*',
        element: <ErrorPage/>
    }
  ]);