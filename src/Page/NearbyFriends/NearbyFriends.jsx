import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router";
import load from "../../assets/s.gif";
import useUser from "../../Hooks/useUser";
import { HiDotsHorizontal } from "react-icons/hi";
import { MdEditLocationAlt, MdAccessTime, MdPerson } from "react-icons/md";
import { FaBook, FaCalendarAlt } from "react-icons/fa";

const NearbyBooks = () => {
  const { user, loading: userLoading, refetch } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const [nearbyBooks, setNearbyBooks] = useState([]);

  // নিকটবর্তী বইগুলির ডেটা ফেচ করুন
  const fetchNearbyBooks = async (longitude, latitude) => {
    try {
      const response = await axios.get("https://fly-book-server-lzu4.onrender.com/books/nearby", {
        params: {
          longitude,
          latitude,
          maxDistance: 4000,
        },
      });
      setNearbyBooks(response.data.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch nearby books.");
      setLoading(false);
    }
  };

  // ইউজারের লোকেশন সংগ্রহ করুন
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          fetchNearbyBooks(longitude, latitude);
        },
        (error) => {
          toast.error("Please enable location access to see nearby books.");
          setLoading(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  }, []);

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
        "https://fly-book-server-lzu4.onrender.com/profile/updateDetails/location",
        updateDetails,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Check for successful response
      if (response.status === 200) {
        toast.success("Location updated successfully!");
        refetch();
        // Refetch nearby books with updated location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const { longitude, latitude } = position.coords;
            fetchNearbyBooks(longitude, latitude);
          });
        }
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
    }
  };

  if (userLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <img src={load} alt="Loading..." />
      </div>
    );
  }

  // Filter out books owned by current user
  const filteredBooks = nearbyBooks.filter((book) => book.userId !== user.id);
  console.log(nearbyBooks)
  return (
    <div>
      <Navbar />
      <div className="max-w-[650px] mx-auto">
        <div className="my-2 lg:my-3 py-3 lg:py-4 px-3 border-b-2 flex justify-between items-center">
          <h1 className="text-lg lg:text-2xl font-semibold">
            Nearby Books Available
          </h1>
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn p-0 px-2 m-0 bg-transparent shadow-none text-2xl"
            >
              <HiDotsHorizontal />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-60 p-2 shadow"
            >
              <li>
                <p
                  onClick={handleUpdateLocation}
                  className="flex items-center gap-1 bg-gray-50 mt-2 w-fit p-2 rounded-md text-sm lg:text-base cursor-pointer"
                >
                  <span className="text-xl lg:text-2xl text-rose-500">
                    <MdEditLocationAlt />
                  </span>
                  Update your location
                </p>
              </li>
            </ul>
          </div>
        </div>

        {error && (
          <div className="alert alert-error my-4">
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 px-3">
          {filteredBooks.length === 0 ? (
            <div className="text-center py-12">
              <FaBook className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-lg text-gray-500">No nearby books available</p>
              <p className="text-sm text-gray-400 mt-2">
                Try updating your location or check back later
              </p>
            </div>
          ) : (
            filteredBooks
              .slice()
              .reverse()
              .map((book, index) => (
                <div
                  key={book._id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  <div className="flex p-4">
                    {/* Book Image */}
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-20 h-24 lg:w-24 lg:h-28 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={book.imageUrl}
                          alt={book.bookName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "/api/placeholder/96/112";
                          }}
                        />
                      </div>
                    </div>

                    {/* Book Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg lg:text-xl font-bold text-gray-900 truncate">
                          {book.bookName}
                        </h3>
                      </div>

                      <p className="text-sm lg:text-base text-gray-600 mb-2">
                        লেখক: {book.writer}
                      </p>

                      <div className="space-y-1 mb-3">
                        <div className="flex items-center text-xs lg:text-sm text-gray-500">
                          <MdPerson className="mr-1" />
                          <span>মালিক: {book.owner}</span>
                        </div>

                        <div className="flex items-center text-xs lg:text-sm text-gray-500">
                          <FaCalendarAlt className="mr-1" />
                          <span>পোস্ট: {book.currentDate}</span>
                        </div>

                        <div className="flex items-center text-xs lg:text-sm text-gray-500">
                          <MdAccessTime className="mr-1" />
                          <span>ফেরত: {book.returnTime}</span>
                        </div>
                      </div>

                      {/* Book Description */}
                      {book.details && (
                        <p className="text-xs lg:text-sm text-gray-600 mb-3 line-clamp-2">
                          {book.details.length > 100
                            ? `${book.details.substring(0, 100)}...`
                            : book.details}
                        </p>
                      )}

                      {/* Action Button */}
                      <div className="flex justify-end">
                        <Link
                          to={`/library/${book.userId}`}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                        >
                          <FaBook className="mr-2 text-xs" />
                          View in Library
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
      <div className="mt-12">
        <DownNav />
      </div>
    </div>
  );
};

export default NearbyBooks;