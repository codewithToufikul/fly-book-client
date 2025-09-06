import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Languages,
  X,
  Send,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  Clock,
} from "lucide-react";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import useUser from "../../Hooks/useUser";
import usePublicAxios from "../../Hooks/usePublicAxios";
import { franc } from "franc";
import toast from "react-hot-toast";
import Linkify from "react-linkify";

const HomePostDetails = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likingPost, setLikingPost] = useState(false);
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showMobileComments, setShowMobileComments] = useState(false);
  const { user, loading: isLoading } = useUser();
  const axiosPublic = usePublicAxios();

  // Translation states
  const [targetLang, setTargetLang] = useState("eng_Latn");
  const [translatedText, setTranslatedText] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [userCountry, setUserCountry] = useState("");

  const loadingTextStyle = {
    color: "#3B82F6",
    fontWeight: "500",
    fontSize: "14px",
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3000/all-home-post/${id}`
        );
        if (!response.ok) {
          throw new Error("Post not found");
        }
        const data = await response.json();
        setPost(data);
        setLikes(data.likes || 0);
        setComments(data.comments || []);

        // Check if current user has liked this post
        if (user && data.likedBy) {
          setIsLiked(data.likedBy.includes(user.id));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, user]);

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
      BD: "ben_Beng", // বাংলা (Bangladesh)
      IN: "hin_Deva", // হিন্দি (India)
      PK: "urd_Arab", // উর্দু (Pakistan)
      NP: "nep_Deva", // নেপালি (Nepal)
      LK: "sin_Sinh", // সিংহলি (Sri Lanka)
      MY: "msa_Latn", // মালয় (Malaysia)
      ID: "ind_Latn", // ইন্দোনেশিয়ান (Indonesia)
      TH: "tha_Thai", // থাই (Thailand)
      VN: "vie_Latn", // ভিয়েতনামি (Vietnam)
      MM: "mya_Mymr", // বর্মি (Myanmar)
      CN: "zho_Hans", // চাইনিজ (China)
      HK: "zho_Hant", // চাইনিজ (Hong Kong)
      TW: "zho_Hant", // চাইনিজ (Taiwan)
      JP: "jpn_Jpan", // জাপানিজ (Japan)
      KR: "kor_Hang", // কোরিয়ান (South Korea)
      SA: "ara_Arab", // আরবি (Saudi Arabia)
      AE: "ara_Arab", // আরবি (UAE)
      IQ: "ara_Arab", // আরবি (Iraq)
      IR: "fas_Arab", // ফার্সি (Iran)
      TR: "tur_Latn", // তুর্কি (Turkey)
      FR: "fra_Latn", // ফরাসি (France)
      BE: "fra_Latn", // ফরাসি (Belgium)
      CH: "fra_Latn", // ফরাসি (Switzerland)
      CA: "fra_Latn", // ফরাসি (Canada)
      ES: "spa_Latn", // স্প্যানিশ (Spain)
      MX: "spa_Latn", // স্প্যানিশ (Mexico)
      CO: "spa_Latn", // স্প্যানিশ (Colombia)
      AR: "spa_Latn", // স্প্যানিশ (Argentina)
      DE: "deu_Latn", // জার্মান (Germany)
      AT: "deu_Latn", // জার্মান (Austria)
      IT: "ita_Latn", // ইতালিয়ান (Italy)
      PT: "por_Latn", // পর্তুগিজ (Portugal)
      BR: "por_Latn", // পর্তুগিজ (Brazil)
      NL: "nld_Latn", // ডাচ (Netherlands)
      SE: "swe_Latn", // সুইডিশ (Sweden)
      NO: "nor_Latn", // নরওয়েজিয়ান (Norway)
      DK: "dan_Latn", // ড্যানিশ (Denmark)
      FI: "fin_Latn", // ফিনিশ (Finland)
      RU: "rus_Cyrl", // রাশিয়ান (Russia)
      UA: "ukr_Cyrl", // ইউক্রেনিয়ান (Ukraine)
      PL: "pol_Latn", // পোলিশ (Poland)
      CZ: "ces_Latn", // চেক (Czech Republic)
      HU: "hun_Latn", // হাঙ্গেরিয়ান (Hungary)
      RO: "ron_Latn", // রোমানিয়ান (Romania)
      GR: "ell_Grek", // গ্রিক (Greece)
      ZA: "afr_Latn", // আফ্রিকান্স (South Africa)
      NG: "yor_Latn", // ইয়োরুবা (Nigeria)
      ET: "amh_Ethi", // আমহারিক (Ethiopia)
      US: "eng_Latn", // ইংরেজি (United States)
      UK: "eng_Latn", // ইংরেজি (United Kingdom)
      AU: "eng_Latn", // ইংরেজি (Australia)
      NZ: "eng_Latn", // ইংরেজি (New Zealand)
    };

    setTargetLang(languageMap[countryCode] || "eng_Latn");
  };

  const handleTranslate = async () => {
    if (showTranslation) {
      setShowTranslation(false);
      return;
    }

    if (translatedText) {
      setShowTranslation(true);
      return;
    }

    const content = post.message;
    const detectedLang = franc(content);
    const targetLangCode = targetLang.split("_")[0];

    // Check if already in target language
    if (detectedLang === targetLangCode) {
      toast.info("The post is already in your language.");
      return;
    }

    setTranslating(true);
    toast.loading(<div style={loadingTextStyle}>AI Translating...</div>, {
      duration: 2000,
    });

    try {
      const response = await axiosPublic.post("/api/translate", {
        text: content,
        srcLang: detectedLang,
        targetLang: targetLang,
      });

      if (response.data && response.data.translation) {
        setTranslatedText(response.data.translation);
        setShowTranslation(true);
        toast.success("Translation completed!");
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

  const handlePostLike = async (postId) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      setLikingPost(true);
      const endpoint = isLiked ? "/admin-post/unlike" : "/admin-post/like";

      const { data } = await axiosPublic.post(
        `https://api.flybook.com.bd${endpoint}`,
        { postId }
      );

      if (data.success) {
        if (isLiked) {
          setLikes((prev) => prev - 1);
          setIsLiked(false);
        } else {
          setLikes((prev) => prev + 1);
          setIsLiked(true);
        }
      }
    } catch (error) {
      console.error("Error liking/unliking post:", error);
    } finally {
      setLikingPost(false);
    }
  };

  const handleCommentSubmit = useCallback(async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);

      const response = await axiosPublic.post(
        `http://localhost:3000/admin-post/comment`,
        {
          postId: id,
          comment: newComment.trim(),
          userId: user.id,
          userName: user.name,
          userPhoto: user.profileImage,
        }
      );
      const data = response.data;
      if (data.success) {
        const newCommentObj = {
          id: Date.now(),
          comment: newComment.trim(),
          userName: user.name || user.email,
          createdAt: new Date().toISOString(),
        };
        setComments((prev) => [newCommentObj, ...prev]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  }, [user, newComment, axiosPublic, id]);

  const handleShare = async () => {
    const postUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(postUrl);
      setShowCopyMessage(true);
      setTimeout(() => setShowCopyMessage(false), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = postUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShowCopyMessage(true);
      setTimeout(() => setShowCopyMessage(false), 2000);
    }
  };

  const formatMessage = (message) => {
    return message.split("\n").map((line, index) => {
      if (line.trim() === "") {
        return React.createElement("br", { key: index });
      }

      if (
        line.startsWith("🟨") ||
        line.startsWith("✅") ||
        line.startsWith("🎯") ||
        line.startsWith("🟩")
      ) {
        return React.createElement(
          "div",
          {
            key: index,
            className:
              "my-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-400 shadow-sm",
          },
          React.createElement(
            "p",
            {
              className: "text-gray-800 font-medium leading-relaxed",
            },
            line
          )
        );
      }

      return React.createElement(
        "p",
        {
          key: index,
          className: "mb-4 text-gray-700 leading-relaxed text-justify",
        },
        line
      );
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Create a stable reference for the textarea using useRef
  const mobileTextareaRef = React.useRef(null);

  // Handle comment input change with focus preservation
  const handleMobileCommentChange = useCallback((e) => {
    const value = e.target.value;
    setNewComment(value);
    
    // Ensure focus is maintained on mobile
    requestAnimationFrame(() => {
      if (mobileTextareaRef.current && document.activeElement !== mobileTextareaRef.current) {
        mobileTextareaRef.current.focus();
      }
    });
  }, []);

  // Mobile Comments Sidebar Component - Rendered conditionally to prevent unnecessary re-renders
  const renderMobileCommentsSidebar = () => {
    if (!showMobileComments) return null;
    
    return (
      <div className="fixed inset-0 mb-8 z-50 transform translate-x-0 transition-transform duration-300">
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setShowMobileComments(false)}
        />
        <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-white shadow-xl">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-lg font-bold text-gray-900">
                Comments ({comments.length})
              </h3>
              <button
                onClick={() => setShowMobileComments(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium text-sm">
                          {comment.userName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 text-sm">
                            {comment.userName}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {comment.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex gap-2">
                <textarea
                  ref={mobileTextareaRef}
                  value={newComment}
                  onChange={handleMobileCommentChange}
                  placeholder={user ? "Write a comment..." : "Please login to comment"}
                  className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows="2"
                  disabled={!user}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  inputMode="text"
                  onBlur={(e) => {
                    // Prevent blur if it's caused by virtual keyboard on mobile
                    e.preventDefault();
                    e.target.focus();
                  }}
                  onFocus={() => {
                    // Scroll textarea into view on mobile
                    setTimeout(() => {
                      if (mobileTextareaRef.current) {
                        mobileTextareaRef.current.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'center' 
                        });
                      }
                    }, 300);
                  }}
                />
                <button
                  onClick={handleCommentSubmit}
                  disabled={!user || !newComment.trim() || submittingComment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  type="button"
                >
                  <Send className="w-4 h-4" />
                  {submittingComment ? "..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <div className="mt-12">
          <DownNav />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-red-700">Error: {error}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12">
          <DownNav />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Post not found</p>
        </div>
        <div className="mt-12">
          <DownNav />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Mobile Comments Sidebar */}
      {renderMobileCommentsSidebar()}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Login Required
              </h3>
              <p className="text-gray-600 mb-6">
                You must login first to like posts and add comments.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    window.location.href = "/login";
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
              <div className="relative h-64 md:h-80 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    {post.category}
                  </span>
                </div>

                {/* Translation Button */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={handleTranslate}
                    disabled={translating}
                    className="bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-white transition-all duration-200 flex items-center gap-2"
                  >
                    <Languages className="w-4 h-4" />
                    {translating
                      ? "Translating..."
                      : showTranslation
                      ? "Show Original"
                      : "Translate"}
                  </button>
                </div>
              </div>

              {/* Title and Meta */}
              <div className="p-6 md:p-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {post.title}
                </h1>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{post.time}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200 relative">
                  <button
                    onClick={() => handlePostLike(post._id)}
                    disabled={likingPost}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isLiked
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600"
                    } ${likingPost ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Heart
                      className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                    />
                    <span className="font-medium">
                      {likes} {isLiked ? "Liked" : "Like"}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowMobileComments(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl transition-all duration-200 lg:hidden"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">
                      {comments.length} Comments
                    </span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all duration-200"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="font-medium">Share</span>
                  </button>

                  {showCopyMessage && (
                    <div className="absolute top-16 md:top-0 right-0 my-2  bg-green-600 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
                      Link copied to clipboard!
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
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
                className="prose prose-lg max-w-none"
              >
                {showTranslation && translatedText
                  ? formatMessage(translatedText)
                  : formatMessage(post.message)}
              </Linkify>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-8 bg-white rounded-2xl shadow-lg p-6 max-h-[calc(100vh-6rem)] flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Comments ({comments.length})
              </h3>
              <div className="mb-6">
                <textarea
                  key="desktop-comment-textarea" // Stable key for desktop textarea too
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={
                    user ? "Add a comment..." : "Please login to comment"
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  disabled={!user}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleCommentSubmit}
                    disabled={!user || !newComment.trim() || submittingComment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {submittingComment ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No comments yet. Be the first to comment!
                    </p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium text-sm">
                            {comment.userName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm">
                              {comment.userName}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {comment.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <DownNav />
      </div>
    </div>
  );
};

export default HomePostDetails;