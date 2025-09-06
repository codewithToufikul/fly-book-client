import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";

const useAllPdfBook = () => {

  const {
    data: pdfBooks = [],
    refetch,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["pdfBooks"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3000/pdf-books", {
      });
      return res.data;
    },
    onError: (err) => {
      // Handle error here
      console.error("Error fetching pdf:", err);
    },
    retry: 2, // retry the query twice in case of failure
  });

  return { pdfBooks, refetch, isLoading, isError, error };
};

export default useAllPdfBook;
