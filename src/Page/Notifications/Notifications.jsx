import React, { useEffect, lazy, Suspense } from "react";
// Remove these imports since we're lazy loading them
// import Navbar from "../../Components/Navbar/Navbar";
// import DownNav from "../../Components/DownNav/DownNav";
import useUser from "../../Hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import usePublicAxios from "../../Hooks/usePublicAxios";
import toast from "react-hot-toast";
import { Link } from "react-router";

// Lazy load components
const Navbar = lazy(() => import("../../Components/Navbar/Navbar"));
const DownNav = lazy(() => import("../../Components/DownNav/DownNav"));

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="relative">
      <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
      <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
    </div>
  </div>
);

const Notifications = () => {
  const { user, isLoading: userLoading } = useUser();
  const axiosPublic = usePublicAxios();

  useEffect(() => {
    localStorage.removeItem("notify");
  }, []);

  const {
    isLoading,
    error,
    data = [],
    refetch,
  } = useQuery({
    queryKey: ["notifyData", user?.id],
    queryFn: async () => {
      if (!user) return []; // Ensure we return an empty array if user is not available
      try {
        const res = await axiosPublic.get(`/api/notifications/${user.id}`);
        return res.data.notifications || []; // Ensure we return an empty array if notifications are not found
      } catch (err) {
        console.error("Error fetching notification:", err);
        throw new Error("Failed to fetch notifications");
      }
    },
    enabled: !!user, // Ensure query only runs if user is available
    onError: (error) => {
      console.error("Error fetching notification:", error);
      toast.error("Failed to load notifications.");
    },
    onSuccess: (data) => {
      if (data.length === 0) {
        console.warn("No notifications found.");
      }
    },
  });

  if (isLoading || userLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div>
        <Navbar />
        <div className=" max-w-[550px] mx-auto mt-4 px-2 ">
          <h1 className=" text-lg font-semibold lg:text-3xl border-b-2 pb-2 lg:pb-4">
            Notifications
          </h1>
          <div>
            {data.length === 0 ? (
              <p>No notifications available</p>
            ) : (
              data
                .slice()
                .reverse()
                .map((notify, index) => (
                  <Link
                    to={
                      notify.type === "fndReq"
                        ? `/profile/${notify.senderId}`
                        : notify.type === "bookReq"
                        ? "/my-library/book-request"
                        : notify.type === "bookReqClO" // Check this condition before "bookReqCl"
                        ? `/library/${notify.senderId}/onindo`
                        : notify.type === "bookReqTns" // Check this condition before "bookReqCl"
                        ? `/my-onindo-library`
                        : notify.type === "bookReqCl" ||
                          notify.type === "bookReturn"
                        ? "/my-library"
                        : notify.type === "bookReqAc"
                        ? "/my-library/my-request"
                        : notify.type === "bookReqOnindo"
                        ? "/my-onindo-library/book-request"
                        : ""
                    }
                    key={index}
                    className="p-2 border-b mb-2 flex items-center gap-3"
                  >
                    <div className="avatar">
                      <div className="w-16 rounded-full">
                        <img src={notify.senderProfile} />
                      </div>
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg">
                        {notify.senderName}
                      </h2>
                      <p className=" text-sm">
                        {notify.senderName.split(" ")[0]}:{" "}
                        <span>{notify.notifyText}</span>
                      </p>
                      <p className=" text-[10px] lg:text-sm text-slate-400">
                        {new Date(notify.timestamp).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </Link>
                ))
            )}
          </div>
        </div>
        <div className="mt-12">
          <DownNav />
        </div>
      </div>
    </Suspense>
  );
};

export default Notifications;
