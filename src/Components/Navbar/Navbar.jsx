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
  HiX,
} from "react-icons/hi";
import { IoNotificationsSharp } from "react-icons/io5";
import { MdPictureAsPdf, MdUploadFile } from "react-icons/md";
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
import near from "../../assets/near.png"
import help from "../../assets/customer-service.png";
import logout from "../../assets/logout.png";
import { Link, NavLink, useNavigate } from "react-router";
import useUser from "../../Hooks/useUser";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

import usePublicAxios from "../../Hooks/usePublicAxios";
import { IoIosSearch } from "react-icons/io";
import { BsFillChatSquareTextFill } from "react-icons/bs";
import { io } from "socket.io-client";
import logoWp from "../../assets/load.webp";
import { FcOrganization } from "react-icons/fc";
import about from "../../assets/information.png";
import disclaimer from "../../assets/disclaimer.png";
import pricacy from "../../assets/protection.png";
import terms from "../../assets/terms-and-conditions.png";

const Navbar = () => {
  const { user, loading, refetch } = useUser();
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
  const [pdfFile, setPdfFile] = useState(null);
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env
    .VITE_CLOUDINARY_UPLOAD_PRESET;
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    const newSocket = io("https://flybook.com.bd", {
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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://flybook.com.bd/search?q=${encodeURIComponent(searchQuery)}`
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

  const toggleDropdown = (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login first to make a post!");
      return;
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handlePdfChange = (event) => {
    const file = event.target.files[0];
    if (file?.type === "application/pdf") {
      setPdfFile(file);
    } else {
      toast.error("Please select a PDF file");
    }
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
    let uploadedPdfUrl = "";

    // First, compress and upload the image (required) to ImgBB
    if (!image) {
      toast.error("Please select an image");
      setPostLoading(false);
      return;
    }

    let imageFileToUpload = await compressImage(image);

    // Upload the compressed image to ImgBB
    const imageFormData = new FormData();
    imageFormData.append("image", imageFileToUpload);

    try {
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`,
        {
          method: "POST",
          body: imageFormData,
        }
      );

      const result = await response.json();
      if (result.success) {
        uploadedImageUrl = result.data.url;
      } else {
        toast.error("Image upload failed");
        setPostLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setPostLoading(false);
      return;
    }

    // Handle optional PDF upload to Cloudinary
    if (pdfFile) {
      const pdfFormData = new FormData();
      pdfFormData.append("file", pdfFile);
      pdfFormData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
          {
            method: "POST",
            body: pdfFormData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Cloudinary Error:", errorData);
          toast.error(
            `PDF upload failed: ${errorData.error?.message || "Unknown error"}`
          );
          // Continue with post creation even if PDF upload fails
        } else {
          const result = await response.json();
          if (result.secure_url) {
            uploadedPdfUrl = result.secure_url;
            toast.success("PDF uploaded successfully");
          } else {
            toast.error("PDF upload failed - no URL returned");
          }
        }
      } catch (error) {
        console.error("Error uploading PDF:", error);
        toast.error("PDF upload failed - network error");
        // Continue with post creation even if PDF upload fails
      }
    }

    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const postData = {
      userId: user._id,
      image: uploadedImageUrl,
      pdf: uploadedPdfUrl,
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
      setPdfFile(null);
      navigate("/public-opinion");
    } catch (error) {
      console.log(error);
      toast.error("Failed to post opinion");
    }
    setPostLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    refetch();
    setIsMobileMenuOpen(false);
    navigate("/");
    setTimeout(() => {
      window.location.reload();
    }, 50);
  };

  const handleUpcoming = () => {
    toast.error("Features Upcoming !");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = (e) => {
    e.stopPropagation();
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={` bg-none md:bg-gray-50  sticky top-0 z-50 `}>
      {/* Mobile Header */}
      <div className=" bg-gray-50 py-3 pl-3 pr-3 lg:p-0 lg:hidden flex justify-between items-center relative">
        <div className="">
          <a href="/">
            <img src={logoWp} className=" w-[130px]" alt="" />
          </a>
        </div>
        <div className=" flex flex-row items-center gap-5">
          <Link to={"/donate-history"} className=" text-2xl">
            <FaDonate />
          </Link>
          <Link to={"/chats"} className=" relative text-2xl">
            <p>
              <BsFillChatSquareTextFill />
            </p>
            <p className="  absolute top-[-10px] right-[-5px] text-xs text-center px-[2px] p-[1px] bg-red-500 text-white rounded-full">
              {notificationCount}
            </p>
          </Link>
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

      {/* Mobile Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeMobileMenu}
      />

      {/* Mobile Sliding Menu */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-xl overflow-y-auto`}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <HiX className="text-2xl text-gray-600" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-4 mb-8">
          <ul className="space-y-2">
            <li>
              <Link
                to={"/peoples"}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 hover:bg-gray-100 w-full rounded-lg px-3 py-3 cursor-pointer transition-colors"
              >
                <div className="w-6">
                  <img className="w-full" src={fnds} alt="" />
                </div>
                <h2 className="text-sm font-medium">Friends</h2>
              </Link>
            </li>
            <li>
              <Link
                to={"/my-library"}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 hover:bg-gray-100 w-full rounded-lg px-3 py-3 cursor-pointer transition-colors"
              >
                <div className="w-6">
                  <img className="w-full" src={library} alt="" />
                </div>
                <h2 className="text-sm font-medium">Library</h2>
              </Link>
            </li>
            <li>
              <div
                onClick={handleUpcoming}
                className="flex items-center gap-3 hover:bg-gray-100 w-full rounded-lg px-3 py-3 cursor-pointer transition-colors"
              >
                <div className="w-6">
                  <img className="w-full" src={group} alt="" />
                </div>
                <h2 className="text-sm font-medium">Groups</h2>
              </div>
            </li>
            <li>
              <Link
                to={"https://bookoffen.com/"}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 hover:bg-gray-100 w-full rounded-lg px-3 py-3 cursor-pointer transition-colors"
              >
                <div className="w-6">
                  <img className="w-full" src={market} alt="" />
                </div>
                <h2 className="text-sm font-medium">Market Place</h2>
              </Link>
            </li>
            <li>
              <Link
                to={"/e-learning"}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 hover:bg-gray-100 w-full rounded-lg px-3 py-3 cursor-pointer transition-colors"
              >
                <div className="w-6">
                  <img className="w-full" src={elng} alt="" />
                </div>
                <h2 className="text-sm font-medium">E-Learning</h2>
              </Link>
            </li>
            <li>
              <Link
                to={"/channels"}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 hover:bg-gray-100 w-full rounded-lg px-3 py-3 cursor-pointer transition-colors"
              >
                <div className="w-6">
                  <img className="w-full" src={channel} alt="" />
                </div>
                <h2 className="text-sm font-medium">Channels</h2>
              </Link>
            </li>
            <li>
              <Link
                to={"/nearby-books"}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 hover:bg-gray-100 w-full rounded-lg px-3 py-3 cursor-pointer transition-colors"
              >
                <div className="w-6">
                  <img className="w-full" src={near} alt="" />
                </div>
                <h2 className="text-sm font-medium">Nearby Book</h2>
              </Link>
            </li>
            <li>
              <Link
                to={"/audio-book"}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 hover:bg-gray-100 w-full rounded-lg px-3 py-3 cursor-pointer transition-colors"
              >
                <div className="w-6">
                  <img className="w-full" src={audioBook} alt="" />
                </div>
                <h2 className="text-sm font-medium">Audio Book</h2>
              </Link>
            </li>
            <li>
              <div
                onClick={handleUpcoming}
                className="flex items-center gap-3 hover:bg-gray-100 w-full rounded-lg px-3 py-3 cursor-pointer transition-colors"
              >
                <div className="w-6">
                  <img className="w-full" src={donetBook} alt="" />
                </div>
                <h2 className="text-sm font-medium">Donate Your Book</h2>
              </div>
            </li>
            <li>
              <Link
                to={"/organizations"}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 hover:bg-gray-100 w-full rounded-lg px-3 py-3 cursor-pointer transition-colors"
              >
                <p className="text-xl">
                  <FcOrganization />
                </p>
                <h2 className="text-sm font-medium">Unlocking your potential with-</h2>
              </Link>
            </li>
            <li>
              <div
                onClick={handleUpcoming}
                className="flex items-center gap-3 hover:bg-gray-100 w-full rounded-lg px-3 py-3 cursor-pointer transition-colors"
              >
                <div className="w-6">
                  <img className="w-full" src={breach} alt="" />
                </div>
                <h2 className="text-sm font-medium">Breach of Contract</h2>
              </div>
            </li>
            <li>
              <div
                onClick={handleUpcoming}
                className="flex items-center gap-3 hover:bg-gray-100 w-full rounded-lg px-3 py-3 cursor-pointer transition-colors"
              >
                <div className="w-6">
                  <img className="w-full" src={settings} alt="" />
                </div>
                <h2 className="text-sm font-medium">Settings</h2>
              </div>
            </li>
            <li>
              <Link
                to={"/contact-us"}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 hover:bg-gray-100 w-full rounded-lg px-3 py-3 cursor-pointer transition-colors"
              >
                <div className="w-6">
                  <img className="w-full" src={help} alt="" />
                </div>
                <h2 className="text-sm font-medium">Contact Us</h2>
              </Link>
            </li>
            <li>
              <Link
                to={"/about-us"}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 hover:bg-gray-100 w-full rounded-lg px-3 py-3 cursor-pointer transition-colors"
              >
                <div className="w-6">
                  <img className="w-full" src={about} alt="" />
                </div>
                <h2 className="text-sm font-medium">About Us</h2>
              </Link>
            </li>
            <li>
              <Link
                to={"/privacy-policy"}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 hover:bg-gray-100 w-full rounded-lg px-3 py-3 cursor-pointer transition-colors"
              >
                <div className="w-6">
                  <img className="w-full" src={pricacy} alt="" />
                </div>
                <h2 className="text-sm font-medium">Privacy Policy</h2>
              </Link>
            </li>
            <li>
              <div
                onClick={handleUpcoming}
                className="flex items-center gap-3 hover:bg-gray-100 w-full rounded-lg px-3 py-3 cursor-pointer transition-colors"
              >
                <div className="w-6">
                  <img className="w-full" src={disclaimer} alt="" />
                </div>
                <h2 className="text-sm font-medium">Disclaimer</h2>
              </div>
            </li>
            <li>
              <Link
                to={"/terms-conditions"}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 hover:bg-gray-100 w-full rounded-lg px-3 py-3 cursor-pointer transition-colors"
              >
                <div className="w-6">
                  <img className="w-full" src={terms} alt="" />
                </div>
                <h2 className="text-sm font-medium">Terms and Conditions</h2>
              </Link>
            </li>
            {user && (
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 hover:bg-gray-100 w-full rounded-lg px-3 py-3 cursor-pointer transition-colors text-left"
                >
                  <div className="w-6">
                    <img className="w-full" src={logout} alt="Logout" />
                  </div>
                  <h2 className="text-sm font-medium text-red-600">Log Out</h2>
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Main Navbar */}
      <div
        className={`navbar bg-gray-50  p-0 transition-transform duration-300 border-b-2  ${
          window.innerWidth <= 768 ? (showNav ? "" : "opacity-0 ") : ""
        }`}
      >
        <div className="w-full lg:navbar-start">
          <ul
            className={`flex w-full flex-row mr-3 z-10 justify-between items-center lg:hidden `}
          >
            <li>
              <button
                onClick={toggleMobileMenu}
                className="btn btn-ghost px-0 pl-4 m-0"
              >
                <HiOutlineMenu className="text-[32px]" />
              </button>
            </li>
            <li className=" ">
              <details className="dropdown w-full">
                <summary className="btn p-0 m-0 border-none shadow-none bg-transparent">
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
                className=" text-3xl lg:text-4xl"
              >
                <FaShop />
              </a>
            </li>
            <Link to={"/e-learning"}>
              <a className=" text-3xl lg:text-4xl">
                <FaUserGraduate />
              </a>
            </Link>
            <li className=" ">
              <Link to={"/pdf-book"} className=" text-3xl lg:text-4xl">
                <MdPictureAsPdf />
              </Link>
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
                    ? " text-4xl"
                    : isPending
                    ? "pending"
                    : "font-bold text-4xl"
                }
                to={"/peoples"}
              >
                <HiUserAdd />
              </NavLink>
            </li>
            <li className="make-post">
              <div
                ref={buttonRef}
                onClick={toggleDropdown}
                className={
                  isOpen
                    ? "font-bold text-4xl bg-gray-200 shadow-lg"
                    : "font-bold text-4xl"
                }
              >
                <div>
                  <p
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
              ref={dropdownRef}
              className={`z-50 ${
                isOpen ? "block" : "hidden"
              } bg-gray-100 fixed  rounded-lg shadow mt-14 w-[500px] p-5`}
            >
              <div className="text-xl font-medium">
                <h1 className="text-3xl mb-5 text-center border-b-2 pb-2">
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
                  <div className="flex flex-col gap-3 mt-3">
                    <label className="text-lg font-medium text-gray-800">
                      Upload Image (Required)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      className="w-full text-gray-500 font-medium text-sm border-2 bg-gray-100 file:cursor-pointer cursor-pointer file:border-0 file:py-2 file:px-4 file:mr-4 file:bg-gray-800 file:hover:bg-gray-700 file:text-white rounded"
                      onChange={handleImageChange}
                    />

                    <label className="text-lg font-medium text-gray-800">
                      Upload PDF (Optional)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      className="w-full text-gray-500 font-medium text-sm border-2 bg-gray-100 file:cursor-pointer cursor-pointer file:border-0 file:py-2 file:px-4 file:mr-4 file:bg-gray-800 file:hover:bg-gray-700 file:text-white rounded"
                      onChange={handlePdfChange}
                    />
                    {pdfFile && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MdPictureAsPdf className="text-xl" />
                        <span>{pdfFile.name}</span>
                      </div>
                    )}
                  </div>
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
                to="/notifications"
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
              to={"/marketplace"}
                className={({ isActive, isPending }) =>
                  isActive
                    ? "bg-gray-300 text-4xl"
                    : isPending
                    ? "pending"
                    : "font-bold text-4xl"
                }
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Market"
              >
                <FaShop />
              </NavLink>
            </li>
            <li className=" ">
              <NavLink
                to={"/e-learning"}
                className={({ isActive, isPending }) =>
                  isActive
                    ? "bg-gray-300 text-4xl"
                    : isPending
                    ? "pending"
                    : "font-bold text-4xl"
                }
                data-tooltip-id="my-tooltip"
                data-tooltip-content="E-Learning"
              >
                <FaUserGraduate />
              </NavLink>
            </li>
            <li className=" ">
              <NavLink
                to={"/pdf-book"}
                className={({ isActive, isPending }) =>
                  isActive
                    ? "bg-gray-300 text-4xl"
                    : isPending
                    ? "pending"
                    : "font-bold text-4xl"
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