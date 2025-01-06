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
      const res = await axios.get("https://fly-book-server.onrender.com/all-friends", {
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
    retry: 2, // retry the query twice in case of failure
  });

  return { allFriends, refetch, isLoading, isError, error };
};

export default useAllFriends;
