import { useEffect, useState } from "react";
import DownNav from "../../Components/DownNav/DownNav";
import Navbar from "../../Components/Navbar/Navbar";
import { Link } from "react-router";

const OrgEvents = () => {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const response = await fetch("https://api.flybook.com.bd/organizations/activities");
                const result = await response.json();

                if (result.success) {
                    setOrganizations(result.data);
                } else {
                    setError(result.message);
                }
            } catch (err) {
                setError("Failed to fetch organizations");
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizations();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    const activities = organizations[0]?.activities || [];
    const events = activities.filter(activity => activity.event === true);

    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4">
                <h1 className="text-xl lg:text-3xl font-bold mb-4">Organizations Events</h1>
                {
                    events.length === 0 ? (
                        <div className="text-center text-lg text-gray-600">No events available</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {
                                events.slice().reverse().map((event, index) => (
                                    <div key={index} className="">
                                        <div className="bg-white p-4 rounded shadow-md">
                                            <h2 className="text-lg font-bold">{event.title}</h2>
                                            <p className="text-gray-700">{event.details.slice(0, 100)}...</p>
                                            <img src={event.image} alt={event.title} className="w-full h-48 object-cover rounded my-4" />
                                            <p className="text-gray-700">{new Date(event.date).toLocaleString()}</p>
                                            <div className="mt-4">
                                                <Link to={`/activity-details/${event._id}`}>
                                                    <button className="bg-primary text-white px-4 py-2 rounded">View Details</button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
            </div>
            <div className=" mt-12">
                <DownNav />
            </div>
        </div>
    );
};

export default OrgEvents;
