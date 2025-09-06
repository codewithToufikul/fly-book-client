import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from "react-router";

const AdminManageOrg = () => {
  const [selectedOrgType, setSelectedOrgType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orgIdToUpdate, setOrgIdToUpdate] = useState(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/v1/organizations');
      const data = await response.json();
      return data;
    },
  });

  const handleUpdateStatus = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found. Access denied.");
      return;
    }

    if (!selectedOrgType) {
      console.error("No organization type selected.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/organizations/${orgIdToUpdate}/approve`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orgType: selectedOrgType, // Sending the selected type
          }),
        }
      );

      const data = await response.json();
      refetch()
      if (!response.ok) {
        throw new Error(data.message || "Failed to update organization status.");
      }

      console.log("Organization approved successfully:", data);
      // Handle success (e.g., update UI, show notification, etc.)
      setIsModalOpen(false); // Close modal on success
    } catch (error) {
      console.error("Error updating organization status:", error.message);
      // Handle error (e.g., show error message)
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-8 text-error">
            {error.message}
          </div>
        ) : data.data.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No Pending organizations found
          </div>
        ) : (
          data.data.map((org) => (
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
                    <Link to={`/profile/${org.postBy}`} className="font-medium">{org.postByName}</Link>
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
                <div className="card-actions mt-4">
                  <button
                    onClick={() => {
                      setOrgIdToUpdate(org._id);
                      setIsModalOpen(true); // Open modal on button click
                    }}
                    className={`btn w-full ${org.status !== "pending" ? 'btn-disabled' : 'btn-primary'}`}
                  >
                    {org.status !== "pending" ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : 'Approve'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="text-lg font-semibold">Select Organization Type</h2>
            <div className="mt-4">
              <select
                className="select select-bordered w-full"
                onChange={(e) => setSelectedOrgType(e.target.value)}
                value={selectedOrgType}
              >
                <option value="">Select an option</option>
                <option value="partner organization">Partner Organization</option>
                <option value="social organization">Social Organization</option>
              </select>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={handleUpdateStatus}>Approve</button>
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

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

export default AdminManageOrg;
