import React, { useEffect, useState } from "react";
import { FaPlusCircle, FaRegComment, FaFilePdf } from "react-icons/fa";
import { HiHome, HiUserAdd } from "react-icons/hi";
import { IoNotificationsSharp } from "react-icons/io5";
import { Link, NavLink, useNavigate } from "react-router";
import usePublicAxios from "../../Hooks/usePublicAxios";
import useUser from "../../Hooks/useUser";
import toast from "react-hot-toast";
import { MdPersonPinCircle } from "react-icons/md";
import imageCompression from "browser-image-compression";
import { useSocket } from "../../contexts/SocketContext";

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
  const socket = useSocket(); // Use global socket
  const [notification, setNotification] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0); // Only notification count
  const [pdf, setPdf] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  const toggleDropdown = () => {
    if (!user) {
      toast.error("Please login first to make a post!");
      return;
    }
    setIsOpen(!isOpen);
  };

  // Load initial unread notification count from database
  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!user?.id) return;
      
      try {
        // Fetch unread notification count
        const notifyRes = await axiosPublic.get(`/api/notifications/${user.id}/unread-count`);
        const notificationCount = notifyRes.data.unreadCount || 0;
        
        // Fetch unread message count
        const messageRes = await axiosPublic.get(`/api/messages/${user.id}/unread-count`);
        const messageCount = messageRes.data.unreadCount || 0;
        
        // Set notification count only (not message count)
        setUnreadNotificationCount(notificationCount);
        
        // Get all notifications for display
        const allNotifyRes = await axiosPublic.get(`/api/notifications/${user.id}`);
        const dbNotifications = allNotifyRes.data.notifications || [];
        
        // Filter unread notifications
        const unreadNotifications = dbNotifications.filter(n => !n.isRead);
        setNotification(unreadNotifications);
        
        // Sync with localStorage (store notification count only)
        localStorage.setItem("unreadNotificationCount", notificationCount.toString());
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };
    
    loadUnreadCount();

    // Listen for reset event from Notifications page
    const handleReset = () => {
      loadUnreadCount(); // Re-fetch to get updated count
    };
    window.addEventListener('resetNotificationCount', handleReset);
    window.addEventListener('resetMessageCount', handleReset); // Also listen for message count reset

    // Removed 30s polling - Socket events will handle real-time updates

    return () => {
      window.removeEventListener('resetNotificationCount', handleReset);
    };
  }, [user?.id, axiosPublic]);

  // Socket is now managed globally via SocketContext
  // Listen for notifications using global socket
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveNotify", (data) => {
      console.log("New Notification:", data);
      // Add to unread notifications
      setNotification((prevNotifications) =>
        Array.isArray(prevNotifications) ? [...prevNotifications, data] : [data]
      );
      
      // Refresh notification count from database (only notification, not message)
      const refreshNotificationCount = async () => {
        if (!user?.id) return;
        try {
          const notifyRes = await axiosPublic.get(`/api/notifications/${user.id}/unread-count`);
          const notifyCount = notifyRes.data.unreadCount || 0;
          setUnreadNotificationCount(notifyCount);
          localStorage.setItem("unreadNotificationCount", notifyCount.toString());
        } catch (error) {
          console.error("Error refreshing notification count:", error);
        }
      };
      refreshNotificationCount();
    });

    return () => {
      socket.off("receiveNotify");
    };
  }, [socket, user?.id, axiosPublic]);
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

  const handlePdfChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdf(file);
    } else {
      toast.error("Please select a PDF file");
      event.target.value = null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPostLoading(true);
    let uploadedImageUrl = "";
    let uploadedPdfUrl = "";

    // Upload the image to ImgBB if provided (optional)
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
          toast.success("Image uploaded successfully");
        } else {
          toast.error("Image upload failed");
          setPostLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Image upload failed");
        setPostLoading(false);
        return;
      }
    }

    // Upload PDF to Cloudinary if provided (optional)
    if (pdf) {
      const formData = new FormData();
      formData.append("file", pdf);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();
        if (result.secure_url) {
          uploadedPdfUrl = result.secure_url;
          toast.success("PDF uploaded successfully");
        } else {
          toast.error("PDF upload failed");
          setPostLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error uploading PDF:", error);
        toast.error("PDF upload failed");
        setPostLoading(false);
        return;
      }
    }

    setImageUrl(uploadedImageUrl);
    setPdfUrl(uploadedPdfUrl);
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const postData = {
      userId: user._id,
      image: uploadedImageUrl,
      pdf: uploadedPdfUrl,
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
      toast.success("Opinion Posted!");
      setIsOpen(false);
      setOpinion("");
      setImage(null);
      setPdf(null);
      navigate("/public-opinion");
    } catch (error) {
      console.log(error);
      toast.error("Failed to post opinion");
    }
  };

  const handleUpcoming = () => {
    toast.error("Features Upcoming !");
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-200 shadow-md lg:hidden z-50 ">
      <ul className="flex justify-around items-center py-2">

        <li >
        <NavLink
            to="/nearby-books"
            className={({ isActive }) =>
              isActive ? "text-[32px] text-blue-500" : "text-[32px] text-gray-700"
            }
          >
            <MdPersonPinCircle />
          </NavLink>
        </li>

        <div
          id="dropdown"
          className={`z-10 ${
            isOpen ? "block" : "hidden"
          } bg-gray-200 absolute rounded-lg mb-[510px] w-full p-5 mx-2 shadow-lg `}
        >
          <div className=" text-xl font-medium">
            <h1 className="text-lg mb-3 text-center border-b-2 pb-2 ">
              Make a Post for your Opinion
            </h1>
            <form onSubmit={handleSubmit}>
              <label
                htmlFor="message"
                className="block mb-2 text-sm font-medium text-gray-800 "
              >
                Your Opinion *
              </label>
              <textarea
                id="message"
                rows="4"
                required
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write your thoughts here..."
                value={opinion}
                onChange={handleOpinionChange}
              ></textarea>

              <label
                className="block mb-2 text-sm mt-3 font-medium text-gray-800"
                htmlFor="file_input"
              >
                Select Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full text-gray-500 font-medium text-sm border-2 bg-gray-100 file:cursor-pointer cursor-pointer file:border-0 file:py-2 file:px-4 file:mr-4 file:bg-gray-800 file:hover:bg-gray-700 file:text-white rounded"
                onChange={handleFileChange}
              />
              {image && (
                <p className="text-xs text-green-600 mt-1">✓ Image selected: {image.name}</p>
              )}

              <label
                className="block mb-2 text-sm mt-3 font-medium text-gray-800"
                htmlFor="pdf_input"
              >
                Select PDF (Optional)
              </label>
              <input
                type="file"
                id="pdf_input"
                accept=".pdf"
                className="w-full text-gray-500 font-medium text-sm border-2 bg-gray-100 file:cursor-pointer cursor-pointer file:border-0 file:py-2 file:px-4 file:mr-4 file:bg-gray-800 file:hover:bg-gray-700 file:text-white rounded"
                onChange={handlePdfChange}
              />
              {pdf && (
                <div className="flex items-center gap-2 mt-1">
                  <FaFilePdf className="text-red-500 text-lg" />
                  <p className="text-xs text-green-600">✓ PDF selected: {pdf.name}</p>
                </div>
              )}

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
          {unreadNotificationCount > 0 && (
            <p className=" absolute top-[-5px] right-0 bg-red-700 text-white px-[2px] rounded-xl text-sm min-w-[18px] text-center">
              {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
            </p>
          )}
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
