import { Navigate } from "react-router";
import useUser from "../../Hooks/useUser";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect, Suspense } from "react";

const PrivateRoute = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const [token, setToken] = useState(null);
  const { user, loading: isLoading } = useUser();

  // Safely get token from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      setToken(null);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  const userNumber = user?.number;
  const isTokenValid = (token, userNumber) => {
    if (!token) return false;
    try {
      const decodedToken = jwtDecode(token); 
      const { exp, number } = decodedToken; 
      const currentTime = Math.floor(Date.now() / 1000);

      return exp > currentTime && number === userNumber;
    } catch (error) {
      return false;
    }
  };

  if (!token || !isTokenValid(token, userNumber)) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">
              Please login first to access this page.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Login
              </button>
            </div>
          </div>
        </div>
        <div className="fixed inset-0 backdrop-blur-sm z-30"></div>
      </>
    );
  }

  // Wrap children in Suspense to handle lazy loading properly
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
            <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
};

export default PrivateRoute;
