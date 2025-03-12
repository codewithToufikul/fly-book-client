import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const OrganizationDetails = () => {
    const { orgId } = useParams();
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrganization = async () => { 
            try {
                const response = await fetch(`https://api.flybook.com.bd/api/v1/organizations/${orgId}`);
                const result = await response.json();
                setOrganization(result.data);
            } catch (err) {
                setError("Failed to fetch organization");
            } finally {
                setLoading(false);
            }
        };
        fetchOrganization();
    }, [orgId]);    

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
                {/* Header Section */}
                <div className="border-b pb-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {organization.name}
                    </h1>
                    <p className="text-gray-600">
                        {organization.description}
                    </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Contact Information
                        </h2>
                        
                        <div className="flex items-center space-x-3">
                            <FaEnvelope className="text-gray-600" />
                            <span>{organization.email}</span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <FaPhone className="text-gray-600" />
                            <span>{organization.phone}</span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <FaMapMarkerAlt className="text-gray-600" />
                            <span>{organization.address}</span>
                        </div>
                    </div>

                    {/* Organization Details */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Organization Details
                        </h2>
                        
                        <div className="flex items-center space-x-3">
                            <FaBuilding className="text-gray-600" />
                            <span>Founded: {new Date(organization.founded_date).getFullYear()}</span>
                        </div>
                        
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <h3 className="font-medium mb-2">Industry</h3>
                            <div className="flex flex-wrap gap-2">
                                {organization.industry && (
                                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
                                        {organization.industry}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationDetails;