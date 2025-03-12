import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import { IoPeopleSharp } from "react-icons/io5";
import { MdPersonAddAlt1 } from "react-icons/md";
import { BsPersonFillUp, BsPersonLinesFill } from "react-icons/bs";
import usePeople from "../../Hooks/usePeople";
import usePublicAxios from "../../Hooks/usePublicAxios";
import toast from "react-hot-toast";
import useUser from "../../Hooks/useUser";
import useAllFriends from "../../Hooks/useAllFriends";
import Swal from "sweetalert2";
import { Link } from "react-router";
import { io, Socket } from "socket.io-client";

const Peoples = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { user, loading: userLoading, refetch } = useUser();
  const { allFriends, refetch: refetchFriends } = useAllFriends();
  const axiosPublic = usePublicAxios();
  const { peoples, isLoading } = usePeople();
  const [reqFriends, setReqFriend] = useState([]);
  const [sendReq, setSendReq] = useState([]);
  const token = localStorage.getItem("token");
  const socket = io("https://api.flybook.com.bd");


  const fetchRequests = async () => {
    try {
      const res = await axiosPublic.get("/friend-request/received", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReqFriend(res.data);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      toast.error("Failed to load friend requests.");
    }
  };
  const fetchSendRequests = async () => {
    try {
      const res = await axiosPublic.get("/friend-request/sended", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSendReq(res.data);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      toast.error("Failed to load friend requests.");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [axiosPublic, token]);

  useEffect(() => {
    fetchSendRequests();
  }, [axiosPublic, token]);

  //   sendFriendRequest
  const sendFriendRequest = async (recipientId) => {
    try {
      await axiosPublic.post(
        "/friend-request/send",
        { recipientId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("request sent !");
      fetchSendRequests();
      socket.emit("sendRequest", {
        senderId: user.id,
        senderName: user.name,
        senderProfile: user.profileImage,
        receoientId: recipientId,
        type: "fndReq",
        notifyText: "Send Friend Request",
        roomId: [recipientId],
      });
      refetch();
    } catch (error) {
      console.log(error);
      toast.error("something went wrong !");
    }
  };

  const handleAcceptReq = async (acceptId) => {
    try {
      await axiosPublic.post(
        "/friend-request/accept",
        { acceptId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Request Accepted !");
      fetchRequests();
      socket.emit("sendRequest", {
        senderId: user.id,
        senderName: user.name,
        senderProfile: user.profileImage,
        receoientId: recipientId,
        type: "fndReq",
        notifyText: "Friend Request Accept",
        roomId: [recipientId],
      });
      refetch();
    } catch (error) {
      console.log(error);
      toast.error("something went wrong !");
    }
  };

  const removeFriendRequest = async (senderId) => {
    try {
      await axiosPublic.post(
        "/friend-request/reject",
        { senderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Request Rejected !");
      fetchRequests();
      refetch();
    } catch (error) {
      console.log(error);
      toast.error("something went wrong !");
    }
  };
  const cancelFriendRequest = async (recipientId) => {
    try {
      await axiosPublic.post(
        "/friend-request/cancel",
        { recipientId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.error("Request Cancel !");
      fetchSendRequests();
      refetch();
    } catch (error) {
      console.log(error);
      toast.error("something went wrong !");
    }
  };
  const handleUnfriend = (friendId, name) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Unfriend ${name}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes !"
    }).then(async (result) => { // Make the callback async
      if (result.isConfirmed) {
        try {
          await axiosPublic.post(
            "/friend-request/unfriend",
            { friendId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          refetchFriends();
          Swal.fire({
            title: "Unfriend Success",
            text: "Your friend has been removed.",
            icon: "success"
          });
        } catch (error) {
          console.error(error);
          toast.error("Something went wrong!");
        }
      }
    });
  };

  if (isLoading) {
    <div className="flex items-center justify-center h-screen">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
        <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
      </div>
    </div>;
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <Navbar />
      <div className="max-w-[1380px] mx-auto lg:grid lg:grid-cols-3">
        <div className="col-span-1 bg-gray-50 m-2 lg:m-5 px-2 pb-3 lg:p-5 rounded-lg">
          <h2 className="text-2xl my-3 mb-5 border-b-4 hidden lg:block pb-3">
            People you may know
          </h2>
          <ul className="space-y-3 flex flex-row justify-between items-center lg:items-start lg:flex-col">
            <li
              className={`hover:bg-gray-100 py-3 px-3 mt-3 lg:w-full rounded-xl cursor-pointer ${
                activeTab === "home" ? "bg-gray-200" : ""
              }`}
              onClick={() => setActiveTab("home")}
            >
              <div className="flex flex-col lg:flex-row items-center gap-2">
                <p className="text-3xl">
                  <IoPeopleSharp />
                </p>
                <p className="text-xl font-medium hidden  lg:block">Home</p>
              </div>
            </li>
            <li
              className={`hover:bg-gray-100 py-3 px-3 lg:w-full rounded-xl cursor-pointer ${
                activeTab === "friendRequests" ? "bg-gray-200" : ""
              }`}
              onClick={() => setActiveTab("friendRequests")}
            >
              <div className="flex items-center gap-2">
                <p className="text-3xl">
                  <MdPersonAddAlt1 />
                </p>
                <p className="text-xl font-medium hidden  lg:block">
                  Friend Requests
                </p>
              </div>
            </li>
            <li
              className={`hover:bg-gray-100 py-3 px-3  lg:w-full rounded-xl cursor-pointer ${
                activeTab === "sentRequests" ? "bg-gray-200" : ""
              }`}
              onClick={() => setActiveTab("sentRequests")}
            >
              <div className="flex items-center gap-2">
                <p className="text-3xl">
                  <BsPersonFillUp />
                </p>
                <p className="text-xl font-medium hidden  lg:block">
                  Sent Requests
                </p>
              </div>
            </li>
            <li
              className={`hover:bg-gray-100 py-3 lg:w-full px-3 rounded-xl cursor-pointer ${
                activeTab === "allFriends" ? "bg-gray-200" : ""
              }`}
              onClick={() => setActiveTab("allFriends")}
            >
              <div className="flex items-center gap-2">
                <p className="text-3xl">
                  <BsPersonLinesFill />
                </p>
                <p className="text-xl font-medium hidden  lg:block">
                  All Friends
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="col-span-2 p-5 bg-gray-50 m-2 lg:m-5 rounded-lg">
          {activeTab === "home" && (
            <div>
              <h1 className="text-xl lg:text-3xl font-medium border-b-2 pb-3 w-fit">
                Peoples
              </h1>
              <div className=" mt-3 lg:mt-7 flex flex-wrap gap-4">
                {peoples.map((people) => (
                  <div
                    className="lg:w-[210px] lg:h-[280px] w-full h-[120px] bg-white shadow-sm rounded-lg flex flex-row lg:flex-col items-center"
                    key={people._id}
                  >
                    <div className="w-[160px] lg:w-[210px] h-full lg:h-[170px]">
                      <img
                        className="w-full h-full lg:h-[170px] rounded-l-2xl lg:rounded-l-none lg:rounded-t-2xl object-cover"
                        src={people.profileImage}
                        alt={people.name}
                      />
                    </div>
                    <div className="w-full pl-3 lg:pl-0 px-1 flex flex-col lg: gap-3 justify-between pb-3">
                      <Link  to={`/profile/${people._id}`}  className="  cursor-pointer   text-xl lg:text-[22px] font-medium lg:font-semibold text-center py-2">
                        {people.name}
                      </Link>
                      {user.friends?.includes(people._id) ? (
                        <button className="w-full btn text-base lg:text-[17px] bg-gray-100 text-gray-600 py-2 rounded">
                          Friend
                        </button>
                      ) : user.friendRequestsSent?.includes(people._id) ? (
                        <button
                          onClick={() => cancelFriendRequest(people._id)}
                          className="w-full btn text-base bg-yellow-50 lg:text-[17px] text-yellow-600 py-2 rounded"
                        >
                          Cancel Request
                        </button>
                      ) : user.friendRequestsReceived?.includes(people._id) ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleAcceptReq(people._id)}
                            className=" btn bg-blue-50 text-blue-600 rounded"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => removeFriendRequest(people._id)}
                            className=" btn bg-red-50 text-red-600 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => sendFriendRequest(people._id)}
                          className="w-full btn text-base lg:text-[17px] bg-green-50 text-green-600 py-2 rounded"
                        >
                          Add Friend
                        </button>
                      )}
                    </div>
                </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "friendRequests" && (
            <div>
              <h1 className="text-xl lg:text-3xl font-medium border-b-2 pb-3 w-fit">
                Your friend Requests
              </h1>
              <div className=" mt-3 lg:mt-7 flex flex-wrap gap-4">
                {reqFriends.map((reqFriend) => (
                  <div
                    className="lg:w-[210px] lg:h-[280px] w-full h-[120px] bg-white shadow-sm rounded-lg flex flex-row lg:flex-col items-center"
                    key={reqFriend._id}
                  >
                    <div className="w-[160px] lg:w-[210px] h-full lg:h-[170px]">
                      <img
                        className="w-full h-full lg:h-[170px] rounded-l-2xl lg:rounded-l-none lg:rounded-t-2xl object-cover"
                        src={reqFriend.profileImage}
                        alt={reqFriend.name}
                      />
                    </div>
                    <div className=" w-full pl-3 lg:pl-0 px-1 flex flex-col lg: gap-3 justify-between pb-3">
                      <Link  to={`/profile/${reqFriend._id}`}  className=" cursor-pointer text-xl lg:text-[22px] font-medium lg:font-semibold text-center py-2">
                        {reqFriend.name}
                      </Link>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleAcceptReq(reqFriend._id)}
                          className=" btn bg-blue-50 text-blue-600 rounded"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => removeFriendRequest(reqFriend._id)}
                          className=" btn bg-red-50 text-red-600 rounded"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "sentRequests" && (
            <div>
              <h1 className="text-xl lg:text-3xl font-medium border-b-2 pb-3 w-fit">
                Peoples
              </h1>
              <div className="  mt-3 lg:mt-7 flex flex-wrap gap-4">
                {sendReq.map((people) => (
                  <div
                    className="lg:w-[210px] lg:h-[280px] w-full h-[120px] bg-white shadow-sm rounded-lg flex flex-row lg:flex-col items-center"
                    key={people._id}
                  >
                    <div className="w-[160px] lg:w-[210px] h-full lg:h-[170px]">
                      <img
                        className="w-full h-full lg:h-[170px] rounded-l-2xl lg:rounded-l-none lg:rounded-t-2xl object-cover"
                        src={people.profileImage}
                        alt={people.name}
                      />
                    </div>
                    <div className=" w-full pl-3 lg:pl-0 px-1 flex flex-col lg: gap-3 justify-between pb-3">
                      <Link  to={`/profile/${people._id}`}  className=" cursor-pointer text-xl lg:text-[22px] font-medium lg:font-semibold text-center py-2">
                        {people.name}
                      </Link>
                      <button
                        onClick={() => cancelFriendRequest(people._id)}
                        className="w-full btn bg-yellow-50 text-[17px] text-yellow-600 py-2 rounded"
                      >
                        Cancel Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "allFriends" && (
            <div>
              <h1 className="text-xl lg:text-3xl font-medium border-b-2 pb-3 w-fit">
                All Friends
              </h1>
              <div className="   mt-3 lg:mt-7 flex flex-wrap gap-4">
                {allFriends.map((Friend) => (
                  <div
                    className="lg:w-[210px] lg:h-[280px] w-full h-[120px] bg-white shadow-sm rounded-lg flex flex-row lg:flex-col items-center"
                    key={Friend._id}
                  >
                    <div className="w-[160px] lg:w-[210px] h-full lg:h-[170px]">
                      <img
                        className="w-full h-full lg:h-[170px] rounded-l-2xl lg:rounded-l-none lg:rounded-t-2xl object-cover"
                        src={Friend.profileImage}
                        alt={Friend.name}
                      />
                    </div>
                    <div className=" w-full pl-3 lg:pl-0 px-1 flex flex-col lg: gap-3 justify-between pb-3">
                      <Link  to={`/profile/${Friend._id}`}  className=" cursor-pointer text-xl lg:text-[22px] font-medium lg:font-semibold text-center py-2">
                        {Friend.name}
                      </Link>
                      <button onClick={()=>handleUnfriend(Friend._id, Friend.name)} className="w-full btn bg-red-100 text-[17px] text-red-400 rounded">
                        Unfriend
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className=" mt-[50px]">
        <DownNav />
      </div>
    </div>
  );
};

export default Peoples;
