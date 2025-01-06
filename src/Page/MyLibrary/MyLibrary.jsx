import React, { useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import useUser from "../../Hooks/useUser";
import { Link, NavLink, Outlet } from "react-router";
import { ImBooks } from "react-icons/im";
import { IoLibraryOutline } from "react-icons/io5";
import { FaCodePullRequest } from "react-icons/fa6";
import { TbArrowsTransferUpDown } from "react-icons/tb";
import { IoIosAddCircleOutline } from "react-icons/io";
import usePublicAxios from "../../Hooks/usePublicAxios";
import toast from "react-hot-toast";
import useAllBook from "../../Hooks/useAllBook";
import { MdOutlineDoNotDisturb } from "react-icons/md";
import { VscGitPullRequestCreate } from "react-icons/vsc";
import imageCompression from "browser-image-compression";

const MyLibrary = () => {
  const { user, loading } = useUser();
const IMG_BB_API_KEY = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const axiosPublic = usePublicAxios();
const token = localStorage.getItem("token");
const [bookData, setBookData] = useState({
  bookName: "",
  writer: "",
  details: "",
  image: null,
  returnTime: "",
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
          "/books/add",
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
      <div className=" max-w-[1320px] mx-auto">
        <div className="drawer mt-1 lg:mt-3">
          <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col">
            {/* Navbar */}
            <div className="navbar bg-gray-100  rounded-md w-full">
              <div className="flex-none lg:hidden">
                <label
                  htmlFor="my-drawer-3"
                  aria-label="open sidebar"
                  className="btn btn-square btn-ghost"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block h-6 w-6 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                  </svg>
                </label>
              </div>
              <div className="lg:flex-1 w-full">
                <Link
                  to={"/my-profile"}
                  className="w-[40px] lg:w-[60px] lg:h-[60px] h-[40px] p-1 border-2 rounded-full border-green-200"
                >
                  <img
                    className="w-full h-full object-cover rounded-full"
                    src={
                      user?.profileImage ||
                      `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png`
                    }
                    alt=""
                  />
                </Link>
                <a className="btn btn-ghost text-lg lg:text-2xl">My Library</a>
              </div>
              <div className="block lg:hidden flex justify-end">
                <button
                  onClick={() =>
                    document.getElementById("my_modal_3").showModal()
                  }
                  className="btn bg-blue-500 text-white border-2"
                >
                  <span className="text-2xl font-semibold">
                    <IoIosAddCircleOutline />
                  </span>
                  Add Book
                </button>
              </div>
              <div className="hidden flex-none lg:block">
                <ul className=" lg:flex w-full grid grid-cols-2 gap-2 px-1">
                  <li className=" flex justify-start">
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive
                          ? "btn bg-gray-50"
                          : isPending
                          ? "pending"
                          : "btn bg-white"
                      }
                      to={"/my-library"}
                    >
                      <span className="text-xl lg:text-2xl">
                        <ImBooks />
                      </span>
                      All Books
                    </NavLink>
                  </li>
                  <li className=" flex justify-end">
                    <Link to={"/my-onindo-library"} className="btn bg-white">
                      <span className="text-xl">
                        <IoLibraryOutline />
                      </span>
                      Onindo Library
                    </Link>
                  </li>
                  <li>
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive
                          ? "btn bg-gray-200"
                          : isPending
                          ? "pending"
                          : "btn bg-white"
                      }
                      to={"/my-library/book-request"}
                    >
                      <span className="text-lg">
                        <FaCodePullRequest />
                      </span>
                      Book Request
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                    className={({ isActive, isPending }) =>
                  isActive
                    ? "btn bg-gray-200"
                    : isPending
                    ? "pending"
                    : "btn bg-white"
                }
                      to={"/my-library/my-request"}
                    >
                      <span className="text-lg">
                        <VscGitPullRequestCreate />
                      </span>
                      My Request
                    </NavLink>
                  </li>
                  <li className=" flex justify-end">
                    <NavLink
                    className={({ isActive, isPending }) =>
                  isActive
                    ? "btn bg-gray-200"
                    : isPending
                    ? "pending"
                    : "btn bg-white"
                }
                      to={"/my-library/transfer-history"}
                    >
                      <span className="text-xl">
                        <TbArrowsTransferUpDown />
                      </span>
                      Transfer List
                    </NavLink>
                  </li>
                  <li className=" flex justify-start">
                    <button className="btn bg-white">
                      <span className="text-xl">
                        <MdOutlineDoNotDisturb />
                      </span>
                      Debt Book
                    </button>
                  </li>
                  <li className="flex justify-end">
                    <button
                      onClick={() =>
                        document.getElementById("my_modal_3").showModal()
                      }
                      className="btn bg-blue-500 text-white border-2"
                    >
                      <span className="text-2xl font-semibold">
                        <IoIosAddCircleOutline />
                      </span>
                      Add Book
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="drawer-side z-50">
            <label
              htmlFor="my-drawer-3"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className=" lg:flex px-1 space-y-3 menu bg-base-200 min-h-full w-72 p-4">
              <li className="">
                <NavLink
                  className={({ isActive, isPending }) =>
                  isActive
                    ? "btn flex justify-start bg-gray-200"
                    : isPending
                    ? "pending"
                    : "btn flex justify-start bg-white"
                }
                  to={"/my-library"}
                >
                  <span className="text-xl lg:text-2xl">
                    <ImBooks />
                  </span>
                  All Books
                </NavLink>
              </li>
              <li className="">
                <NavLink
                className={({ isActive, isPending }) =>
                  isActive
                    ? "btn flex justify-start bg-gray-200"
                    : isPending
                    ? "pending"
                    : "btn flex justify-start bg-white"
                }
                  to={"/my-onindo-library"}
                >
                  <span className="text-xl">
                    <IoLibraryOutline />
                  </span>
                  Onindo Library
                </NavLink>
              </li>
              <li>
                <NavLink
                className={({ isActive, isPending }) =>
                  isActive
                    ? "btn flex justify-start bg-gray-200"
                    : isPending
                    ? "pending"
                    : "btn flex justify-start bg-white"
                }
                  to={"/my-library/book-request"}
                >
                  <span className="text-lg">
                    <FaCodePullRequest />
                  </span>
                  Book Request
                </NavLink>
              </li>
              <li>
                <NavLink
                className={({ isActive, isPending }) =>
                  isActive
                    ? "btn flex justify-start bg-gray-200"
                    : isPending
                    ? "pending"
                    : "btn flex justify-start bg-white"
                }
                  to={"/my-library/my-request"}
                >
                  <span className="text-lg">
                    <VscGitPullRequestCreate />
                  </span>
                  My Request
                </NavLink>
              </li>
              <li className="">
                <NavLink
                className={({ isActive, isPending }) =>
                  isActive
                    ? "btn flex justify-start bg-gray-200"
                    : isPending
                    ? "pending"
                    : "btn flex justify-start bg-white"
                }
                  to={"/my-library/transfer-history"}
                >
                  <span className="text-xl">
                    <TbArrowsTransferUpDown />
                  </span>
                  Transfer List
                </NavLink>
              </li>
              <li className="">
                <button className="btn flex justify-start bg-white">
                  <span className="text-xl">
                    <MdOutlineDoNotDisturb />
                  </span>
                  Debt Book
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div>
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
                  Select return Time
                </label>
                <select
                  name="returnTime" // Add the name attribute for identification
                  value={bookData.returnTime || ""} // Bind the value to `bookData.returnTime`
                  onChange={handleInputChange} // Call the handleInputChange method
                  className="select select-bordered select-sm w-full "
                >
                  <option disabled selected>
                    select time
                  </option>
                  <option>3 days</option>
                  <option>7 days</option>
                  <option>15 days</option>
                  <option>30 days</option>
                </select>
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
          <div>
            <Outlet />
          </div>
        </div>
      </div>
      <div className="mt-10">
        <DownNav />
      </div>
    </div>
  );
};

export default MyLibrary;
