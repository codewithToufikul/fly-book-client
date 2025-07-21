import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const fetchUserProfile = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null; // No token found, return null
  }

  try {
    const response = await fetch("https://api.flybook.com.bd/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) {
        throw new Error(errorData.error || "Invalid or expired token.");
      }
      throw new Error(errorData.error || "Failed to fetch user data.");
    }

    return response.json();
  } catch (error) {
    throw new Error(error.message || "Network Error");
  }
};

const useUser = () => {
  const navigate = useNavigate(); // hook for navigation

  const queryResult = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    onSuccess: (data) => {
      console.log('User data fetched:', data);
    },
    onError: (error) => {
      console.error('Error fetching user data:', error);
      if (error.message === "Invalid or expired token.") {
        // Redirect to login page on JWT error
        navigate("/login");
      }
    },
    // Optionally, set a staleTime to avoid repeated fetching
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
  });

  const { data: user, isLoading, isError, error, refetch } = queryResult;

  // If there's an error or loading, return the relevant state
  if (isError && error.message === "Invalid or expired token.") {
    // In case of expired token, handle the redirect to login page
    return {
      user: null,
      loading: false, // Stop loading state
      isError: true,
      error: error?.message,
      refetch,
    };
  }

  return {
    user: user || null, // Default to null if query fails or no data
    loading: isLoading,
    isError,
    error: error?.message,
    refetch,
  };
};

export default useUser;
