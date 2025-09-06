import React, { useEffect, useState } from "react";
import usePublicAxios from "../../../Hooks/usePublicAxios";
import Swal from "sweetalert2";

const AdminProductsOrders = () => {
  const axiosPublic = usePublicAxios();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const token = localStorage.getItem("token");

  // all possible statuses
  const orderStatusOptions = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "returned",
  ];

  const paymentStatusOptions = [
    "pending",
    "processing",
    "confirmed",
    "failed",
    "refunded",
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosPublic.get(`/admin-products/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to fetch orders", "error");
    } finally {
      setLoading(false);
    }
  };

  // update order status
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await axiosPublic.patch(
        `/admin-products/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Success", "Order status updated!", "success");
      fetchOrders();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to update order status", "error");
    }
  };

  // update payment status
  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      await axiosPublic.patch(
        `/admin-products/orders/${orderId}/payment`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Success", "Payment status updated!", "success");
      fetchOrders();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to update payment status", "error");
    }
  };

  // toggle order expansion
  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  // get status badge styling
  const getStatusBadge = (status, type) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    if (type === 'order') {
      switch (status) {
        case 'pending':
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'confirmed':
          return `${baseClasses} bg-blue-100 text-blue-800`;
        case 'processing':
          return `${baseClasses} bg-orange-100 text-orange-800`;
        case 'shipped':
          return `${baseClasses} bg-purple-100 text-purple-800`;
        case 'out_for_delivery':
          return `${baseClasses} bg-indigo-100 text-indigo-800`;
        case 'delivered':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'cancelled':
          return `${baseClasses} bg-red-100 text-red-800`;
        case 'returned':
          return `${baseClasses} bg-gray-100 text-gray-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    } else {
      switch (status) {
        case 'pending':
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'processing':
          return `${baseClasses} bg-orange-100 text-orange-800`;
        case 'confirmed':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'failed':
          return `${baseClasses} bg-red-100 text-red-800`;
        case 'refunded':
          return `${baseClasses} bg-purple-100 text-purple-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Manage Orders</h2>
        <p className="text-gray-600">View and manage all customer orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No orders found.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {/* Order Header */}
              <div className="p-4 md:p-6 border-b border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                      <h3 className="font-semibold text-lg text-gray-900">
                        Order #{order._id.slice(-8)}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <span className={getStatusBadge(order.orderStatus, 'order')}>
                          {order.orderStatus.replace('_', ' ')}
                        </span>
                        <span className={getStatusBadge(order.paymentStatus, 'payment')}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Customer:</span>
                        <p className="text-gray-600">{order.shippingInfo?.fullName}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Total Amount:</span>
                        <p className="text-gray-600 font-semibold">{order.totalAmount} ৳</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Items:</span>
                        <p className="text-gray-600">{order.totalProducts} products</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Order Date:</span>
                        <p className="text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 lg:ml-6">
                    <button
                      onClick={() => toggleOrderExpansion(order._id)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200 text-sm font-medium"
                    >
                      {expandedOrders.has(order._id) ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Order Details */}
              {expandedOrders.has(order._id) && (
                <div className="p-4 md:p-6 bg-gray-50">
                  {/* Customer Information */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                    <div className="bg-white p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <p className="text-gray-600">{order.shippingInfo?.email}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Phone:</span>
                        <p className="text-gray-600">{order.shippingInfo?.phone}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">Address:</span>
                        <p className="text-gray-600">
                          {order.shippingInfo?.street}, {order.shippingInfo?.city}, {order.shippingInfo?.postalCode}, {order.shippingInfo?.country}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {order.items?.map((item) => (
                        <div key={item._id} className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex flex-col sm:flex-row gap-4">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              <img
                                src={item.images?.[0]}
                                alt={item.title}
                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                              />
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 mb-1 truncate">{item.title}</h5>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description?.substring(0, 100)}...</p>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">Price:</span>
                                  <p className="text-gray-600">{item.price} ৳</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Quantity:</span>
                                  <p className="text-gray-600">{item.quantity}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Category:</span>
                                  <p className="text-gray-600">{item.category}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Status:</span>
                                  <span className={`inline-block ${getStatusBadge(item.itemOrderStatus || order.orderStatus, 'order')}`}>
                                    {(item.itemOrderStatus || order.orderStatus).replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">{order.subtotal} ৳</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Charges:</span>
                          <span className="font-medium">{order.deliveryCharges} ৳</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                          <span className="font-semibold text-gray-900">Total Amount:</span>
                          <span className="font-bold text-lg">{order.totalAmount} ৳</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Management */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Update Status</h4>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Order Status
                          </label>
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {orderStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status.replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Status
                          </label>
                          <select
                            value={order.paymentStatus}
                            onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {paymentStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Dates */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Order Timeline</h4>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Created:</span>
                          <p className="text-gray-600">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {order.confirmedAt && (
                          <div>
                            <span className="font-medium text-gray-700">Confirmed:</span>
                            <p className="text-gray-600">
                              {new Date(order.confirmedAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-700">Last Updated:</span>
                          <p className="text-gray-600">
                            {new Date(order.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProductsOrders;