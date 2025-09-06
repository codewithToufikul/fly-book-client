import React, { useEffect, useState } from "react";
import useUser from "../../../Hooks/useUser";
import usePublicAxios from "../../../Hooks/usePublicAxios";
import toast from "react-hot-toast";
import { Search, Filter, Calendar, User, Eye, CheckCircle, XCircle, Clock, RefreshCw, Image as ImageIcon, DollarSign } from "lucide-react";

const AdminBannerRequest = () => {
  const { user, loading: userLoading } = useUser();
  const axiosPublic = usePublicAxios();
  const token = localStorage.getItem("token");

  const [banners, setBanners] = useState([]);
  const [filteredBanners, setFilteredBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch banners when user data is available
  useEffect(() => {
    if (user?.id) fetchBanners();
  }, [user]);

  // Filter banners based on search and status
  useEffect(() => {
    let filtered = banners;
    
    if (searchTerm) {
      filtered = filtered.filter(banner => 
        banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        banner.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        banner.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(banner => banner.status === statusFilter);
    }
    
    setFilteredBanners(filtered);
  }, [banners, searchTerm, statusFilter]);

  // Fetch all banner requests
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await axiosPublic.get("/admin/banner-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanners(res.data.banners || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  // Update banner status
  const updateBannerStatus = async (bannerId, newStatus) => {
    try {
      await axiosPublic.patch(
        `/admin/banner-request/${bannerId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Banner ${newStatus} successfully!`);
      fetchBanners(); // refresh list
    } catch (error) {
      console.error(error);
      toast.error("Failed to update banner status");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const openModal = (banner) => {
    setSelectedBanner(banner);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBanner(null);
    setIsModalOpen(false);
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Banner Management</h1>
            <p className="text-gray-600 mt-1">Manage and review banner requests from sellers</p>
          </div>
          <button
            onClick={fetchBanners}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search banners, sellers, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[160px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{banners.length}</div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{banners.filter(b => b.status === 'pending').length}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{banners.filter(b => b.status === 'approved').length}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{banners.filter(b => b.status === 'rejected').length}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>
      </div>

      {/* Banner List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No banners found</h3>
          <p className="text-gray-600">
            {banners.length === 0 ? "No banner requests available." : "Try adjusting your search or filter criteria."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBanners.map((banner) => (
            <div
              key={banner._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Banner Image */}
                  <div className="lg:w-80 flex-shrink-0">
                    {banner.image ? (
                      <div className="relative group cursor-pointer" onClick={() => openModal(banner)}>
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="w-full h-48 lg:h-32 object-cover rounded-lg border border-gray-200 group-hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-all">
                          <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-48 lg:h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Banner Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">{banner.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{banner.description}</p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              <span className="font-medium">{banner.sellerName}</span>
                              <span className="text-gray-400 ml-1">({banner.sellerId})</span>
                            </span>
                          </div>
                          
                          {banner.createdAt && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{formatDate(banner.createdAt)}</span>
                            </div>
                          )}
                          
                          {banner.budget && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{banner.budget}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex flex-col items-start sm:items-end gap-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(banner.status)}`}>
                          {getStatusIcon(banner.status)}
                          {banner.status.charAt(0).toUpperCase() + banner.status.slice(1)}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          {["pending", "approved", "rejected"].map((statusOption) => (
                            <button
                              key={statusOption}
                              onClick={() => updateBannerStatus(banner._id, statusOption)}
                              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                statusOption === "approved"
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : statusOption === "rejected"
                                  ? "bg-red-600 hover:bg-red-700 text-white"
                                  : "bg-yellow-600 hover:bg-yellow-700 text-white"
                              } ${
                                banner.status === statusOption 
                                  ? "ring-2 ring-offset-2 ring-gray-400" 
                                  : ""
                              } disabled:opacity-50`}
                              disabled={loading}
                            >
                              {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                            </button>
                          ))}
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

      {/* Image Modal */}
      {isModalOpen && selectedBanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">{selectedBanner.title}</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={selectedBanner.image}
                alt={selectedBanner.title}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
              <div className="mt-4">
                <p className="text-gray-600">{selectedBanner.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBannerRequest;