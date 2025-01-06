import fnds from "../../assets/friends.png";
import library from "../../assets/books.png";
import group from "../../assets/user.png";
import market from "../../assets/store.png";
import elng from "../../assets/elearning.png";
import channel from "../../assets/live-channel.png";
import audioBook from "../../assets/audio-book.png";
import donetBook from "../../assets/book.png";
import breach from "../../assets/cyber-attack.png";
import settings from "../../assets/setting.png";
import help from "../../assets/customer-service.png";
import logout from "../../assets/logout.png";
import useUser from "../../Hooks/useUser";
import { Link, useNavigate } from "react-router";

const Categories = () => {
  const { user, loading, refetch } = useUser();
  const navigate = useNavigate();

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
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("notify")
    refetch();
  };

  return (
    <div className=" sticky top-[110px] z-40 hidden lg:block">
      {user ? (
        <Link to={"/my-profile"} className=" flex items-center space-x-4">
          <div className="w-[50px] h-[50px] p-1 border-2 rounded-full border-green-200">
            <img
              className=" w-full h-full object-cover rounded-full"
              src={
                user?.profileImage ||
                `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png`
              }
              alt=""
            />
          </div>
          <h1 className=" text-2xl font-semibold">
            {user ? user.name : "your profile"}
          </h1>
        </Link>
      ) : (
        <Link to={'/login'}
          type="button"
          className="text-white pb-3 bg-gradient-to-r ml-5 from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br  shadow-lg shadow-cyan-500/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          Login Now
        </Link>
      )}
      <ul className=" mt-3">
        <li>
          <Link
            to={"/peoples"}
            className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer"
          >
            <div className=" w-8 ">
              <img className=" w-full" src={fnds} alt="" />
            </div>
            <h2 className=" text-lg font-medium">Friends</h2>
          </Link>
        </li>
        <li>
          <div className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
            <div className=" w-8 ">
              <img className=" w-full" src={library} alt="" />
            </div>
            <h2 className=" text-lg font-medium">Library</h2>
          </div>
        </li>
        <li>
          <div className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
            <div className=" w-8 ">
              <img className=" w-full" src={group} alt="" />
            </div>
            <h2 className=" text-lg font-medium">Groups</h2>
          </div>
        </li>
        <li>
          <div className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
            <div className=" w-8 ">
              <img className=" w-full" src={market} alt="" />
            </div>
            <h2 className=" text-lg font-medium">Market Place</h2>
          </div>
        </li>
        <li>
          <div className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
            <div className=" w-8 ">
              <img className=" w-full" src={elng} alt="" />
            </div>
            <h2 className=" text-lg font-medium">E-Learning</h2>
          </div>
        </li>
        <li>
          <div className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
            <div className=" w-8 ">
              <img className=" w-full" src={channel} alt="" />
            </div>
            <h2 className=" text-lg font-medium">Channels</h2>
          </div>
        </li>
        <li>
          <div className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
            <div className=" w-8 ">
              <img className=" w-full" src={audioBook} alt="" />
            </div>
            <h2 className=" text-lg font-medium">Audio Book</h2>
          </div>
        </li>
        <li>
          <div className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
            <div className=" w-8 ">
              <img className=" w-full" src={donetBook} alt="" />
            </div>
            <h2 className=" text-lg font-medium">Donate Your Book</h2>
          </div>
        </li>
        <li>
          <div className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
            <div className=" w-8 ">
              <img className=" w-full" src={breach} alt="" />
            </div>
            <h2 className=" text-lg font-medium">Breach of Contract</h2>
          </div>
        </li>
        <li>
          <div className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
            <div className=" w-8 ">
              <img className=" w-full" src={settings} alt="" />
            </div>
            <h2 className=" text-lg font-medium">Settings</h2>
          </div>
        </li>
        <li>
          <div className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
            <div className=" w-8 ">
              <img className=" w-full" src={help} alt="" />
            </div>
            <h2 className=" text-lg font-medium">Help Center</h2>
          </div>
        </li>
        <li onClick={handleLogout}>
          <div className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
            <div className=" w-8 ">
              <img className=" w-full" src={logout} alt="" />
            </div>
            <h2 className=" text-lg font-medium">Log Out</h2>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Categories;
