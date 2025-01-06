
import { Navigate } from "react-router";
import useUser from "../../Hooks/useUser";
import { jwtDecode } from "jwt-decode";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const { user,loading: isLoading } = useUser();
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
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
