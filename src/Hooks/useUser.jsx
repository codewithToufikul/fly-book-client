import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const fetchUserProfile = async () => {
  const token = localStorage.getItem("token");

  // ✅ Token na thakle, null return korbo — kono exception throw na
  if (!token) return null;

  const response = await fetch("https://fly-book-server-lzu4.onrender.com/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  // ✅ Invalid token, expired token er jonno 401 error
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(data.error || "Invalid or expired token.");
    }
    throw new Error(data.error || "Failed to fetch user data.");
  }

  return data;
};

const useUser = () => {
  const navigate = useNavigate();

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
    status,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    retry: false,
  });

  useEffect(() => {
    // ✅ Only redirect if token exists but is invalid/expired
    const token = localStorage.getItem("token");
    if (
      token &&
      status === "error" &&
      error?.message === "Invalid or expired token."
    ) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [status, error, navigate]);

  return {
    user: user || null,          // Token na thakle null
    loading: isLoading,
    isError,
    error: error?.message || null,
    refetch,
  };
};

export default useUser;
