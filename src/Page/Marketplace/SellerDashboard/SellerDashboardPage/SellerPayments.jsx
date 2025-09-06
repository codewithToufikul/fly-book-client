import React, { useEffect, useState } from "react";
import { DollarSign, Package, Clock, CheckCircle, Eye, X, User, MapPin, Phone, Mail, ChevronRight } from "lucide-react";
import useUser from "../../../../Hooks/useUser";
import usePublicAxios from "../../../../Hooks/usePublicAxios";

const SellerPayments = () => {
  const { user, loading: userLoading } = useUser();
  const axiosPublic = usePublicAxios();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user) return;
    fetchPayments();
  }, [user]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await axiosPublic.get("/seller-payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data);
      setItems(res.data.items);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });

  const formatCurrency = (amount) => `৳${amount}`;

  // Calculate summary statistics
  const calculateSummary = () => {
    if (!items.length) return { totalEarnings: 0, pendingPayments: 0, completedPayments: 0, totalOrders: 0 };

    const totalEarnings = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const pendingPayments = items
      .filter(item => item.itemOrderStatus !== 'delivered')
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const completedPayments = items
      .filter(item => item.itemOrderStatus === 'delivered')
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalOrders = items.length;

    return { totalEarnings, pendingPayments, completedPayments, totalOrders };
  };

  const summary = calculateSummary();

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'ready-to-ship': return 'bg-purple-100 text-purple-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const openModal = (item) => {
    setSelectedOrder(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  if (loading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Payments</h1>
          <p className="text-sm text-gray-600">Track your earnings and payments</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border-l-4 border-teal-600">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-teal-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total Earnings</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{formatCurrency(summary.totalEarnings)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-yellow-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Pending</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{formatCurrency(summary.pendingPayments)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border-l-4 border-green-500">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Completed</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{formatCurrency(summary.completedPayments)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500">
            <div className="flex items-center">
              <Package className="h-6 w-6 text-blue-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total Orders</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{summary.totalOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No payment data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={item.images?.[0] || '/api/placeholder/48/48'}
                              alt={item.title}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {item.title}
                            </div>
                            <div className="text-sm text-gray-500">{item.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(item.price)}
                          {item.discount > 0 && (
                            <div className="text-xs text-gray-500">
                              <span className="line-through">{formatCurrency(item.originalPrice)}</span>
                              <span className="text-red-600 ml-1">({item.discount}% off)</span>
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-medium text-teal-700">
                          Total: {formatCurrency(item.price * item.quantity)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.itemOrderStatus)}`}>
                          {item.itemOrderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.paymentStatus)}`}>
                          {item.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openModal(item)}
                          className="text-teal-700 hover:text-teal-900 flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          {items.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No payments found</h3>
              <p className="text-gray-500 text-sm">You haven't received any payments yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      className="w-14 h-14 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                      src={item.images?.[0] || '/api/placeholder/56/56'}
                      alt={item.title}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-1 mb-1">{item.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                      <div className="flex gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.itemOrderStatus)}`}>
                          {item.itemOrderStatus}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.paymentStatus)}`}>
                          {item.paymentStatus}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => openModal(item)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    >
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500">Qty:</span>
                      <p className="font-medium text-gray-900">{item.quantity}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Price:</span>
                      <p className="font-medium text-gray-900">{formatCurrency(item.price)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total:</span>
                      <p className="font-medium text-teal-600">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>

                  {item.discount > 0 && (
                    <div className="mt-2 text-xs">
                      <span className="text-gray-500">Original: </span>
                      <span className="line-through text-gray-500">{formatCurrency(item.originalPrice)}</span>
                      <span className="text-red-600 ml-1">({item.discount}% off)</span>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal - Mobile Optimized */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
                  <p className="text-sm text-gray-600">Order #{selectedOrder._id?.slice(-8)}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
                <div className="p-4 space-y-4">
                  {/* Product Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Product Information</h4>
                    <div className="flex items-start gap-3">
                      <img
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                        src={selectedOrder.images?.[0] || '/api/placeholder/64/64'}
                        alt={selectedOrder.title}
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 mb-1 text-sm">{selectedOrder.title}</h5>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{selectedOrder.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Category: </span>
                            <span className="font-medium text-gray-900">{selectedOrder.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Quantity: </span>
                            <span className="font-medium text-gray-900">{selectedOrder.quantity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Information */}
                  <div className="bg-teal-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Pricing Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit Price:</span>
                        <span className="text-gray-900">{formatCurrency(selectedOrder.price)}</span>
                      </div>
                      {selectedOrder.originalPrice && selectedOrder.discount > 0 && (
                        <>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Original Price:</span>
                            <span className="line-through">{formatCurrency(selectedOrder.originalPrice)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-red-600">
                            <span>Discount ({selectedOrder.discount}%):</span>
                            <span>-{formatCurrency(selectedOrder.originalPrice - selectedOrder.price)}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="text-gray-900">×{selectedOrder.quantity}</span>
                      </div>
                      <div className="border-t border-teal-200 pt-2 flex justify-between font-semibold text-teal-700">
                        <span>Total Amount:</span>
                        <span>{formatCurrency(selectedOrder.price * selectedOrder.quantity)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Status */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Status Information</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Order Status:</span>
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.itemOrderStatus)}`}>
                          {selectedOrder.itemOrderStatus}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Payment Status:</span>
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.paymentStatus)}`}>
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Order Date:</span>
                        <p className="font-medium text-sm">{formatDate(selectedOrder.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Buyer Information */}
                  {selectedOrder.shippingInfo && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Buyer Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="font-medium text-gray-900">{selectedOrder.shippingInfo.fullName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-900 text-xs">{selectedOrder.shippingInfo.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-900">{selectedOrder.shippingInfo.phone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3 w-3 text-gray-400 mt-0.5" />
                          <div className="text-gray-900 text-xs">
                            <div>{selectedOrder.shippingInfo.street}</div>
                            <div>{selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.postalCode}</div>
                            <div>{selectedOrder.shippingInfo.country}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="w-full bg-teal-600 text-white px-4 py-2.5 rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerPayments;