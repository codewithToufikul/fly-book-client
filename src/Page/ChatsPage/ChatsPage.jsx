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
      <div className="flex justify-center">
          <Outlet />
      </div>

    </div>
  );
};

export default ChatsPage;
