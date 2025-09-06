import React, { useEffect, useState } from "react";
import usePublicAxios from "../../../Hooks/usePublicAxios";
import Swal from "sweetalert2";

const AdminPaymentPage = () => {
  const axiosPublic = usePublicAxios();
  const [loading, setLoading] = useState(false);
  const [withdrawData, setWithdrawData] = useState([]);
  const [selectedWithdraw, setSelectedWithdraw] = useState(null);
  const [expandedWithdraws, setExpandedWithdraws] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchWithdrawRequest();
  }, []);

  // Fetch Withdraw Requests
  const fetchWithdrawRequest = async () => {
    setLoading(true);
    try {
      const res = await axiosPublic.get(`/admin-withdrawData`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWithdrawData(res.data.withdrawData || []);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to fetch withdraw request", "error");
    } finally {
      setLoading(false);
    }
  };

  // Update Withdraw Request Status
  const updateWithdrawStatus = async (withdrawId, newStatus) => {
    try {
      await axiosPublic.patch(
        `/admin-withdraw/${withdrawId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Success", `Withdraw status updated to ${newStatus}!`, "success");
      fetchWithdrawRequest();
      setSelectedWithdraw(null); // close modal after update
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to update withdraw status", "error");
    }
  };

  // Toggle withdraw expansion
  const toggleWithdrawExpansion = (withdrawId) => {
    const newExpanded = new Set(expandedWithdraws);
    if (newExpanded.has(withdrawId)) {
      newExpanded.delete(withdrawId);
    } else {
      newExpanded.add(withdrawId);
    }
    setExpandedWithdraws(newExpanded);
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'processing':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Get method icon
  const getMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'bank':
        return '🏦';
      case 'bkash':
        return '📱';
      case 'nagad':
        return '💳';
      case 'rocket':
        return '🚀';
      default:
        return '💰';
    }
  };

  // Filter withdrawals
  const filteredWithdraws = withdrawData.filter(withdraw => {
    const statusMatch = filterStatus === "all" || withdraw.status === filterStatus;
    const methodMatch = filterMethod === "all" || withdraw.method.toLowerCase() === filterMethod.toLowerCase();
    return statusMatch && methodMatch;
  });

  // Get unique methods for filter
  const uniqueMethods = [...new Set(withdrawData.map(w => w.method))];

  // Statistics
  const stats = {
    total: withdrawData.length,
    pending: withdrawData.filter(w => w.status === 'pending').length,
    approved: withdrawData.filter(w => w.status === 'approved').length,
    rejected: withdrawData.filter(w => w.status === 'rejected').length,
    totalAmount: withdrawData.reduce((sum, w) => sum + w.amount, 0),
    pendingAmount: withdrawData.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0)
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Payment Management</h1>
        <p className="text-gray-600">Manage seller withdrawal requests and payments</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Requests</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">৳{stats.totalAmount.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Amount</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">৳{stats.pendingAmount.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Pending Amount</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Method</label>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Methods</option>
              {uniqueMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Withdraw Requests */}
      {filteredWithdraws.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No withdrawal requests found.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWithdraws.map((withdraw) => (
            <div key={withdraw._id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {/* Withdraw Header */}
              <div className="p-4 md:p-6 border-b border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                      <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                        {getMethodIcon(withdraw.method)}
                        Withdraw #{withdraw._id.slice(-8)}
                      </h3>
                      <span className={getStatusBadge(withdraw.status)}>
                        {withdraw.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Seller ID:</span>
                        <p className="text-gray-600">{withdraw.sellerId.slice(-8)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Amount:</span>
                        <p className="text-gray-600 font-semibold text-lg">৳{withdraw.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Method:</span>
                        <p className="text-gray-600">{withdraw.method}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Request Date:</span>
                        <p className="text-gray-600">
                          {new Date(withdraw.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 lg:ml-6">
                    <button
                      onClick={() => toggleWithdrawExpansion(withdraw._id)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200 text-sm font-medium"
                    >
                      {expandedWithdraws.has(withdraw._id) ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Withdraw Details */}
              {expandedWithdraws.has(withdraw._id) && (
                <div className="p-4 md:p-6 bg-gray-50">
                  {/* Payment Method Details */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Payment Method Details</h4>
                    <div className="bg-white p-4 rounded-lg">
                      {withdraw.methodDetails ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {Object.entries(withdraw.methodDetails).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium text-gray-700 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <p className="text-gray-600 mt-1">{value}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No additional method details available</p>
                      )}
                    </div>
                  </div>

                  {/* Request Information */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Request Information</h4>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Full Withdraw ID:</span>
                          <p className="text-gray-600 font-mono text-xs mt-1 break-all">{withdraw._id}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Full Seller ID:</span>
                          <p className="text-gray-600 font-mono text-xs mt-1 break-all">{withdraw.sellerId}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Request Time:</span>
                          <p className="text-gray-600 mt-1">
                            {new Date(withdraw.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Management */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Update Status</h4>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => updateWithdrawStatus(withdraw._id, "pending")}
                          className={`px-4 py-2 rounded-md text-white font-medium transition-colors duration-200 ${
                            withdraw.status === 'pending' 
                              ? 'bg-yellow-400 cursor-not-allowed' 
                              : 'bg-yellow-600 hover:bg-yellow-700'
                          }`}
                          disabled={withdraw.status === 'pending'}
                        >
                          Mark as Pending
                        </button>
                        <button
                          onClick={() => updateWithdrawStatus(withdraw._id, "approved")}
                          className={`px-4 py-2 rounded-md text-white font-medium transition-colors duration-200 ${
                            withdraw.status === 'approved' 
                              ? 'bg-green-400 cursor-not-allowed' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                          disabled={withdraw.status === 'approved'}
                        >
                          Approve Request
                        </button>
                        <button
                          onClick={() => updateWithdrawStatus(withdraw._id, "rejected")}
                          className={`px-4 py-2 rounded-md text-white font-medium transition-colors duration-200 ${
                            withdraw.status === 'rejected' 
                              ? 'bg-red-400 cursor-not-allowed' 
                              : 'bg-red-600 hover:bg-red-700'
                          }`}
                          disabled={withdraw.status === 'rejected'}
                        >
                          Reject Request
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-3">
                        Current status: <span className="font-semibold capitalize">{withdraw.status}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Legacy Modal (keeping for backward compatibility) */}
      {selectedWithdraw && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Withdraw Details</h3>
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl"
              onClick={() => setSelectedWithdraw(null)}
            >
              &times;
            </button>

            <div className="space-y-3 mb-6">
              <div>
                <span className="font-medium text-gray-700">Withdraw ID:</span>
                <p className="text-gray-600 font-mono text-sm">{selectedWithdraw._id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Seller ID:</span>
                <p className="text-gray-600 font-mono text-sm">{selectedWithdraw.sellerId}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Amount:</span>
                <p className="text-gray-600 font-semibold text-lg">৳{selectedWithdraw.amount}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Method:</span>
                <p className="text-gray-600">{selectedWithdraw.method}</p>
              </div>
              {selectedWithdraw.methodDetails && (
                <div>
                  <span className="font-medium text-gray-700">Method Details:</span>
                  <div className="bg-gray-100 p-3 rounded mt-2 text-sm">
                    {Object.entries(selectedWithdraw.methodDetails).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1">
                        <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 ${getStatusBadge(selectedWithdraw.status)}`}>
                  {selectedWithdraw.status.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Created At:</span>
                <p className="text-gray-600">{new Date(selectedWithdraw.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {["pending", "approved", "rejected"].map((status) => (
                <button
                  key={status}
                  className={`px-4 py-2 rounded text-white font-medium ${
                    status === "approved" 
                      ? "bg-green-600 hover:bg-green-700" 
                      : status === "pending"
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                  onClick={() => updateWithdrawStatus(selectedWithdraw._id, status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentPage;