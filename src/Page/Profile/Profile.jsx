import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import useUser from "../../Hooks/useUser";
import Navbar from "../../Components/Navbar/Navbar";
import toast from "react-hot-toast";
import cover from "../../assets/cover.png";
import logout from "../../assets/logout.png";
import { Link, useNavigate } from "react-router";
import * as faceapi from "face-api.js";
import { IoVideocam } from "react-icons/io5";
import { IoIosMail } from "react-icons/io";
import { FaFilePdf, FaPhoneAlt, FaRegHeart, FaUserGraduate } from "react-icons/fa";
import pChannel from "../../assets/pchannel.png";
import MyLibrary from "../../assets/my-library.png";
import { MdEditLocationAlt, MdWork } from "react-icons/md";
import { HiHomeModern } from "react-icons/hi2";
import { FaLocationDot } from "react-icons/fa6";
import heartfill from "../../assets/heart.png";
import DownNav from "../../Components/DownNav/DownNav";
import done from "../../assets/check.png";
import { useQuery } from "@tanstack/react-query";
import usePublicAxios from "../../Hooks/usePublicAxios";
import useAllFriends from "../../Hooks/useAllFriends";
import imageCompression from "browser-image-compression";
import { HiDotsHorizontal } from "react-icons/hi";
import { FaNoteSticky } from "react-icons/fa6";
import { RiDeleteBin6Line } from "react-icons/ri";

const Profile = () => {
  const { user, loading: userLoading, refetch } = useUser();
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const token = localStorage.getItem("token");
  const [faceApiLoading, setFaceApiLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isVideoStarted, setIsVideoStarted] = useState(false);
  const [updateLogin, setUpdateLogin] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const axiosPublic = usePublicAxios();
  const IMG_BB_API_KEY = import.meta.env.VITE_IMAGE_HOSTING_KEY;
  const [expandedPosts, setExpandedPosts] = useState({});
  const { allFriends, refetch: refetchFriends, isLoading } = useAllFriends();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);

  const toggleExpand = (id) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Load face-api models
    const loadModels = async () => {
      setFaceApiLoading(true);
      await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      setFaceApiLoading(false);
    };

    // Fetch notes
    const fetchNotes = async () => {
      try {
        const response = await axiosPublic.get(
          "/notes",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotes(response.data.notes);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };

    loadModels();
    fetchNotes();
  }, [token]);

  const {
    data,
    isLoading: postLoading,
    refetch: postRefetch,
  } = useQuery({
    queryKey: ["postsData"],
    queryFn: () =>
      axiosPublic.get("/opinion/posts").then((res) => res.data.data),
  });

  const handlePostLike = async (postId) => {
    try {
      const response = await axiosPublic.post(
        "/opinion/like",
        { postId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        postRefetch();
      } else {
        toast.error("Failed to like the post:", response.data.error);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleUnlike = async (postId) => {
    try {
      const response = await axiosPublic.post(
        "/opinion/unlike",
        { postId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        postRefetch();
      } else {
        toast.error("Failed to like the post:", response.data.error);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const updateVerificationStatus = async (status) => {
    try {
      await axios.put(
        "https://api.flybook.com.bd/profile/verification",
        { verificationStatus: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Verification status updated successfully!");
      refetch();
    } catch (error) {
      console.error("Error updating verification status:", error);
      toast.error("Failed to update verification status.");
    }
  };

  const startDetection = async () => {
    videoRef.current.onloadeddata = () => {
      const detectionInterval = setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(videoRef.current)
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (detections.length > 0) {
          setVerificationStatus("Face Verified");
          await updateVerificationStatus(true);
          clearInterval(detectionInterval);
          stopCamera();
        } else {
          setVerificationStatus("No Face Detected");
        }
      }, 100);
    };
  };

  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    setIsVideoStarted(false);
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startVerification = () => {
    setIsVideoStarted(true);
    startVideo().then(startDetection);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("Please select an image to upload.");
      return;
    }

    setLoadingUpload(true);

    let compressedFile = file;
    const options = {
      maxSizeMB: 0.03,
      maxHeightOrWidth: 500,
      useWebWorker: true,
      mimeType: "image/webp",
    };

    try {
      while (compressedFile.size > 30 * 1024) {
        compressedFile = await imageCompression(compressedFile, options);
      }

      const formData = new FormData();
      formData.append("image", compressedFile);

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`,
        formData
      );

      if (response.data.success) {
        const imageUrl = response.data.data.url;

        await axios.put(
          "https://api.flybook.com.bd/profile/update",
          { profileImageUrl: imageUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Image uploaded successfully!");
        refetch();
      } else {
        toast.error("Image upload failed.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Something went wrong. Please try again.");
    }

    setLoadingUpload(false);
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("Please select an image to upload.");
      return;
    }

    setCoverLoading(true);

    const options = {
      maxSizeMB: 0.03,
      maxHeightOrWidth: 500,
      useWebWorker: true,
      mimeType: "image/webp",
    };

    try {
      const compressedFile = await imageCompression(file, options);

      const formData = new FormData();
      formData.append("image", compressedFile);

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`,
        formData
      );

      if (response.data.success) {
        const imageUrl = response.data.data.url;
        console.log(imageUrl);

        await axios.put(
          "https://api.flybook.com.bd/profile/cover/update",
          { coverImageUrl: imageUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Image uploaded successfully!");
        refetch();
      } else {
        toast.error("Image upload failed.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Something went wrong. Please try again.");
    }

    setCoverLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("notify");
    refetch();
    navigate("/login");
  };

  if (userLoading || postLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  const myPosts = data.filter((post) => post.userId === user.id);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateLogin(true);
    const formData = new FormData(e.target);
    const updateDetails = {
      work: formData.get("work"),
      studies: formData.get("studies"),
      currentCity: formData.get("currentCity"),
      hometown: formData.get("hometown"),
      email: formData.get("email"),
    };

    try {
      const response = await axios.put(
        "https://api.flybook.com.bd/profile/updateDetails",
        updateDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Profile updated successfully!");
        setUpdateLogin(false);
        refetch();
      }
    } catch (error) {
      setUpdateLogin(false);
      toast.error(error.response?.data?.error || "Failed to update profile.");
    }
    setUpdateLogin(false);
  };

  const handleUpdateLocation = async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      const updateDetails = { userLocation: { latitude, longitude } };

      const response = await axios.put(
        "https://api.flybook.com.bd/profile/updateDetails/location",
        updateDetails,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        toast.success("Location updated successfully!");
        refetch();
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      let errorMessage;
      if (error instanceof GeolocationPositionError) {
        errorMessage = "Enable location services to update.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = "Something went wrong. Try again!";
      }
      toast.error(errorMessage);
    } finally {
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error("Note cannot be empty!");
      return;
    }

    try {
      const response = await axiosPublic.post(
        "/notes/add",
        { content: newNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setNotes([...notes, response.data.note]);
        setNewNote('');
        setShowNoteModal(false);
        toast.success("Note added successfully!");
      }
    } catch (error) {
      toast.error("Failed to add note");
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await axiosPublic.delete(
        `/notes/${noteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setNotes(notes.filter(note => note._id !== noteId));
        toast.success("Note deleted successfully!");
      }
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-[1220px] mx-auto">
        <div className=" bg-gray-50 p-2 pb-4 rounded-xl mt-2">
          <div className="w-full h-[160px] lg:h-[350px] lg:mt-2 relative">
            <img
              className="w-full h-full object-cover object-center rounded-t-xl lg:rounded-xl"
              src={
                user?.coverImage ||
                "https://i.ibb.co.com/xmyN9fT/freepik-expand-75906-min.png"
              }
              alt="Update a Cover Photo"
            />
            <div className=" absolute right-0 bottom-1">
              <div className="relative inline-block">
                <input
                  type="file"
                  id="coverInput"
                  onChange={handleCoverChange}
                  className="absolute opacity-0 w-0 h-0"
                />
                <label
                  htmlFor="coverInput"
                  className={`flex items-center justify-center w-8 h-8 ${loadingUpload ? "bg-gray-300" : "bg-slate-400"
                    } text-white rounded-full cursor-pointer`}
                >
                  {coverLoading ? (
                    <div className="animate-spin border-2 border-t-transparent border-white rounded-full w-4 h-4"></div>
                  ) : (
                    "+"
                  )}
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative w-[100px] h-[100px] lg:w-[180px] mt-[-30px] lg:ml-[60px] lg:h-[180px] border-4 border-white rounded-full">
                <img
                  src={
                    user.profileImage ||
                    "https://i.ibb.co/mcL9L2t/f10ff70a7155e5ab666bcdd1b45b726d.jpg"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />

                <div className="absolute bottom-[2px] lg:bottom-5 right-0 lg:right-3">
                  <div className="relative inline-block">
                    <input
                      type="file"
                      id="profileInput"
                      onChange={handleImageChange}
                      className="absolute opacity-0 w-0 h-0"
                    />
                    <label
                      htmlFor="profileInput"
                      className={`flex items-center justify-center w-8 h-8 ${loadingUpload ? "bg-gray-300" : "bg-slate-400"
                        } text-white rounded-full cursor-pointer`}
                    >
                      {loadingUpload ? (
                        <div className="animate-spin border-2 border-t-transparent border-white rounded-full w-4 h-4"></div>
                      ) : (
                        "+"
                      )}
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-lg lg:text-3xl font-semibold">
                  {user?.name}
                </h1>
                <p className="text-sm lg:text-base text-gray-500">
                  @{user?.userName}
                </p>
              </div>
            </div>
            <div>
              <div
                onClick={handleLogout}
                className="flex items-center lg:gap-3 hover:bg-gray-200 hover:shadow-md gap-1 rounded-md px-3 lg:px-5 lg:py-3 cursor-pointer"
              >
                <div className="w-7 lg:w-8">
                  <img className="w-full" src={logout} alt="Logout" />
                </div>
                <h2 className="text-base lg:text-lg hidden lg:block font-medium">
                  Log Out
                </h2>
              </div>
            </div>
          </div>
          <div className="face-verification flex px-2 mt-4 lg:mt-0 justify-end gap-3 lg:gap-5">
            <button
              className="btn"
              onClick={() => document.getElementById("my_modal_3").showModal()}
            >
              <span className=" text-2xl lg:text-3xl">
                <IoVideocam />
              </span>{" "}
              <span className="hidden lg:block">Verify Face</span>
              <span className="block lg:hidden">Verify</span>
            </button>
            <Link to={"/my-library"} className="btn">
              {" "}
              <img
                className=" w-4 lg:w-8 hidden lg:block"
                src={MyLibrary}
                alt=""
              />{" "}
              <span className=" text-sm lg:text-lg">My Library</span>
            </Link>
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn text-lg lg:text-xl"
              >
                <HiDotsHorizontal />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-[1] w-64 lg:w-72 p-2 shadow"
              >
                <li>
                  <div className=" flex justify-center lg:justify-start">
                    <p
                      onClick={handleUpdateLocation}
                      className=" flex items-center gap-1 bg-gray-50 mt-2 w-fit p-2 rounded-md shadow-md lg:shadow-none text-sm lg:text-base lg:hover:shadow-md cursor-pointer"
                    >
                      <span className=" text-xl lg:text-2xl text-rose-500 ">
                        <MdEditLocationAlt />
                      </span>{" "}
                      Update your location
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <dialog id="my_modal_3" className="modal">
              <div className="modal-box">
                <form method="dialog">
                  <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                    ✕
                  </button>
                </form>
                <h1 className=" text-xl font-medium text-center">
                  Face Verification
                </h1>
                <div>
                  {user.verificationStatus ? (
                    <div className=" flex justify-center">
                      <img className=" w-[200px]" src={done} alt="" />
                    </div>
                  ) : (
                    <div className="flex justify-between mt-4">
                      {isVideoStarted ? (
                        <p>Verification in Progress</p>
                      ) : (
                        <button
                          className="btn btn-primary"
                          onClick={startVerification}
                        >
                          Start Camera
                        </button>
                      )}
                      <button className="btn btn-error" onClick={stopCamera}>
                        Stop
                      </button>
                    </div>
                  )}

                  <video
                    className="rounded-full lg:rounded-none h-full w-full"
                    ref={videoRef}
                    width="340"
                    height="540"
                    autoPlay
                    muted
                  />

                  {faceApiLoading && <div>Loading models...</div>}

                  <div>
                    <p className="text-lg font-medium text-center">
                      {user.verificationStatus == true
                        ? "Verify success"
                        : "Not verified"}
                    </p>
                  </div>
                </div>
              </div>
            </dialog>
          </div>
        </div>

        <div className=" lg:grid lg:grid-cols-5 mt-2">
          <div className=" col-span-2 lg:sticky lg:top-0 mb-5 lg:h-fit">
            <div className=" bg-gray-50 p-3 rounded-xl">
              <h1 className=" text-lg lg:text-2xl font-medium py-1 lg:py-2 mb-2 border-b-2">
                About
              </h1>
              <div>
                <ul className=" space-y-5">
                  {user.work ? (
                    <li className=" flex items-center gap-2">
                      <span className=" text-2xl lg:text-3xl text-gray-400">
                        <MdWork />
                      </span>
                      <span className=" text-sm "> Works at </span>
                      <span className=" text-sm lg:text-base font-medium text-gray-700">
                        {user.work}
                      </span>
                    </li>
                  ) : (
                    ""
                  )}
                  {user.studies ? (
                    <li className=" flex items-center gap-2">
                      <span className=" text-2xl lg:text-[28px] text-gray-400">
                        <FaUserGraduate />
                      </span>
                      <span className=" text-sm "> Studies at </span>
                      <span className=" text-sm lg:text-base font-medium text-gray-700">
                        {user.studies}
                      </span>
                    </li>
                  ) : (
                    ""
                  )}
                  {user.currentCity ? (
                    <li className=" flex items-center gap-2">
                      <span className=" text-2xl lg:text-[28px] text-gray-400">
                        <HiHomeModern />
                      </span>
                      <span className=" text-sm "> Lives in </span>
                      <span className=" text-sm lg:text-base font-medium text-gray-700">
                        {user.currentCity}
                      </span>
                    </li>
                  ) : (
                    ""
                  )}
                  {user.hometown ? (
                    <li className=" flex items-center gap-2">
                      <span className=" text-2xl lg:text-[28px] text-gray-400">
                        <FaLocationDot />
                      </span>
                      <span className=" text-sm "> From </span>
                      <span className=" text-sm lg:text-base font-medium text-gray-700">
                        {user.hometown}
                      </span>
                    </li>
                  ) : (
                    ""
                  )}
                  <li className=" flex items-center gap-2">
                    <span className=" text-2xl lg:text-3xl text-gray-400">
                      <IoIosMail />
                    </span>
                    <span className=" text-sm lg:text-base text-gray-700">
                      {user.email}
                    </span>
                  </li>
                  <li className=" flex items-center gap-3">
                    <span className=" text-lg lg:text-[24px] text-gray-400">
                      <FaPhoneAlt />
                    </span>
                    <span className=" text-sm lg:text-base text-gray-700">
                      {user.number}
                    </span>
                  </li>
                </ul>
                <button
                  className={`btn w-full my-4`}
                  disabled={user.verificationStatus === false}
                  onClick={() =>
                    document.getElementById("my_modal_4").showModal()
                  }
                >
                  Edit Details
                </button>
                <dialog id="my_modal_4" className="modal">
                  <div className="modal-box">
                    <form method="dialog">
                      <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                        ✕
                      </button>
                    </form>
                    <form className="" onSubmit={handleUpdateProfile}>
                      <h3 className="text-lg font-medium text-center">
                        Update Your Profile Details
                      </h3>

                      <label className="block mb-2 mt-4 text-sm font-normal text-gray-900">
                        Add Works
                      </label>
                      <input
                        type="text"
                        name="work"
                        placeholder="Add your work"
                        defaultValue={user?.work}
                        className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs"
                      />

                      <label className="block mb-2 mt-4 text-sm font-normal text-gray-900">
                        Add Studies
                      </label>
                      <input
                        type="text"
                        name="studies"
                        placeholder="Add your Current Studies"
                        defaultValue={user?.studies}
                        className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs"
                      />

                      <label className="block mb-2 mt-4 text-sm font-normal text-gray-900">
                        Current City
                      </label>
                      <input
                        type="text"
                        name="currentCity"
                        defaultValue={user?.currentCity}
                        placeholder="Add your current city"
                        className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs"
                      />

                      <label className="block mb-2 mt-4 text-sm font-normal text-gray-900">
                        Hometown
                      </label>
                      <input
                        type="text"
                        name="hometown"
                        defaultValue={user?.hometown}
                        placeholder="Add your Hometown"
                        className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs"
                      />

                      <label className="block mb-2 mt-4 text-sm font-normal text-gray-900">
                        Your Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        defaultValue={user?.email}
                        placeholder={"Add your email"}
                        className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs"
                      />

                      <input
                        type="submit"
                        value={updateLogin ? "Loading..." : "Update Profile"}
                        className="w-full p-2 mt-4 text-gray-900 border rounded-xl cursor-pointer hover:shadow-lg py-3 bg-gray-50 text-xs"
                      />
                    </form>
                  </div>
                </dialog>
              </div>
            </div>
            <div className=" bg-gray-50 p-3 rounded-xl mt-3">
              <h1 className=" text-xl lg:text-2xl font-medium py-1 lg:py-2 mb-2 border-b-2">
                Book Fiends
              </h1>
              <div className=" grid gap-2 grid-cols-3">
                {allFriends.map((friend) => (
                  <Link
                    to={`/profile/${friend._id}`}
                    className="lg:w-[130px] lg:h-[160px] w-[100px] h-[160px] bg-white shadow-sm rounded-lg flex flex-col items-center"
                    key={friend._id}
                  >
                    <div className="w-[100px] lg:w-[130px] h-[140px]">
                      <img
                        className="w-full h-[110px] lg:h-[120px] rounded-t-2xl object-cover"
                        src={friend.profileImage}
                        alt={friend.name}
                      />
                    </div>
                    <div className=" w-full pl-3 lg:pl-0 px-1 flex flex-col lg: gap-3 justify-between ">
                      <h1 className=" text-xs lg:text-[14px] font-medium  text-center py-2">
                        {friend.name}
                      </h1>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl mt-3">
              <div className="flex justify-between items-center border-b-2 pb-2">
                <h1 className="text-xl lg:text-2xl font-medium">My Notes</h1>
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="btn btn-sm bg-gray-100"
                >
                  Add Note
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {notes.map((note) => (
                  <div key={note._id} className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2 items-start">
                        <span className="text-gray-500 mt-1"><FaNoteSticky /></span>
                        <p className="text-sm lg:text-base whitespace-pre-wrap">{note.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <RiDeleteBin6Line />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}

                {notes.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No notes yet</p>
                )}
              </div>
            </div>
          </div>
          <div className=" col-span-3 lg:ml-8 space-y-8 lg:overflow-y-auto lg:h-[calc(100vh-100px)]">
            {myPosts
              .slice()
              .reverse()
              .map((post) => (
                <div
                  key={post._id}
                  className="card bg-gray-50 shadow-sm rounded-md"
                >
                  <div className="card-body p-4">
                    <Link className="flex items-center gap-3 border-b-2 pb-2 lg:pb-3 shadow-sm px-3">
                      <div className="lg:w-[60px] w-[50px] h-[50px] lg:h-[60px]">
                        <img
                          className="w-full h-full rounded-full object-cover"
                          src={post.userProfileImage}
                          alt=""
                        />
                      </div>
                      <div>
                        <h1 className="text-lg lg:text-xl font-medium">
                          {post.userName}
                        </h1>
                        <p className="text-xs text-slate-400 lg:text-sm">{`${post.date
                          } at ${post.time.slice(0, -6) + post.time.slice(-3)
                          }`}</p>
                      </div>
                    </Link>
                    <pre
                      style={{
                        fontFamily: "inherit",
                        fontSize: "1rem",
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                      }}
                      className="text-xs text-slate-700 lg:text-base w-fit"
                      onClick={() => toggleExpand(post._id)}
                    >
                      {expandedPosts[post._id]
                        ? post.description
                        : `${post.description.slice(0, 220)}...`}
                    </pre>
                  </div>
                  {post.pdf && (
                    <div className="px-4 py-3 bg-gray-100 mt-2 rounded-md mx-4">
                      <div className="flex items-center gap-2">
                        <FaFilePdf className="text-red-600 text-xl" />
                        <a
                          href={post.pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View PDF
                        </a>
                      </div>
                    </div>
                  )}
                  {post.image && (
                    <figure className="w-full h-full md:w-full lg:overflow-hidden flex justify-center items-center bg-gray-100">
                      <img
                        className="w-full h-full object-cover"
                        src={post.image}
                      />
                    </figure>
                  )}

                  <div className="p-5 flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      {user && post.likedBy?.includes(user.id) ? (
                        <img
                          onClick={() => handleUnlike(post._id)}
                          className="w-8 lg:w-10 mr-2 cursor-pointer"
                          src={heartfill}
                          alt=""
                        />
                      ) : (
                        <h1
                          onClick={() => handlePostLike(post._id)}
                          className="cursor-pointer text-[32px] mr-2"
                        >
                          <FaRegHeart />
                        </h1>
                      )}

                      <p className="text-sm lg:text-lg font-medium">
                        {post.likes} Likes
                      </p>
                    </div>
                    <div className="flex items-center gap-1 cursor-pointer">
                      <p className="text-sm lg:text-lg font-medium">Share</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-4 rounded-lg w-[90%] max-w-md relative">
            <button
              onClick={() => setShowNoteModal(false)}
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-lg font-medium mb-3">Add New Note</h2>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full h-32 p-2 border rounded-lg mb-3"
              placeholder="Write your note here..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNoteModal(false)}
                className="btn btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="btn btn-sm btn-primary"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
      <div className=" mt-10">
        <DownNav />
      </div>
    </div>
  );
};

export default Profile;
