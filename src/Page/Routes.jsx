import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import PrivateRoute from "./PrivateRoute/PrivateRoute";
import AdminRoute from "./AdminRoute/AdminRoute";
import RootLayout from "../Components/RootLayout/RootLayout";
import ErrorBoundary from "../Components/ErrorBoundary/ErrorBoundary";

// Loading component for lazy routes
const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen">
        <div className="relative">
            <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
            <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
    </div>
);

// Lazy load all routes for better code splitting
const Home = lazy(() => import("./Home/Home"));
const Login = lazy(() => import("./Login/Login"));
const Register = lazy(() => import("./Register/Register"));
const Profile = lazy(() => import("./Profile/Profile"));
const RecoverPass = lazy(() => import("./RecoverPass/RecoverPass"));
const ResetPassword = lazy(() => import("./ResetPassword/ResetPassword"));
const ErrorPage = lazy(() => import("./ErrorPage/ErrorPage"));
const Peoples = lazy(() => import("./Peoples/Peoples"));
const PublicOpinion = lazy(() => import("./PublicOpinion/PublicOpinion"));
const UserProfile = lazy(() => import("./UserProfile/UserProfile"));
const MyLibrary = lazy(() => import("./MyLibrary/MyLibrary"));
const MyLibraryBook = lazy(() => import("../Components/MyLibraryBook/MyLibraryBook"));
const UserLibrary = lazy(() => import("./UserLibrary/UserLibrary"));
const UserLibraryBook = lazy(() => import("../Components/UserLibraryBook/UserLibraryBook"));
const MyBookRequest = lazy(() => import("../Components/MyBookRequest/MyBookRequest"));
const MyRequestBook = lazy(() => import("../Components/MyRequestBook/MyRequestBook"));
const MyTrans = lazy(() => import("../Components/MyTrans/MyTrans"));
const MyOnindoLibrary = lazy(() => import("../Components/MyOnindoLibrary/MyOnindoLibrary"));
const MyOnindoAllBook = lazy(() => import("../Components/MyOnindoAllBook/MyOnindoAllBook"));
const UserOnindoLibrary = lazy(() => import("../Components/UserOnindoLibrary/UserOnindoLibrary"));
const MyOnindoRequest = lazy(() => import("../Components/MyOnindoRequest/MyOnindoRequest"));
const DonateHistory = lazy(() => import("./DonateHistory/DonateHistory"));
const AdminDashBoard = lazy(() => import("./AdminDashBoard/AdminDashBoard"));
const AllUsersAdmin = lazy(() => import("./DashboardPages/AllUsersAdmin"));
const AdminReferralHistory = lazy(() => import("./DashboardPages/AdminReferralHistory"));
const DashboardData = lazy(() => import("./DashboardPages/DashboardData"));
const AllOpinionAdmin = lazy(() => import("./DashboardPages/AllOpinionAdmin"));
const AllBooksAdmin = lazy(() => import("./DashboardPages/AllBooksAdmin"));
const AllTransferDetails = lazy(() => import("./DashboardPages/AllTransferDetails"));
const AddadminPost = lazy(() => import("./DashboardPages/AddadminPost"));
const ScearchPage = lazy(() => import("./ScearchPage/ScearchPage"));
const ChatsPage = lazy(() => import("./ChatsPage/ChatsPage"));
const MassegeBox = lazy(() => import("../Components/MassegeBox/MassegeBox"));
const Notifications = lazy(() => import("./Notifications/Notifications"));
const ChatList = lazy(() => import("./ChatList/ChatList"));
const Thesis = lazy(() => import("./Thesis/Thesis"));
const FreeAi = lazy(() => import("./FreeAi/FreeAi"));
const ThesisPost = lazy(() => import("./DashboardPages/ThesisPost"));
const ThesisRead = lazy(() => import("./ThesisRead/ThesisRead"));
const ContractUs = lazy(() => import("./ContractUs/ContractUs"));
const AdminPosts = lazy(() => import("./DashboardPages/AdminPosts"));
const AllCoinTransfers = lazy(() => import("./DashboardPages/AllCoinTransfers"));
const NearbyFriends = lazy(() => import("./NearbyFriends/NearbyFriends"));
const PdfBook = lazy(() => import("./PdfBook/PdfBook"));
const PdfAdd = lazy(() => import("./DashboardPages/PdfAdd"));
const ViewPdfBook = lazy(() => import("./ViewPdfBook/ViewPdfBook"));
const AddCategory = lazy(() => import("./DashboardPages/AddCategory"));
const AllAdminPdfBooks = lazy(() => import("./DashboardPages/AllAdminPdfBooks"));
const AiPosts = lazy(() => import("./DashboardPages/AiPosts"));
const ViewAiPost = lazy(() => import("./ViewAiPost/ViewAiPost"));
const Organizations = lazy(() => import("./Organizations/Organizations"));
const AddOrganization = lazy(() => import("./AddOrganization/AddOrganization"));
const OrganizationDetails = lazy(() => import("./OrganizationDetails/OrganizationDetails"));
const MyOrganizations = lazy(() => import("./MyOrganizations/MyOrganizations"));
const MyOrganizationDetails = lazy(() => import("./MyOrganizationDetails/MyOrganizationDetails"));
const AdminManageOrg = lazy(() => import("./DashboardPages/AdminManageOrg"));
const AddActivities = lazy(() => import("./AddActivities/AddActivities"));
const MyAllActivies = lazy(() => import("./MyAllActivies/MyAllActivies"));
const OrgActivies = lazy(() => import("./OrgActivies/OrgActivies"));
const ActivityDetails = lazy(() => import("./ActivityDetails/ActivityDetails"));
const OrgEvents = lazy(() => import("./OrgEvents/OrgEvents"));
const SocialOrganizations = lazy(() => import("./SocialOrganizations/SocialOrganizations"));
const AllOrganizationManage = lazy(() => import("./DashboardPages/AllOrganizationManage"));
const AdminEManage = lazy(() => import("./DashboardPages/AdminEManage"));
const ELearning = lazy(() => import("./ELearning/ELearning"));
const CourseDetails = lazy(() => import("./CourseDetails/CourseDetails"));
const AudioBooks = lazy(() => import("./AudioBooks/AudioBooks"));
const Channels = lazy(() => import("./Channels/Channels"));
const ManageChannel = lazy(() => import("./DashboardPages/ManageChannel"));
const AddCourse = lazy(() => import("./DashboardPages/AddCourse"));
const ChannelBox = lazy(() => import("./ChannelBox/ChannelBox"));
const ChatBot = lazy(() => import("./ChatBot/ChatBot"));
const ManageCourse = lazy(() => import("./DashboardPages/ManageCourse"));
const AboutUs = lazy(() => import("./AboutUs/AboutUs"));
const PrivacyPolicy = lazy(() => import("./PrivacyPolicy/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./TermsConditions/TermsConditions"));
const HomePostDetails = lazy(() => import("./HomePostDetails/HomePostDetails"));
const MarketplaceHome = lazy(() => import("./Marketplace/MarketplaceHome/MarketplaceHome"));
const PostDetail = lazy(() => import("./PostDetail/PostDetail"));
const FullMessageView = lazy(() => import("./FullMessageView/FullMessageView"));
const MarketUser = lazy(() => import("./MarketUser/MarketUser"));
const ReqSeller = lazy(() => import("./Marketplace/ReqSeller/ReqSeller"));
const ProductDetails = lazy(() => import("./Marketplace/ProductDetails/ProductDetails"));
const CategoryProduct = lazy(() => import("./Marketplace/CategoryProduct/CategoryProduct"));
const MSearchPage = lazy(() => import("./Marketplace/MSearchPage/MSearchPage"));
const CartPage = lazy(() => import("./Marketplace/CartPage/CartPage"));
const BuyNowPage = lazy(() => import("./Marketplace/BuyNowPage/BuyNowPage"));
const PaymentPage = lazy(() => import("./Marketplace/PaymentPage/PaymentPage"));
const MarketAdmin = lazy(() => import("./Marketplace/MarketAdmin/MarketAdmin"));
const AdminOverview = lazy(() => import("./Marketplace/MarketAdmin/AdminOverview"));
const SellersData = lazy(() => import("./Marketplace/MarketAdmin/SellersData"));
const SellerRequest = lazy(() => import("./Marketplace/MarketAdmin/SellerRequest"));
const SellerProfileAccess = lazy(() => import("./Marketplace/SellerProfileAccess/SellerProfileAccess"));
const SellerDashboard = lazy(() => import("./Marketplace/SellerDashboard/SellerDashboard"));
const SellerOverview = lazy(() => import("./Marketplace/SellerDashboard/SellerDashboardPage/SellerOverview"));
const SellerPrivet = lazy(() => import("./Marketplace/SellerDashboard/SellerPrivet"));
const AddProduct = lazy(() => import("./Marketplace/SellerDashboard/SellerDashboardPage/AddProduct"));
const AllSellerProducts = lazy(() => import("./Marketplace/SellerDashboard/SellerDashboardPage/AllSellerProducts"));
const SellerOrders = lazy(() => import("./Marketplace/SellerDashboard/SellerDashboardPage/SellerOrders"));
const SellerPayments = lazy(() => import("./Marketplace/SellerDashboard/SellerDashboardPage/SellerPayments"));
const SellerProfile = lazy(() => import("./Marketplace/SellerDashboard/SellerDashboardPage/SellerProfile"));
const SellerWithdrawPage = lazy(() => import("./Marketplace/SellerDashboard/SellerDashboardPage/SellerWithdrawPage"));
const AdminProducts = lazy(() => import("./Marketplace/MarketAdmin/AdminProducts"));
const AdminCategories = lazy(() => import("./Marketplace/MarketAdmin/AdminCategories"));
const AdminProductsOrders = lazy(() => import("./Marketplace/MarketAdmin/AdminProductsOrders"));
const AdminPaymentPage = lazy(() => import("./Marketplace/MarketAdmin/AdminPaymentPage"));
const BannerRequest = lazy(() => import("./Marketplace/SellerDashboard/SellerDashboardPage/BannerRequest"));
const AdminBannerRequest = lazy(() => import("./Marketplace/MarketAdmin/AdminBannerRequest"));
const CommunitiesHome = lazy(() => import("./Community/CommunitiesHome/CommunitiesHome"));
const CommunityDetail = lazy(() => import("./Community/CommunityDetail/CommunityDetail"));
const CoursePlayer = lazy(() => import("./CoursePlayer/CoursePlayer"));
const SocialResponse = lazy(() => import("./SocialResponse/SocialResponse"));
const AdminCommunityMangae = lazy(() => import("./DashboardPages/AdminCommunityMangae"));
const AdminEmployerRequests = lazy(() => import("./DashboardPages/AdminEmployerRequests"));
const StudentDashboard = lazy(() => import("./StudentDashboard/StudentDashboard"));
const Jobs = lazy(() => import("./Jobs/Jobs"));
const JobBoard = lazy(() => import("./Jobs/JobBoard"));
const Freelance = lazy(() => import("./Jobs/Freelance"));
const JobDetails = lazy(() => import("./Jobs/JobDetails"));
const EmployerRequest = lazy(() => import("./Jobs/EmployerRequest"));
const PostJob = lazy(() => import("./Jobs/PostJob"));
const EmployerDashboard = lazy(() => import("./Jobs/EmployerDashboard"));
const MyApplications = lazy(() => import("./Jobs/MyApplications"));
const FreelanceMarketplace = lazy(() => import("./Jobs/FreelanceMarketplace"));
const ProjectDetails = lazy(() => import("./Jobs/ProjectDetails"));
const PostProject = lazy(() => import("./Jobs/PostProject"));
const ClientDashboard = lazy(() => import("./Jobs/ClientDashboard"));
const FreelancerDashboard = lazy(() => import("./Jobs/FreelancerDashboard"));
const WallateShop = lazy(() => import("./wallateShop/wallateShop"));
const ManageLocations = lazy(() => import("./DashboardPages/ManageLocations"));
const WallateShopManage = lazy(() => import("./DashboardPages/WallateShopManage"));

// Wrapper component for Suspense
const SuspenseWrapper = ({ children }) => (
    <Suspense fallback={<LoadingFallback />}>
        {children}
    </Suspense>
);

export const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            {
                path: '/',
                element: <SuspenseWrapper><Home /></SuspenseWrapper>
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
                element: (
                    <ErrorBoundary>
                        <PrivateRoute>
                            <SuspenseWrapper>
                                <Profile />
                            </SuspenseWrapper>
                        </PrivateRoute>
                    </ErrorBoundary>
                ),
                errorElement: <ErrorBoundary />
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
                path: '/wallate-shop',
                element: <PrivateRoute><SuspenseWrapper><WallateShop /></SuspenseWrapper></PrivateRoute>
            },
            {
                path: '/profile/:userId',
                element: <PrivateRoute><UserProfile></UserProfile></PrivateRoute>
            },
            {
                path: '/library/:userId',
                element: <PrivateRoute><SuspenseWrapper><UserLibrary /></SuspenseWrapper></PrivateRoute>,
                children: [
                    {
                        path: '/library/:userId',
                        element: <PrivateRoute><SuspenseWrapper><UserLibraryBook /></SuspenseWrapper></PrivateRoute>
                    },

                    {
                        path: '/library/:userId/onindo',
                        element: <PrivateRoute><SuspenseWrapper><UserOnindoLibrary /></SuspenseWrapper></PrivateRoute>
                    }
                ]
            },
            {
                path: '/my-library',
                element: <PrivateRoute><SuspenseWrapper><MyLibrary /></SuspenseWrapper></PrivateRoute>,
                children: [
                    {
                        path: '/my-library',
                        element: <PrivateRoute><SuspenseWrapper><MyLibraryBook /></SuspenseWrapper></PrivateRoute>
                    },
                    {
                        path: '/my-library/book-request',
                        element: <PrivateRoute><SuspenseWrapper><MyBookRequest /></SuspenseWrapper></PrivateRoute>
                    },
                    {
                        path: '/my-library/my-request',
                        element: <PrivateRoute><SuspenseWrapper><MyRequestBook /></SuspenseWrapper></PrivateRoute>
                    },
                    {
                        path: '/my-library/transfer-history',
                        element: <PrivateRoute><SuspenseWrapper><MyTrans /></SuspenseWrapper></PrivateRoute>
                    },
                ]
            },
            {
                path: '/my-onindo-library',
                element: <PrivateRoute><SuspenseWrapper><MyOnindoLibrary /></SuspenseWrapper></PrivateRoute>,
                children: [
                    {
                        path: '/my-onindo-library',
                        element: <PrivateRoute><SuspenseWrapper><MyOnindoAllBook /></SuspenseWrapper></PrivateRoute>
                    },
                    {
                        path: '/my-onindo-library/book-request',
                        element: <PrivateRoute><SuspenseWrapper><MyOnindoRequest /></SuspenseWrapper></PrivateRoute>
                    }
                ]
            },
            {
                path: '/donate-history',
                element: <SuspenseWrapper><DonateHistory /></SuspenseWrapper>
            },
            {
                path: '/dashboard',
                element: <AdminRoute><PrivateRoute><SuspenseWrapper><AdminDashBoard /></SuspenseWrapper></PrivateRoute></AdminRoute>,
                children: [
                    {
                        path: '/dashboard',
                        element: <AdminRoute><PrivateRoute><SuspenseWrapper><DashboardData /></SuspenseWrapper></PrivateRoute></AdminRoute>
                    },
                    {
                        path: '/dashboard/all-users',
                        element: <AdminRoute><PrivateRoute><SuspenseWrapper><AllUsersAdmin /></SuspenseWrapper></PrivateRoute></AdminRoute>
                    },
                    {
                        path: '/dashboard/referral-history',
                        element: <AdminRoute><PrivateRoute><SuspenseWrapper><AdminReferralHistory /></SuspenseWrapper></PrivateRoute></AdminRoute>
                    },
                    {
                        path: '/dashboard/all-opinion',
                        element: <AdminRoute><PrivateRoute><SuspenseWrapper><AllOpinionAdmin /></SuspenseWrapper></PrivateRoute></AdminRoute>
                    },
                    {
                        path: '/dashboard/all-books',
                        element: <AdminRoute><PrivateRoute><SuspenseWrapper><AllBooksAdmin /></SuspenseWrapper></PrivateRoute></AdminRoute>
                    },
                    {
                        path: '/dashboard/transfer-history',
                        element: <AdminRoute><PrivateRoute><SuspenseWrapper><AllTransferDetails /></SuspenseWrapper></PrivateRoute></AdminRoute>
                    },
                    {
                        path: '/dashboard/add-post',
                        element: <AdminRoute><PrivateRoute><SuspenseWrapper><AddadminPost /></SuspenseWrapper></PrivateRoute></AdminRoute>
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
                    },
                    {
                        path: '/dashboard/manage-communnity',
                        element: <AdminRoute><PrivateRoute><AdminCommunityMangae /></PrivateRoute></AdminRoute>
                    }
                    ,
                    {
                        path: '/dashboard/manage-locations',
                        element: <AdminRoute><PrivateRoute><SuspenseWrapper><ManageLocations /></SuspenseWrapper></PrivateRoute></AdminRoute>
                    }
                    ,
                    {
                        path: '/dashboard/employer-requests',
                        element: <AdminRoute><PrivateRoute><AdminEmployerRequests /></PrivateRoute></AdminRoute>
                    },
                    {
                        path: '/dashboard/wallate-shop',
                        element: <AdminRoute><PrivateRoute><WallateShopManage /></PrivateRoute></AdminRoute>
                    },
                    {
                        path: '/dashboard/all-coin-transfers',
                        element: <AdminRoute><PrivateRoute><SuspenseWrapper><AllCoinTransfers /></SuspenseWrapper></PrivateRoute></AdminRoute>
                    }


                ]
            }, {
                path: '/search-result',
                element: <PrivateRoute><SuspenseWrapper><ScearchPage /></SuspenseWrapper></PrivateRoute>
            }, {
                path: '/chats',
                element: <PrivateRoute><SuspenseWrapper><ChatsPage /></SuspenseWrapper></PrivateRoute>,
                children: [
                    {
                        path: '/chats',
                        element: <SuspenseWrapper><ChatList /></SuspenseWrapper>,
                    },
                    {
                        path: '/chats/:userId',
                        element: <PrivateRoute><SuspenseWrapper><MassegeBox /></SuspenseWrapper></PrivateRoute>
                    }
                ]
            }, {
                path: "/notifications",
                element: <PrivateRoute><SuspenseWrapper><Notifications /></SuspenseWrapper></PrivateRoute>
            }, {
                path: "/thesis",
                element: <SuspenseWrapper><Thesis /></SuspenseWrapper>
            }, {
                path: '/thesis/:postId',
                element: <SuspenseWrapper><ThesisRead /></SuspenseWrapper>
            }, {
                path: '/contact-us',
                element: <SuspenseWrapper><ContractUs /></SuspenseWrapper>
            }, {
                path: "/nearby-books",
                element: <PrivateRoute><SuspenseWrapper><NearbyFriends /></SuspenseWrapper></PrivateRoute>
            }, {
                path: "/pdf-book",
                element: <SuspenseWrapper><PdfBook /></SuspenseWrapper>
            }, {
                path: "/view-pdf-book/:id",
                element: <SuspenseWrapper><ViewPdfBook /></SuspenseWrapper>
            },
            {
                path: '/free-ai',
                element: <SuspenseWrapper><FreeAi /></SuspenseWrapper>
            }, {
                path: '/ai-post/:id',
                element: <SuspenseWrapper><ViewAiPost /></SuspenseWrapper>
            },
            {
                path: '/organizations',
                element: <SuspenseWrapper><Organizations /></SuspenseWrapper>
            },
            {
                path: '/add-organization',
                element: <SuspenseWrapper><AddOrganization /></SuspenseWrapper>
            },
            {
                path: '/organization/:orgId',
                element: <SuspenseWrapper><OrganizationDetails /></SuspenseWrapper>
            }, {
                path: '/my-organization/:orgId',
                element: <PrivateRoute><SuspenseWrapper><MyOrganizationDetails /></SuspenseWrapper></PrivateRoute>
            },
            {
                path: '/my-organizations',
                element: <PrivateRoute><SuspenseWrapper><MyOrganizations /></SuspenseWrapper></PrivateRoute>
            },
            {
                path: '/my-organization/add-organization-activies/:orgId',
                element: <PrivateRoute><SuspenseWrapper><AddActivities /></SuspenseWrapper></PrivateRoute>
            },
            {
                path: '/my-organization/:orgId/activities',
                element: <PrivateRoute><SuspenseWrapper><MyAllActivies /></SuspenseWrapper></PrivateRoute>
            },
            {
                path: '/organization/:orgId/activities',
                element: <PrivateRoute><SuspenseWrapper><OrgActivies /></SuspenseWrapper></PrivateRoute>
            },
            {
                path: '/activity-details/:id',
                element: <PrivateRoute><SuspenseWrapper><ActivityDetails /></SuspenseWrapper></PrivateRoute>
            },
            {
                path: '/social-organizations',
                element: <SuspenseWrapper><SocialOrganizations /></SuspenseWrapper>
            },
            {
                path: '/organizations-events',
                element: <SuspenseWrapper><OrgEvents /></SuspenseWrapper>
            },
            {
                path: '/e-learning',
                element: <SuspenseWrapper><ELearning /></SuspenseWrapper>
            }, {
                path: '/course-details/:courseId',
                element: <SuspenseWrapper><CourseDetails /></SuspenseWrapper>
            },
            {
                path: '/audio-book',
                element: <SuspenseWrapper><AudioBooks /></SuspenseWrapper>
            },
            {
                path: '/channels',
                element: <SuspenseWrapper><Channels /></SuspenseWrapper>
            },
            {
                path: '/channel/:channelId',
                element: <SuspenseWrapper><ChannelBox /></SuspenseWrapper>
            },
            {
                path: '/chatbot',
                element: <SuspenseWrapper><ChatBot /></SuspenseWrapper>
            },
            {
                path: '/about-us',
                element: <SuspenseWrapper><AboutUs /></SuspenseWrapper>
            },
            {
                path: '/privacy-policy',
                element: <SuspenseWrapper><PrivacyPolicy /></SuspenseWrapper>
            },
            {
                path: '/terms-conditions',
                element: <SuspenseWrapper><TermsConditions /></SuspenseWrapper>
            },
            {
                path: '/post-details/:id',
                element: <SuspenseWrapper><HomePostDetails /></SuspenseWrapper>
            },
            {
                path: '/marketplace',
                element: <SuspenseWrapper><MarketplaceHome /></SuspenseWrapper>
            },
            {
                path: '/market-user',
                element: <PrivateRoute><SellerProfileAccess><MarketUser /></SellerProfileAccess></PrivateRoute>
            }, {
                path: '/seller-dashboard',
                element: <PrivateRoute><SellerPrivet><SellerDashboard /></SellerPrivet></PrivateRoute>,
                children: [
                    {
                        index: true,
                        element: <PrivateRoute><SellerPrivet><SellerOverview /></SellerPrivet></PrivateRoute>
                    },
                    {
                        path: '/seller-dashboard/add-product',
                        element: <PrivateRoute><SellerPrivet><AddProduct /></SellerPrivet></PrivateRoute>
                    },
                    {
                        path: '/seller-dashboard/products',
                        element: <PrivateRoute><SellerPrivet><AllSellerProducts /></SellerPrivet></PrivateRoute>
                    },
                    {
                        path: '/seller-dashboard/orders',
                        element: <PrivateRoute><SellerPrivet><SellerOrders /></SellerPrivet></PrivateRoute>
                    },
                    {
                        path: '/seller-dashboard/payments',
                        element: <PrivateRoute><SellerPrivet><SellerPayments /></SellerPrivet></PrivateRoute>
                    },
                    {
                        path: '/seller-dashboard/profile',
                        element: <PrivateRoute><SellerPrivet><SellerProfile /></SellerPrivet></PrivateRoute>
                    },
                    {
                        path: '/seller-dashboard/withdraw',
                        element: <PrivateRoute><SellerPrivet><SellerWithdrawPage /></SellerPrivet></PrivateRoute>
                    },
                    {
                        path: '/seller-dashboard/home-banner',
                        element: <PrivateRoute><SellerPrivet><BannerRequest /></SellerPrivet></PrivateRoute>
                    }
                ]

            },
            {
                path: '/seller-request',
                element: <PrivateRoute><ReqSeller /></PrivateRoute>
            },
            {
                path: '/product-details/:productId',
                element: <ProductDetails />
            },
            {
                path: '/category-product/:categoryId',
                element: <CategoryProduct />
            },
            {
                path: '/product-search',
                element: <MSearchPage />
            },
            {
                path: '/cart',
                element: <PrivateRoute><CartPage /></PrivateRoute>
            },
            {
                path: '/cart-checkout',
                element: <PrivateRoute><BuyNowPage /></PrivateRoute>
            },
            {
                path: '/payment/:orderId',
                element: <PrivateRoute><PaymentPage /></PrivateRoute>
            },
            {
                path: '/opinion-post/:postId',
                element: <PrivateRoute><PostDetail /></PrivateRoute>
            },
            {
                path: '/market-dashboard',
                element: <AdminRoute><PrivateRoute><MarketAdmin /></PrivateRoute></AdminRoute>,
                children: [
                    {
                        index: true,
                        element: <AdminRoute><PrivateRoute><AdminOverview /></PrivateRoute></AdminRoute>
                    },
                    {
                        path: '/market-dashboard/sellers',
                        element: <AdminRoute><PrivateRoute><SellersData /></PrivateRoute></AdminRoute>
                    },
                    {
                        path: '/market-dashboard/seller-requests',
                        element: <AdminRoute><PrivateRoute><SellerRequest /></PrivateRoute></AdminRoute>
                    },
                    {
                        path: '/market-dashboard/products',
                        element: <AdminRoute><PrivateRoute><AdminProducts /></PrivateRoute></AdminRoute>
                    },
                    {
                        path: '/market-dashboard/product-categories',
                        element: <AdminRoute><PrivateRoute><AdminCategories /></PrivateRoute></AdminRoute>
                    },
                    {
                        path: '/market-dashboard/orders',
                        element: <AdminRoute><PrivateRoute><AdminProductsOrders /></PrivateRoute></AdminRoute>
                    },
                    {
                        path: '/market-dashboard/payments',
                        element: <AdminRoute><PrivateRoute><AdminPaymentPage /></PrivateRoute></AdminRoute>
                    },
                    {
                        path: '/market-dashboard/banner-manage',
                        element: <AdminRoute><PrivateRoute><AdminBannerRequest /></PrivateRoute></AdminRoute>
                    }
                ]
            },
            {
                path: '/channels/:channelId/messages/:messageId',
                element: <PrivateRoute><FullMessageView /></PrivateRoute>
            },
            {
                path: '/community',
                element: <CommunitiesHome />
            },
            {
                path: '/community/:communityId',
                element: <CommunityDetail />
            },
            {
                path: '/course/:courseId',
                element: <PrivateRoute><CoursePlayer /></PrivateRoute>
            },
            {
                path: '/course/:courseId/student-dashboard',
                element: <PrivateRoute><StudentDashboard /></PrivateRoute>
            },
            {
                path: '/social-responsibility',
                element: <SocialResponse />
            },
            {
                path: '/jobs',
                element: <Jobs />
            },
            {
                path: '/jobs/board',
                element: <JobBoard />
            },
            {
                path: '/jobs/board/:jobId',
                element: <JobDetails />
            },
            {
                path: '/jobs/freelance',
                element: <FreelanceMarketplace />
            },
            {
                path: '/jobs/freelance/:projectId',
                element: <ProjectDetails />
            },
            {
                path: '/jobs/freelance/post-project',
                element: <PrivateRoute><PostProject /></PrivateRoute>
            },
            {
                path: '/jobs/freelance/my-projects',
                element: <PrivateRoute><ClientDashboard /></PrivateRoute>
            },
            {
                path: '/jobs/freelance/my-proposals',
                element: <PrivateRoute><FreelancerDashboard /></PrivateRoute>
            },
            {
                path: '/jobs/employer/request',
                element: <PrivateRoute><EmployerRequest /></PrivateRoute>
            },
            {
                path: '/jobs/employer/post',
                element: <PrivateRoute><PostJob /></PrivateRoute>
            },
            {
                path: '/jobs/employer/dashboard',
                element: <PrivateRoute><EmployerDashboard /></PrivateRoute>
            },
            {
                path: '/jobs/my-applications',
                element: <PrivateRoute><MyApplications /></PrivateRoute>
            },
            {
                path: '*',
                element: <ErrorPage />
            }
        ]
    }
]);