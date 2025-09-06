import React, { useEffect, useState } from 'react'

function AdminEManage() {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const response = await fetch("http://localhost:3000/organizations/activities");
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
    console.log(organizations);
    const events = activities.filter(activity => activity.event === true);
    return (
        <div>
            AdminEManage
        </div>
    )
}

export default AdminEManage