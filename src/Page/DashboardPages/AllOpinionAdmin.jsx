import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import usePublicAxios from "../../Hooks/usePublicAxios";
import { Link } from "react-router";
import { FaRegHeart } from "react-icons/fa";
import useUser from "../../Hooks/useUser";
import Swal from "sweetalert2";

const AllOpinionAdmin = () => {
  const { user, loading: userLoading,} = useUser();
  const axiosPublic = usePublicAxios();
  const [expandedPosts, setExpandedPosts] = useState({});

  const toggleExpand = (id) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["postsData"], // Unique key for the query
    queryFn: () =>
      axiosPublic.get("/opinion/posts").then((res) => res.data.data), // Use res.data.data for success response
  });
  if (isLoading || userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }
  const handleRemovePost = async(postId)=>{
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const res = await axiosPublic.delete(`/post/delete/${postId}`);
            if (res.data.success) {
              Swal.fire({
                title: "Removed!",
                text: "Post has been removed!.",
                icon: "success",
              });
              refetch();
            }
          } catch (error) {
            console.log(error);
          }
        }
      });
  }
  return (
    <div>
      <h1 className=" sticky top-0 z-[1] py-2 bg-gray-100 mb-5 text-xl lg:text-3xl font-semibold text-center">
        All Opinion Posts
      </h1>
      <div className=" flex justify-center">
        <div className=" lg:w-[500px] space-y-5">
          {data
            .slice()
            .reverse()
            .map((post) => {
              return (
                // Add the return keyword here
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
                      className=" flex items-center gap-3 border-b-2 pb-2 lg:pb-3 shadow-sm px-3"
                    >
                      <div className=" lg:w-[60px] w-[50px] h-[50px] lg:h-[60px] ">
                        <img
                          className=" w-full h-full rounded-full object-cover "
                          src={post.userProfileImage}
                          alt=""
                        />
                      </div>
                      <div className="">
                        <h1 className=" text-lg lg:text-xl font-medium">
                          {post.userName}
                        </h1>
                        <p className=" text-xs text-slate-400 lg:text-sm">{`${
                          post.date
                        } at ${
                          post.time.slice(0, -6) + post.time.slice(-3)
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
                      className="text-sm lg:text-base w-fit"
                      onClick={() => toggleExpand(post._id)}
                    >
                      {expandedPosts[post._id] ? (
                        post.description
                      ) : (
                        <>
                          <span className="block sm:hidden">
                            {post.description.slice(0, 140)}...
                          </span>
                          <span className="hidden sm:block">
                            {post.description.slice(0, 220)}...
                          </span>
                        </>
                      )}
                    </pre>
                  </div>
                  {post.image && (
                    <figure className="w-full h-full overflow-hidden flex justify-center items-center bg-gray-100">
                      <img
                        className="w-full h-full object-cover"
                        src={post.image}
                      />
                    </figure>
                  )}

                  <div className="py-2 flex justify-center items-center">
                    <button onClick={()=>handleRemovePost(post._id)} className=" btn text-white btn-error">Remove Post</button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default AllOpinionAdmin;
