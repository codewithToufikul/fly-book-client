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
import toast from "react-hot-toast";
import loadingLogo from "../../assets/load.webp"
import organization from "../../assets/partners.png"
import near from "../../assets/near.png"

const Categories = () => {
  const { user, loading: isLoading, refetch } = useUser();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className=" flex flex-col min-h-screen justify-center block lg:hidden items-center">
        <div className=" w-[100px] lg:w-[200px]">
          <img className=" w-full " src={loadingLogo} alt="" />
        </div>
        <span className="loading loading-dots loading-lg"></span>
      </div>
    );
  }
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("notify");
    refetch();
  };

  const handleUpcoming = () => {
    toast.error("Features Upcoming !");
  };

  return (
    <div className="max-h-[calc(100vh-110px)] sticky top-[100px] z-40 ">
      <div className="  hidden lg:block">
        {user ? (
          <Link to={"/my-profile"} className=" flex items-center space-x-4">
            <div className="w-[45px] h-[45px] p-1 border-2 rounded-full border-green-200">
              <img
                className=" w-full h-full object-cover rounded-full"
                src={
                  user?.profileImage ||
                  `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png`
                }
                alt=""
              />
            </div>
            <h1 className=" text-xl font-semibold">
              {user ? user.name : "your profile"}
            </h1>
          </Link>
        ) : (
          <Link
            to={"/login"}
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
              className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-2 cursor-pointer"
            >
              <div className=" w-7 ">
                <img className=" w-full" src={fnds} alt="" />
              </div>
              <h2 className=" text-base font-medium">Friends</h2>
            </Link>
          </li>
          <li>
            <Link
              to={"my-library"}
              className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer"
            >
              <div className=" w-7 ">
                <img className=" w-full" src={library} alt="" />
              </div>
              <h2 className=" text-base font-medium">Library</h2>
            </Link>
          </li>
          <li onClick={handleUpcoming}>
            <div className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
              <div className=" w-7 ">
                <img className=" w-full" src={group} alt="" />
              </div>
              <h2 className=" text-base font-medium">Groups</h2>
            </div>
          </li>
          <li>
            <Link
              to={"https://bookoffen.com/"}
              className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer"
            >
              <div className=" w-7 ">
                <img className=" w-full" src={market} alt="" />
              </div>
              <h2 className=" text-base font-medium">Market Place</h2>
            </Link>
          </li>
          <li>
            <Link
              to={"/nearby-friends"}
              className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer"
            >
              <div className=" w-7 ">
                <img className=" w-full" src={near} alt="" />
              </div>
              <h2 className=" text-base font-medium">Nearby Books</h2>
            </Link>
          </li>
          <Link to={'/e-learning'}>
            <div className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
              <div className=" w-7 ">
                <img className=" w-full" src={elng} alt="" />
              </div>
              <h2 className=" text-base font-medium">E-Learning</h2>
            </div>
          </Link>
          <Link to={'/channels'}>
            <div className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
              <div className=" w-7 ">
                <img className=" w-full" src={channel} alt="" />
              </div>
              <h2 className=" text-base font-medium">Channels</h2>
            </div>
          </Link>
          <Link to={'/audio-book'}>
            <div className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
              <div className=" w-7 ">
                <img className=" w-full" src={audioBook} alt="" />
              </div>
              <h2 className=" text-base font-medium">Audio Book</h2>
            </div>
          </Link>
          <li onClick={handleUpcoming}>
            <div className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
              <div className=" w-7 ">
                <img className=" w-full" src={donetBook} alt="" />
              </div>
              <h2 className=" text-base font-medium">Donate Your Book</h2>
            </div>
          </li>
          <li>
            <Link
              to={"/organizations"}
              className=" flex items-center gap-3 hover:bg-gray-200 w-[400px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer"
            >
              <div className=" w-7 ">
                <img className=" w-full" src={organization} alt="" />
              </div>
              <h2 className=" text-base font-medium">Unlocking your potential with-</h2>
            </Link>
          </li>
          <li onClick={handleUpcoming}>
            <div className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
              <div className=" w-7 ">
                <img className=" w-full" src={breach} alt="" />
              </div>
              <h2 className=" text-base font-medium">Breach of Contract</h2>
            </div>
          </li>
          <li onClick={handleUpcoming}>
            <div className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
              <div className=" w-7 ">
                <img className=" w-full" src={settings} alt="" />
              </div>
              <h2 className=" text-base font-medium">Settings</h2>
            </div>
          </li>
          <li>
            <Link
              to={"/contact-us"}
              className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer"
            >
              <div className=" w-7 ">
                <img className=" w-full" src={help} alt="" />
              </div>
              <h2 className=" text-base font-medium">Contact Us</h2>
            </Link>
          </li>
          <li onClick={handleLogout}>
            <div className=" flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
              <div className=" w-7 ">
                <img className=" w-full" src={logout} alt="" />
              </div>
              <h2 className=" text-base font-medium">Log Out</h2>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Categories;
