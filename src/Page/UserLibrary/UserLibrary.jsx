import React from "react";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import { Link, Outlet, useParams } from "react-router";
import useAllBook from "../../Hooks/useAllBook";
import useUser from "../../Hooks/useUser";
import usePeople from "../../Hooks/usePeople";
import { ImBooks } from "react-icons/im";
import { IoLibraryOutline } from "react-icons/io5";
import { FaCodePullRequest } from "react-icons/fa6";
import { TbArrowsTransferUpDown } from "react-icons/tb";
import { IoIosAddCircleOutline } from "react-icons/io";

const UserLibrary = () => {
  const { userId } = useParams();
  const { peoples, isLoading: peopleLoad } = usePeople();
  if (peopleLoad) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }
  const libraryUser = peoples.find((people) => people._id === userId);
  return (
    <div>
      <Navbar />
      <div className=" max-w-[1220px] mx-auto">
        <div>
          <div className="navbar flex-col lg:flex-row bg-base-200 rounded-md mt-3">
            <Link to={`/profile/${userId}`} className="flex-1">
              <div
                className="w-[40px] lg:w-[60px] lg:h-[60px] h-[40px] p-1 border-2 rounded-full border-green-200"
              >
                <img
                  className="w-full h-full object-cover rounded-full"
                  src={
                    libraryUser?.profileImage ||
                    `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png`
                  }
                  alt=""
                />
              </div>
              <a className="text-2xl font-semibold ml-2">{libraryUser.name.split(" ")[0]}`s Library</a>
            </Link>
            <div className="flex-none mt-3 lg:mt-0">
              <ul className=" lg:flex grid grid-cols-2 gap-2 px-1">
                <li className=" flex justify-start">
                  <Link to={`/library/${userId}`} className="btn bg-white">
                    <span className="text-xl lg:text-2xl">
                      <ImBooks />
                    </span>
                    All Books
                  </Link>
                </li>
                <li className=" flex justify-end">
                  <Link to={`/library/${userId}/onindo`} className="btn bg-white">
                    <span className="text-xl">
                      <IoLibraryOutline />
                    </span>
                    Onindo Library
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div>
            <Outlet/>
        </div>
      </div>
      <div className=" mt-10">
        <DownNav />
      </div>
    </div>
  );
};

export default UserLibrary;
