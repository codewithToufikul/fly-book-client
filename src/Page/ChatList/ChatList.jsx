import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import usePublicAxios from "../../Hooks/usePublicAxios";
import DownNav from "../../Components/DownNav/DownNav";
import Navbar from "../../Components/Navbar/Navbar";
import { HiOutlineDotsVertical } from "react-icons/hi";
import toast from "react-hot-toast";
import { BiMessageDetail } from "react-icons/bi";

const ChatList = () => {
  const [chatUsers, setChatUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const axiosPublic = usePublicAxios();
  const token = localStorage.getItem("token");

  const sortChatsByLatestMessage = (chats) => {
    return [...chats].sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });
  };

  const fetchChatUsers = async () => {
    try {
      const res = await axiosPublic.get("/api/chat-users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.success) {
        setChatUsers(sortChatsByLatestMessage(res.data.users));
      }
    } catch (error) {
      console.error("Error fetching chat users:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  // Function to update chat order when new message arrives
  const updateChatOrder = (updatedChat) => {
    setChatUsers(prev => {
      const otherChats = prev.filter(chat => chat._id !== updatedChat._id);
      return sortChatsByLatestMessage([updatedChat, ...otherChats]);
    });
  };

  useEffect(() => {
    fetchChatUsers();
  }, []);

  const handleDeleteClick = (chat) => {
    setSelectedChat(chat);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedChat) return;

    setDeleting(true);
    try {
      const response = await axiosPublic({
        method: 'DELETE',
        url: `https://api.flybook.com.bd/api/delete-conversation/${selectedChat._id}`,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success("Conversation deleted successfully");
        setChatUsers(prev => prev.filter(user => user._id !== selectedChat._id));
        setShowDeleteModal(false);
      } else {
        toast.error(response.data.error || "Failed to delete conversation");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      if (error.response?.status === 404) {
        toast.error("Conversation not found or already deleted");
      } else if (error.response?.status === 401) {
        toast.error("Unauthorized. Please login again");
      } else {
        toast.error(error.response?.data?.error || "Failed to delete the conversation");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex justify-center mx-auto max-w-[700px] p-4">
        <ul className="w-full">
          <li className="mb-6 flex items-center gap-3 text-xl font-semibold lg:text-2xl py-4 bg-white px-6 rounded-lg shadow-sm">
            <BiMessageDetail className="text-blue-500" />
            My Conversations
          </li>

          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse flex items-center gap-4 bg-white p-4 rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : chatUsers.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">No conversations yet</p>
              <p className="text-sm text-gray-400 mt-2">Start chatting with someone!</p>
            </div>
          ) : (
            chatUsers.map((cUser) => (
              <div key={cUser._id} className="mb-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-center p-3">
                  <Link
                    to={`/chats/${cUser._id}`}
                    className="flex items-center gap-4 flex-1"
                  >
                    <div className="w-12 h-12 rounded-full ring-2 ring-offset-2 ring-blue-100">
                      <img
                        className="w-full h-full object-cover rounded-full"
                        src={cUser.profileImage}
                        alt={cUser.name}
                      />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-base lg:text-lg font-medium text-gray-800">
                        {cUser.name}
                      </h1>
                      <p className="flex items-center gap-1 text-gray-600">
                        <span className="text-sm lg:text-base font-medium">
                          {cUser.sender?.split(" ")[0] || ""}
                        </span>
                        {cUser.sender && ": "}
                        <span className="text-sm lg:text-base truncate">
                          {cUser.lastMessage ?
                            `${cUser.lastMessage.slice(0, 10)}${cUser.lastMessage.length > 30 ? "..." : ""}`
                            : "No messages yet"}
                        </span>
                      </p>
                    </div>
                  </Link>

                  {cUser.lastMessageTime && (
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(cUser.lastMessageTime).toLocaleDateString()}
                    </span>
                  )}

                  <details className="dropdown dropdown-left">
                    <summary className="btn btn-ghost btn-sm btn-circle">
                      <HiOutlineDotsVertical className="text-xl text-gray-600" />
                    </summary>
                    <ul className="dropdown-content menu bg-white rounded-box z-[1] w-52 p-2 shadow-lg">
                      <li>
                        <button
                          onClick={() => handleDeleteClick(cUser)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          Delete Conversation
                        </button>
                      </li>
                    </ul>
                  </details>
                </div>
              </div>
            ))
          )}
        </ul>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Conversation</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your conversation with {selectedChat?.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 lg:mt-0">
        <DownNav />
      </div>
    </div>
  );
};

export default ChatList;
