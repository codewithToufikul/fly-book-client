import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import Categories from "../../Components/Categories/Categories";
import HomeLeft from "../../Components/HomeLeft/HomeLeft";
import usePublicAxios from "../../Hooks/usePublicAxios";
import heartfill from "../../assets/heart.png";
import toast from "react-hot-toast";
import useUser from "../../Hooks/useUser";
import { FaRegHeart, FaFilePdf } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import Linkify from "linkify-react";

const PublicOpinion = () => {
  const { user } = useUser();
  const token = localStorage.getItem("token");
  const axiosPublic = usePublicAxios();
  const [likingPosts, setLikingPosts] = useState({});

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["postsData"],
    queryFn: () =>
      axiosPublic.get("/opinion/posts").then((res) => res.data.data),
  });

  const handlePostLike = async (postId) => {
    try {
      setLikingPosts((prev) => ({ ...prev, [postId]: true }));

      const response = await axiosPublic.post(
        "/opinion/like",
        { postId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Post liked successfully.");
        refetch();
      } else {
        toast.error("Failed to like the post:", response.data.error);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setLikingPosts((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleUnlike = async (postId) => {
    try {
      setLikingPosts((prev) => ({ ...prev, [postId]: true }));

      const response = await axiosPublic.post(
        "/opinion/unlike",
        { postId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Post unlike successfully.");
        refetch();
      } else {
        toast.error("Failed to like the post:", response.data.error);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setLikingPosts((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleUpcoming = () => {
    toast.error("Features Upcoming !");
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  if (isLoading) {
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
      <div className="w-full lg:grid lg:grid-cols-3 mt-5 px-3">
        <div>
          <Categories />
        </div>
        <div className="space-y-5">
          <div className="space-y-5">
            {data
              .slice()
              .reverse()
              .map((post) => {
                return (
                  <div
                    key={post._id}
                    className="card bg-gray-50 shadow-sm rounded-md"
                  >
                    <div className="card-body p-4">
                      <Link
                        to={
                          user.id == post.userId
                            ? `/my-profile`
                            : `/profile/${post.userId}`
                        }
                        className="flex items-center gap-3 border-b-2 pb-2 lg:pb-3 shadow-sm px-3"
                      >
                        <div className="lg:w-[60px] w-[50px] h-[50px] lg:h-[60px]">
                          <img
                            className="w-full h-full rounded-full object-cover"
                            src={post.userProfileImage}
                            alt=""
                          />
                        </div>
                        <div className="">
                          <h1 className="text-lg lg:text-xl font-medium">
                            {post.userName}
                          </h1>
                          <p className="text-xs text-slate-400 lg:text-sm">{`${
                            post.date
                          } at ${
                            post.time.slice(0, -6) + post.time.slice(-3)
                          }`}</p>
                        </div>
                      </Link>
                      
                      {/* Truncated post content */}
                      <div className="text-sm lg:text-lg whitespace-pre-wrap">
                        <span className="block sm:hidden">
                          <Linkify
                            componentDecorator={(
                              decoratedHref,
                              decoratedText,
                              key
                            ) => (
                              <a
                                key={key}
                                href={decoratedHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {decoratedText}
                              </a>
                            )}
                          >
                            {truncateText(post.description, 100)}
                          </Linkify>
                        </span>
                        <span className="hidden sm:block">
                          <Linkify
                            componentDecorator={(
                              decoratedHref,
                              decoratedText,
                              key
                            ) => (
                              <a
                                key={key}
                                href={decoratedHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {decoratedText}
                              </a>
                            )}
                          >
                            {truncateText(post.description, 180)}
                          </Linkify>
                        </span>
                      </div>

                      {/* Read More button */}
                      {post.description.length > 100 && (
                        <Link
                          to={`/opinion-post/${post._id}`}
                          className="text-blue-500 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                        >
                          Read More
                        </Link>
                      )}

                      {post.pdf && (
                        <div className="px-4 py-3 bg-gray-100 mt-2 rounded-md mx-4">
                          <div className="flex items-center gap-2">
                            <FaFilePdf className="text-red-600 text-xl" />
                            <a
                              href={post.pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              View PDF
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {post.image && (
                      <figure className="w-full h-full overflow-hidden flex justify-center items-center bg-gray-100">
                        <img
                          className="w-full h-full object-contain"
                          src={post.image}
                        />
                      </figure>
                    )}

                    <div className="p-5 flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        {likingPosts[post._id] ? (
                          <div className="w-8 lg:w-10 h-8 lg:h-10 mr-2 animate-spin border-2 border-gray-300 border-t-red-500 rounded-full"></div>
                        ) : user && post.likedBy?.includes(user.id) ? (
                          <img
                            onClick={() => handleUnlike(post._id)}
                            className="w-8 lg:w-10 mr-2 cursor-pointer"
                            src={heartfill}
                            alt=""
                          />
                        ) : (
                          <h1
                            onClick={() => handlePostLike(post._id)}
                            className="cursor-pointer text-[32px] mr-2"
                          >
                            <FaRegHeart />
                          </h1>
                        )}

                        <p className="text-sm lg:text-lg font-medium">
                          {post.likes} Likes
                        </p>
                      </div>
                      <div
                        onClick={handleUpcoming}
                        className="flex items-center gap-1 cursor-pointer"
                      >
                        <p className="text-sm lg:text-lg font-medium">Share</p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        <div className="hidden lg:block">
          <HomeLeft />
        </div>
      </div>
      <div className="mt-[50px]">
        <DownNav />
      </div>
    </div>
  );
};

export default PublicOpinion;