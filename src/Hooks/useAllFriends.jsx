import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router';

const useAllFriends = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const { data: allFriends = [], refetch, isLoading, isError, error } = useQuery({
    queryKey: ["allFriends"],
    queryFn: async () => {
      if (!token) {
        return [];
      }
      const res = await axios.get("https://fly-book-server-lzu4.onrender.com/all-friends", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    },
    onError: (err) => {
      // Handle error here
      console.error("Error fetching friends:", err);
    },
    retry: 1, // Reduced retry from 2 to 1 for faster failure
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  return { allFriends, refetch, isLoading, isError, error };
};

export default useAllFriends;
