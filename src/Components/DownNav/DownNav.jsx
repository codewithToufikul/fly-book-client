import React, { useEffect, useState } from "react";
import { FaPlusCircle, FaRegComment } from "react-icons/fa";
import { HiHome, HiUserAdd } from "react-icons/hi";
import { IoNotificationsSharp } from "react-icons/io5";
import { NavLink, useNavigate } from "react-router";
import usePublicAxios from "../../Hooks/usePublicAxios";
import useUser from "../../Hooks/useUser";
import toast from "react-hot-toast";
import { MdPersonPinCircle } from "react-icons/md";
import imageCompression from 'browser-image-compression';
import { io } from "socket.io-client";

const DownNav = () => {
  const { user } = useUser();
const [isOpen, setIsOpen] = useState(false);
const axiosPublic = usePublicAxios();
const [image, setImage] = useState(null);
const [opinion, setOpinion] = useState("");
const [imageUrl, setImageUrl] = useState("");
const [postLoading, setPostLoading] = useState(false);
const navigate = useNavigate();
const token = localStorage.getItem("token");
const IMG_BB_API_KEY = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const [socket, setSocket] = useState(null);
const [notification, setNotification] = useState([])

const toggleDropdown = () => {
  setIsOpen(!isOpen);
};

useEffect(() => {
  const notify = JSON.parse(localStorage.getItem("notify")) || [];
  setNotification(notify);
}, []);

useEffect(() => {
  const newSocket = io("https://fly-book-server.onrender.com", {
    transports: ["websocket"],
    withCredentials: true,
  });
  setSocket(newSocket);
  newSocket.on("connect", () => {
    newSocket.emit("joinUser", user.id);
  });
  newSocket.on("receiveNotify", (data) => {
    console.log("New Notification:", data);
    setNotification((prevNotifications) =>
      Array.isArray(prevNotifications) ? [...prevNotifications, data] : [data]
    );
    const existingNotifications = JSON.parse(localStorage.getItem("notify")) || [];
    const updatedNotifications = [...existingNotifications, data];
    localStorage.setItem("notify", JSON.stringify(updatedNotifications));
  });

  return () => newSocket.disconnect(); // ক্লিনআপ
}, []);
const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    const options = {
      maxSizeMB: 0.035, // 35 KB max size
      maxWidthOrHeight: 800, // Optional: Set max width or height
      useWebWorker: true, // Optional: Use web worker for compression
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setImage(compressedFile);
    } catch (error) {
      console.error("Image compression failed:", error);
    }
  }
};

const handleOpinionChange = (event) => {
  setOpinion(event.target.value);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  setPostLoading(true);
  let uploadedImageUrl = "";

  // First, upload the image to ImgBB
  if (image) {
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      if (result.success) {
        uploadedImageUrl = result.data.url;
      } else {
        toast.error("Image upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }

  setImageUrl(uploadedImageUrl);
  setPostLoading(false);
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();
  const postData = {
    userId: user._id,
    image: uploadedImageUrl,
    description: opinion,
    date: currentDate,
    time: currentTime,
  };
  try {
    await axiosPublic.post(
      "/opinion/post",
      { postData },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success('Opinion Posted!');
    setIsOpen(false);
    setOpinion("");
    setImage(null);
    navigate('/public-opinion');
  } catch (error) {
    console.log(error);
  }
};
  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-200 shadow-md lg:hidden z-50 ">
      <ul className="flex justify-around items-center py-2">
        {/* Home link */}
        

        {/* Peoples link */}
        <li>
          <NavLink
          to={'/near-people'}
            className={({ isActive }) =>
              isActive
                ? "text-blue-500 text-4xl"
                : "font-bold text-4xl text-gray-700"
            }
          >
            <MdPersonPinCircle />
          </NavLink>
        </li>

        {/* Add new link */}

        <div
          id="dropdown"
          className={`z-10 ${
            isOpen ? "block" : "hidden"
          } bg-gray-200 absolute rounded-lg mb-[430px] w-full p-5 mx-2 shadow-lg `}
        >
          <div className=" text-xl font-medium">
            <h1 className="text-lg mb-3 text-center border-b-2 pb-2 ">
              Make a Post for your Opinion
            </h1>
            <form onSubmit={handleSubmit}>
              <label
                className="block mb-2 text-sm mt-3 font-medium text-gray-800"
                htmlFor="file_input"
              >
                Select Image
              </label>
              <input
                type="file"
                className="w-full text-gray-500 font-medium text-sm border-2 bg-gray-100 file:cursor-pointer cursor-pointer file:border-0 file:py-2 file:px-4 file:mr-4 file:bg-gray-800 file:hover:bg-gray-700 file:text-white rounded"
                onChange={handleFileChange}
              />

              <label
                htmlFor="message"
                className="block mb-2 mt-4 text-sm font-medium text-gray-800 "
              >
                Your Opinion
              </label>
              <textarea
                id="message"
                rows="4"
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write your thoughts here..."
                value={opinion}
                onChange={handleOpinionChange}
              ></textarea>

              <button
                type="submit"
                className="btn text-base w-full mt-7 bg-gray-700 text-white flex items-center justify-center"
              >
                {postLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                ) : (
                  "Post"
                )}
              </button>
            </form>
          </div>
        </div>
        <li>
          <NavLink
            to="/public-opinion"
            className={({ isActive }) =>
              isActive ? "text-3xl text-blue-500" : "text-3xl text-gray-700"
            }
          >
            <FaRegComment />
          </NavLink>
        </li>
        <li
          id="dropdownDefaultButton"
          onClick={toggleDropdown}
          className={`${
            isOpen ? "rotate-45" : "rotate-0"
          } transition-all font-bold text-3xl text-gray-700`}
        >
          <FaPlusCircle />
        </li>

        {/* Notifications link */}
        <li className=" relative">
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              isActive ? "text-3xl text-blue-500" : "text-3xl text-gray-700"
            }
          >
            <IoNotificationsSharp />
          </NavLink>
          <p className=" absolute top-[-5px] right-0 bg-red-700 text-white px-[2px] rounded-xl text-sm">{notification.length}</p>
        </li>
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "text-3xl text-blue-500" : "text-3xl text-gray-700"
            }
          >
            <HiHome />
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default DownNav;
