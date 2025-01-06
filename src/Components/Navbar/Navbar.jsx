import {
  FaDonate,
  FaLanguage,
  FaPlusCircle,
  FaRegComment,
  FaUserGraduate,
} from "react-icons/fa";
import { FaShop } from "react-icons/fa6";
import {
  HiDocumentSearch,
  HiHome,
  HiOutlineMenu,
  HiUserAdd,
} from "react-icons/hi";
import { IoNotificationsSharp } from "react-icons/io5";
import { MdPictureAsPdf } from "react-icons/md";
import { Tooltip } from "react-tooltip";
import imageCompression from "browser-image-compression";
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
import { Link, NavLink, useNavigate } from "react-router";
import useUser from "../../Hooks/useUser";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import usePublicAxios from "../../Hooks/usePublicAxios";
import { IoIosSearch } from "react-icons/io";
import { BsFillChatSquareTextFill } from "react-icons/bs";
import { io } from "socket.io-client";

const Navbar = () => {
  const { user, refetch } = useUser();
  const axiosPublic = usePublicAxios();
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [opinion, setOpinion] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [postLoading, setPostLoading] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const IMG_BB_API_KEY = import.meta.env.VITE_IMAGE_HOSTING_KEY;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down, hide nav after scrolling 100px
        setShowNav(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up, show nav
        setShowNav(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  useEffect(() => {
    if (!user) return;

    const newSocket = io("https://fly-book-server.onrender.com", {
      transports: ["websocket"], // Use WebSocket transport directly
      withCredentials: true, // If your server requires credentials for CORS
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("joinUser", user.id);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on("newNotification", (notificationData) => {
      setNotifications((prevNotifications) => {
        // Check if the notification from the same user already exists
        const existingNotificationIndex = prevNotifications.findIndex(
          (notification) => notification.senderId === notificationData.senderId
        );

        if (existingNotificationIndex !== -1) {
          // Update the message text of the existing notification
          const updatedNotifications = [...prevNotifications];
          updatedNotifications[existingNotificationIndex].messageText =
            notificationData.messageText;
          return updatedNotifications;
        }

        // Add a new notification and increment the count
        setNotificationCount((prevCount) => prevCount + 1);
        return [...prevNotifications, notificationData];
      });
    });

    return () => {
      socket.off("newNotification");
    };
  }, [socket]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://fly-book-server.onrender.com/search?q=${encodeURIComponent(
          searchQuery
        )}`
      );
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json();
      navigate("/search-result", { state: { searchResults: data } });
    } catch (error) {
      console.error("Error fetching search results:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleFileChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleOpinionChange = (event) => {
    setOpinion(event.target.value);
  };

  // Compress image to max size 40 KB
  const compressImage = async (imageFile) => {
    try {
      const options = {
        maxSizeMB: 0.03,
        useWebWorker: true,
        maxWidthOrHeight: 800,
        mimeType: "image/webp",
      };

      const compressedFile = await imageCompression(imageFile, options);
      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      return imageFile; // Return original image if compression fails
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPostLoading(true);
    let uploadedImageUrl = "";

    // First, compress the image
    let imageFileToUpload = image;
    if (image) {
      imageFileToUpload = await compressImage(image);
    }

    // Upload the compressed image to ImgBB
    if (imageFileToUpload) {
      const formData = new FormData();
      formData.append("image", imageFileToUpload);

      try {
        const response = await fetch(
          `https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();
        if (result.success) {
          uploadedImageUrl = result.data.url;
          navigate("/public-opinion");
        } else {
          toast.error("Image upload failed");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    setImageUrl(uploadedImageUrl);
    setPostLoading(false);
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const postData = {
      userId: user._id,
      image: uploadedImageUrl,
      description: opinion,
      date: currentDate,
      time: currentTime,
    };

    try {
      await axiosPublic.post(
        "/opinion/post",
        { postData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Opinion Posted!");
      setIsOpen(false);
      setOpinion("");
      setImage(null);
      navigate("/public-opinion");
    } catch (error) {
      console.log(error);
      toast.error("Failed to post opinion");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    refetch();
    navigate("/");
  };
  return (
    <div
      className={`bg-gray-50 sticky top-0 z-50 transition-transform duration-300 ${
        window.innerWidth <= 768
          ? showNav
            ? "translate-y-0"
            : "-translate-y-full"
          : "translate-y-0"
      }`}
    >
      <div className="pt-3 pl-3 pr-3 lg:p-0 lg:hidden flex justify-between items-center relative">
        <div className="">
          <a href="/">
            <img
              src="https://i.ibb.co.com/VjWkST4/logo.png"
              className=" w-[130px]"
              alt=""
            />
          </a>
        </div>
        <div className=" flex flex-row items-center gap-5">
          <Link to={"/donate-history"} className=" text-2xl">
            <FaDonate />
          </Link>
          <details className="dropdown dropdown-end bg-transparent">
            <summary className="btn p-0 m-0 bg-transparent text-2xl relative">
              <BsFillChatSquareTextFill />
              <p className=" absolute px-1 rounded-full top-0 right-[-8px] text-xs bg-red-700 text-white p-[2px]">
                {notificationCount}
              </p>
            </summary>
            <ul className="menu dropdown-content space-y-3 bg-base-100 rounded-box z-[1] w-64 p-2 shadow">
              {notifications.length === 0 ? (
                <li className="text-gray-500 italic">No new messages</li>
              ) : (
                notifications.map((notify, index) => (
                  <li
                    className=" hover:shadow-md border-2 rounded-xl border-slate-100 "
                    key={index}
                  >
                    <Link to={`/chats/${notify.senderId}`}>
                      <p>
                        <span className=" text-sm font-semibold">
                          {notify.senderName.split(" ")[0]}:
                        </span>{" "}
                        <span className=" text-sm">
                          {notify.messageText.slice(0, 15)}...
                        </span>
                      </p>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </details>
          {user ? (
            <Link
              to={"/my-profile"}
              className="w-[40px] h-[40px] p-1 border-2 rounded-full border-green-200"
            >
              <img
                className=" w-full h-full object-cover rounded-full"
                src={
                  user?.profileImage ||
                  `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png`
                }
                alt=""
              />
            </Link>
          ) : (
            <Link
              to={"/login"}
              className=" text-sm rounded-3xl font-medium bg-blue-300 text-white px-3 py-2"
            >
              Login
            </Link>
          )}
        </div>
      </div>
      <div className="navbar p-0 border-b-2">
        <div className="w-full lg:navbar-start">
          <ul className="flex w-full flex-row mr-3 justify-between items-center lg:hidden">
            <li>
              <div className="dropdown">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost px-0 pl-4 m-0 lg:hidden"
                >
                  <h2 className=" text-[32px]">
                    <HiOutlineMenu />
                  </h2>
                </div>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-60 p-2 shadow"
                >
                  <li>
                    <Link
                      to={"/peoples"}
                      className=" flex items-center gap-2 hover:bg-gray-200 w-full hover:shadow-md rounded-md px-2 py-2 cursor-pointer"
                    >
                      <div className=" w-6 ">
                        <img className=" w-full" src={fnds} alt="" />
                      </div>
                      <h2 className=" text-sm font-normal">Friends</h2>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={"/my-library"}
                      className=" flex items-center gap-2 hover:bg-gray-200 w-full hover:shadow-md rounded-md px-2 py-2 cursor-pointer"
                    >
                      <div className=" w-6 ">
                        <img className=" w-full" src={library} alt="" />
                      </div>
                      <h2 className=" text-sm font-normal">Library</h2>
                    </Link>
                  </li>
                  <li>
                    <div className=" flex items-center gap-2 hover:bg-gray-200 w-full hover:shadow-md rounded-md px-2 py-2 cursor-pointer">
                      <div className=" w-6 ">
                        <img className=" w-full" src={group} alt="" />
                      </div>
                      <h2 className=" text-sm font-normal">Groups</h2>
                    </div>
                  </li>
                  <li>
                    <div className=" flex items-center gap-2 hover:bg-gray-200 w-full hover:shadow-md rounded-md px-2 py-2 cursor-pointer">
                      <div className=" w-6 ">
                        <img className=" w-full" src={market} alt="" />
                      </div>
                      <h2 className=" text-sm font-normal">Market Place</h2>
                    </div>
                  </li>
                  <li>
                    <div className=" flex items-center gap-2 hover:bg-gray-200 w-full hover:shadow-md rounded-md px-2 py-2 cursor-pointer">
                      <div className=" w-6 ">
                        <img className=" w-full" src={elng} alt="" />
                      </div>
                      <h2 className=" text-sm font-normal">E-Learning</h2>
                    </div>
                  </li>
                  <li>
                    <div className=" flex items-center gap-2 hover:bg-gray-200 w-full hover:shadow-md rounded-md px-2 py-2 cursor-pointer">
                      <div className=" w-6 ">
                        <img className=" w-full" src={channel} alt="" />
                      </div>
                      <h2 className=" text-sm font-normal">Channels</h2>
                    </div>
                  </li>
                  <li>
                    <div className=" flex items-center gap-2 hover:bg-gray-200 w-full hover:shadow-md rounded-md px-2 py-2 cursor-pointer">
                      <div className=" w-6 ">
                        <img className=" w-full" src={audioBook} alt="" />
                      </div>
                      <h2 className=" text-sm font-normal">Audio Book</h2>
                    </div>
                  </li>
                  <li>
                    <div className=" flex items-center gap-2 hover:bg-gray-200 w-full hover:shadow-md rounded-md px-2 py-2 cursor-pointer">
                      <div className=" w-6 ">
                        <img className=" w-full" src={donetBook} alt="" />
                      </div>
                      <h2 className=" text-sm font-normal">Donate Your Book</h2>
                    </div>
                  </li>
                  <li>
                    <div className=" flex items-center gap-2 hover:bg-gray-200 w-full hover:shadow-md rounded-md px-2 py-2 cursor-pointer">
                      <div className=" w-6 ">
                        <img className=" w-full" src={breach} alt="" />
                      </div>
                      <h2 className=" text-sm font-normal">
                        Breach of Contract
                      </h2>
                    </div>
                  </li>
                  <li>
                    <div className=" flex items-center gap-2 hover:bg-gray-200 w-full hover:shadow-md rounded-md px-2 py-2 cursor-pointer">
                      <div className=" w-6 ">
                        <img className=" w-full" src={settings} alt="" />
                      </div>
                      <h2 className=" text-sm font-normal">Settings</h2>
                    </div>
                  </li>
                  <li>
                    <div className=" flex items-center gap-2 hover:bg-gray-200 w-full hover:shadow-md rounded-md px-2 py-2 cursor-pointer">
                      <div className=" w-6 ">
                        <img className=" w-full" src={help} alt="" />
                      </div>
                      <h2 className=" text-sm font-normal">Help Center</h2>
                    </div>
                  </li>
                  <li onClick={handleLogout}>
                    <div className=" flex items-center gap-2 hover:bg-gray-200 w-full hover:shadow-md rounded-md px-2 py-2 cursor-pointer">
                      <div className=" w-6 ">
                        <img className=" w-full" src={logout} alt="" />
                      </div>
                      <h2 className=" text-sm font-normal">Log Out</h2>
                    </div>
                  </li>
                </ul>
              </div>
            </li>
            <li className=" ">
              <details className="dropdown w-full">
                <summary className="btn p-0 m-0 bg-transparent">
                  <a className=" text-3xl lg:text-4xl">
                    <HiDocumentSearch />
                  </a>
                </summary>
                <ul className=" absolute top-15 right-14 w-full">
                  <li className="text-gray-600">
                    <form onSubmit={handleSearch} className=" flex">
                      <input
                        type="search"
                        name="search"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white h-10 px-5 pr-10 rounded-full text-sm focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="ml-[-40px]  mr-4 text-3xl font-semibold"
                      >
                        <IoIosSearch />
                      </button>
                    </form>
                  </li>
                </ul>
              </details>
            </li>
            <li className=" ml-[-10px]">
              <a
              href="https://bookoffen.com/"
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Market"
                className=" text-3xl lg:text-4xl"
              >
                <FaShop />
              </a>
            </li>
            <li className=" ">
              <a
                data-tooltip-id="my-tooltip"
                data-tooltip-content="E-Learning"
                className=" text-3xl lg:text-4xl"
              >
                <FaUserGraduate />
              </a>
            </li>
            <li className=" ">
              <a
                data-tooltip-id="my-tooltip"
                data-tooltip-content="PDF Book"
                className=" text-3xl lg:text-4xl"
              >
                <MdPictureAsPdf />
              </a>
            </li>
          </ul>
          <div className="lg:flex hidden lg:block items-center space-x-6 ml-2">
            <a href="/">
              <img
                src="https://i.ibb.co.com/VjWkST4/logo.png"
                className=" w-[180px]"
                alt=""
              />
            </a>
            <div className="max-w-md mx-auto">
              <form
                onSubmit={handleSearch}
                className="relative flex items-center w-full h-12 rounded-lg shadow-lg bg-white overflow-hidden"
              >
                <input
                  className="peer h-full w-full outline-none text-sm text-gray-700 px-2"
                  type="text"
                  id="search"
                  placeholder="Search something.."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="grid place-items-center h-full w-12 text-gray-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="lg:navbar-center hidden lg:block lg:flex">
          <ul className="menu menu-horizontal space-x-14">
            <li className=" ">
              <NavLink
                className={({ isActive, isPending }) =>
                  isActive
                    ? "bg-gray-300 text-4xl"
                    : isPending
                    ? "pending"
                    : "font-bold text-4xl"
                }
                to={"/"}
              >
                <HiHome />
              </NavLink>
            </li>
            <li className=" ">
              <NavLink
                className={({ isActive, isPending }) =>
                  isActive
                    ? "bg-gray-300 text-4xl"
                    : isPending
                    ? "pending"
                    : "font-bold text-4xl"
                }
                to={"/peoples"}
              >
                <HiUserAdd />
              </NavLink>
            </li>
            <li className=" make-post">
              <div
                onClick={toggleDropdown}
                className={
                  isOpen
                    ? "font-bold text-4xl bg-gray-200 shadow-lg"
                    : "font-bold text-4xl"
                }
              >
                <div>
                  <p
                    id="dropdownDefaultButton"
                    className={`${
                      isOpen ? "rotate-45" : "rotate-0"
                    } transition-all`}
                  >
                    <FaPlusCircle />
                  </p>
                </div>
              </div>
            </li>
            {/* Dropdown menu */}
            <div
              id="dropdown"
              className={`z-10 ${
                isOpen ? "block" : "hidden"
              } bg-gray-100 absolute rounded-lg shadow mt-16 w-[500px] p-5 `}
            >
              <div className=" text-xl font-medium">
                <h1 className=" text-3xl mb-5 text-center border-b-2 pb-2 ">
                  Make a Post for your Opinion
                </h1>
                <form onSubmit={handleSubmit}>
                  <label
                    htmlFor="message"
                    className="block mb-2 mt-4 text-lg font-medium text-gray-800 "
                  >
                    Your Opinion
                  </label>
                  <textarea
                    id="message"
                    rows="4"
                    required
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Write your thoughts here..."
                    value={opinion}
                    onChange={handleOpinionChange}
                  ></textarea>
                  <label
                    className="block mb-2 mt-3 text-lg font-medium text-gray-800"
                    htmlFor="file_input"
                  >
                    Select Image
                  </label>
                  <input
                    type="file"
                    className="w-full text-gray-500 font-medium text-sm border-2 bg-gray-100 file:cursor-pointer cursor-pointer file:border-0 file:py-2 file:px-4 file:mr-4 file:bg-gray-800 file:hover:bg-gray-700 file:text-white rounded"
                    onChange={handleFileChange}
                  />
                  <button
                    type="submit"
                    className="btn text-base w-full mt-7 bg-gray-700 text-white flex items-center justify-center"
                  >
                    {postLoading ? (
                      <svg
                        className="animate-spin h-5 w-5 mr-3"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                    ) : (
                      "Post"
                    )}
                  </button>
                </form>
              </div>
            </div>
            <li>
              <NavLink
                className={({ isActive, isPending }) =>
                  isActive
                    ? "bg-gray-300 text-4xl"
                    : isPending
                    ? "pending"
                    : "font-bold text-4xl"
                }
                to={"/public-opinion"}
              >
                <FaRegComment />
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive, isPending }) =>
                  isActive
                    ? "bg-gray-300 text-4xl"
                    : isPending
                    ? "pending"
                    : "font-bold text-4xl"
                }
                to={"/notification"}
              >
                <IoNotificationsSharp />
              </NavLink>
            </li>
          </ul>
        </div>
        <div className="lg:navbar-end hidden lg:block">
          <ul className="flex flex-row gap-8 justify-end py-2 px-3 rounded-lg mr-5 items-center">
            <li className=" ml-[-10px]">
              <NavLink
              to={'https://bookoffen.com/'}
                className={({ isActive, isPending }) =>
                  isActive
                    ? "bg-gray-300 text-4xl"
                    : isPending
                    ? "pending"
                    : "font-bold text-3xl lg:text-4xl"
                }
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Market"
              >
                <FaShop />
              </NavLink>
            </li>
            <li className=" ">
              <NavLink
                className={({ isActive, isPending }) =>
                  isActive
                    ? "bg-gray-300 text-4xl"
                    : isPending
                    ? "pending"
                    : "font-bold text-3xl lg:text-4xl"
                }
                data-tooltip-id="my-tooltip"
                data-tooltip-content="E-Learning"
              >
                <FaUserGraduate />
              </NavLink>
            </li>
            <li className=" ">
              <NavLink
                className={({ isActive, isPending }) =>
                  isActive
                    ? "bg-gray-300 text-4xl"
                    : isPending
                    ? "pending"
                    : "font-bold text-3xl lg:text-4xl"
                }
                data-tooltip-id="my-tooltip"
                data-tooltip-content="PDF Book"
              >
                <MdPictureAsPdf />
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
      <Tooltip id="my-tooltip" />
    </div>
  );
};

export default Navbar;
