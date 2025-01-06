import { useQuery } from "@tanstack/react-query";

const fetchUserProfile = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null; // Return null if no token is found
  }

  const response = await fetch("https://fly-book-server.onrender.com/profile", {
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
};

const useUser = () => {
  const queryResult = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    retry: false, // Disable retries
    enabled: !!localStorage.getItem("token"), // Run only if token exists
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
