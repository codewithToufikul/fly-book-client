import React, { useEffect, useState } from "react";
import useUser from "../../../../Hooks/useUser";
import usePublicAxios from "../../../../Hooks/usePublicAxios";
import Swal from "sweetalert2";
import { Eye, Package, Calendar, CreditCard, MapPin, Phone, Mail, User, X, ChevronDown, ChevronRight } from "lucide-react";

const SellerOrders = () => {
  const { user, loading: userLoading } = useUser();
  const axiosPublic = usePublicAxios();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const token = localStorage.getItem("token");

  // fetch orders for this seller
  const fetchOrders = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await axiosPublic.get(`/seller/orders/${user.id}`, {
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

  useEffect(() => {
    if (!userLoading) fetchOrders();
  }, [userLoading]);

  // update order item status
  const handleStatusChange = async (orderId, itemId, newStatus) => {
    try {
      const confirm = await Swal.fire({
        title: "Are you sure?",
        text: `Change status to "${newStatus}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0f766e",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, update it!",
      });

      if (!confirm.isConfirmed) return;

      await axiosPublic.put(
        `/seller/orders/${orderId}/item/${itemId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? {
                ...order,
                items: order.items.map((item) =>
                  item._id === itemId
                    ? { ...item, itemOrderStatus: newStatus }
                    : item
                ),
              }
            : order
        )
      );

      Swal.fire("Updated!", "Item status updated successfully", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const getPaymentStatusBadge = (status) => {
    const statusColors = {
      confirmed: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      failed: "bg-red-100 text-red-700",
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const getItemStatusColor = (status) => {
    const colors = {
      pending: "text-yellow-600 bg-yellow-50",
      processing: "text-blue-600 bg-blue-50",
      "ready-to-ship": "text-purple-600 bg-purple-50",
      shipped: "text-indigo-600 bg-indigo-50",
      delivered: "text-green-600 bg-green-50",
      cancelled: "text-red-600 bg-red-50",
    };
    return colors[status] || "text-gray-600 bg-gray-50";
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-600 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Orders</h1>
          <p className="text-sm text-gray-600">Manage your product orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
            <p className="text-gray-500 text-sm">You haven't received any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Order Header - Mobile Optimized */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Package className="h-4 w-4 text-teal-600 flex-shrink-0" />
                      <span className="font-mono text-xs text-gray-600 truncate">#{order._id.slice(-8)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPaymentStatusBadge(order.paymentStatus)}
                      <button
                        onClick={() => toggleOrderExpansion(order._id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        {expandedOrders.has(order._id) ? 
                          <ChevronDown className="h-4 w-4 text-gray-400" /> : 
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Order meta info */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      <span>৳{order.totalAmount}</span>
                    </div>
                    <div className="hidden sm:block">
                      <span>{order.totalProducts} items</span>
                    </div>
                  </div>
                </div>

                {/* Expandable Content */}
                {expandedOrders.has(order._id) && (
                  <div className="p-4 bg-gray-50">
                    <div className="space-y-3">
                      {order.items
                        .filter((item) => item.vendorId === user.id)
                        .map((item) => (
                          <div
                            key={item._id}
                            className="bg-white rounded-lg p-3 border border-gray-100"
                          >
                            <div className="flex gap-3">
                              {/* Product Image */}
                              <div className="flex-shrink-0">
                                <img
                                  src={item.images?.[0] || '/api/placeholder/60/60'}
                                  alt={item.title}
                                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border border-gray-200"
                                  onError={(e) => {
                                    e.target.src = '/api/placeholder/60/60';
                                  }}
                                />
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 text-sm line-clamp-1 mb-1">{item.title}</h4>
                                
                                <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                                  <span>Qty: {item.quantity}</span>
                                  <span>৳{item.price}</span>
                                  {item?.discount > 0 && (
                                    <span className="text-green-600 font-medium">
                                      {item.discount}% off
                                    </span>
                                  )}
                                </div>

                                {/* Status Badge */}
                                <div className="mb-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getItemStatusColor(item.itemOrderStatus)}`}>
                                    {item.itemOrderStatus?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>
                                </div>

                                {/* Status Selector */}
                                <select
                                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                  value={item.itemOrderStatus}
                                  onChange={(e) =>
                                    handleStatusChange(order._id, item._id, e.target.value)
                                  }
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="ready-to-ship">Ready to Ship</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal - Mobile Optimized */}
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
                  <p className="text-sm text-gray-600">#{selectedOrder._id.slice(-8)}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
                <div className="p-4 space-y-6">
                  {/* Order & Shipping Info */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Order Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="text-gray-900">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Payment:</span>
                          {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="text-gray-900 capitalize">{selectedOrder.orderStatus}</span>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Shipping Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-900">{selectedOrder.shippingInfo?.fullName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-900 text-xs">{selectedOrder.shippingInfo?.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-900">{selectedOrder.shippingInfo?.phone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3 w-3 text-gray-400 mt-0.5" />
                          <div className="text-gray-900 text-xs">
                            <div>{selectedOrder.shippingInfo?.street}</div>
                            <div>{selectedOrder.shippingInfo?.city}, {selectedOrder.shippingInfo?.postalCode}</div>
                            <div>{selectedOrder.shippingInfo?.country}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Items ({selectedOrder.items.filter(item => item.vendorId === user.id).length})</h3>
                    <div className="space-y-3">
                      {selectedOrder.items
                        .filter((item) => item.vendorId === user.id)
                        .map((item) => (
                          <div key={item._id} className="flex gap-3 p-3 border border-gray-200 rounded-lg">
                            <img
                              src={item.images?.[0] || '/api/placeholder/80/80'}
                              alt={item.title}
                              className="w-16 h-16 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                              onError={(e) => {
                                e.target.src = '/api/placeholder/80/80';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 mb-1 text-sm line-clamp-1">{item.title}</h4>
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                <div>
                                  <span>Qty: </span>
                                  <span className="text-gray-900">{item.quantity}</span>
                                </div>
                                <div>
                                  <span>Price: </span>
                                  <span className="text-gray-900">৳{item.price}</span>
                                </div>
                              </div>
                              <div className="mt-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getItemStatusColor(item.itemOrderStatus)}`}>
                                  {item.itemOrderStatus?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-teal-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-900">৳{selectedOrder.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery:</span>
                        <span className="text-gray-900">৳{selectedOrder.deliveryCharges}</span>
                      </div>
                      <div className="border-t border-teal-200 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">Total:</span>
                          <span className="font-bold text-teal-700">৳{selectedOrder.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;