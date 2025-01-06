import axios from "axios";

const axiosPublic = axios.create({
  baseURL: "https://fly-book-server.onrender.com", // Base URL for your API
});

// Add a request interceptor to include the token
axiosPublic.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Retrieve token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add token to headers
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const usePublicAxios = () => {
  return axiosPublic;
};

export default usePublicAxios;
