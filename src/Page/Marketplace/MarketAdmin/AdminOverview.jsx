import { Users, ShoppingCart, DollarSign, TrendingUp, Package, Store, CreditCard } from "lucide-react";
import usePublicAxios from "../../../Hooks/usePublicAxios";
import { useEffect, useState } from "react";

const AdminOverview = () => {
  const axiosPublic = usePublicAxios();
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [withdrawData, setWithdrawData] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchSellers();
    fetchWithdrawRequest();
  }, [axiosPublic, token]);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await axiosPublic.get("/sellers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSellers(res.data.sellers);
    } catch (error) {
      console.error("Error fetching sellers", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawRequest = async () => {
    setLoading(true);
    try {
      const res = await axiosPublic.get(`/admin-withdrawData`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWithdrawData(res.data.withdrawData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosPublic.get(`/admin-products/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosPublic.get("/get-admin-products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic calculations
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const activeSellers = sellers.filter(seller => seller.status === 'approved').length;
  const pendingWithdrawals = withdrawData.filter(withdraw => withdraw.status === 'pending').length;
  const totalWithdrawAmount = withdrawData.reduce((sum, withdraw) => sum + (withdraw.amount || 0), 0);

  // Get recent activities
  const getRecentActivities = () => {
    const activities = [];
    
    // Add recent orders
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
    
    recentOrders.forEach(order => {
      activities.push({
        type: 'order',
        description: `New Order #${order._id.slice(-6)} placed`,
        user: order.shippingInfo?.fullName || 'Unknown User',
        time: getTimeAgo(order.createdAt),
        amount: order.totalAmount
      });
    });

    // Add recent withdrawals
    const recentWithdrawals = withdrawData
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2);
    
    recentWithdrawals.forEach(withdraw => {
      const seller = sellers.find(s => s._id === withdraw.sellerId);
      activities.push({
        type: 'withdrawal',
        description: `Withdrawal request of ৳${withdraw.amount}`,
        user: seller?.userInfo?.name || 'Unknown Seller',
        time: getTimeAgo(withdraw.createdAt),
        status: withdraw.status
      });
    });

    return activities.slice(0, 5);
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const recentActivities = getRecentActivities();

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">৳{totalRevenue.toLocaleString()}</h2>
            </div>
            <div className="p-3 bg-teal-100 rounded-lg">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-teal-700" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">From {totalOrders} orders</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{totalOrders}</h2>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            {orders.filter(order => order.orderStatus === 'delivered').length} delivered
          </p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Sellers</p>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{activeSellers}</h2>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Store className="w-5 h-5 sm:w-6 sm:h-6 text-purple-700" />
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-2">Out of {sellers.length} total</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{totalProducts}</h2>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-orange-700" />
            </div>
          </div>
          <p className="text-xs text-orange-600 mt-2">
            {products.filter(product => product.stock > 0).length} in stock
          </p>
        </div>
      </div>

      {/* Withdrawal Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Withdrawals</h3>
            <div className="p-2 bg-red-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-red-700" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900">{pendingWithdrawals}</p>
            <p className="text-sm text-gray-500">Total amount: ৳{totalWithdrawAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-700" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900">
              ৳{orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0}
            </p>
            <p className="text-sm text-gray-500">Average order value</p>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
        
        {recentActivities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs uppercase bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-3 sm:px-6 py-3">Activity</th>
                  <th className="px-3 sm:px-6 py-3">User</th>
                  <th className="px-3 sm:px-6 py-3">Time</th>
                  <th className="px-3 sm:px-6 py-3 hidden sm:table-cell">Details</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((activity, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {activity.type === 'order' ? (
                          <ShoppingCart className="w-4 h-4 text-blue-500" />
                        ) : (
                          <CreditCard className="w-4 h-4 text-green-500" />
                        )}
                        <span className="truncate max-w-xs">{activity.description}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 font-medium text-gray-900">
                      {activity.user}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-gray-500">
                      {activity.time}
                    </td>
                    <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                      {activity.amount && (
                        <span className="text-green-600 font-medium">
                          ৳{activity.amount.toLocaleString()}
                        </span>
                      )}
                      {activity.status && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {activity.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activities found</p>
          </div>
        )}
      </div>

      {/* Product Categories */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(
              products.reduce((acc, product) => {
                acc[product.category] = (acc[product.category] || 0) + 1;
                return acc;
              }, {})
            ).map(([category, count]) => (
              <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 truncate">{category}</h4>
                <p className="text-2xl font-bold text-teal-600 mt-1">{count}</p>
                <p className="text-xs text-gray-500">products</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;