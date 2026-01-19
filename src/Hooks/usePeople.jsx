import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const usePeople = () => {
  const token = localStorage.getItem("token");

  const { data: peoples = [], refetch, isLoading, isError, error } = useQuery({
    queryKey: ["peoples"],
    queryFn: async () => {
      if (!token) {
        return [];
      }
      const res = await axios.get("https://fly-book-server-lzu4.onrender.com/peoples", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    },
    onError: (err) => {
      // Handle any errors that occur during the fetching process
      console.error("Error fetching peoples:", err);
    },
    retry: 1, // Reduced retry from 2 to 1 for faster failure
    staleTime: 0, // Always fetch fresh data
    cacheTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: true, // Refetch when window is focused
  });

  return { peoples, refetch, isLoading, isError, error };
};

export default usePeople;
