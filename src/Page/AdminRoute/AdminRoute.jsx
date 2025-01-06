import React, { useEffect } from "react";
import useUser from "../../Hooks/useUser";
import { useNavigate } from "react-router";

const AdminRoute = ({ children }) => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if loading is complete and user role is not admin
    if (!loading && user?.role !== "admin") {
      navigate("/"); // Redirect to home page
    }
  }, [loading, user, navigate]);

  if (loading) {
    // Show a loading spinner while user data is being fetched
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  // If user is admin, render the children
  if (user?.role === "admin") {
    return children;
  }

  // Return null to prevent rendering if user is redirected
  return null;
};

export default AdminRoute;
