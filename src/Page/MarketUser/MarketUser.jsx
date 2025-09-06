import { useState, useEffect } from "react";
import {
  User,
  Package,
  MapPin,
  Bell,
  Store,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Phone,
  Mail,
  GraduationCap,
  Briefcase,
  Home,
  CheckCircle,
  X,
  Save,
  Shield,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import Swal from "sweetalert2";
import useUser from "../../Hooks/useUser";
import usePublicAxios from "../../Hooks/usePublicAxios";
import MNavbar from "../Marketplace/MComponent/MNavbar";
import { MFooter } from "../Marketplace/MComponent/MFooter";

const MarketUser = () => {
  const { user, loading } = useUser();
  const [activeTab, setActiveTab] = useState("personal");
  const [pendingOrders, setPendingOrders] = useState([]);
  const [confirmedOrders, setConfirmedOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellerRequest, setSellerRequest] = useState(null);
  const [orders, setOrders] = useState([]);

  const axiosPublic = usePublicAxios();
  const navigate = useNavigate();

  const [addressForm, setAddressForm] = useState({
    type: "Home",
    fullAddress: "",
    phone: "",
    isDefault: false,
  });

  // Fetch data: orders, addresses, seller request
  useEffect(() => {
    if (user?.id) {
      // all orders
      axiosPublic
        .get(`/user-all/orders/${user.id}`)
        .then((res) => setOrders(res.data.orders || []))
        .catch((err) => console.log("Error fetching orders:", err));

      // Pending orders
      axiosPublic
        .get(`/payments/pending/${user.id}`)
        .then((res) => setPendingOrders(res.data.orders || []))
        .catch((err) => console.log("Error fetching pending orders:", err));

      // Confirmed orders
      axiosPublic
        .get(`/payments/confirmed/${user.id}`)
        .then((res) => setConfirmedOrders(res.data.orders || []))
        .catch((err) => console.log("Error fetching confirmed orders:", err));

      // Addresses
      axiosPublic
        .get(`/addresses/${user.id}`)
        .then((res) => setAddresses(res.data.addresses || []))
        .catch((err) => console.log("Error fetching addresses:", err));

      // Seller request status
      axiosPublic
        .get(`/seller-request/${user.id}`)
        .then((res) => setSellerRequest(res.data.request || null))
        .catch((err) => console.log("Error fetching seller request:", err));
    }
  }, [user, axiosPublic]);

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "pending", label: "Pending Orders", icon: Clock },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "seller", label: "Become Seller", icon: Store },
  ];

  // Address management
  const resetAddressForm = () => {
    setAddressForm({
      type: "Home",
      fullAddress: "",
      phone: "",
      isDefault: false,
    });
    setShowAddressForm(false);
    setEditingAddress(null);
    setIsSubmitting(false);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const addressData = { ...addressForm, userId: user.id };
      if (editingAddress) {
        const response = await axiosPublic.put(
          `/addresses/${editingAddress._id}`,
          { addressData }
        );
        setAddresses(
          addresses.map((addr) =>
            addr._id === editingAddress._id ? response.data.address : addr
          )
        );
      } else {
        const response = await axiosPublic.post("/addresses", { addressData });
        setAddresses([...addresses, response.data.address]);
      }
      resetAddressForm();
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Failed to save address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAddress = (address) => {
    setAddressForm({
      type: address.type,
      fullAddress: address.fullAddress,
      phone: address.phone,
      isDefault: address.isDefault || false,
    });
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this address?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#EF4444",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirmResult.isConfirmed) {
      try {
        await axiosPublic.delete(`/addresses/${addressId}`);
        setAddresses(addresses.filter((addr) => addr._id !== addressId));
        Swal.fire({
          title: "Deleted!",
          text: "Your address has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting address:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete address. Please try again.",
          icon: "error",
        });
      }
    }
  };

  // Renders
  const renderContent = () => {
    switch (activeTab) {
      case "personal":
        return renderPersonalInfo();
      case "orders":
        return renderOrders();
      case "pending":
        return renderPendingOrders();
      case "addresses":
        return renderAddresses();
      case "seller":
        return renderSellerRequest();
      default:
        return renderPersonalInfo();
    }
  };

  // Render sections
  const renderPersonalInfo = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-600"></div>
        <div className="px-4 sm:px-8 pb-8 -mt-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user?.name || "User"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ display: user?.profileImage ? "none" : "flex" }}
              >
                <User className="w-16 h-16 text-gray-400" />
              </div>
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start space-x-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {user?.name || "User"}
                </h1>
                {user?.verificationStatus && (
                  <CheckCircle
                    className="w-6 h-6 text-blue-500"
                    title="Verified Account"
                  />
                )}
              </div>
              <p className="text-gray-600 mb-2">
                {user?.work || "Not specified"}
              </p>
              <p className="text-sm text-gray-500">
                {user?.studies || "Not specified"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <User className="w-5 h-5 mr-2 text-teal-600" />
            Contact Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900 truncate">
                  {user?.email || "Not provided"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">
                  {user?.number || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-teal-600" />
            Location Details
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mt-0.5">
                <Home className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Current City</p>
                <p className="font-medium text-gray-900">
                  {user?.currentCity || "Not specified"}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mt-0.5">
                <MapPin className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Hometown</p>
                <p className="font-medium text-gray-900">
                  {user?.hometown || "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2 text-teal-600" />
            Education
          </h3>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500">Studies</p>
              <p className="font-medium text-gray-900">
                {user?.studies || "Not specified"}
              </p>
            </div>
          </div>
        </div>

        {/* Professional & Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-teal-600" />
            Professional
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Work</p>
                <p className="font-medium text-gray-900">
                  {user?.work || "Not specified"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Verification Status</p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    user?.verificationStatus
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                  }`}
                >
                  {user?.verificationStatus
                    ? "Verified"
                    : "Pending Verification"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Statistics */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold mb-6">Account Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">
              {user?.friends?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Friends</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">
              {confirmedOrders.length}
            </div>
            <div className="text-sm text-gray-600">Completed Orders</div>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-xl">
            <div className="text-2xl font-bold text-amber-600">
              {pendingOrders.length}
            </div>
            <div className="text-sm text-gray-600">Pending Orders</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Seller request section
  const renderSellerRequest = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-2 h-8 bg-teal-600 rounded-full"></div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Become a Seller
        </h2>
      </div>

      {sellerRequest ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-teal-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Seller Request Status
          </h3>
          <p className="text-gray-600 text-lg mb-2">
            Your request has been submitted.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Current status:{" "}
            <span className="font-medium">{sellerRequest.status}</span>
          </p>
          {sellerRequest.status === "Pending" && (
            <p className="text-gray-500 text-sm">
              Our team will review your application shortly.
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-teal-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Start Your Selling Journey
          </h3>
          <p className="text-gray-600 text-lg mb-2">
            Join our marketplace and reach thousands of customers
          </p>
          <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
            Expand your business by selling your products on our platform. Easy
            setup, secure payments, and dedicated support.
          </p>
          <Link
            to={"/seller-request"}
            className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm"
          >
            Apply to Become Seller
          </Link>
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center space-x-3 mb-6 sm:mb-8">
        <div className="w-2 h-8 bg-teal-600 rounded-full"></div>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
          Order History
        </h2>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Your order history will appear here
          </p>
          <button
            onClick={() => navigate("/marketplace")}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 text-xs sm:text-sm">
                      <span className="text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-gray-400 hidden sm:inline">•</span>
                      <span className="text-gray-600">
                        {order.totalProducts} product
                        {order.totalProducts !== 1 ? "s" : ""}
                      </span>
                      <span className="text-gray-400 hidden sm:inline">•</span>
                      <span className="text-gray-600">
                        {order.items?.reduce(
                          (total, item) => total + (item.quantity || 1),
                          0
                        )}{" "}
                        item
                        {order.items?.reduce(
                          (total, item) => total + (item.quantity || 1),
                          0
                        ) !== 1
                          ? "s"
                          : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <div className="text-right sm:text-left">
                      <div className="font-bold text-lg sm:text-xl text-gray-900">
                        ৳{order.totalAmount?.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Total Amount</div>
                    </div>

                    <span
                      className={`inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${
                        order.paymentStatus === "confirmed" &&
                        order.orderStatus === "delivered"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : order.paymentStatus === "confirmed" &&
                            order.orderStatus === "pending"
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : order.paymentStatus === "pending"
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : order.orderStatus === "cancelled"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {order.paymentStatus === "confirmed" &&
                      order.orderStatus === "delivered" ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Delivered
                        </>
                      ) : order.paymentStatus === "confirmed" &&
                        order.orderStatus === "pending" ? (
                        <>
                          <Package className="w-3 h-3 mr-1" />
                          Processing
                        </>
                      ) : order.paymentStatus === "pending" ? (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Payment Pending
                        </>
                      ) : order.orderStatus === "cancelled" ? (
                        <>
                          <X className="w-3 h-3 mr-1" />
                          Cancelled
                        </>
                      ) : (
                        <>
                          <Package className="w-3 h-3 mr-1" />
                          {order.orderStatus || "Processing"}
                        </>
                      )}
                    </span>

                    {/* Payment pending action */}
                    {order.paymentStatus === "pending" && (
                      <button
                        onClick={() => navigate(`/payment/${order._id}`)}
                        className="w-full sm:w-auto px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                      >
                        Complete Payment
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <div
                        key={item._id || index}
                        className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-xl"
                      >
                        {/* Product Image */}
                        <div className="flex-shrink-0 mx-auto sm:mx-0">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                            {item.images && item.images.length > 0 ? (
                              <img
                                src={item.images[0]}
                                alt={item.title || "Product"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="w-full h-full flex items-center justify-center bg-gray-100"
                              style={{
                                display:
                                  item.images && item.images.length > 0
                                    ? "none"
                                    : "flex",
                              }}
                            >
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 text-center sm:text-left">
                          <h4 className="font-semibold text-gray-900 text-base sm:text-lg mb-2 line-clamp-2">
                            {item.title || "Product Name"}
                          </h4>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                            <div className="flex items-center justify-center sm:justify-start space-x-2">
                              <span className="text-gray-600">Qty:</span>
                              <span className="font-medium bg-gray-200 px-2 py-1 rounded text-xs">
                                {item.quantity || 1}
                              </span>
                            </div>

                            <div className="flex items-center justify-center sm:justify-start space-x-2">
                              <span className="text-gray-600">Price:</span>
                              <div className="flex items-center space-x-1">
                                <span className="font-medium text-gray-900">
                                  ৳{item.price?.toLocaleString()}
                                </span>
                                {item.originalPrice &&
                                  item.originalPrice > item.price && (
                                    <span className="text-gray-500 line-through text-xs">
                                      ৳{item.originalPrice?.toLocaleString()}
                                    </span>
                                  )}
                              </div>
                            </div>

                            {item.discount && item.discount > 0 && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                {item.discount}% OFF
                              </span>
                            )}
                          </div>

                          {/* Item Status */}
                          <div className="mt-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                item.itemOrderStatus === "delivered"
                                  ? "bg-green-100 text-green-700"
                                  : item.itemOrderStatus === "shipped"
                                  ? "bg-blue-100 text-blue-700"
                                  : item.itemOrderStatus === "pending"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {item.itemOrderStatus === "delivered"
                                ? "✅ Delivered"
                                : item.itemOrderStatus === "shipped"
                                ? "🚚 Shipped"
                                : item.itemOrderStatus === "pending"
                                ? "⏳ Processing"
                                : item.itemOrderStatus || "Processing"}
                            </span>
                          </div>

                          {/* Product Info */}
                          <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-1">
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                              {item.category}
                            </span>
                            {item.rating && (
                              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                                ⭐ {item.rating}/5 ({item.reviews} reviews)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-center sm:text-right">
                          <div className="font-bold text-gray-900 text-lg sm:text-xl">
                            ৳
                            {(
                              (item.price || 0) * (item.quantity || 1)
                            )?.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Item Total
                          </div>

                          {/* Quick Actions */}
                          <div className="mt-3 flex flex-col sm:flex-col gap-1">
                            <button className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                              View Details
                            </button>
                            <button className="text-xs text-gray-500 hover:text-gray-700">
                              Write Review
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No items found for this order</p>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Shipping Information */}
                    {order.shippingInfo && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                          Shipping Address
                        </h5>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                          <div className="font-medium text-gray-900">
                            {order.shippingInfo.fullName}
                          </div>
                          <div className="text-gray-600">
                            {order.shippingInfo.street}
                            {order.shippingInfo.city &&
                              `, ${order.shippingInfo.city}`}
                            {order.shippingInfo.postalCode &&
                              `, ${order.shippingInfo.postalCode}`}
                          </div>
                          <div className="text-gray-600">
                            {order.shippingInfo.country}
                          </div>
                          <div className="flex items-center space-x-4 pt-2 border-t border-gray-200">
                            <span className="flex items-center text-gray-600">
                              <Phone className="w-3 h-3 mr-1" />
                              {order.shippingInfo.phone}
                            </span>
                            <span className="flex items-center text-gray-600">
                              <Mail className="w-3 h-3 mr-1" />
                              {order.shippingInfo.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Summary */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">
                        Order Summary
                      </h5>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Subtotal ({order.totalProducts} products):
                            </span>
                            <span className="text-gray-900 font-medium">
                              ৳{order.subtotal?.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Delivery Charges:
                            </span>
                            <span className="text-gray-900 font-medium">
                              {order.deliveryCharges > 0
                                ? `৳${order.deliveryCharges?.toLocaleString()}`
                                : "FREE"}
                            </span>
                          </div>

                          {order.discount && order.discount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-green-600">Discount:</span>
                              <span className="text-green-600 font-medium">
                                -৳{order.discount?.toLocaleString()}
                              </span>
                            </div>
                          )}

                          <div className="border-t border-gray-200 pt-2 mt-2">
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-900">
                                Total Amount:
                              </span>
                              <span className="font-bold text-lg text-gray-900">
                                ৳{order.totalAmount?.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-200 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">
                                Payment Status:
                              </span>
                              <span
                                className={`font-medium ${
                                  order.paymentStatus === "confirmed"
                                    ? "text-green-600"
                                    : "text-amber-600"
                                }`}
                              >
                                {order.paymentStatus === "confirmed"
                                  ? "✅ Confirmed"
                                  : "⏳ Pending"}
                              </span>
                            </div>

                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">
                                Order Source:
                              </span>
                              <span className="text-gray-700 capitalize">
                                {order.orderSource || "Cart"}
                              </span>
                            </div>

                            {order.confirmedAt && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">
                                  Confirmed At:
                                </span>
                                <span className="text-gray-700">
                                  {new Date(
                                    order.confirmedAt
                                  ).toLocaleDateString("en-GB")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPendingOrders = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Pending Orders
        </h2>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No pending orders 🎉
          </h3>
          <p className="text-gray-500 text-sm">
            All your orders are up to date
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingOrders.map((order) => (
            <div
              key={order._id}
              className="group p-4 sm:p-6 rounded-xl border border-amber-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer bg-amber-50"
              onClick={() => navigate(`/payment/${order._id}`)}
            >
              <Link
                to={`/payment/${order._id}`}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-amber-700 transition-colors">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-gray-600 text-sm">
                      {order.items?.length || 0} item
                      {(order.items?.length || 0) !== 1 ? "s" : ""}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-900 font-medium">
                      ৳{order.totalAmount}
                    </span>
                  </div>
                  <p className="text-amber-600 text-xs mt-2 font-medium">
                    👆 Click to complete payment
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex px-4 py-2 rounded-full text-sm font-medium bg-amber-100 text-amber-700 border border-amber-200">
                    <Clock className="w-4 h-4 mr-1" />
                    Pending Payment
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAddresses = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-8 bg-teal-600 rounded-full"></div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Delivery Addresses
            </h2>
          </div>
          <button
            onClick={() => setShowAddressForm(true)}
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No addresses added yet
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Add your delivery addresses for faster checkout
            </p>
            <button
              onClick={() => setShowAddressForm(true)}
              className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {addresses.map((address) => (
              <div
                key={address._id}
                className="p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow bg-gray-50"
              >
                <div className="flex flex-col lg:flex-row lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {address.type}
                      </h3>
                      {address.isDefault && (
                        <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full border border-teal-200 font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600 flex items-start">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                        {address.fullAddress}
                      </p>
                      <p className="text-gray-500 text-sm flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        {address.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 lg:ml-4">
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="p-3 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Edit Address"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address._id)}
                      className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h3>
              <button
                onClick={resetAddressForm}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Type *
                </label>
                <select
                  value={addressForm.type}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, type: e.target.value })
                  }
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                  required
                  disabled={isSubmitting}
                >
                  <option value="Home">🏠 Home</option>
                  <option value="Office">🏢 Office</option>
                  <option value="Other">📍 Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address *
                </label>
                <textarea
                  value={addressForm.fullAddress}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      fullAddress: e.target.value,
                    })
                  }
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                  rows="3"
                  placeholder="Enter your complete address including house/building number, street, area, city, etc."
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, phone: e.target.value })
                  }
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter phone number for delivery"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      isDefault: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="isDefault"
                  className="ml-3 text-sm text-gray-700"
                >
                  Set as default delivery address
                </label>
              </div>

              <div className="flex space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={resetAddressForm}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddressSubmit}
                  disabled={
                    isSubmitting ||
                    !addressForm.fullAddress.trim() ||
                    !addressForm.phone.trim()
                  }
                  className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingAddress ? "Update Address" : "Save Address"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div>
        <MNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your profile...</p>
          </div>
        </div>
        <MFooter />
      </div>
    );
  }
  console.log(orders);
  return (
    <div>
      <MNavbar />
      <div className="min-h-screen bg-gray-50 py-6 sm:py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Sidebar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 h-fit">
              <nav className="space-y-1 sm:space-y-2">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl w-full text-left transition-all duration-200 ${
                        isActive
                          ? "bg-teal-600 text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 hover:text-teal-600"
                      }`}
                    >
                      <tab.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base">
                        {tab.label}
                      </span>
                      {tab.id === "pending" && pendingOrders.length > 0 && (
                        <span
                          className={`ml-auto px-2 py-1 text-xs rounded-full ${
                            isActive
                              ? "bg-white text-teal-600"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {pendingOrders.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">{renderContent()}</div>
          </div>
        </div>
      </div>
      <MFooter />
    </div>
  );
};

export default MarketUser;
