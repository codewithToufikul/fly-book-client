import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import usePublicAxios from "../../Hooks/usePublicAxios";
import heartfill from "../../assets/heart.png";
import toast from "react-hot-toast";
import useUser from "../../Hooks/useUser";
import { FaRegHeart, FaFilePdf, FaShare, FaCopy, FaArrowLeft } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import Linkify from "linkify-react";
import { franc } from 'franc-min';

const PostDetail = () => {
  const { postId } = useParams();
  const { user } = useUser();
  const token = localStorage.getItem("token");
  const axiosPublic = usePublicAxios();
  const [likingPost, setLikingPost] = useState(false);
  const [userCountry, setUserCountry] = useState("");
  const [targetLang, setTargetLang] = useState("eng_Latn");
  const [translatedText, setTranslatedText] = useState("");
  const [showTranslated, setShowTranslated] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // CSS styles for translation loading animation
  const loadingTextStyle = {
    display: "inline-block",
    background: "linear-gradient(90deg, #4b6cb7 0%, #182848 50%, #4b6cb7 100%)",
    backgroundSize: "200% auto",
    color: "transparent",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    animation: "shine 1.5s ease-in-out infinite",
    fontWeight: "bold",
    padding: "4px 8px",
    borderRadius: "4px",
  };

  const keyframes = `
    @keyframes shine {
      to {
        background-position: 200% center;
      }
    }
  `;

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = keyframes;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    fetch("https://geolocation-db.com/json/")
      .then((res) => res.json())
      .then((data) => {
        setUserCountry(data.country_name);
        determineLanguage(data.country_code);
      })
      .catch((err) => console.error("Error fetching location:", err));
  }, []);

  const determineLanguage = (countryCode) => {
    const languageMap = {
      BD: "bn", IN: "hi", PK: "ur", NP: "ne", LK: "si", MY: "ms", ID: "id",
      TH: "th", VN: "vi", MM: "my", CN: "zh", HK: "zh", TW: "zh", JP: "ja",
      KR: "ko", SA: "ar", AE: "ar", IQ: "ar", IR: "fa", TR: "tr", FR: "fr",
      BE: "fr", CH: "fr", CA: "fr", ES: "es", MX: "es", CO: "es", AR: "es",
      DE: "de", AT: "de", IT: "it", PT: "pt", BR: "pt", NL: "nl", SE: "sv",
      NO: "no", DK: "da", FI: "fi", RU: "ru", UA: "uk", PL: "pl", CZ: "cs",
      HU: "hu", RO: "ro", GR: "el", ZA: "af", NG: "yo", ET: "am", US: "en",
      UK: "en", AU: "en", NZ: "en"
    };
    setTargetLang(languageMap[countryCode] || "eng_Latn");
  };

const { isLoading, error, data: post } = useQuery({
  queryKey: ["postDetail", postId],
  queryFn: () =>
    axiosPublic.get(`/opinion/posts/${postId}`).then((res) => res.data.data), // Changed from /opinion/post/ to /opinion/posts/
});

  const handleTranslate = async () => {
    if (!post) return;
    
    const detectedLang = franc(post.description);
    const targetLangCode = targetLang.split("_")[0];
    
    if (detectedLang === targetLangCode) {
      toast.success("The post is already in your language.");
      return;
    }
    
    if (translatedText) {
      setShowTranslated(!showTranslated);
      return;
    }

    setTranslating(true);
    toast.loading(<div style={loadingTextStyle}>AI Translating...</div>, {
      duration: 2000,
    });
    
    try {
      const response = await axiosPublic.post("/api/translate", {
        text: post.description,
        srcLang: detectedLang,
        targetLang: targetLang,
      });

      if (response.data && response.data.translation) {
        setTranslatedText(response.data.translation);
        setShowTranslated(true);
      } else {
        throw new Error("Translation failed");
      }
    } catch (error) {
      console.error("Translation error:", error);
      toast.error(
        error.response?.data?.error ||
          "Translation failed. Please try again later."
      );
    } finally {
      setTranslating(false);
    }
  };

  const handleLike = async () => {
    try {
      setLikingPost(true);
      const response = await axiosPublic.post(
        "/opinion/like",
        { postId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Post liked successfully.");
        // Refetch post data or update state
      }
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setLikingPost(false);
    }
  };

  const handleUnlike = async () => {
    try {
      setLikingPost(true);
      const response = await axiosPublic.post(
        "/opinion/unlike",
        { postId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Post unliked successfully.");
        // Refetch post data or update state
      }
    } catch (error) {
      console.error("Error unliking post:", error);
    } finally {
      setLikingPost(false);
    }
  };

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      toast.success("Link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.userName}`,
        text: post.description.slice(0, 100) + "...",
        url: window.location.href,
      });
    } else {
      handleCopyLink();
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    
    setSubmittingComment(true);
    try {
      const response = await axiosPublic.post(
        "/opinion/comment",
        { postId, comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setNewComment("");
        toast.success("Comment added successfully!");
        // Refetch comments or update state
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Post not found</h2>
          <Link to="/public-opinion" className="text-blue-500 hover:underline">
            Go back to feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back button */}
        <Link 
          to="/public-opinion" 
          className="flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-6"
        >
          <FaArrowLeft /> Back to Feed
        </Link>

        {/* Post content */}
        <div className="bg-gray-50 shadow-sm rounded-md">
          <div className="p-6">
            {/* User info */}
            <Link
              to={
                user.id == post.userId
                  ? `/my-profile`
                  : `/profile/${post.userId}`
              }
              className="flex items-center gap-3 border-b-2 pb-4 mb-6"
            >
              <div className="w-16 h-16">
                <img
                  className="w-full h-full rounded-full object-cover"
                  src={post.userProfileImage}
                  alt=""
                />
              </div>
              <div>
                <h1 className="text-xl font-medium">{post.userName}</h1>
                <p className="text-sm text-slate-400">
                  {`${post.date} at ${
                    post.time.slice(0, -6) + post.time.slice(-3)
                  }`}
                </p>
              </div>
            </Link>

            {/* Post description */}
            <div className="text-lg whitespace-pre-wrap mb-4">
              <Linkify
                componentDecorator={(decoratedHref, decoratedText, key) => (
                  <a
                    key={key}
                    href={decoratedHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {decoratedText}
                  </a>
                )}
              >
                {showTranslated ? translatedText : post.description}
              </Linkify>
            </div>

            {/* Translation button */}
            <button
              onClick={handleTranslate}
              className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-700 transition-colors mb-4"
              disabled={translating}
            >
              {translating ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
              )}
              {showTranslated ? "Show Original" : "Translate"}
            </button>

            {/* PDF attachment */}
            {post.pdf && (
              <div className="px-4 py-3 bg-gray-100 rounded-md mb-4">
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
          </div>

          {/* Post image */}
          {post.image && (
            <figure className="w-full overflow-hidden flex justify-center items-center bg-gray-100">
              <img className="w-full object-contain" src={post.image} />
            </figure>
          )}

          {/* Action buttons */}
          <div className="p-6 border-t flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Like button */}
              <div className="flex items-center gap-2">
                {likingPost ? (
                  <div className="w-8 h-8 animate-spin border-2 border-gray-300 border-t-red-500 rounded-full"></div>
                ) : user && post.likedBy?.includes(user.id) ? (
                  <img
                    onClick={handleUnlike}
                    className="w-8 cursor-pointer"
                    src={heartfill}
                    alt=""
                  />
                ) : (
                  <FaRegHeart
                    onClick={handleLike}
                    className="cursor-pointer text-2xl"
                  />
                )}
                <span className="font-medium">{post.likes} Likes</span>
              </div>
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
              >
                <FaShare />
                Share
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
              >
                <FaCopy />
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-[50px]">
        <DownNav />
      </div>
    </div>
  );
};

export default PostDetail;