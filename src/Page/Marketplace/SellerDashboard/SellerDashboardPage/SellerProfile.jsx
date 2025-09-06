import React, { useEffect, useState } from "react";
import useUser from "../../../../Hooks/useUser";
import usePublicAxios from "../../../../Hooks/usePublicAxios";
import toast from "react-hot-toast";
import { 
  Edit3, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Facebook,
  Instagram,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard
} from "lucide-react";

const SellerProfile = () => {
  const { user, loading: userLoading } = useUser();
  const axiosPublic = usePublicAxios();
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const [seller, setSeller] = useState(null);
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchSellerData();
    fetchPayments();
    fetchProducts();
  }, [user, axiosPublic]);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      const res = await axiosPublic.get(`/sellers/check/${user.id}`);
      if (res.data?.isSeller) {
        setSeller(res.data.seller);
      }
    } catch (error) {
      console.error("Error checking seller:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await axiosPublic.get("/seller-payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data.items);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosPublic.get("/get-seller-products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.products || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalRevenue = items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const totalOrders = items?.length || 0;
  const deliveredOrders = items?.filter(item => item.itemOrderStatus === 'delivered')?.length || 0;
  const pendingOrders = items?.filter(item => item.itemOrderStatus === 'pending')?.length || 0;
  const processingOrders = items?.filter(item => item.itemOrderStatus === 'processing')?.length || 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (amount) => `৳${amount.toLocaleString()}`;

  if (loading && !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Seller Profile Found</h2>
          <p className="text-gray-600">You need to register as a seller first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Profile</h1>
          <p className="text-sm text-gray-600">Manage your seller account</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {/* Header Background */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 h-20 sm:h-32"></div>
          
          {/* Profile Content */}
          <div className="relative px-4 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end -mt-10 sm:-mt-16">
              {/* Profile Image */}
              <div className="relative self-center sm:self-auto">
                <img
                  src={seller.userInfo?.profileImage || 'https://via.placeholder.com/120'}
                  alt={seller.userInfo?.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg object-cover"
                />
                {seller.status === 'approved' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="text-center sm:text-left sm:ml-6 flex-1 mt-4 sm:mt-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{seller.businessName}</h1>
                <p className="text-sm sm:text-base text-gray-600">{seller.userInfo?.name}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(seller.status)}`}>
                    {seller.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    Joined {new Date(seller.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short'
                    })}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <button className="mt-4 sm:mt-0 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 self-center">
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border-l-4 border-teal-600">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-teal-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Products</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500">
            <div className="flex items-center">
              <ShoppingBag className="h-6 w-6 text-blue-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Orders</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border-l-4 border-green-500 col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-green-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Revenue</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border-l-4 border-yellow-500 col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-yellow-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Pending</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{pendingOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-First Content Layout */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">{seller.userInfo?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">{seller.userInfo?.phone}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-sm text-gray-900">{seller.businessAddress}</span>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-xl p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Business Type</label>
                <p className="text-sm text-gray-900">{seller.businessType}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Trade License</label>
                <p className="text-sm text-gray-900">{seller.tradeLicense}</p>
              </div>
              {seller.websiteUrl && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Website</label>
                  <a 
                    href={seller.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    <span>{seller.websiteUrl}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Social Media */}
            {(seller.facebookUrl || seller.instagramUrl) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="block text-xs font-medium text-gray-500 mb-2">Social Media</label>
                <div className="flex gap-3">
                  {seller.facebookUrl && (
                    <a 
                      href={seller.facebookUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Facebook className="h-4 w-4" />
                    </a>
                  )}
                  {seller.instagramUrl && (
                    <a 
                      href={seller.instagramUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Bank Name</label>
                <p className="text-sm text-gray-900">{seller.bankName || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Account Number</label>
                <p className="text-sm text-gray-900">{seller.bankAccountNumber || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Mobile Payment</label>
                <p className="text-sm text-gray-900">{seller.mobilePaymentProvider || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Mobile Number</label>
                <p className="text-sm text-gray-900">{seller.mobilePaymentNumber || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-xl p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status Breakdown</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Delivered</span>
                </div>
                <span className="font-semibold text-green-600">{deliveredOrders}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Processing</span>
                </div>
                <span className="font-semibold text-blue-600">{processingOrders}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-gray-700">Pending</span>
                </div>
                <span className="font-semibold text-yellow-600">{pendingOrders}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg transition-colors text-sm font-medium">
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </button>
              <button className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg transition-colors text-sm font-medium">
                <CreditCard className="h-4 w-4" />
                Update Payment
              </button>
              <button className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg transition-colors text-sm font-medium">
                <Package className="h-4 w-4" />
                View Products
              </button>
              <button className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg transition-colors text-sm font-medium">
                <ShoppingBag className="h-4 w-4" />
                View Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;