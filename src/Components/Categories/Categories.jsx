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
import { useQueryClient } from "@tanstack/react-query";
import loadingLogo from "../../assets/load.webp";
import organization from "../../assets/partners.png";
import near from "../../assets/near.png";
import about from "../../assets/information.png";
import disclaimer from "../../assets/disclaimer.png";
import pricacy from "../../assets/protection.png";
import terms from "../../assets/terms-and-conditions.png";
import socialres from "../../assets/social-worker.png"
import jobs from "../../assets/job-search.png"
const Categories = () => {
  const { user, loading: isLoading, refetch } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    // Clear all localStorage data
    localStorage.clear();

    // Clear React Query cache
    queryClient.clear();

    // Navigate to login
    navigate("/login");

    // Force reload to ensure complete state reset
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleUpcoming = () => {
    toast.error("Features Upcoming !");
  };

  return (
    <div className="max-h-[calc(100vh-110px)] sticky top-[100px] z-40 overflow-y-auto">
      <div className="hidden lg:block">
        {user ? (
          <Link to={"/my-profile"} className="flex items-center space-x-4 mb-3">
            <div className="w-[45px] h-[45px] p-1 border-2 rounded-full border-green-200">
              <img
                className="w-full h-full object-cover rounded-full"
                src={
                  user?.profileImage ||
                  `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png`
                }
                alt=""
              />
            </div>
            <h1 className="text-xl font-semibold">
              {user ? user.name : "your profile"}
            </h1>
          </Link>
        ) : (
          <Link
            to={"/login"}
            type="button"
            className="text-white pb-3 mb-3 bg-gradient-to-r ml-5 from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br shadow-lg shadow-cyan-500/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-block"
          >
            Login Now
          </Link>
        )}

        <div className="overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
          <ul className="space-y-1">
            <li>
              <Link
                to={"/peoples"}
                className="flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-2 cursor-pointer"
              >
                <div className="w-7">
                  <img className="w-full" src={fnds} alt="" />
                </div>
                <h2 className="text-base font-medium">Friends</h2>
              </Link>
            </li>
            <li>
              <Link
                to={"my-library"}
                className="flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer"
              >
                <div className="w-7">
                  <img className="w-full" src={library} alt="" />
                </div>
                <h2 className="text-base font-medium">Library</h2>
              </Link>
            </li>
            <Link to={"/community"}>
              <div className="flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
                <div className="w-7">
                  <img className="w-full" src={group} alt="" />
                </div>
                <h2 className="text-base font-medium">Community</h2>
              </div>
            </Link>
            <li>
              <Link
                to={"/marketplace"}
                className="flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer"
              >
                <div className="w-7">
                  <img className="w-full" src={market} alt="" />
                </div>
                <h2 className="text-base font-medium">Market Place</h2>
              </Link>
            </li>
            <li>
              <Link
                to={"/nearby-books"}
                className="flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer"
              >
                <div className="w-7">
                  <img className="w-full" src={near} alt="" />
                </div>
                <h2 className="text-base font-medium">Nearby Books</h2>
              </Link>
            </li>
            <li>
              <Link
                to={"/e-learning"}
                className="flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer"
              >
                <div className="w-7">
                  <img className="w-full" src={elng} alt="" />
                </div>
                <h2 className="text-base font-medium">E-Learning</h2>
              </Link>
            </li>
            <li>
              <Link
                to={"/channels"}
                className="flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer"
              >
                <div className="w-7">
                  <img className="w-full" src={channel} alt="" />
                </div>
                <h2 className="text-base font-medium">Channels</h2>
              </Link>
            </li>
            <li>
              <Link
                to={"/social-responsibility"}
                className="flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer"
              >
                <div className="w-7">
                  <img className="w-full" src={socialres} alt="" />
                </div>
                <h2 className="text-base font-medium">Social Responsibility</h2>
              </Link>
            </li>
            <li>
              <Link
                to={"/jobs"}
                className="flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer"
              >
                <div className="w-7">
                  <img className="w-full" src={jobs} alt="" />
                </div>
                <h2 className="text-base font-medium">Jobs</h2>
              </Link>
            </li>
            <li>
              <Link
                to={"/audio-book"}
                className="flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer"
              >
                <div className="w-7">
                  <img className="w-full" src={audioBook} alt="" />
                </div>
                <h2 className="text-base font-medium">Audio Book</h2>
              </Link>
            </li>
            <li onClick={handleUpcoming}>
              <div className="flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
                <div className="w-7">
                  <img className="w-full" src={donetBook} alt="" />
                </div>
                <h2 className="text-base font-medium">Donate Your Book</h2>
              </div>
            </li>
            <li>
              <Link
                to={"/organizations"}
                className="flex items-center gap-3 hover:bg-gray-200 w-[400px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer"
              >
                <div className="w-7">
                  <img className="w-full" src={organization} alt="" />
                </div>
                <h2 className="text-base font-medium">
                  Unlocking your potential with-
                </h2>
              </Link>
            </li>
            <li onClick={handleUpcoming}>
              <div className="flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
                <div className="w-7">
                  <img className="w-full" src={breach} alt="" />
                </div>
                <h2 className="text-base font-medium">Breach of Contract</h2>
              </div>
            </li>
            <li onClick={handleUpcoming}>
              <div className="flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
                <div className="w-7">
                  <img className="w-full" src={settings} alt="" />
                </div>
                <h2 className="text-base font-medium">Settings</h2>
              </div>
            </li>
            <li>
              <Link
                to={"/contact-us"}
                className="flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer"
              >
                <div className="w-7">
                  <img className="w-full" src={help} alt="" />
                </div>
                <h2 className="text-base font-medium">Contact Us</h2>
              </Link>
            </li>
            <li>
              <Link
                to={"/about-us"}
                className="flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer"
              >
                <div className="w-7">
                  <img className="w-full" src={about} alt="" />
                </div>
                <h2 className="text-base font-medium">About Us</h2>
              </Link>
            </li>
            <li>
              <Link
                to={"/privacy-policy"}
                className="flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer"
              >
                <div className="w-7">
                  <img className="w-full" src={pricacy} alt="" />
                </div>
                <h2 className="text-base font-medium">Privacy Policy</h2>
              </Link>
            </li>
            <li onClick={handleUpcoming}>
              <Link className="flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
                <div className="w-7">
                  <img className="w-full" src={disclaimer} alt="" />
                </div>
                <h2 className="text-base font-medium">Disclaimer</h2>
              </Link>
            </li>
            <li>
              <Link
                to={"/terms-conditions"}
                className="flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer"
              >
                <div className="w-7">
                  <img className="w-full" src={terms} alt="" />
                </div>
                <h2 className="text-base font-medium">Terms and Conditions</h2>
              </Link>
            </li>
            <li onClick={handleLogout}>
              <div className="flex items-center gap-3 hover:bg-gray-200 w-[300px] hover:shadow-md rounded-md px-5 py-3 cursor-pointer">
                <div className="w-7">
                  <img className="w-full" src={logout} alt="" />
                </div>
                <h2 className="text-base font-medium">Log Out</h2>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Categories;
