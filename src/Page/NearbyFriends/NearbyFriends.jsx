import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router";
import load from "../../assets/s.gif";
import useUser from "../../Hooks/useUser";
import { HiDotsHorizontal } from "react-icons/hi";
import { MdEditLocationAlt } from "react-icons/md";

const NearbyFriends = () => {
  const { user, loading: userLoading, refetch } = useUser();
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  // নিকটবর্তী ইউজারদের ডেটা ফেচ করুন
  const fetchNearbyUsers = async (longitude, latitude) => {
    try {
      const response = await axios.get("https://api.flybook.com.bd/users/nearby", {
        params: {
          longitude,
          latitude,
          maxDistance: 4000,
        },
      });
      setNearbyUsers(response.data.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch nearby users.");
      setLoading(false);
    }
  };

  // ইউজারের লোকেশন সংগ্রহ করুন
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          fetchNearbyUsers(longitude, latitude);
        },
        (error) => {
          toast.error("Please enable location access to see nearby friends.");
          setLoading(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  }, []);

  if (userLoading || loading) {
    return (
      <div className=" flex h-screen items-center justify-center">
        <img src={load} alt="" />
      </div>
    );
  }
  const nearUser = nearbyUsers.filter((u) => u._id !== user.id);


  const handleUpdateLocation = async () => {
    try {
      // Wrap geolocation in a Promise to use try/catch
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      const updateDetails = { userLocation: { latitude, longitude } };

      // Send to server
      const response = await axios.put(
        "https://api.flybook.com.bd/profile/updateDetails/location",
        updateDetails,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Check for successful response
      if (response.status === 200) {
        toast.success("Location updated successfully!");
        refetch();
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      // Handle all possible errors
      let errorMessage;
      if (error instanceof GeolocationPositionError) {
        errorMessage = "Enable location services to update.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = "Something went wrong. Try again!";
      }
      toast.error(errorMessage);
    } finally {
    }
  };
  return (
    <div>
      <Navbar></Navbar>
      <div className=" max-w-[650px] mx-auto ">
        <div className=" my-2 lg:my-3 py-3 lg:py-4 px-3 border-b-2 flex justify-between items-center ">
          <h1 className=" text-lg lg:text-2xl font-semibold">
            Your Nearby Friends
          </h1>
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn p-0 px-2  m-0 bg-transparent  shadow-none text-2xl"
            >
              <HiDotsHorizontal />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-60 p-2 shadow"
            >
              <li>
                <p onClick={handleUpdateLocation}
                  className=" flex items-center gap-1 bg-gray-50 mt-2 w-fit p-2 rounded-md text-sm lg:text-base cursor-pointer"
                >
                  <span className=" text-xl lg:text-2xl text-rose-500 ">
                    <MdEditLocationAlt />
                  </span>{" "}
                  Update your location
                </p>
              </li>
            </ul>
          </div>
        </div>

        {loading ? (
          <div className=" flex justify-center">
            <img src={load} alt="" />
          </div>
        ) : (
          <div className=" space-y-2">
            {nearUser.length === 0 ? (
              <p>No nearby friends available</p>
            ) : (
              nearUser
                .slice()
                .reverse()
                .map((user, index) => (
                  <div className=" flex items-center justify-between border-b bg-gray-50 rounded-lg px-3 lg:pt-2">
                    <div
                      key={index}
                      className="p-2  lg:mb-2 flex items-center gap-3"
                    >
                      <div className="avatar">
                        <div className="w-16 rounded-full">
                          <img src={user.profileImage} />
                        </div>
                      </div>
                      <div>
                        <h2 className="font-semibold text-lg">{user.name}</h2>
                      </div>
                    </div>
                    <Link
                      to={`/profile/${user._id}`}
                      className=" p-0 px-3 bg-green-100 btn text-base lg:text-lg font-medium text-gray-500"
                    >
                      View
                    </Link>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
      <div className="mt-12">
        <DownNav />
      </div>
    </div>
  );
};

export default NearbyFriends;
