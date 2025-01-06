import React, { useEffect, useState } from "react";
import usePeople from "../../Hooks/usePeople";
import { Link, useParams } from "react-router";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import useUser from "../../Hooks/useUser";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import heartfill from "../../assets/heart.png";
import { IoLibraryOutline } from "react-icons/io5";
import { MdOutlineAddIcCall, MdOutlineMessage, MdWork } from "react-icons/md";
import { FaRegHeart, FaUserGraduate } from "react-icons/fa";
import { HiHomeModern } from "react-icons/hi2";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosMail } from "react-icons/io";
import { useQuery } from "@tanstack/react-query";
import usePublicAxios from "../../Hooks/usePublicAxios";

const UserProfile = () => {
  const { user: myData, loading: userLoading } = useUser();
  const { peoples, isLoading: peopleLoading } = usePeople();
  const { userId } = useParams();
  const axiosPublic = usePublicAxios();
  const token = localStorage.getItem("token");
  const [expandedPosts, setExpandedPosts] = useState({});
  const [isUserFound, setIsUserFound] = useState(false);
  const [userAt, setUserAt] = useState(null);

  const toggleExpand = (id) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const {
    data,
    isLoading: postLoading,
    refetch: postRefetch,
  } = useQuery({
    queryKey: ["postsData"],
    queryFn: () =>
      axiosPublic.get("/opinion/posts").then((res) => res.data.data),
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (peoples && userId) {
      const foundUser = peoples.find((people) => people._id === userId);
      if (foundUser) {
        setUserAt(foundUser);
        setIsUserFound(true);
      }
    }
  }, [peoples, userId]);

  const handlePostLike = async (postId) => {
    try {
      const response = await axiosPublic.post(
        "/opinion/like",
        { postId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        postRefetch();
      } else {
        toast.error("Failed to like the post:", response.data.error);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleUnlike = async (postId) => {
    try {
      const response = await axiosPublic.post(
        "/opinion/unlike",
        { postId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        postRefetch();
      } else {
        toast.error("Failed to unlike the post:", response.data.error);
      }
    } catch (error) {
      console.error("Error unliking post:", error);
    }
  };

  if (peopleLoading || postLoading || userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!isUserFound || !userAt) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  const post = data.filter((perPost) => perPost.userId === userId);
  return (
    <div>
      <Navbar />
      <div className="max-w-[1120px] mx-auto">
        <div className="bg-gray-50 p-2 pb-4 rounded-xl mt-2">
          <div className="w-full h-[160px] lg:h-[350px] lg:mt-2 relative">
            <img
              className="w-full h-full object-cover object-center rounded-t-xl lg:rounded-xl"
              src={
                userAt?.coverImage ||
                "https://i.ibb.co.com/N7cd8Rc/freepik-expand-75906.png"
              }
              alt="Update a Cover Photo"
            />
          </div>
          <div className="flex justify-between flex-col lg:flex-row lg:items-end">
            <div className="flex items-center gap-4">
              <div className="relative w-[100px] h-[100px] lg:w-[180px] mt-[-30px] lg:ml-[60px] lg:h-[180px] border-4 border-white rounded-full">
                <img
                  src={
                    userAt?.profileImage ||
                    "https://i.ibb.co/mcL9L2t/f10ff70a7155e5ab666bcdd1b45b726d.jpg"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h1 className="text-lg lg:text-3xl font-semibold">
                  {userAt?.name}
                </h1>
                <p className="lg:text-lg text-slate-400">
                  {myData.friends.includes(userId) ? "Your Friend" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center lg:gap-4 justify-between mt-4 lg:mb-5">
              <Link
                to={`/library/${userId}`}
                className="btn bg-white shadow-sm"
              >
                <span className="lg:text-2xl">
                  <IoLibraryOutline />
                </span>
                <span className="text-sm"> Library</span>
              </Link>
              <Link to={`/chats/${userId}`} className="btn bg-white shadow-sm">
                <span className="lg:text-2xl">
                  <MdOutlineMessage />
                </span>
                <span className="text-sm">Message</span>
              </Link>
              <button className="btn bg-white shadow-sm">
                <span className="lg:text-2xl">
                  <MdOutlineAddIcCall />
                </span>
                <span className="text-sm">Call</span>
              </button>
              <button className="btn lg:text-xl bg-white shadow-sm">
                <HiOutlineDotsHorizontal />
              </button>
            </div>
          </div>
        </div>
        <div className="lg:grid lg:grid-cols-5 mt-2 gap-4">
          <div className="col-span-2 lg:sticky lg:top-0 mb-5 lg:h-fit">
            <div className="bg-gray-50 p-3 rounded-xl">
              <h1 className="text-lg lg:text-2xl font-medium py-1 lg:py-2 mb-2 border-b-2">
                About
              </h1>
              <div>
                <ul className="space-y-5">
                  {userAt?.work && (
                    <li className="flex items-center gap-2">
                      <span className="text-2xl lg:text-3xl text-gray-400">
                        <MdWork />
                      </span>
                      <span className="text-sm">Works at</span>
                      <span className="text-sm lg:text-base font-medium text-gray-700">
                        {userAt.work}
                      </span>
                    </li>
                  )}
                  {userAt.studies && (
                    <li className="flex items-center gap-2">
                      <span className="text-2xl lg:text-[28px] text-gray-400">
                        <FaUserGraduate />
                      </span>
                      <span className="text-sm">Studies at</span>
                      <span className="text-sm lg:text-base font-medium text-gray-700">
                        {userAt.studies}
                      </span>
                    </li>
                  )}
                  {userAt.currentCity && (
                    <li className="flex items-center gap-2">
                      <span className="text-2xl lg:text-[28px] text-gray-400">
                        <HiHomeModern />
                      </span>
                      <span className="text-sm">Lives in</span>
                      <span className="text-sm lg:text-base font-medium text-gray-700">
                        {userAt.currentCity}
                      </span>
                    </li>
                  )}
                  {userAt.hometown && (
                    <li className="flex items-center gap-2">
                      <span className="text-2xl lg:text-[28px] text-gray-400">
                        <FaLocationDot />
                      </span>
                      <span className="text-sm">From</span>
                      <span className="text-sm lg:text-base font-medium text-gray-700">
                        {userAt.hometown}
                      </span>
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <span className="text-2xl lg:text-[28px] text-gray-400">
                      <IoIosMail />
                    </span>
                    <span className="text-sm">Email</span>
                    <span className="text-sm lg:text-base font-medium text-gray-700">
                      {userAt.email}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* POSTS SECTION */}
          <div className="col-span-3 space-y-8 lg:overflow-y-auto lg:h-[calc(100vh-100px)]">
            {post.length > 0 ? (
              post.slice().reverse().map((perPost) => (
                  <div
                    key={perPost._id}
                    className="card bg-gray-50 shadow-sm rounded-md"
                  >
                    <div className="card-body p-4">
                      <Link className="flex items-center gap-3 border-b-2 pb-2 lg:pb-3 shadow-sm px-3">
                        <div className="lg:w-[60px] w-[50px] h-[50px] lg:h-[60px]">
                          <img
                            className="w-full h-full rounded-full object-cover"
                            src={perPost.userProfileImage}
                            alt=""
                          />
                        </div>
                        <div>
                          <h1 className="text-lg lg:text-xl font-medium">
                            {perPost.userName}
                          </h1>
                          <p className="text-xs text-slate-400 lg:text-sm">{`${
                            perPost.date
                          } at ${
                            perPost.time.slice(0, -6) + perPost.time.slice(-3)
                          }`}</p>
                        </div>
                      </Link>
                      <pre
                        style={{
                          fontFamily: "inherit",
                          fontSize: "1rem",
                          whiteSpace: "pre-wrap",
                          wordWrap: "break-word",
                        }}
                        className="text-xs text-slate-700 lg:text-base w-fit"
                        onClick={() => toggleExpand(post._id)}
                      >
                        {expandedPosts[perPost._id]
                          ? perPost.description
                          : `${perPost.description.slice(0, 210)}...`}
                      </pre>
                    </div>
                    {perPost.image && (
                      <figure className="w-full h-full lg:overflow-hidden flex justify-center items-center bg-gray-100">
                        <img
                          className="w-full h-full object-cover"
                          src={perPost.image}
                        />
                      </figure>
                    )}

                    <div className="p-5 flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        {myData && perPost.likedBy?.includes(myData.id) ? (
                          <img
                            onClick={() => handleUnlike(perPost._id)}
                            className="w-8 lg:w-10 mr-2 cursor-pointer"
                            src={heartfill}
                            alt=""
                          />
                        ) : (
                          <h1
                            onClick={() => handlePostLike(perPost._id)}
                            className="cursor-pointer text-[32px] mr-2"
                          >
                            <FaRegHeart />
                          </h1>
                        )}

                        <p className="text-sm lg:text-lg font-medium">
                          {perPost.likes} Likes
                        </p>
                      </div>
                      <div className="flex items-center gap-1 cursor-pointer">
                        <p className="text-sm lg:text-lg font-medium">Share</p>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div>No posts available.</div>
            )}
          </div>
        </div>
      </div>
      <div className=" mt-10"><DownNav/></div>
    </div>
  );
};

export default UserProfile;
