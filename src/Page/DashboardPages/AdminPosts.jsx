import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin2Fill } from "react-icons/ri";
import Swal from "sweetalert2";
import usePublicAxios from "../../Hooks/usePublicAxios";
import toast from "react-hot-toast";

const AdminPosts = () => {
  const [expandedPosts, setExpandedPosts] = useState({});
  const [selectedPost, setSelectedPost] = useState(null); // নির্বাচিত পোস্ট
  const [currentPostId, setCurrentPostId] = useState(null); // বর্তমানে এডিট হওয়া পোস্ট ID
  const axiosPublic = usePublicAxios();

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["adminPostData"],
    queryFn: () =>
      fetch("http://localhost:3000/all-home-books").then((res) => res.json()),
  });

  const toggleExpand = (id) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleEdit = (post) => {
    setSelectedPost(post); // নির্বাচিত পোস্ট সেট করুন
    setCurrentPostId(post._id); // বর্তমান পোস্ট ID সেট করুন
    document.getElementById("my_modal_3").showModal(); // মডাল খুলুন
  };

  const handleDelete = async (postId) => {
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
          const res = await axiosPublic.delete(`/admin-post-delete/${postId}`);
          if (res.data.success) {
            Swal.fire({
              title: "Removed!",
              text: "Post has been removed!",
              icon: "success",
            });
            refetch();
          }
        } catch (error) {
          console.log(error);
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = {
      title: document.getElementById("title").value,
      message: document.getElementById("message").value,
    };
    try {
      const res = await axiosPublic.put(`/admin-post-edit/${currentPostId}`, updatedData);
      if (res.data.success) {
        toast.success("Post updated successfully!");
        refetch(); // ডেটা রিফ্রেশ করুন
        document.getElementById("my_modal_3").close();
        setSelectedPost(null)
      }
    } catch (error) {
      console.error("Error updating post:", error);
    }
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
    <div className="space-y-5 mt-10 px-2 lg:mt-5 max-w-[600px] mx-auto">
      {data.length === 0 ? (
        <p className="text-center text-gray-500">No posts in this category.</p>
      ) : (
        data
          .slice()
          .reverse()
          .map((post) => (
            <div key={post._id} className="card bg-gray-50 shadow-sm rounded-md">
              <div className="card-body p-4">
                <h2 className="card-title text-xl lg:text-3xl">{post.title}</h2>
                <p
                  className="text-sm lg:text-lg whitespace-pre-wrap"
                  onClick={() => toggleExpand(post._id)}
                >
                  {expandedPosts[post._id] ? (
                    post.message
                  ) : (
                    <>
                      <span className="block sm:hidden">
                        {post.message.slice(0, 100)}...
                      </span>
                      <span className="hidden sm:block">
                        {post.message.slice(0, 180)}...
                      </span>
                    </>
                  )}
                </p>
              </div>
              <figure className="w-full">
                <img
                  className="h-[200px] lg:h-[300px] w-full"
                  src={post.image}
                  alt={post.title}
                />
              </figure>
              <div className="p-5 flex justify-between items-center">
                <button
                  className="flex items-center gap-1"
                  onClick={() => handleEdit(post)}
                >
                  <p className="text-xl lg:text-2xl text-blue-600">
                    <FaRegEdit />
                  </p>
                  <p>Edit</p>
                </button>
                <div
                  onClick={() => handleDelete(post._id)}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <p className="text-xl lg:text-2xl text-red-600">
                    <RiDeleteBin2Fill />
                  </p>
                  <p className="text-sm lg:text-lg font-medium">Delete</p>
                </div>
              </div>
            </div>
          ))
      )}

      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button onClick={() => { setSelectedPost(null) }} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          {selectedPost ? (
            <div className="rounded-lg lg:p-8 shadow-lg lg:col-span-3 p-2">
              <h1 className="text-xl text-center">Edit Post</h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="lg:text-lg font-medium">Post Title</label>
                  <input
                    className="w-full border-2 rounded-lg border-gray-200 p-3 text-sm"
                    placeholder="Title"
                    type="text"
                    id="title"
                    defaultValue={selectedPost.title}
                  />
                </div>
                <div>
                  <label className="lg:text-lg font-medium">Description</label>
                  <textarea
                    className="w-full border-2 rounded-lg border-gray-200 p-3 text-sm"
                    placeholder="Description"
                    rows="8"
                    id="message"
                    defaultValue={selectedPost.message}
                  ></textarea>
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    className="inline-block w-full rounded-lg bg-gray-500 px-5 py-3 font-medium text-white sm:w-auto"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </dialog>
    </div>
  );
};

export default AdminPosts;
