import React, { useState } from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
import useUser from "../../Hooks/useUser";
import usePublicAxios from "../../Hooks/usePublicAxios";
import DownNav from "../DownNav/DownNav";
import Navbar from "../Navbar/Navbar";
import { Link, NavLink, Outlet } from "react-router";
import { FaCodePullRequest } from "react-icons/fa6";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";

const MyOnindoLibrary = () => {
  const { user, loading } = useUser();
  const IMG_BB_API_KEY = import.meta.env.VITE_IMAGE_HOSTING_KEY;
  const axiosPublic = usePublicAxios();
  const token = localStorage.getItem("token");
  const [bookData, setBookData] = useState({
    bookName: "",
    writer: "",
    details: "",
    image: null,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const options = {
        maxSizeMB: 0.02, // 20 KB max size
        maxWidthOrHeight: 800, // Optional: Set max width or height
        useWebWorker: true, // Optional: Use web worker for compression
      };

      try {
        const compressedFile = await imageCompression(file, options);
        setBookData((prev) => ({ ...prev, image: compressedFile }));
      } catch (error) {
        console.error("Image compression failed:", error);
      }
    }
  };

  const addBook = async (e) => {
    e.preventDefault();
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    // Upload image to ImgBB
    const formData = new FormData();
    formData.append("image", bookData.image);

    try {
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      const imageUrl = data?.data?.url;

      if (imageUrl) {
        const bookAllData = {
          ...bookData,
          imageUrl,
          userId: user.id,
          currentDate: currentDate,
          currentTime: currentTime,
        };
        try {
          await axiosPublic.post(
            "/books/onindo/add",
            { bookAllData },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success("Book Added!");
          window.location.reload();
        } catch (error) {
          console.log(error);
        }
      } else {
        console.error("Image upload failed:", data);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };
  return (
    <div>
      <Navbar />
      <div className=" ">
        <div className=" max-w-[1320px] mx-auto">
          <div className=" flex flex-col lg:flex-row gap-3 mt-2 p-5 rounded-xl bg-gray-50 justify-between border-b-2 pb-2 mb-2 items-center">
            <h1 className=" text-xl lg:text-3xl font-semibold ">
              My Onindo Library
            </h1>
            <div className=" flex items-center gap-2">
              <NavLink
                className={({ isActive, isPending }) =>
                  isActive
                    ? "btn text-sm bg-gray-200"
                    : isPending
                    ? "pending"
                    : "btn text-sm bg-white"
                }
                to={"/my-onindo-library/book-request"}
              >
                <span className="lg:text-lg">
                  <FaCodePullRequest />
                </span>
                Book Request
              </NavLink>
              <button
                onClick={() =>
                  document.getElementById("my_modal_3").showModal()
                }
                className="btn bg-blue-500 text-white text-sm border-2"
              >
                <span className="text-lg lg:text-2xl font-semibold">
                  <IoIosAddCircleOutline />
                </span>
                Add Book
              </button>
            </div>
          </div>
          <div>
            <Outlet />
          </div>
        </div>
        <dialog id="my_modal_3" className="modal">
          <div className="modal-box">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <form onSubmit={addBook}>
              <h3 className="font-medium text-center text-lg">
                Add a Book to Your Library
              </h3>
              <label className="block mb-2 mt-4 text-sm font-normal text-gray-900">
                Add Book Name
              </label>
              <input
                type="text"
                name="bookName"
                value={bookData.bookName}
                onChange={handleInputChange}
                placeholder="Add your Book Name"
                className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs"
              />

              <label className="block mb-2 mt-4 text-sm font-normal text-gray-900">
                Book Writer
              </label>
              <input
                type="text"
                name="writer"
                value={bookData.writer}
                onChange={handleInputChange}
                placeholder="Add your Book Writer"
                className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs"
              />

              <label className="block mb-2 mt-4 text-sm font-normal text-gray-900">
                Sort Details of Book
              </label>
              <textarea
                id="details"
                name="details"
                value={bookData.details}
                onChange={handleInputChange}
                rows="4"
                required
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300"
                placeholder="Write short details about your Book..."
              ></textarea>
              <label className="block mb-2 mt-4 text-sm font-normal text-gray-900">
                Upload your Book Image
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full text-gray-500 font-medium text-sm border-2 bg-gray-100 file:cursor-pointer file:border-0 file:py-2 file:px-4 file:mr-4 file:bg-gray-800 file:hover:bg-gray-700 file:text-white rounded"
              />

              <input
                type="submit"
                value="Add Book"
                className="w-full p-2 mt-4 text-gray-900 border rounded-xl cursor-pointer hover:shadow-lg py-3 bg-gray-50 text-xs"
              />
            </form>
          </div>
        </dialog>
      </div>
      <div className=" mt-10">
        <DownNav />
      </div>
    </div>
  );
};

export default MyOnindoLibrary;
