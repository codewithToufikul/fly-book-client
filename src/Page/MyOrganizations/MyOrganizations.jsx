import React, { useState, useEffect } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import DownNav from '../../Components/DownNav/DownNav';
import { Link } from 'react-router';
import useUser from '../../Hooks/useUser';
import { FaBuilding, FaCalendarAlt, FaUsers } from 'react-icons/fa';

const MyOrganizations = () => {
    const { user } = useUser();
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const response = await fetch(`https://fly-book-server-lzu4.onrender.com/api/v1/organizations/user/${user?.id}`);
                const result = await response.json();
                if (result.success) {
                    setOrganizations(result.data);
                }
            } catch (error) {
                console.error('Error fetching organizations:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchOrganizations();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Organizations</h1>
                    <Link
                        to="/add-organization"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Add Organization
                    </Link>
                </div>

                {organizations.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <FaBuilding className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No organizations</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new organization.</p>
                        <div className="mt-6">
                            <Link
                                to="/add-organization"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Create Organization
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {organizations.map((org) => (
                            <Link
                                key={org._id}
                                to={`/my-organization/${org._id}`}
                                className="block hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="bg-white rounded-lg shadow overflow-hidden">
                                    <div className="h-48 w-full overflow-hidden">
                                        <img
                                            src={org.profileImage}
                                            alt={org.orgName}
                                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-200"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{org.orgName}</h3>
                                        <p className="text-gray-500 text-sm mb-4">
                                            {org.description?.slice(0, 100)}...
                                        </p>
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <FaUsers className="mr-2" />
                                                <span>23 Members</span>
                                            </div>
                                            <div className="flex items-center">
                                                <FaCalendarAlt className="mr-2" />
                                                <span>{new Date(org.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <div className="mt-12">
                <DownNav />
            </div>
        </div>
    );
};

export default MyOrganizations;