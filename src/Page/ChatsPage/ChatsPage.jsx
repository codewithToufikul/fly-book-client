import React, { useEffect, useState } from "react";
import DownNav from "../../Components/DownNav/DownNav";
import Navbar from "../../Components/Navbar/Navbar";
import { FiMenu } from "react-icons/fi";
import { FaCircleExclamation } from "react-icons/fa6";
import { Link, Outlet } from "react-router";
import usePublicAxios from "../../Hooks/usePublicAxios";

const ChatsPage = () => {
  const [chatUsers, setChatUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const axiosPublic = usePublicAxios();

  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        const res = await axiosPublic.get("/api/chat-users");
        if (res.data.success) {
          setChatUsers(res.data.users);
        }
      } catch (error) {
        console.error("Error fetching chat users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatUsers();
  }, []);
  return (
    <div className="flex flex-col h-screen">
      {/* Navbar for Desktop */}

      {/* Main Drawer Content */}
      <div className="flex flex-grow">
        <div className="drawer lg:drawer-open w-full">
          <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
          <Outlet />
          {/* Sidebar */}
          <div className="drawer-side">
            <label
              htmlFor="my-drawer-2"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
              <li className="mb-5 text-2xl font-semibold lg:text-3xl">
                My Chats
              </li>
              {loading ? (
                <p>Loading</p>
              ) : (
                chatUsers.slice()
                .reverse().map((cUser) => (
                  <Link
                    key={cUser._id} // Always provide a unique key when rendering lists
                    to={`/chats/${cUser._id}`}
                    className="flex items-center gap-2 mb-3 rounded-md hover:bg-gray-200 hover:shadow-lg p-1"
                  >
                    <div className="w-[45px] h-[45px] rounded-full">
                      <img
                        className="w-full h-full object-cover rounded-full"
                        src={cUser.profileImage}
                        alt="User Profile"
                      />
                    </div>
                    <div>
                      <h1 className="text-base lg:text-lg font-medium">
                        {cUser.name}
                      </h1>
                      <p className="flex items-center gap-1">
                        <span className="text-sm lg:text-base">
                          {cUser.sender.split(" ")[0]}:
                        </span>
                        <span className="text-sm lg:text-base">
                          {cUser.lastMessage.slice(0, 15)}..
                        </span>
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ChatsPage;
