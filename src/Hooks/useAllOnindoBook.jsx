import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { useNavigate } from "react-router";

const useAllOnindoBook = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const {
    data: allOnindoBooks = [],
    refetch,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["allOnindoBooks"],
    queryFn: async () => {
      if (!token) {
        return [];
      }
      const res = await axios.get("https://api.flybook.com.bd/all-onindo-books", {
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

  return { allOnindoBooks, refetch, isLoading, isError, error };
};

export default useAllOnindoBook;
