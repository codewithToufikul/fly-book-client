import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useUser from "../../../Hooks/useUser";
import usePublicAxios from "../../../Hooks/usePublicAxios";

const SellerProfileAccess = ({ children }) => {
  const { user, loading: userLoading } = useUser();
  const axiosPublic = usePublicAxios();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSeller = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const res = await axiosPublic.get(`/sellers/check/${user.id}`);
        if (res.data?.isSeller) {
          setSeller(res.data.seller);
        }
      } catch (error) {
        console.error("Error checking seller:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSeller();
  }, [user, axiosPublic]);

  if (userLoading || loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  // যদি seller পাওয়া যায় → redirect to SellerDashboard
  if (seller) {
    return <Navigate to="/seller-dashboard" replace />;
  }

  // otherwise → normal user এর জন্য children render হবে
  return children;
};

export default SellerProfileAccess;
