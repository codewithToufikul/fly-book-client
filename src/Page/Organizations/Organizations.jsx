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
        const response = await fetch("https://api.flybook.com.bd/api/v1/organizations");
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

  return (
    <div>
      <Navbar />
      <div>
        <div className="hero">
          <div className="hero-content flex-col lg:flex-row-reverse">
            <img
              src={organization}
              className="max-w-lg rounded-lg animate-fade-in-scale"
            />
            <div>
              <h1 className=" text-3xl lg:text-5xl font-bold">Partner with Leading Organizations</h1>
              <p className="py-6 text-sm lg:text-base">
                Connect and collaborate with top-tier organizations to accelerate your growth. 
                Whether you're seeking partnerships, mentorship, or networking opportunities, 
                our platform brings together innovative organizations committed to fostering 
                success and driving meaningful impact.
              </p>
              <div className="form-control w-full max-w-md">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search organizations..." 
                    className="input input-bordered w-full pr-16" 
                  />
                  <button className="btn btn-primary absolute top-0 right-0 rounded-l-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-4 py-6 gap-4">
            <div className="text-xl md:text-2xl font-bold text-gray-700 underline text-center md:text-left">All Organizations</div>
            <Link to="/add-organization" className="btn btn-primary rounded-full w-full md:w-auto px-4 py-2 text-white font-bold hover:bg-primary-dark transition-all duration-300 flex items-center justify-center gap-2">
                <FaPlus className="text-sm" />
                <span>Add Your Organization</span>
            </Link>
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
