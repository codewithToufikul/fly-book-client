import React, { useState } from "react";
import usePublicAxios from "../../Hooks/usePublicAxios";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { Search, Coins, ArrowRightLeft, Calendar, Clock, User, ArrowUpDown, Filter } from "lucide-react";

const AllCoinTransfers = () => {
    const axiosPublic = usePublicAxios();
    const [searchTerm, setSearchTerm] = useState("");

    const { data: transfers = [], isLoading, isError } = useQuery({
        queryKey: ["allCoinTransfers"],
        queryFn: async () => {
            const res = await axiosPublic.get("/api/admin/all-coin-transfers");
            return res.data.data;
        }
    });

    const filteredTransfers = transfers.filter(tx =>
        tx.senderUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.receiverUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.senderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.receiverName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                </div>
                <p className="text-gray-500 font-bold animate-pulse">Loading all transactions...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-gray-900 flex items-center gap-3">
                            <TbArrowsTransferUpDown className="w-8 h-8 text-indigo-600" />
                            Transfer Master Ledger
                        </h1>
                        <p className="text-gray-500 font-medium mt-1">Monitor all peer-to-peer wallet activities</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                        <div className="px-4 py-2 bg-indigo-50 rounded-xl">
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">Total Volume</p>
                            <div className="flex items-center gap-1.5">
                                <Coins className="w-4 h-4 text-indigo-600" />
                                <span className="text-lg font-black text-gray-900">
                                    {transfers.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-emerald-50 rounded-xl">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Tx Count</p>
                            <div className="flex items-center gap-1.5">
                                <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                                <span className="text-lg font-black text-gray-900">{transfers.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="relative group max-w-2xl">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by username or name..."
                        className="block w-full pl-11 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-900 font-semibold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Transaction Info</th>
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Flow</th>
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Sender Account</th>
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Receiver Account</th>
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTransfers.length > 0 ? (
                                filteredTransfers.map((tx) => (
                                    <tr key={tx._id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-gray-900 font-black text-sm">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    {tx.date || new Date(tx.timestamp).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {tx.time || new Date(tx.timestamp).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center">
                                                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                    <ArrowRightLeft className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Link to={`/profile/${tx.senderId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 overflow-hidden border border-gray-100">
                                                    <User className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 leading-none mb-1">{tx.senderName}</p>
                                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">@{tx.senderUsername}</p>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Link to={`/profile/${tx.receiverId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 overflow-hidden border border-gray-100">
                                                    <User className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 leading-none mb-1">{tx.receiverName}</p>
                                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">@{tx.receiverUsername}</p>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="inline-flex flex-col items-end">
                                                <div className="flex items-center gap-1.5 text-lg font-black text-gray-900">
                                                    <Coins className="w-4 h-4 text-amber-500" />
                                                    {tx.amount?.toLocaleString()}
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-400 italic">≈ ৳{(tx.amount / 100).toFixed(2)}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                                            <ArrowUpDown className="w-10 h-10 text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900">No transfers found</h3>
                                        <p className="text-gray-500 text-sm mt-1">Try adjusting your search terms</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8 p-6 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-200 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
                            <Filter className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black">Audit Insight</h3>
                            <p className="text-white/80 font-medium">Verify peer-to-peer flows and identify suspicious patterns.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Import needed for icon consistency in AdminDashBoard
import { TbArrowsTransferUpDown } from "react-icons/tb";

export default AllCoinTransfers;
