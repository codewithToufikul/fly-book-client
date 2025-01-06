import React from "react";
import { FaCodePullRequest } from "react-icons/fa6";
import { ImBooks } from "react-icons/im";
import { IoLibraryOutline, IoPeopleSharp } from "react-icons/io5";
import { MdOutlineDoNotDisturb } from "react-icons/md";
import { TbArrowsTransferUpDown, TbBooks } from "react-icons/tb";
import { VscGitPullRequestCreate } from "react-icons/vsc";
import { Link, NavLink, Outlet } from "react-router";
import logo from "../../assets/logo.png";
import { TiThMenuOutline } from "react-icons/ti";
import { BsFilePost } from "react-icons/bs";
import { FaHome } from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";


const AdminDashBoard = () => {
  return (
    <div>
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <div className=" w-full flex justify-end bg-gray-100">
            <label
              htmlFor="my-drawer-2"
              className="btn text-2xl drawer-button lg:hidden"
            >
              <TiThMenuOutline />
            </label>
          </div>
          <div className=" w-full">
            <Outlet/>
          </div>
        </div>
        <div className="drawer-side z-50">
          <label
            htmlFor="my-drawer-2"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="px-1 space-y-3 menu bg-base-200 min-h-full w-72 p-4">
            <Link to={'/dashboard'} className=" flex justify-center ">
              <img className=" w-24 lg:w-36" src={logo} alt="" />
            </Link>
            <li className="">
              <NavLink
                className={({ isActive, isPending }) =>
                  isActive
                    ? "btn flex justify-start bg-gray-200"
                    : isPending
                    ? "pending"
                    : "btn flex justify-start bg-white"
                }
                to={"/dashboard/add-post"}
              >
                <span className="text-xl lg:text-2xl">
                <IoMdAddCircleOutline />
                </span>
                Add Post
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
                to={"/dashboard/all-users"}
              >
                <span className="text-xl lg:text-2xl">
                  <IoPeopleSharp />
                </span>
                All User
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
                to={"/dashboard/all-opinion"}
              >
                <span className="text-xl">
                  <BsFilePost />
                </span>
                All Opinion Posts
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
                to={"/dashboard/all-books"}
              >
                <span className="text-lg">
                  <TbBooks />
                </span>
                All Books
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
                to={"/dashboard/transfer-history"}
              >
                <span className="text-lg">
                  <VscGitPullRequestCreate />
                </span>
                Books Transfer History
              </NavLink>
            </li>
            <li className=" mt-5 border-t-2 pt-3">
              <Link
                to={"/"}
                className="btn flex justify-start text-white bg-blue-400"
              >
                <span className="text-xl">
                  <FaHome />
                </span>
                Go Home
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashBoard;
