import { useQuery } from '@tanstack/react-query';
import { Link } from "react-router";

const AdminManageOrg = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await fetch('https://api.flybook.com.bd/api/v1/organizations');
      const data = await response.json();
      return data;
    },
  });

  const handleUpdateStatus = async (orgId) => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      console.error("No token found. Access denied.");
      return;
    }
  
    try {
      const response = await fetch(
        `https://api.flybook.com.bd/api/v1/organizations/${orgId}/approve`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to update organization status.");
      }
  
      console.log("Organization approved successfully:", data);
      // Handle success (e.g., update UI, show notification, etc.)
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
                  onClick={()=>handleUpdateStatus(org._id)}
                    className={`btn w-full ${org.status != "pending" ? 'btn-disabled' : 'btn-primary'}`}
                  >
                    {org.status != "pending" ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : 'Approve'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
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

export default AdminManageOrg;

