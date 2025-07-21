import { useEffect, useState } from "react";
import DownNav from "../../Components/DownNav/DownNav";
import Navbar from "../../Components/Navbar/Navbar";
import { Link } from "react-router";

const SocialOrganizations = () => {
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSocialOrganizations = async () => {
      try {
        const response = await fetch("https://api.flybook.com.bd/social-organization");
        const result = await response.json();
        if (result.success) {
          setOrganizations(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Failed to fetch social organizations");
      } finally {
        setLoading(false);
      }
    };

    fetchSocialOrganizations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  console.log(organizations)
  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 ">
        <h1 className="text-2xl font-bold text-gray-700 underline text-center md:text-left">All Social Organizations</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-8 text-error">
              {error}
            </div>
          ) : organizations.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No organizations found
            </div>
          ) : (
            organizations.map((org) => (
              <div key={org._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                <figure className="px-4 pt-4">
                  <img
                    src={org.profileImage || "https://placeholder.com/300x200"}
                    alt={org.orgName}
                    className="rounded-xl h-48 w-full object-cover"
                  />
                </figure>
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={org.postByProfile || "https://placeholder.com/40x40"}
                      alt={org.postByName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium">{org.postByName}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(org.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <h2 className="card-title">{org.orgName}</h2>
                  <p className="text-sm text-gray-600">{org.description.slice(0, 100)}...</p>
                  <div className="card-actions justify-end mt-4">
                    <Link to={`/organization/${org._id}`} className="btn btn-primary">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className=" mt-12">
        <DownNav />
      </div>
    </div>
  );
};

export default SocialOrganizations;
