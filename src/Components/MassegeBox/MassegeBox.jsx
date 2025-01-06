import React, { useEffect, useRef, useState } from "react";
import { FaCircleExclamation, FaUpload } from "react-icons/fa6";
import { FiMenu } from "react-icons/fi";
import usePeople from "../../Hooks/usePeople";
import useUser from "../../Hooks/useUser";
import { LuSend } from "react-icons/lu";
import usePublicAxios from "../../Hooks/usePublicAxios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { Link, useParams } from "react-router";
import imageCompression from "browser-image-compression";
import axios from "axios";
import { TbPhotoShare } from "react-icons/tb";
import DownNav from "../DownNav/DownNav";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { MdDeleteForever } from "react-icons/md";

const MassegeBox = () => {
  const { userId } = useParams();
  const { peoples, isLoading: peopleLoading } = usePeople();
  const { user: myData, loading: userLoading } = useUser();
  const bottomRef = useRef(null);
  const token = localStorage.getItem("token");
  const [userW, setUserW] = useState(null);
  const [isUserFound, setIsUserFound] = useState(false);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const axiosPublic = usePublicAxios();
  const IMG_BB_API_KEY = import.meta.env.VITE_IMAGE_HOSTING_KEY;
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (peoples && userId) {
      const foundUser = peoples.find((people) => people._id === userId);
      if (foundUser) {
        setUserW(foundUser);
        setIsUserFound(true);
      }
    }
  }, [peoples, userId]);

  useEffect(() => {
    // Initialize the Socket.IO connection
    const newSocket = io("https://fly-book-server.onrender.com", {
      transports: ["websocket"], // Use WebSocket transport directly
      withCredentials: true, // If your server requires credentials for CORS
    });
    setSocket(newSocket);

    // Log connection success
    newSocket.on("connect", () => {});

    // Handle errors during connection
    newSocket.on("connect_error", (error) => {
      console.error("Socket Connection Error:", error.message);
    });

    // Handle reconnection attempts
    newSocket.on("reconnect_attempt", (attempt) => {
      console.warn("Socket Reconnection Attempt:", attempt);
    });

    // Handle specific user logic
    if (userId) {
      const roomId = [userId, myData?.id].join("-");

      newSocket.emit("joinRoom", roomId);

      newSocket.on("connected", () => {});
    }

    // Listen for incoming messages
    newSocket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          senderId: message.senderId,
          messageText: message.messageText,
          timestamp: message.timestamp,
          messageType: message.messageType,
          mediaUrl: message.mediaUrl,
        },
      ]);
    });

    // Cleanup on unmount
    return () => {
      console.log("Disconnecting Socket...");
      newSocket.disconnect();
    };
  }, [userId, myData?.id]);

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["messageData", userW?._id],
    queryFn: async () => {
      if (!userW) return;
      const res = await axiosPublic.get(`/api/messages/${userW._id}`);
      return res.data.messages;
    },
    enabled: !!userW,
    onError: (error) => {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages.");
    },
  });

  useEffect(() => {
    if (data) {
      setMessages(data);
    }
  }, [data]);

  const handleTyping = () => {
    socket.emit("typing", {
      senderId: myData.id,
      roomId: [myData.id, userId].join("-"),
    });
  };

  const handleImageUpload = async (file) => {
    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.015, // Compress to max 15KB
        maxWidthOrHeight: 500, // Max image dimension
        useWebWorker: true,
      });
      const formData = new FormData();
      formData.append("image", compressedFile);
      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`,
        formData
      );
      return res.data.data.url;
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Image upload failed.");
      return null;
    }
  };

  const handleSendMessage = async (e, imageFile = null) => {
    e.preventDefault();
    const messageText = e.target.message?.value.trim() || "";

    if (messageText && imageFile) {
      toast.error("You cannot send both text and image together.");
      return;
    }

    let messageType = "text";
    let mediaUrl = null;

    if (imageFile) {
      messageType = "image";
      mediaUrl = await handleImageUpload(imageFile);
    }

    if (!messageText && !mediaUrl) return;

    socket.emit("sendMessage", {
      senderId: myData.id,
      senderName: myData.name,
      receoientId: userId,
      messageText,
      messageType,
      mediaUrl,
      roomId: [myData.id, userId].join("-"),
    });

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        senderId: myData.id,
        receoientId: userId,
        messageText,
        timestamp: new Date(),
        messageType,
        mediaUrl,
      },
    ]);
    e.target.reset();
  };

  useEffect(() => {
    if (socket) {
      socket.on("typing", (data) => {
        if (data.senderId !== myData.id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000); // Typing stop after 3 seconds
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("typing");
      }
    };
  }, [socket, myData.id]);

  useEffect(() => {
    if (socket) {
      socket.on("newNotification", (notification) => {
        console.log("New Notification:", notification);
        // এখানে আপনি UI বা পুশ নোটিফিকেশন প্রদর্শন করতে পারেন
        toast.success(
          `New message from ${notification.senderId}: ${notification.messageText}`
        );
      });
    }

    return () => {
      if (socket) {
        socket.off("newNotification");
      }
    };
  }, [socket]);

  const handleImageChange = async (e) => {
    const imageFile = e.target.files[0];
    if (imageFile) {
      handleSendMessage(e, imageFile); // Send message with image as soon as it's selected
    }
  };

  if (peopleLoading || userLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }
  if (!isUserFound || !userW) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  const handleMessageDelete = async (messageId) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(
        `https://fly-book-server.onrender.com/api/delete-message/${messageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        refetch();
        setDeleteLoading(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete the message.");
      setDeleteLoading(false);
    }
    setDeleteLoading(false);
  };

  return (
    <div className="drawer-content flex flex-col justify-between">
      {/* Header Section */}
      <div className="w-full bg-gray-100 p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex sticky top-1 items-center gap-5">
          <label
            htmlFor="my-drawer-2"
            className="drawer-button text-3xl font-semibold lg:hidden"
          >
            <FiMenu />
          </label>
          <Link to={`/profile/${userId}`} className="flex items-center gap-2">
            <div className="w-[40px] h-[40px] p-1 border-2 rounded-full border-green-200">
              <img
                className="w-full h-full object-cover rounded-full"
                src={userW.profileImage}
                alt="User Profile"
              />
            </div>
            <h1 className="text-xl font-semibold">{userW.name}</h1>
          </Link>
        </div>
        <Link className="text-2xl">
          <FaCircleExclamation />
        </Link>
      </div>

      {/* Chat Content Section */}
      <div className="flex-grow bg-white overflow-y-auto max-h-[calc(100vh-160px)]">
        {" "}
        {/* Adjust the height to leave space for the header and input */}
        <div className="p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.senderId === myData.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] items-center gap-2 flex ${
                  message.senderId === myData.id
                    ? "flex-row-reverse items-end"
                    : "flex-row"
                } `}
              >
                <div
                  className={`gap-2 flex ${
                    message.senderId === myData.id
                      ? "flex-col items-end"
                      : "flex-col"
                  } `}
                >
                  {message.messageType === "image" ? (
                    <img
                      src={message.mediaUrl}
                      alt="message"
                      className="max-w-[200px] max-h-[200px] rounded-lg"
                    />
                  ) : (
                    <p
                      className={`text-start text-sm lg:text-base p-3 rounded-lg shadow ${
                        message.senderId === myData.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 text-black"
                      } overflow-hidden break-words`}
                    >
                      {message.messageText}
                    </p>
                  )}
                  <p className=" text-[10px] lg:text-sm text-slate-400">
                    {new Date(message.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
                <div
                  className={`flex items-center justify-center ${
                    message.senderId === myData.id
                      ? ""
                      : "hidden"
                  }`}
                >
                  <details
                    className={`dropdown ${
                      message.senderId === myData.id
                        ? "dropdown-left"
                        : "dropdown-right"
                    }`}
                  >
                    <summary className="btn p-0 py-0 bg-transparent border-none shadow-none mb-4 text-lg font-bold">
                      <HiOutlineDotsHorizontal />
                    </summary>
                    <ul className="menu mx-2 top-0 dropdown-content bg-base-100 rounded-box z-[1] p-0 m-0 shadow">
                      <li onClick={() => handleMessageDelete(message._id)}>
                        <p className=" text-2xl text-red-700">
                          {deleteLoading ? (
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
                            <MdDeleteForever />
                          )}
                        </p>
                      </li>
                    </ul>
                  </details>
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
          {isTyping && (
            <div className="flex justify-start items-center space-x-2 p-2 mb-5 w-fit bg-gray-300 py-3 rounded-md">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-700"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-400"></div>
            </div>
          )}
        </div>
      </div>

      {/* Input Field Fixed at Bottom */}
      <form
        onSubmit={handleSendMessage}
        className="w-full bg-gray-100 px-4 py-2 lg:p-4 border-t-2 flex justify-between items-center "
      >
        <label htmlFor="image-upload" className="cursor-pointer pr-3 lg:pr-4">
          <TbPhotoShare size={30} /> {/* এখানে আপনার পছন্দের আইকন */}
        </label>
        <input
          type="file"
          id="image-upload"
          name="image"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <input
          type="text"
          name="message"
          onKeyDown={handleTyping}
          placeholder="Type a message..."
          className="flex-grow border-2 max-w-[230px] md:max-w-full border-gray-300 rounded-md p-2"
        />
        <button type="submit" className="pl-3 pr-1 text-2xl">
          <LuSend />
        </button>
      </form>
    </div>
  );
};

export default MassegeBox;
