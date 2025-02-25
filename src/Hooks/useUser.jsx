import { useQuery } from "@tanstack/react-query";

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
      throw new Error(errorData.error || "Failed to fetch user data.");
    }

    return response.json();
  } catch (error) {
    throw new Error(error.message || "Network Error");
  }
};

const useUser = () => {
  const queryResult = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    onSuccess: (data) => {
      console.log('User data fetched:', data);
    },
    onError: (error) => {
      console.error('Error fetching user data:', error);
    },
  });

  const { data: user, isLoading, isError, error, refetch } = queryResult;

  return {
    user: user || null, // Default to null if query fails or no data
    loading: isLoading,
    isError,
    error: error?.message,
    refetch,
  };
};

export default useUser;
