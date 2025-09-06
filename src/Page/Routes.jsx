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
import UserProfile from "./UserProfile/UserProfile";
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
import ChatList from "./ChatList/ChatList";
import Thesis from "./Thesis/Thesis";
import FreeAi from "./FreeAi/FreeAi";
import ThesisPost from "./DashboardPages/ThesisPost";
import ThesisRead from "./ThesisRead/ThesisRead";
import ContractUs from "./ContractUs/ContractUs";
import AdminPosts from "./DashboardPages/AdminPosts";
import NearbyFriends from "./NearbyFriends/NearbyFriends";
import PdfBook from "./PdfBook/PdfBook";
import PdfAdd from "./DashboardPages/PdfAdd";
import ViewPdfBook from "./ViewPdfBook/ViewPdfBook";
import AddCategory from "./DashboardPages/AddCategory";
import AllAdminPdfBooks from "./DashboardPages/AllAdminPdfBooks";
import AiPosts from "./DashboardPages/AiPosts";
import ViewAiPost from "./ViewAiPost/ViewAiPost";
import Organizations from "./Organizations/Organizations";
import AddOrganization from "./AddOrganization/AddOrganization";
import OrganizationDetails from "./OrganizationDetails/OrganizationDetails";
import MyOrganizations from "./MyOrganizations/MyOrganizations";
import MyOrganizationDetails from "./MyOrganizationDetails/MyOrganizationDetails";
import AdminManageOrg from "./DashboardPages/AdminManageOrg";
import AddActivities from "./AddActivities/AddActivities";
import MyAllActivies from "./MyAllActivies/MyAllActivies";
import OrgActivies from "./OrgActivies/OrgActivies";
import ActivityDetails from "./ActivityDetails/ActivityDetails";
import OrgEvents from "./OrgEvents/OrgEvents";
import SocialOrganizations from "./SocialOrganizations/SocialOrganizations";
import AllOrganizationManage from "./DashboardPages/AllOrganizationManage";
import AdminEManage from "./DashboardPages/AdminEManage";
import ELearning from "./ELearning/ELearning";
import CourseDetails from "./CourseDetails/CourseDetails";
import AudioBooks from "./AudioBooks/AudioBooks";
import Channels from "./Channels/Channels";
import ManageChannel from "./DashboardPages/ManageChannel";
import AddCourse from "./DashboardPages/AddCourse"
import ChannelBox from "./ChannelBox/ChannelBox";
import ChatBot from "./ChatBot/ChatBot";
import ManageCourse from "./DashboardPages/ManageCourse";
import AboutUs from "./AboutUs/AboutUs";
import PrivacyPolicy from "./PrivacyPolicy/PrivacyPolicy";
import TermsConditions from "./TermsConditions/TermsConditions";
import HomePostDetails from "./HomePostDetails/HomePostDetails";
import MarketplaceHome from "./Marketplace/MarketplaceHome/MarketplaceHome";
import PostDetail from "./PostDetail/PostDetail";
import { patch } from "@mui/material";
import FullMessageView from "./FullMessageView/FullMessageView";
import MarketUser from "./MarketUser/MarketUser";
import ReqSeller from "./Marketplace/ReqSeller/ReqSeller";
import ProductDetails from "./Marketplace/ProductDetails/ProductDetails";
import CategoryProduct from "./Marketplace/CategoryProduct/CategoryProduct";
import MSearchPage from "./Marketplace/MSearchPage/MSearchPage";
import CartPage from "./Marketplace/CartPage/CartPage";
import BuyNowPage from "./Marketplace/BuyNowPage/BuyNowPage";
import PaymentPage from "./Marketplace/PaymentPage/PaymentPage";
import MarketAdmin from "./Marketplace/MarketAdmin/MarketAdmin";
import AdminOverview from "./Marketplace/MarketAdmin/AdminOverview";
import { SellersData } from "./Marketplace/MarketAdmin/SellersData";
import SellerRequest from "./Marketplace/MarketAdmin/SellerRequest";
import SellerProfileAccess from "./Marketplace/SellerProfileAccess/SellerProfileAccess";
import SellerDashboard from "./Marketplace/SellerDashboard/SellerDashboard";
import SellerOverview from "./Marketplace/SellerDashboard/SellerDashboardPage/SellerOverview";
import SellerPrivet from "./Marketplace/SellerDashboard/SellerPrivet";
import AddProduct from "./Marketplace/SellerDashboard/SellerDashboardPage/AddProduct";
import AllSellerProducts from "./Marketplace/SellerDashboard/SellerDashboardPage/AllSellerProducts";
import SellerOrders from "./Marketplace/SellerDashboard/SellerDashboardPage/SellerOrders";
import SellerPayments from "./Marketplace/SellerDashboard/SellerDashboardPage/SellerPayments";
import SellerProfile from "./Marketplace/SellerDashboard/SellerDashboardPage/SellerProfile";
import SellerWithdrawPage from "./Marketplace/SellerDashboard/SellerDashboardPage/SellerWithdrawPage";
import AdminProducts from "./Marketplace/MarketAdmin/AdminProducts";
import AdminCategories from "./Marketplace/MarketAdmin/AdminCategories";
import AdminProductsOrders from "./Marketplace/MarketAdmin/AdminProductsOrders";
import AdminPaymentPage from "./Marketplace/MarketAdmin/AdminPaymentPage";
import BannerRequest from "./Marketplace/SellerDashboard/SellerDashboardPage/BannerRequest";
import AdminBannerRequest from "./Marketplace/MarketAdmin/AdminBannerRequest";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />
    },
    {
        path: '/login',
        element: <Login></Login>
    },
    {
        path: '/register',
        element: <Register />
    },
    {
        path: '/my-profile',
        element: <PrivateRoute><Profile></Profile></PrivateRoute>
    },
    {
        path: '/recover-password',
        element: <RecoverPass />
    },
    {
        path: '/reset_password/:id/:token',
        element: <ResetPassword></ResetPassword>
    },
    {
        path: '/peoples',
        element: <PrivateRoute><Peoples /></PrivateRoute>
    },
    {
        path: '/public-opinion',
        element: <PrivateRoute><PublicOpinion /></PrivateRoute>
    },
    {
        path: '/profile/:userId',
        element: <PrivateRoute><UserProfile></UserProfile></PrivateRoute>
    },
    {
        path: '/library/:userId',
        element: <PrivateRoute><UserLibrary /></PrivateRoute>,
        children: [
            {
                path: '/library/:userId',
                element: <PrivateRoute><UserLibraryBook /></PrivateRoute>
            },

            {
                path: '/library/:userId/onindo',
                element: <PrivateRoute><UserOnindoLibrary /></PrivateRoute>
            }
        ]
    },
    {
        path: '/my-library',
        element: <PrivateRoute><MyLibrary /></PrivateRoute>,
        children: [
            {
                path: '/my-library',
                element: <PrivateRoute><MyLibraryBook /></PrivateRoute>
            },
            {
                path: '/my-library/book-request',
                element: <PrivateRoute><MyBookRequest /></PrivateRoute>
            },
            {
                path: '/my-library/my-request',
                element: <PrivateRoute><MyRequestBook /></PrivateRoute>
            },
            {
                path: '/my-library/transfer-history',
                element: <PrivateRoute><MyTrans /></PrivateRoute>
            },
        ]
    },
    {
        path: '/my-onindo-library',
        element: <PrivateRoute><MyOnindoLibrary /></PrivateRoute>,
        children: [
            {
                path: '/my-onindo-library',
                element: <PrivateRoute><MyOnindoAllBook /></PrivateRoute>
            },
            {
                path: '/my-onindo-library/book-request',
                element: <PrivateRoute><MyOnindoRequest /></PrivateRoute>
            }
        ]
    },
    {
        path: '/donate-history',
        element: <DonateHistory></DonateHistory>
    },
    {
        path: '/dashboard',
        element: <AdminRoute><PrivateRoute><AdminDashBoard /></PrivateRoute></AdminRoute>,
        children: [
            {
                path: '/dashboard',
                element: <AdminRoute><PrivateRoute><DashboardData /></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/all-users',
                element: <AdminRoute><PrivateRoute><AllUsersAdmin /></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/all-opinion',
                element: <AdminRoute><PrivateRoute><AllOpinionAdmin /></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/all-books',
                element: <AdminRoute><PrivateRoute><AllBooksAdmin /></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/transfer-history',
                element: <AdminRoute><PrivateRoute><AllTransferDetails /></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/add-post',
                element: <AdminRoute><PrivateRoute><AddadminPost /></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/thesis-post',
                element: <AdminRoute><PrivateRoute><ThesisPost /></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/add-ai-post',
                element: <AdminRoute><PrivateRoute><AiPosts /></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/all-posts',
                element: <AdminRoute><PrivateRoute><AdminPosts /></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/add-category',
                element: <AdminRoute><PrivateRoute><AddCategory /></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/add-pdf',
                element: <AdminRoute><PrivateRoute><PdfAdd /></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/all-pdf-books',
                element: <AdminRoute><PrivateRoute><AllAdminPdfBooks /></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/manage-organizations',
                element: <AdminRoute><PrivateRoute><AdminManageOrg /></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/organizations-controller',
                element: <AdminRoute><PrivateRoute><AllOrganizationManage /></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/events-management',
                element: <AdminRoute><PrivateRoute><AdminEManage /></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/manage-channels',
                element: <AdminRoute><PrivateRoute><ManageChannel /></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/add-course',
                element: <AdminRoute><PrivateRoute><AddCourse /></PrivateRoute></AdminRoute>
            },
            {
                path: '/dashboard/manage-course',
                element: <AdminRoute><PrivateRoute><ManageCourse /></PrivateRoute></AdminRoute>
            }


        ]
    }, {
        path: '/search-result',
        element: <PrivateRoute><ScearchPage /></PrivateRoute>
    }, {
        path: '/chats',
        element: <PrivateRoute><ChatsPage /></PrivateRoute>,
        children: [
            {
                path: '/chats',
                element: <ChatList></ChatList>,
            },
            {
                path: '/chats/:userId',
                element: <PrivateRoute><MassegeBox /></PrivateRoute>
            }
        ]
    }, {
        path: "/notifications",
        element: <PrivateRoute><Notifications /></PrivateRoute>
    }, {
        path: "/thesis",
        element: <Thesis />
    }, {
        path: '/thesis/:postId',
        element: <ThesisRead></ThesisRead>
    }, {
        path: '/contact-us',
        element: <ContractUs></ContractUs>
    }, {
        path: "/nearby-books",
        element: <PrivateRoute><NearbyFriends></NearbyFriends></PrivateRoute>
    }, {
        path: "/pdf-book",
        element: <PdfBook />
    }, {
        path: "/view-pdf-book/:id",
        element: <ViewPdfBook />
    },
    {
        path: '/free-ai',
        element: <FreeAi />
    }, {
        path: '/ai-post/:id',
        element: <ViewAiPost />
    },
    {
        path: '/organizations',
        element: <Organizations />
    },
    {
        path: '/add-organization',
        element: <AddOrganization />
    },
    {
        path: '/organization/:orgId',
        element: <OrganizationDetails />
    }, {
        path: '/my-organization/:orgId',
        element: <PrivateRoute><MyOrganizationDetails /></PrivateRoute>
    },
    {
        path: '/my-organizations',
        element: <PrivateRoute><MyOrganizations /> </PrivateRoute>
    },
    {
        path: '/my-organization/add-organization-activies/:orgId',
        element: <PrivateRoute><AddActivities /></PrivateRoute>
    },
    {
        path: '/my-organization/:orgId/activities',
        element: <PrivateRoute><MyAllActivies /></PrivateRoute>
    },
    {
        path: '/organization/:orgId/activities',
        element: <PrivateRoute><OrgActivies /></PrivateRoute>
    },
    {
        path: '/activity-details/:id',
        element: <PrivateRoute><ActivityDetails /></PrivateRoute>
    },
    {
        path: '/social-organizations',
        element: <SocialOrganizations />
    },
    {
        path: '/organizations-events',
        element: <OrgEvents />
    },
    {
        path: '/e-learning',
        element: <ELearning />
    }, {
        path: '/course-details/:courseId',
        element: <CourseDetails />
    },
    {
        path: '/audio-book',
        element: <AudioBooks />
    },
    {
        path: '/channels',
        element: <Channels />
    },
    {
        path: '/channel/:channelId',
        element: <ChannelBox />
    },
    {
        path: '/chatbot',
        element: <ChatBot />
    },
    {
        path: '/about-us',
        element: <AboutUs/>
    },
    {
        path: '/privacy-policy',
        element: <PrivacyPolicy/>
    },
    {
        path: '/terms-conditions',
        element: <TermsConditions/>
    },
    {
        path: '/post-details/:id',
        element: <HomePostDetails/>
    },
    {
        path: '/marketplace',
        element: <MarketplaceHome/>
    },
    {
        path: '/market-user',
        element: <PrivateRoute><SellerProfileAccess><MarketUser/></SellerProfileAccess></PrivateRoute>
    },{
        path: '/seller-dashboard',
        element: <PrivateRoute><SellerPrivet><SellerDashboard/></SellerPrivet></PrivateRoute>,
        children:[
            {
                index: true,
                element: <PrivateRoute><SellerPrivet><SellerOverview/></SellerPrivet></PrivateRoute>
            },
            {
                path: '/seller-dashboard/add-product',
                element:<PrivateRoute><SellerPrivet><AddProduct/></SellerPrivet></PrivateRoute>
            },
            {
                path: '/seller-dashboard/products',
                element: <PrivateRoute><SellerPrivet><AllSellerProducts/></SellerPrivet></PrivateRoute>
            },
            {
                path: '/seller-dashboard/orders',
                element: <PrivateRoute><SellerPrivet><SellerOrders/></SellerPrivet></PrivateRoute>
            },
            {
                path: '/seller-dashboard/payments',
                element: <PrivateRoute><SellerPrivet><SellerPayments/></SellerPrivet></PrivateRoute>
            },
            {
                path: '/seller-dashboard/profile',
                element: <PrivateRoute><SellerPrivet><SellerProfile/></SellerPrivet></PrivateRoute>
            },
            {
                path: '/seller-dashboard/withdraw',
                element: <PrivateRoute><SellerPrivet><SellerWithdrawPage/></SellerPrivet></PrivateRoute>
            },
            {
                path: '/seller-dashboard/home-banner',
                element: <PrivateRoute><SellerPrivet><BannerRequest/></SellerPrivet></PrivateRoute>
            }
        ]

    },
    {
        path: '/seller-request',
        element: <PrivateRoute><ReqSeller/></PrivateRoute>
    },
    {
        path: '/product-details/:productId',
        element: <ProductDetails/>
    },
    {
        path: '/category-product/:categoryId',
        element: <CategoryProduct/>
    },
    {
        path: '/product-search',
        element: <MSearchPage/>
    },
    {
        path: '/cart',
        element: <PrivateRoute><CartPage/></PrivateRoute>
    },
    {
        path: '/cart-checkout',
        element: <PrivateRoute><BuyNowPage/></PrivateRoute>
    },
    {
        path: '/payment/:orderId',
        element: <PrivateRoute><PaymentPage/></PrivateRoute>
    },
    {
        path: '/opinion-post/:postId',
        element: <PrivateRoute><PostDetail/></PrivateRoute>
    },
    {
        path: '/market-dashboard',
        element: <AdminRoute><PrivateRoute><MarketAdmin/></PrivateRoute></AdminRoute>,
        children: [
            {
                index: true,
                element: <AdminRoute><PrivateRoute><AdminOverview/></PrivateRoute></AdminRoute>
            },
            {
                path: '/market-dashboard/sellers',
                element: <AdminRoute><PrivateRoute><SellersData/></PrivateRoute></AdminRoute>
            },
            {
                path: '/market-dashboard/seller-requests',
                element:<AdminRoute><PrivateRoute><SellerRequest/></PrivateRoute></AdminRoute>
            },
            {
                path: '/market-dashboard/products',
                element: <AdminRoute><PrivateRoute><AdminProducts/></PrivateRoute></AdminRoute>
            },
            {
                path: '/market-dashboard/product-categories',
                element: <AdminRoute><PrivateRoute><AdminCategories/></PrivateRoute></AdminRoute>
            },
            {
                path: '/market-dashboard/orders',
                element: <AdminRoute><PrivateRoute><AdminProductsOrders/></PrivateRoute></AdminRoute>
            },
            {
                path: '/market-dashboard/payments',
                element: <AdminRoute><PrivateRoute><AdminPaymentPage/></PrivateRoute></AdminRoute>
            },
            {
                path: '/market-dashboard/banner-manage',
                element: <AdminRoute><PrivateRoute><AdminBannerRequest/></PrivateRoute></AdminRoute>
            }
        ]
    },
    {
        path: '/channels/:channelId/messages/:messageId',
        element: <PrivateRoute><FullMessageView/></PrivateRoute>
    },
    {
        path: '*',
        element: <ErrorPage />
    }
]);