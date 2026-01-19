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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import usePublicAxios from "../../Hooks/usePublicAxios";
import useAllFriends from "../../Hooks/useAllFriends";
import imageCompression from "browser-image-compression";
import { HiDotsHorizontal } from "react-icons/hi";
import { FaNoteSticky } from "react-icons/fa6";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useSocket } from "../../contexts/SocketContext";
import Swal from "sweetalert2";
import { MdOutlineEdit } from "react-icons/md";

const Profile = () => {
  const { user, loading: userLoading, refetch } = useUser();
  const queryClient = useQueryClient();
  const socket = useSocket();
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [faceApiLoading, setFaceApiLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isVideoStarted, setIsVideoStarted] = useState(false);
  const [updateLogin, setUpdateLogin] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectionInterval, setDetectionInterval] = useState(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const axiosPublic = usePublicAxios();
  const IMG_BB_API_KEY = import.meta.env.VITE_IMAGE_HOSTING_KEY;
  const [expandedPosts, setExpandedPosts] = useState({});
  const { allFriends, refetch: refetchFriends, isLoading } = useAllFriends();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [referredUsers, setReferredUsers] = useState([]);
  const [loadingReferred, setLoadingReferred] = useState(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [updatingPost, setUpdatingPost] = useState(false);

  // Safely get token from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      setToken(null);
    }
  }, []);

  const toggleExpand = (id) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Defer face-api models loading - only load when needed (lazy load)
    const loadModels = async () => {
      try {
        setFaceApiLoading(true);

        // Dynamic import for face-api to reduce initial bundle size
        const faceapi = await import('face-api.js');

        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models")
        ]);

        setModelsLoaded(true);
        setFaceApiLoading(false);
      } catch (error) {
        console.error("Error loading face-api models:", error);
        setFaceApiLoading(false);
        toast.error("Failed to load face detection models");
      }
    };

    // Fetch notes
    const fetchNotes = async () => {
      if (!token) return;
      try {
        const response = await axiosPublic.get(
          "/notes",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data?.notes) {
          setNotes(response.data.notes);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
        // Don't throw, just log the error
      }
    };

    // Load face-api models only when user actually needs it (e.g., when opening camera)
    // For now, defer loading by 2 seconds to not block initial render
    const faceApiTimer = setTimeout(() => {
      loadModels();
    }, 2000);

    fetchNotes();
    fetchReferredUsers();

    return () => clearTimeout(faceApiTimer);
  }, [token, axiosPublic, user?.id]);

  // Listen for wallet updates from socket
  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleWalletUpdate = (data) => {
      console.log("💰 Wallet updated via socket:", data);
      // Invalidate and refetch user profile to get updated wallet balance
      queryClient.invalidateQueries(["userProfile"]);
      refetch();
    };

    socket.on("walletUpdated", handleWalletUpdate);

    return () => {
      socket.off("walletUpdated", handleWalletUpdate);
    };
  }, [socket, user?.id, refetch, queryClient]);

  // Periodic refetch for wallet updates (every 15 seconds when on profile page)
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      // Invalidate and refetch for wallet updates
      queryClient.invalidateQueries(["userProfile"]);
      refetch({
        cancelRefetch: false,
        throwOnError: false
      });
    }, 15000); // Refetch every 15 seconds (balanced - not too frequent, not too slow)

    return () => clearInterval(interval);
  }, [user?.id, refetch, queryClient]);

  // Log user data for debugging (only in dev) - MUST be before early return
  useEffect(() => {
    if (import.meta.env.DEV && user) {
      console.log("👤 Current user data:", user);
      console.log("💰 FlyWallet balance:", user.flyWallet);
    }
  }, [user]);

  // Close wallet dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (walletDropdownOpen && !event.target.closest('.wallet-dropdown-container')) {
        setWalletDropdownOpen(false);
      }
    };

    if (walletDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [walletDropdownOpen]);

  // Fetch referred users
  const fetchReferredUsers = async () => {
    if (!token || !user?.id) return;
    setLoadingReferred(true);
    try {
      const response = await axiosPublic.get(
        "/users/referred",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.success) {
        setReferredUsers(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching referred users:", error);
    } finally {
      setLoadingReferred(false);
    }
  };

  const {
    data,
    isLoading: postLoading,
    refetch: postRefetch,
  } = useQuery({
    queryKey: ["postsData"],
    queryFn: () =>
      axiosPublic.get("/opinion/posts").then((res) => res.data.data),
    retry: 1,
    staleTime: 0, // Mark data as stale immediately to ensure refetch always hits the server
    cacheTime: 1 * 60 * 1000, // Reduced cache time (1 minute)
    refetchOnWindowFocus: false,
    throwOnError: false,
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
        toast.error("Failed to unlike the post:", response.data.error);
      }
    } catch (error) {
      console.error("Error unliking post:", error);
    }
  };

  const updateVerificationStatus = async (status) => {
    try {
      await axios.put(
        "https://fly-book-server-lzu4.onrender.com/profile/verification",
        { verificationStatus: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Face verification completed successfully!");
      refetch();
    } catch (error) {
      console.error("Error updating verification status:", error);
      toast.error("Failed to update verification status.");
    }
  };

  const startVideo = async () => {
    try {
      console.log("Starting camera...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded, starting playback");
          videoRef.current.play();
        };
      }

      return stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
      let errorMessage = "Failed to access camera. ";

      if (error.name === 'NotAllowedError') {
        errorMessage += "Please allow camera permission.";
      } else if (error.name === 'NotFoundError') {
        errorMessage += "No camera found.";
      } else if (error.name === 'NotReadableError') {
        errorMessage += "Camera is already in use.";
      } else {
        errorMessage += "Please check your camera settings.";
      }

      toast.error(errorMessage);
      setIsVideoStarted(false);
      throw error;
    }
  };

  const startDetection = async () => {
    if (!modelsLoaded) {
      toast.error("Face detection models not loaded yet. Please wait.");
      return;
    }

    console.log("Starting face detection...");
    setVerificationStatus("Detecting face...");

    const interval = setInterval(async () => {
      if (videoRef.current && videoRef.current.videoWidth > 0) {
        try {
          const detections = await faceapi
            .detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
            .withFaceLandmarks()
            .withFaceDescriptors();

          console.log(`Detected ${detections.length} faces`);

          if (detections.length > 0) {
            setVerificationStatus("Face detected and verified!");
            await updateVerificationStatus(true);
            clearInterval(interval);
            setDetectionInterval(null);

            // Stop camera after successful verification
            setTimeout(() => {
              stopCamera();
            }, 2000);
          } else {
            setVerificationStatus("Please position your face in the camera");
          }
        } catch (error) {
          console.error("Face detection error:", error);
          setVerificationStatus("Detection error. Please try again.");
        }
      }
    }, 500); // Check every 500ms for better performance

    setDetectionInterval(interval);
  };

  const stopCamera = () => {
    console.log("Stopping camera...");

    // Clear detection interval
    if (detectionInterval) {
      clearInterval(detectionInterval);
      setDetectionInterval(null);
    }

    // Stop video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
      videoRef.current.srcObject = null;
    }

    setIsVideoStarted(false);
    setVerificationStatus(null);
  };

  const startVerification = async () => {
    if (!modelsLoaded) {
      toast.error("Face detection models are still loading. Please wait.");
      return;
    }

    try {
      setIsVideoStarted(true);
      setVerificationStatus("Starting camera...");

      await startVideo();

      // Wait a bit for video to stabilize before starting detection
      setTimeout(() => {
        startDetection();
      }, 1000);
    } catch (error) {
      setIsVideoStarted(false);
      setVerificationStatus("Camera failed to start");
    }
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
          "https://fly-book-server-lzu4.onrender.com/profile/update",
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
          "https://fly-book-server-lzu4.onrender.com/profile/cover/update",
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

  const myPosts = (data && Array.isArray(data) && user?.id)
    ? data.filter((post) => post.userId === user.id)
    : [];

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
        "https://fly-book-server-lzu4.onrender.com/profile/updateDetails",
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
        "https://fly-book-server-lzu4.onrender.com/profile/updateDetails/location",
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

  const handleDeletePost = async (postId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axiosPublic.delete(`/opinion/delete/${postId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data.success) {
            Swal.fire("Deleted!", "Your post has been deleted.", "success");
            postRefetch();
          }
        } catch (error) {
          console.error("Error deleting post:", error);
          toast.error("Failed to delete post.");
        }
      }
    });
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditDescription(post.description);
    setShowEditModal(true);
  };

  const handleUpdatePost = async () => {
    if (!editDescription.trim()) {
      toast.error("Description cannot be empty!");
      return;
    }

    setUpdatingPost(true);
    try {
      const response = await axiosPublic.put(
        `/opinion/edit/${editingPost._id}`,
        { description: editDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Post updated successfully!");
        setShowEditModal(false);
        setEditingPost(null);
        postRefetch();
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post.");
    } finally {
      setUpdatingPost(false);
    }
  };

  // Show loading state while user data is being fetched
  if (userLoading || !user || !token) {
    return (
      <div>
        <Navbar />
        <div className="max-w-[1220px] mx-auto">
          <div className="flex justify-center items-center min-h-screen">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  // Ensure user object has all required properties with defaults
  const safeUser = {
    id: user?.id || '',
    name: user?.name || 'User',
    userName: user?.userName || '',
    profileImage: user?.profileImage || 'https://i.ibb.co/mcL9L2t/f10ff70a7155e5ab666bcdd1b45b726d.jpg',
    coverImage: user?.coverImage || 'https://i.ibb.co.com/xmyN9fT/freepik-expand-75906-min.png',
    email: user?.email || '',
    number: user?.number || '',
    work: user?.work || '',
    studies: user?.studies || '',
    currentCity: user?.currentCity || '',
    hometown: user?.hometown || '',
    verificationStatus: user?.verificationStatus || false,
    referrerId: user?.referrerId || null,
    referrerName: user?.referrerName || user?.referredBy || null,
    flyWallet: user?.flyWallet || 0,
    wallet: user?.wallet || 0,
    ...user, // Spread to include any other properties
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-[1220px] mx-auto">
        <div className=" bg-gray-50 p-2 pb-4 rounded-xl mt-2">
          <div className="w-full h-[160px] lg:h-[350px] lg:mt-2 relative">
            <img
              className="w-full h-full object-cover object-center rounded-t-xl lg:rounded-xl"
              src={safeUser.coverImage}
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
                  src={safeUser.profileImage}
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
                  {safeUser.name}
                </h1>
                <p className="text-sm lg:text-base text-gray-500">
                  @{safeUser.userName}
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
              <div className="modal-box max-w-2xl">
                <form method="dialog">
                  <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={stopCamera}
                  >
                    ✕
                  </button>
                </form>
                <h1 className="text-xl font-medium text-center mb-4">
                  Face Verification
                </h1>

                {faceApiLoading && (
                  <div className="text-center mb-4">
                    <div className="loading loading-spinner loading-md"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading face detection models...</p>
                  </div>
                )}

                <div className="space-y-4">
                  {safeUser.verificationStatus ? (
                    <div className="flex flex-col items-center">
                      <img className="w-[200px]" src={done} alt="Verified" />
                      <p className="text-green-600 font-medium mt-2">Face Already Verified ✅</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center gap-4 mb-4">
                        {!isVideoStarted ? (
                          <button
                            className={`btn btn-primary ${faceApiLoading ? 'btn-disabled' : ''}`}
                            onClick={startVerification}
                            disabled={faceApiLoading || !modelsLoaded}
                          >
                            {faceApiLoading ? 'Loading Models...' : 'Start Camera'}
                          </button>
                        ) : (
                          <button
                            className="btn btn-error"
                            onClick={stopCamera}
                          >
                            Stop Camera
                          </button>
                        )}
                      </div>

                      <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
                        <video
                          ref={videoRef}
                          width="400"
                          height="300"
                          autoPlay
                          muted
                          className="rounded-lg border-2 border-gray-300"
                          style={{
                            display: isVideoStarted ? 'block' : 'none',
                            transform: 'scaleX(-1)' // Mirror the video for better user experience
                          }}
                        />
                        {!isVideoStarted && (
                          <div className="flex items-center justify-center w-[400px] h-[300px] bg-gray-200 rounded-lg">
                            <div className="text-center">
                              <IoVideocam className="mx-auto text-6xl text-gray-400 mb-2" />
                              <p className="text-gray-600">Camera preview will appear here</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {verificationStatus && (
                        <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <p className="text-blue-800 font-medium">
                            {verificationStatus}
                          </p>
                        </div>
                      )}

                      <div className="text-center text-sm text-gray-600">
                        <p>• Position your face clearly in the camera</p>
                        <p>• Ensure good lighting</p>
                        <p>• Look directly at the camera</p>
                      </div>
                    </>
                  )}
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
                  {safeUser.work ? (
                    <li className=" flex items-center gap-2">
                      <span className=" text-2xl lg:text-3xl text-gray-400">
                        <MdWork />
                      </span>
                      <span className=" text-sm "> Works at </span>
                      <span className=" text-sm lg:text-base font-medium text-gray-700">
                        {safeUser.work}
                      </span>
                    </li>
                  ) : null}
                  {safeUser.studies ? (
                    <li className=" flex items-center gap-2">
                      <span className=" text-2xl lg:text-[28px] text-gray-400">
                        <FaUserGraduate />
                      </span>
                      <span className=" text-sm "> Studies at </span>
                      <span className=" text-sm lg:text-base font-medium text-gray-700">
                        {safeUser.studies}
                      </span>
                    </li>
                  ) : null}
                  {safeUser.currentCity ? (
                    <li className=" flex items-center gap-2">
                      <span className=" text-2xl lg:text-[28px] text-gray-400">
                        <HiHomeModern />
                      </span>
                      <span className=" text-sm "> Lives in </span>
                      <span className=" text-sm lg:text-base font-medium text-gray-700">
                        {safeUser.currentCity}
                      </span>
                    </li>
                  ) : null}
                  {safeUser.hometown ? (
                    <li className=" flex items-center gap-2">
                      <span className=" text-2xl lg:text-[28px] text-gray-400">
                        <FaLocationDot />
                      </span>
                      <span className=" text-sm "> From </span>
                      <span className=" text-sm lg:text-base font-medium text-gray-700">
                        {safeUser.hometown}
                      </span>
                    </li>
                  ) : null}
                  {safeUser.referrerName ? (
                    <li className=" flex items-center gap-2">
                      <span className=" text-2xl lg:text-[28px] text-gray-400">
                        👤
                      </span>
                      <span className=" text-sm "> Referred by </span>
                      {safeUser.referrerId ? (
                        <Link
                          to={`/profile/${safeUser.referrerId}`}
                          className=" text-sm lg:text-base font-medium text-blue-600 hover:underline"
                        >
                          @{safeUser.referrerName}
                        </Link>
                      ) : (
                        <span className=" text-sm lg:text-base font-medium text-gray-700">
                          @{safeUser.referrerName}
                        </span>
                      )}
                    </li>
                  ) : null}
                  <li className=" flex items-center gap-2">
                    <span className=" text-2xl lg:text-3xl text-gray-400">
                      <IoIosMail />
                    </span>
                    <span className=" text-sm lg:text-base text-gray-700">
                      {safeUser.email}
                    </span>
                  </li>
                  <li className=" flex items-center gap-3">
                    <span className=" text-lg lg:text-[24px] text-gray-400">
                      <FaPhoneAlt />
                    </span>
                    <span className=" text-sm lg:text-base text-gray-700">
                      {safeUser.number}
                    </span>
                  </li>
                </ul>
                <button
                  className={`btn w-full my-4`}
                  disabled={safeUser.verificationStatus === false}
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
                        defaultValue={safeUser.work}
                        className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs"
                      />

                      <label className="block mb-2 mt-4 text-sm font-normal text-gray-900">
                        Add Studies
                      </label>
                      <input
                        type="text"
                        name="studies"
                        placeholder="Add your Current Studies"
                        defaultValue={safeUser.studies}
                        className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs"
                      />

                      <label className="block mb-2 mt-4 text-sm font-normal text-gray-900">
                        Current City
                      </label>
                      <input
                        type="text"
                        name="currentCity"
                        defaultValue={safeUser.currentCity}
                        placeholder="Add your current city"
                        className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs"
                      />

                      <label className="block mb-2 mt-4 text-sm font-normal text-gray-900">
                        Hometown
                      </label>
                      <input
                        type="text"
                        name="hometown"
                        defaultValue={safeUser.hometown}
                        placeholder="Add your Hometown"
                        className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs"
                      />

                      <label className="block mb-2 mt-4 text-sm font-normal text-gray-900">
                        Your Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        defaultValue={safeUser.email}
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

            {/* Wallet Section with Dropdown */}
            <div className="bg-gray-50 p-3 rounded-xl mt-3">
              <h1 className="text-xl lg:text-2xl font-medium py-1 lg:py-2 mb-3 border-b-2">
                My Wallets
              </h1>

              {/* Clickable Wallet Button */}
              <div className="relative wallet-dropdown-container">
                <button
                  onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 p-4 rounded-lg shadow-md transition-all duration-200 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-white text-3xl lg:text-4xl">
                      💰
                    </div>
                    <div className="text-left">
                      <h3 className="text-white text-sm lg:text-base font-medium">
                        Wallets
                      </h3>
                      <p className="text-white text-xs lg:text-sm opacity-90">
                        Click to view all wallets
                      </p>
                    </div>
                  </div>
                  <div className="text-white">
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${walletDropdownOpen ? "rotate-180" : ""
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Dropdown Content */}
                {walletDropdownOpen && (
                  <div className="mt-3 space-y-3 animate-fadeIn">
                    {/* FlyWallet */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-105">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-white text-sm lg:text-base font-medium mb-1">
                            FlyWallet
                          </h3>
                          <p className="text-white text-2xl lg:text-3xl font-bold">
                            {parseFloat(safeUser.flyWallet || 0).toFixed(2)}
                          </p>
                          <Link to="/wallate-shop">
                            <button className="mt-2 bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors">
                              Use your coin
                            </button>
                          </Link>
                        </div>
                        <div className="text-white text-3xl lg:text-4xl">
                          💰
                        </div>
                      </div>
                    </div>

                    {/* My Wallet */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-105">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-white text-sm lg:text-base font-medium mb-1">
                            My Wallet
                          </h3>
                          <p className="text-white text-2xl lg:text-3xl font-bold">
                            {parseFloat(safeUser.wallet || 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-white text-3xl lg:text-4xl">
                          💳
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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

            {/* Referred Users Section */}
            <div className="bg-gray-50 p-3 rounded-xl mt-3">
              <h1 className="text-xl lg:text-2xl font-medium py-1 lg:py-2 mb-2 border-b-2">
                Referred Users
              </h1>
              {loadingReferred ? (
                <div className="flex justify-center py-4">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              ) : (
                <div className="mt-3">
                  {referredUsers.length > 0 ? (
                    <div className="grid gap-2 grid-cols-3">
                      {referredUsers.map((referredUser) => (
                        <Link
                          to={`/profile/${referredUser._id}`}
                          className="lg:w-[130px] lg:h-[160px] w-[100px] h-[160px] bg-white shadow-sm rounded-lg flex flex-col items-center hover:shadow-md transition-shadow"
                          key={referredUser._id}
                        >
                          <div className="w-[100px] lg:w-[130px] h-[140px]">
                            <img
                              className="w-full h-[110px] lg:h-[120px] rounded-t-2xl object-cover"
                              src={referredUser.profileImage || 'https://i.ibb.co/mcL9L2t/f10ff70a7155e5ab666bcdd1b45b726d.jpg'}
                              alt={referredUser.name}
                            />
                          </div>
                          <div className="w-full pl-3 lg:pl-0 px-1 flex flex-col gap-3 justify-between">
                            <h1 className="text-xs lg:text-[14px] font-medium text-center py-2">
                              {referredUser.name}
                            </h1>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No referred users yet
                    </p>
                  )}
                  {referredUsers.length > 0 && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Total: {referredUsers.length} user{referredUsers.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}
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
                    <div className="flex items-center gap-3 border-b-2 pb-2 lg:pb-3 shadow-sm px-3">
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
                      <div className="ml-auto dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-circle">
                          <HiDotsHorizontal className="text-xl" />
                        </div>
                        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow-lg border border-gray-100">
                          <li>
                            <button onClick={(e) => { e.preventDefault(); handleEditPost(post); }} className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 py-2">
                              <MdOutlineEdit className="text-lg" /> Edit
                            </button>
                          </li>
                          <li>
                            <button onClick={(e) => { e.preventDefault(); handleDeletePost(post._id); }} className="flex items-center gap-2 text-red-600 hover:bg-red-50 py-2">
                              <RiDeleteBin6Line className="text-lg" /> Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
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
                      {safeUser.id && post.likedBy?.includes(safeUser.id) ? (
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

      {/* Post Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transform transition-all">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
              <h3 className="text-xl font-bold">Edit Your Post</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={safeUser.profileImage}
                  alt="Me"
                  className="w-12 h-12 rounded-full border-2 border-blue-100 object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">{safeUser.name}</h4>
                  <p className="text-xs text-gray-500">Public Post</p>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all text-gray-800"
                  placeholder="What's on your mind?"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {editDescription.length} characters
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-full font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  disabled={updatingPost}
                >
                  Discard Changes
                </button>
                <button
                  onClick={handleUpdatePost}
                  className={`px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold shadow-md hover:shadow-lg transform active:scale-95 transition-all flex items-center gap-2 ${updatingPost ? "opacity-75 cursor-wait" : ""
                    }`}
                  disabled={updatingPost}
                >
                  {updatingPost ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Saving...
                    </>
                  ) : (
                    "Update Post"
                  )}
                </button>
              </div>
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