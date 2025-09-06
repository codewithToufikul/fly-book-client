import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const useCategories = () => {

  const { data: categories = [], refetch, isLoading, isError, error } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3000/home-category");
      return res.data.categories;
    },
    onError: (err) => {
      // Handle any errors that occur during the fetching process
      console.error("Error fetching categories:", err);
    },
    retry: 2, // retry 2 times in case of failure
  });

  return { categories, refetch, isLoading, isError, error };
};

export default useCategories;