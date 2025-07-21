import { useEffect, useState } from "react";
import DownNav from "../../Components/DownNav/DownNav";
import Navbar from "../../Components/Navbar/Navbar";
import { Link, useParams } from "react-router";

const OrgActivies = () => {
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
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                    Error: {error}
                </div>
            </div>
        );
    }
    console.log(organization.activities)
    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4">
                <h1 className="text-xl lg:text-3xl font-bold mb-4">{organization.orgName} <span className="text-primary">Activities</span></h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
                    {organization?.activities?.map((activity) => (
                        <div key={activity.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                            <h2 className="text-2xl font-bold mb-4">{activity.title}</h2>
                            <p className="text-gray-700 mb-4">{activity.details.slice(0, 100)}...</p>
                            <img src={activity.image} alt={activity.title} className="w-full h-48 object-cover mb-4" />
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">{activity.date}</span>
                                <Link to={`/activity-details/${activity._id}`} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-12">
                <DownNav />
            </div>
        </div>
    );
};

export default OrgActivies;