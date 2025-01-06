import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router';

const useAllBook = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
  
    const { data: allBooks = [], refetch, isLoading, isError, error } = useQuery({
      queryKey: ["allBooks"],
      queryFn: async () => {
        if (!token) {
          return [];
        }
        const res = await axios.get("https://fly-book-server.onrender.com/all-books", {
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
  
    return { allBooks, refetch, isLoading, isError, error };
};

export default useAllBook;