import React, { useEffect, useState } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import useUser from "../../../../Hooks/useUser";
import usePublicAxios from "../../../../Hooks/usePublicAxios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SellerOverview = () => {
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
    } finally {
      setLoading(false);
    }
  };

  // Calculate dynamic statistics
  const calculateStats = () => {
  const totalProducts = products.length;
    const totalOrders = items.length;
    const deliveredOrders = items?.filter(item => item.itemOrderStatus === 'delivered')?.length || 0;
    const pendingOrders = items?.filter(item => item.itemOrderStatus === 'pending')?.length || 0;
    const totalSales = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
      totalProducts,
      totalOrders,
      deliveredOrders,
      pendingOrders,
      totalSales
    };
  };

  // Generate sales chart data by month
  const generateSalesChartData = () => {
    const monthlyData = {};
    
    items.forEach(item => {
      const date = new Date(item.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          label: monthName,
          sales: 0
        };
      }
      monthlyData[monthKey].sales += item.price * item.quantity;
    });

    const sortedData = Object.values(monthlyData).sort((a, b) => a.label.localeCompare(b.label));
    
    return {
      labels: sortedData.map(data => data.label),
      datasets: [
        {
          label: "Sales (৳)",
          data: sortedData.map(data => data.sales),
          backgroundColor: "rgba(13, 148, 136, 0.8)",
          borderColor: "rgba(13, 148, 136, 1)",
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  };

  // Generate order status distribution for doughnut chart
  const generateOrderStatusChart = () => {
    const statusCounts = items.reduce((acc, item) => {
      const status = item.itemOrderStatus || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const colors = {
      delivered: 'rgba(34, 197, 94, 0.8)',
      pending: 'rgba(234, 179, 8, 0.8)',
      processing: 'rgba(59, 130, 246, 0.8)',
      cancelled: 'rgba(239, 68, 68, 0.8)',
      unknown: 'rgba(156, 163, 175, 0.8)'
    };

    return {
      labels: Object.keys(statusCounts).map(status => 
        status.charAt(0).toUpperCase() + status.slice(1)
      ),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: Object.keys(statusCounts).map(status => colors[status]),
          borderColor: Object.keys(statusCounts).map(status => colors[status].replace('0.8', '1')),
          borderWidth: 2,
        },
      ],
    };
  };

  // Chart options with mobile responsiveness
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: window.innerWidth < 640 ? 10 : 20,
          usePointStyle: true,
          font: {
            size: window.innerWidth < 640 ? 10 : 12,
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(13, 148, 136, 1)',
        borderWidth: 1,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: window.innerWidth < 640 ? 10 : 12,
          },
          callback: function(value) {
            return '৳' + value;
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: window.innerWidth < 640 ? 9 : 12,
          },
          maxRotation: window.innerWidth < 640 ? 45 : 0,
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: window.innerWidth < 640 ? 'bottom' : 'bottom',
        labels: {
          padding: window.innerWidth < 640 ? 10 : 20,
          usePointStyle: true,
          font: {
            size: window.innerWidth < 640 ? 10 : 12,
          }
        }
      }
    }
  };

  if (loading && !seller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-slate-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 mx-auto border-4 border-transparent border-t-teal-400 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <p className="text-slate-600 font-medium text-sm sm:text-base">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-slate-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md mx-auto w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-teal-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 sm:mb-3">
            No Seller Profile Found
          </h2>
          <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">
            You need to register as a seller first to access this dashboard.
          </p>
          <button className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto">
            Become a Seller
          </button>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-lg border-4 border-teal-100 flex-shrink-0">
              <img 
                src={seller.userInfo.profileImage || "/api/placeholder/80/80"} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                {seller.businessName}
              </h1>
              <p className="text-gray-600 font-medium text-sm sm:text-base">{seller.userInfo.name}</p>
              <p className="text-xs sm:text-sm text-gray-500 mb-2">{seller.businessType}</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                seller.status === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
          {[
            { label: "Products", value: stats.totalProducts, icon: "📦", color: "from-blue-500 to-blue-600" },
            { label: "Orders", value: stats.totalOrders, icon: "🛍️", color: "from-green-500 to-green-600" },
            { label: "Pending", value: stats.pendingOrders, icon: "⏳", color: "from-yellow-500 to-yellow-600" },
            { label: "Sales", value: `${stats.totalSales} ৳`, icon: "💰", color: "from-purple-500 to-purple-600" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100"
            >
              <div className={`h-1 sm:h-2 bg-gradient-to-r ${item.color} rounded-t-lg sm:rounded-t-xl`}></div>
              <div className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-lg sm:text-xl lg:text-2xl">{item.icon}</span>
            </div>
                <p className="text-gray-600 text-xs font-medium mb-1 truncate">{item.label}</p>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 break-words">
                  {typeof item.value === 'string' && item.value.includes('৳') 
                    ? <span className="text-xs sm:text-sm lg:text-base">{item.value}</span>
                    : item.value
                  }
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
          
          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-teal-600">📊</span>
                <span className="text-sm sm:text-base lg:text-lg">Monthly Sales</span>
              </h2>
            </div>
            <div className="h-48 sm:h-64 lg:h-80">
              {items.length > 0 ? (
                <Bar data={generateSalesChartData()} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl mb-2">📈</div>
                    <p className="text-sm sm:text-base">No sales data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Status Chart */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <span className="text-teal-600">🎯</span>
              <span className="text-sm sm:text-base lg:text-lg">Order Status</span>
            </h2>
            <div className="h-48 sm:h-64 lg:h-80">
              {items.length > 0 ? (
                <Doughnut data={generateOrderStatusChart()} options={doughnutOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl mb-2">🎯</div>
                    <p className="text-sm sm:text-base">No order data available</p>
        </div>
      </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-teal-600">📋</span>
              <span className="text-sm sm:text-base lg:text-lg">Recent Orders</span>
            </h2>
          </div>
          
          {items.length > 0 ? (
            <div className="overflow-x-auto">
              {/* Mobile Card View */}
              <div className="sm:hidden">
                {items.slice(0, 5).map((order, index) => (
                  <div key={index} className="p-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm text-gray-900">
                        #{order.orderId?.slice(-8)}
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.itemOrderStatus === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.itemOrderStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.itemOrderStatus === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.itemOrderStatus?.charAt(0).toUpperCase() + order.itemOrderStatus?.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1 truncate">{order.title}</div>
                    <div className="flex justify-between items-center">
                      <div className="font-semibold text-sm text-gray-900">
                        ৳{order.price * order.quantity}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <table className="w-full hidden sm:table">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                </tr>
              </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.slice(0, 10).map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.orderId?.slice(-8)}
                    </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-600">
                        <div className="max-w-xs truncate">{order.title}</div>
                    </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ৳{order.price * order.quantity}
                    </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            order.itemOrderStatus === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.itemOrderStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.itemOrderStatus === "processing"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.itemOrderStatus?.charAt(0).toUpperCase() + order.itemOrderStatus?.slice(1)}
                        </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
            <div className="p-6 sm:p-8 text-center text-gray-500">
              <div className="text-3xl sm:text-4xl mb-4">📭</div>
              <p className="text-base sm:text-lg font-medium mb-1">No orders yet</p>
              <p className="text-xs sm:text-sm">Orders will appear here once customers start buying your products.</p>
          </div>
        )}
      </div>

        {/* Top Products */}
        {products.length > 0 && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <span className="text-teal-600">⭐</span>
              <span className="text-sm sm:text-base lg:text-lg">Top Products</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {products
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 10)
                .map((product) => (
                  <div key={product._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.images?.[0] || "/api/placeholder/200/200"}
                        alt={product.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-2 sm:p-3">
                      <h3 className="font-semibold text-xs sm:text-sm text-gray-900 truncate mb-1" title={product.title}>
                        {product.title}
                      </h3>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm sm:text-base font-bold text-teal-600">৳{product.price}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400 text-xs sm:text-sm">★</span>
                          <span className="text-xs text-gray-600">
                            {product.rating || 0}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Stock: {product.stock}
                      </div>
                    </div>
              </div>
            ))}
          </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SellerOverview;