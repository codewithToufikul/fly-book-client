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
      const res = await axios.get("http://localhost:3000/peoples", {
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
    retry: 2, // retry 2 times in case of failure
  });

  return { peoples, refetch, isLoading, isError, error };
};

export default usePeople;
