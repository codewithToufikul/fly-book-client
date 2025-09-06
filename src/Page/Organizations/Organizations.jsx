import React, { useState, useEffect } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import organization from "../../assets/patnr.svg"
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router";

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/v1/organizations/aprooved");
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
  const partnarOrg = organizations.filter(org => org.orgType === "partner organization");
  return (
    <div>
      <Navbar />
      <div>
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-4 py-6 gap-4">
          <div className="text-xl md:text-2xl font-bold text-gray-700 underline text-center md:text-left">All Partnar Organizations</div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <Link to="/organizations-events" className="btn btn-accent rounded-full w-full md:w-auto px-4 py-2 text-white font-bold hover:bg-secondary-dark transition-all duration-300 flex items-center justify-center gap-2">
              <span>Events</span>
            </Link>
            <Link to="/my-organizations" className="btn btn-secondary rounded-full w-full md:w-auto px-4 py-2 text-white font-bold hover:bg-secondary-dark transition-all duration-300 flex items-center justify-center gap-2">
              <span>My Organizations</span>
            </Link>
            <Link to="/social-organizations" className="btn btn-info rounded-full w-full md:w-auto px-4 py-2 text-white font-bold hover:bg-secondary-dark transition-all duration-300 flex items-center justify-center gap-2">
              <span>Social Organizations</span>
            </Link>
            <Link to="/add-organization" className="btn btn-primary rounded-full w-full md:w-auto px-4 py-2 text-white font-bold hover:bg-primary-dark transition-all duration-300 flex items-center justify-center gap-2">
              <FaPlus className="text-sm" />
              <span>Add Your Organization</span>
            </Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-8 text-error">
              {error}
            </div>
          ) : partnarOrg.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No organizations found
            </div>
          ) : (
            partnarOrg.slice().reverse().map((org) => (
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
      <style>
        {`
          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: scale(0.95);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-fade-in-scale {
            animation: fadeInScale 1s ease-out forwards;
            transition: transform 0.3s ease;
          }

          .animate-fade-in-scale:hover {
            transform: scale(1.02);
          }
        `}
      </style>
    </div>
  );
};

export default Organizations;
