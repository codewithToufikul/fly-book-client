import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeftLong, FaCircleExclamation, FaUpload } from "react-icons/fa6";
import { FiMenu } from "react-icons/fi";
import usePeople from "../../Hooks/usePeople";
import useUser from "../../Hooks/useUser";
import { LuSend } from "react-icons/lu";
import usePublicAxios from "../../Hooks/usePublicAxios";
import toast from "react-hot-toast";
import { useSocket } from "../../contexts/SocketContext";
import { Link, useParams } from "react-router";
import imageCompression from "browser-image-compression";
import axios from "axios";
import { TbPhotoShare, TbFileUpload } from "react-icons/tb";
import DownNav from "../DownNav/DownNav";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { MdDeleteForever } from "react-icons/md";
import { AiOutlineFilePdf } from "react-icons/ai";
import { BsFileEarmarkPdf } from 'react-icons/bs';

const MassegeBox = () => {
  const { userId } = useParams();
  const { peoples, isLoading: peopleLoading } = usePeople();
  const { user: myData, loading: userLoading } = useUser();
  const bottomRef = useRef(null);
  const token = localStorage.getItem("token");
  const [userW, setUserW] = useState(null);
  const [isUserFound, setIsUserFound] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isUserOnline, setIsUserOnline] = useState(false);
  const axiosPublic = usePublicAxios();
  const IMG_BB_API_KEY = import.meta.env.VITE_IMAGE_HOSTING_KEY;
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Add these constants for Cloudinary
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; // You'll need to create this in Cloudinary

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
        // Set initial online status
        setIsUserOnline(foundUser.isOnline || false);
      }
    }
  }, [peoples, userId]);

  const socket = useSocket(); // Use global socket

  useEffect(() => {
    if (!socket) return;

    // Handle specific user logic
    if (userId && myData?.id) {
      const roomId = [userId, myData.id].join("-");
      socket.emit("joinRoom", roomId);
    }

    // Listen for user online/offline status
    socket.on("userOnline", (data) => {
      if (data.userId === userId) {
        setIsUserOnline(true);
      }
    });

    socket.on("userOffline", (data) => {
      if (data.userId === userId) {
        setIsUserOnline(false);
      }
    });

    // Listen for incoming messages
    socket.on("receiveMessage", (message) => {
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
      socket.off("userOnline");
      socket.off("userOffline");
      socket.off("receiveMessage");
    };
  }, [socket, userId, myData?.id]);

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["messageData", userW?._id],
    queryFn: async () => {
      if (!userW) return;
      const res = await axiosPublic.get(`/api/messages/${userW._id}`);
      return res.data.messages;
    },
    enabled: !!userW,
    onSuccess: async (messages) => {
      // Mark messages as read when specific chat is opened
      if (messages && messages.length > 0 && myData?.id && userW?._id) {
        try {
          await axiosPublic.put("/api/messages/mark-read", {
            userId: myData.id,
            senderId: userW._id,
          });
          
          // Update message count in Navbar and DownNav
          window.dispatchEvent(new CustomEvent('resetMessageCount'));
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      }
    },
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
    if (socket) {
      socket.emit("typing", {
        senderId: myData.id,
        roomId: [myData.id, userId].join("-"),
      });
    }
  };

  const handleImageUpload = async (file) => {
    setIsUploading(true);
    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.015,
        maxWidthOrHeight: 500,
        useWebWorker: true,
      });
      const formData = new FormData();
      formData.append("image", compressedFile);
      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`,
        formData
      );
      setIsUploading(false);
      return res.data.data.url;
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Image upload failed.");
      setIsUploading(false);
      return null;
    }
  };

  // Add this function to handle PDF upload
  const handlePdfUpload = async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
        formData
      );
      setIsUploading(false);
      return response.data.secure_url;
    } catch (error) {
      console.error("PDF upload failed:", error);
      toast.error("PDF upload failed.");
      setIsUploading(false);
      return null;
    }
  };

  // Modify handleSendMessage to handle PDFs
  const handleSendMessage = async (e, file = null) => {
    e.preventDefault();
    const messageText = e.target.message?.value.trim() || "";

    if (messageText && file) {
      toast.error("You cannot send both text and file together.");
      return;
    }

    let messageType = "text";
    let mediaUrl = null;

    if (file) {
      if (file.type === "application/pdf") {
        messageType = "pdf";
        mediaUrl = await handlePdfUpload(file);
      } else if (file.type.startsWith("image/")) {
        messageType = "image";
        mediaUrl = await handleImageUpload(file);
      }
    }

    if (!messageText && !mediaUrl) return;

    if (socket) {
      socket.emit("sendMessage", {
        senderId: myData.id,
        senderName: myData.name,
        receoientId: userId,
        messageText,
        messageType,
        mediaUrl,
        roomId: [myData.id, userId].join("-"),
      });
    }

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

  // Add this function to handle file changes
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      handleSendMessage(e, file);
    }
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
        `https://fly-book-server-lzu4.onrender.com/api/delete-message/${messageId}`,
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

  const PdfPreview = ({ url, senderId, myId }) => {
    const [fileName, setFileName] = useState('');

    useEffect(() => {
      const name = url.split('/').pop().split('.')[0];
      setFileName(name.length > 15 ? name.substring(0, 15) + '...' : name);
    }, [url]);

    return (
      <div className="max-w-[300px] transition-transform hover:scale-[1.02]">
        <div className={`rounded-2xl overflow-hidden shadow-lg ${senderId === myId
          ? "bg-blue-500 text-white"
          : "bg-white text-gray-900"
          }`}>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <BsFileEarmarkPdf size={32} className={senderId === myId ? "text-white/90" : "text-red-500"} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{fileName || 'PDF Document'}</p>
                <p className="text-sm opacity-75">PDF File</p>
              </div>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-3 block text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors ${senderId === myId
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
            >
              Open PDF
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 relative">
      {/* Header - adjusted padding */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-2 py-2">
        <div className="flex items-center gap-2">
          <Link
            to={'/chats'}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaArrowLeftLong className="text-lg" />
          </Link>
          <Link to={`/profile/${userId}`} className="flex items-center gap-2">
            <div className="relative">
              <img
                className="w-8 h-8 rounded-full object-cover border-2 border-blue-500/20"
                src={userW.profileImage}
                alt={userW.name}
              />
              {isUserOnline ? (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
              ) : (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-gray-400 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <h1 className="font-medium text-gray-900 text-sm">{userW.name}</h1>
              <p className="text-xs text-gray-500">
                {isUserOnline ? "Online" : userW.lastSeen ? `Last seen ${new Date(userW.lastSeen).toLocaleTimeString()}` : "Offline"}
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Messages Area - adjusted padding and margins */}
      <div className="flex-1 overflow-y-auto px-2 pt-14 pb-16">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex mb-3 ${message.senderId === myData.id ? "justify-end" : "justify-start"
              }`}
          >
            <div className={`max-w-[85%] space-y-1`}>
              {message.messageType === "image" ? (
                <div className="relative">
                  <div className="rounded-xl overflow-hidden shadow-sm">
                    <img
                      src={message.mediaUrl}
                      alt="message"
                      className="w-full max-w-[280px] object-cover"
                      loading="lazy"
                    />
                  </div>
                  {message.senderId === myData.id && (
                    <div className="absolute -right-1 -top-1 opacity-80 hover:opacity-100 transition-opacity">
                      <details className="dropdown dropdown-left">
                        <summary className="btn btn-ghost btn-xs bg-white/10 backdrop-blur-sm rounded-full p-1">
                          <HiOutlineDotsHorizontal className="text-white" />
                        </summary>
                        <ul className="dropdown-content menu shadow bg-white rounded-lg">
                          <li onClick={() => handleMessageDelete(message._id)}>
                            <button className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg">
                              {deleteLoading ? (
                                <div className="animate-spin h-5 w-5 border-2 border-red-500 rounded-full" />
                              ) : (
                                <MdDeleteForever size={20} />
                              )}
                            </button>
                          </li>
                        </ul>
                      </details>
                    </div>
                  )}
                </div>
              ) : message.messageType === "pdf" ? (
                <div className="relative max-w-[280px]">
                  <PdfPreview
                    url={message.mediaUrl}
                    senderId={message.senderId}
                    myId={myData.id}
                  />
                  {message.senderId === myData.id && (
                    <div className="absolute -right-1 -top-1 opacity-80 hover:opacity-100 transition-opacity">
                      <details className="dropdown dropdown-left">
                        <summary className="btn btn-ghost btn-xs bg-white/10 backdrop-blur-sm rounded-full p-1">
                          <HiOutlineDotsHorizontal className="text-white" />
                        </summary>
                        <ul className="dropdown-content menu shadow bg-white rounded-lg">
                          <li onClick={() => handleMessageDelete(message._id)}>
                            <button className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg">
                              {deleteLoading ? (
                                <div className="animate-spin h-5 w-5 border-2 border-red-500 rounded-full" />
                              ) : (
                                <MdDeleteForever size={20} />
                              )}
                            </button>
                          </li>
                        </ul>
                      </details>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`relative ${message.senderId === myData.id
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-900"
                    } px-4 py-2.5 rounded-xl shadow-sm`}
                >
                  <p className="text-sm">{message.messageText}</p>
                  {message.senderId === myData.id && (
                    <div className="absolute -right-1 -top-1 opacity-80 hover:opacity-100 transition-opacity">
                      <details className="dropdown dropdown-left">
                        <summary className="btn btn-ghost btn-xs bg-white/10 backdrop-blur-sm rounded-full p-1">
                          <HiOutlineDotsHorizontal className="text-white" />
                        </summary>
                        <ul className="dropdown-content menu shadow bg-white rounded-lg">
                          <li onClick={() => handleMessageDelete(message._id)}>
                            <button className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg">
                              {deleteLoading ? (
                                <div className="animate-spin h-5 w-5 border-2 border-red-500 rounded-full" />
                              ) : (
                                <MdDeleteForever size={20} />
                              )}
                            </button>
                          </li>
                        </ul>
                      </details>
                    </div>
                  )}
                </div>
              )}
              <p className="text-[10px] text-gray-400 px-1">
                {new Date(message.timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />

        {isTyping && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-sm w-fit">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>

      {/* Input Area - completely restructured for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center px-2 py-2 gap-1.5 max-w-screen-sm mx-auto">
          <div className="flex gap-1.5">
            <label htmlFor="image-upload" className="p-1.5 hover:text-gray-700 text-gray-500">
              <TbPhotoShare className="text-xl" />
            </label>
            <label htmlFor="pdf-upload" className="p-1.5 hover:text-gray-700 text-gray-500">
              <TbFileUpload className="text-xl" />
            </label>
          </div>

          <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={handleFileChange} />
          <input type="file" id="pdf-upload" accept=".pdf" className="hidden" onChange={handleFileChange} />

          <input
            type="text"
            name="message"
            onKeyDown={handleTyping}
            placeholder="Type your message..."
            className="flex-1 min-w-0 px-3 py-1.5 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />

          <button
            type="submit"
            disabled={isUploading}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full disabled:opacity-50"
          >
            {isUploading ? (
              <div className="animate-spin h-3 w-3 border-2 border-white rounded-full" />
            ) : (
              <LuSend className="text-base" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MassegeBox;
