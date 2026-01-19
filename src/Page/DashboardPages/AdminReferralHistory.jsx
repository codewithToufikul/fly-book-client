import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import usePublicAxios from "../../Hooks/usePublicAxios";
import { toast } from "react-hot-toast";
import { FaSearch, FaUsers, FaUserPlus, FaTrophy, FaClock } from "react-icons/fa";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";

const AdminReferralHistory = () => {
    const axiosPublic = usePublicAxios();
    const [loading, setLoading] = useState(true);
    const [referralData, setReferralData] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedUsers, setExpandedUsers] = useState({});

    useEffect(() => {
        fetchReferralHistory();
    }, [currentPage, searchTerm]);

    const fetchReferralHistory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axiosPublic.get("/admin/referrals/history", {
                params: {
                    page: currentPage,
                    limit: 50,
                    search: searchTerm
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setReferralData(response.data.data);
                setStatistics(response.data.statistics);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error("Error fetching referral history:", error);
            toast.error("Failed to load referral history");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchReferralHistory();
    };

    const toggleExpand = (userId) => {
        setExpandedUsers(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    if (loading && !referralData.length) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                    Referral History
                </h1>
                <p className="text-gray-600">
                    Complete overview of all user referrals and statistics
                </p>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                                <h3 className="text-3xl font-bold mt-2">{statistics.totalUsers}</h3>
                            </div>
                            <FaUsers className="text-5xl text-blue-200 opacity-50" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Users with Referrer</p>
                                <h3 className="text-3xl font-bold mt-2">{statistics.usersWithReferrer}</h3>
                            </div>
                            <FaUserPlus className="text-5xl text-green-200 opacity-50" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Referral Rate</p>
                                <h3 className="text-3xl font-bold mt-2">{statistics.referralPercentage}%</h3>
                            </div>
                            <FaTrophy className="text-5xl text-purple-200 opacity-50" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium">Top Referrer</p>
                                <h3 className="text-xl font-bold mt-2">
                                    {statistics.topReferrers[0]?.name || "N/A"}
                                </h3>
                                <p className="text-sm text-orange-100">
                                    {statistics.topReferrers[0]?.referralCount || 0} referrals
                                </p>
                            </div>
                            <FaClock className="text-5xl text-orange-200 opacity-50" />
                        </div>
                    </div>
                </div>
            )}

            {/* Top Referrers & Recent Referrals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Top Referrers */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaTrophy className="text-yellow-500" />
                        Top Referrers
                    </h2>
                    <div className="space-y-3">
                        {statistics?.topReferrers.slice(0, 5).map((user, index) => (
                            <div key={user._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {index + 1}
                                </div>
                                <img
                                    src={user.profileImage || "https://i.ibb.co/mcL9L2t/f10ff70a7155e5ab666bcdd1b45b726d.jpg"}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <Link to={`/profile/${user._id}`} className="font-semibold text-gray-800 hover:text-blue-600">
                                        {user.name}
                                    </Link>
                                    <p className="text-sm text-gray-500">@{user.userName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-blue-600">{user.referralCount}</p>
                                    <p className="text-xs text-gray-500">referrals</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Referrals */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaClock className="text-green-500" />
                        Recent Referrals
                    </h2>
                    <div className="space-y-3">
                        {statistics?.recentReferrals.slice(0, 5).map((referral) => (
                            <div key={referral._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <img
                                    src={referral.profileImage || "https://i.ibb.co/mcL9L2t/f10ff70a7155e5ab666bcdd1b45b726d.jpg"}
                                    alt={referral.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <Link to={`/profile/${referral._id}`} className="font-semibold text-gray-800 hover:text-blue-600">
                                        {referral.name}
                                    </Link>
                                    <p className="text-sm text-gray-500">
                                        Referred by{" "}
                                        <Link to={`/profile/${referral.referrerId}`} className="text-blue-600 hover:underline">
                                            @{referral.referrerDetails?.userName}
                                        </Link>
                                    </p>
                                </div>
                                <p className="text-xs text-gray-400">
                                    {new Date(referral.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, username, or email..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Referred By</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Referrals Made</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Joined</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {referralData.map((user) => (
                                <React.Fragment key={user._id}>
                                    <tr className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.profileImage || "https://i.ibb.co/mcL9L2t/f10ff70a7155e5ab666bcdd1b45b726d.jpg"}
                                                    alt={user.name}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                                <div>
                                                    <Link to={`/profile/${user._id}`} className="font-semibold text-gray-800 hover:text-blue-600">
                                                        {user.name}
                                                    </Link>
                                                    <p className="text-sm text-gray-500">@{user.userName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.hasReferrer && user.referrerDetails ? (
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={user.referrerDetails.profileImage || "https://i.ibb.co/mcL9L2t/f10ff70a7155e5ab666bcdd1b45b726d.jpg"}
                                                        alt={user.referrerDetails.name}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                    <Link to={`/profile/${user.referrerId}`} className="text-blue-600 hover:underline">
                                                        @{user.referrerDetails.userName}
                                                    </Link>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">No referrer</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${user.referralCount > 0
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-500"
                                                }`}>
                                                {user.referralCount || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-600">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {user.referralCount > 0 && (
                                                <button
                                                    onClick={() => toggleExpand(user._id)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 mx-auto"
                                                >
                                                    {expandedUsers[user._id] ? (
                                                        <>
                                                            <HiChevronUp /> Hide
                                                        </>
                                                    ) : (
                                                        <>
                                                            <HiChevronDown /> View
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>

                                    {/* Expanded Row - Referred Users */}
                                    {expandedUsers[user._id] && user.referredUsers.length > 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 bg-blue-50">
                                                <div className="ml-16">
                                                    <h4 className="font-semibold text-gray-700 mb-3">
                                                        Users Referred by {user.name} ({user.referralCount})
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {user.referredUsers.map((referred) => (
                                                            <div key={referred._id} className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
                                                                <img
                                                                    src={referred.profileImage || "https://i.ibb.co/mcL9L2t/f10ff70a7155e5ab666bcdd1b45b726d.jpg"}
                                                                    alt={referred.name}
                                                                    className="w-10 h-10 rounded-full object-cover"
                                                                />
                                                                <div className="flex-1">
                                                                    <Link to={`/profile/${referred._id}`} className="font-medium text-gray-800 hover:text-blue-600 text-sm">
                                                                        {referred.name}
                                                                    </Link>
                                                                    <p className="text-xs text-gray-500">@{referred.userName}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {user.referralCount > 10 && (
                                                        <p className="text-sm text-gray-500 mt-3">
                                                            Showing 10 of {user.referralCount} referrals
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{" "}
                            {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)} of{" "}
                            {pagination.totalUsers} users
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={pagination.currentPage === 1}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                                {pagination.currentPage}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReferralHistory;
