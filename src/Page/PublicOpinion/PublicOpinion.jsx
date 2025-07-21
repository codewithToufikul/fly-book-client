import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import Categories from "../../Components/Categories/Categories";
import HomeLeft from "../../Components/HomeLeft/HomeLeft";
import usePublicAxios from "../../Hooks/usePublicAxios";
import heartfill from "../../assets/heart.png";
import toast from "react-hot-toast";
import useUser from "../../Hooks/useUser";
import { FaRegHeart, FaFilePdf } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import Linkify from "linkify-react";
import { franc } from 'franc-min';

const PublicOpinion = () => {
  const { user } = useUser();
  const token = localStorage.getItem("token");
  const axiosPublic = usePublicAxios();
  const [expandedPosts, setExpandedPosts] = useState({});
  const [likingPosts, setLikingPosts] = useState({});
  const [userCountry, setUserCountry] = useState("");
  const [targetLang, setTargetLang] = useState("eng_Latn");
  const [translatedTexts, setTranslatedTexts] = useState({});
  const [showTranslates, setShowTranslates] = useState({});
  const [tLoadings, setTLoadings] = useState({});

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
    // Add keyframes to document
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
      BD: "bn",  // বাংলা (Bangladesh)
      IN: "hi",  // হিন্দি (India)
      PK: "ur",  // উর্দু (Pakistan)
      NP: "ne",  // নেপালি (Nepal)
      LK: "si",  // সিংহলি (Sri Lanka)
      MY: "ms",  // মালয় (Malaysia)
      ID: "id",  // ইন্দোনেশিয়ান (Indonesia)
      TH: "th",  // থাই (Thailand)
      VN: "vi",  // ভিয়েতনামি (Vietnam)
      MM: "my",  // বর্মি (Myanmar)
      CN: "zh",  // চাইনিজ (China)
      HK: "zh",  // চাইনিজ (Hong Kong)
      TW: "zh",  // চাইনিজ (Taiwan)
      JP: "ja",  // জাপানিজ (Japan)
      KR: "ko",  // কোরিয়ান (South Korea)
      SA: "ar",  // আরবি (Saudi Arabia)
      AE: "ar",  // আরবি (UAE)
      IQ: "ar",  // আরবি (Iraq)
      IR: "fa",  // ফার্সি (Iran)
      TR: "tr",  // তুর্কি (Turkey
      FR: "fr",  // ফরাসি (France)
      BE: "fr",  // ফরাসি (Belgium)
      CH: "fr",  // ফরাসি (Switzerland)
      CA: "fr",  // ফরাসি (Canada)
      ES: "es",  // স্প্যানিশ (Spain)
      MX: "es",  // স্প্যানিশ (Mexico)
      CO: "es",  // স্প্যানিশ (Colombia)
      AR: "es",  // স্প্যানিশ (Argentina)
      DE: "de",  // জার্মান (Germany)
      AT: "de",  // জার্মান (Austria)
      CH: "de",  // জার্মান (Switzerland)
      IT: "it",  // ইতালিয়ান (Italy)
      PT: "pt",  // পর্তুগিজ (Portugal)
      BR: "pt",  // পর্তুগিজ (Brazil)
      NL: "nl",  // ডাচ (Netherlands)
      SE: "sv",  // সুইডিশ (Sweden)
      NO: "no",  // নরওয়েজিয়ান (Norway)
      DK: "da",  // ড্যানিশ (Denmark)
      FI: "fi",  // ফিনিশ (Finland)
      RU: "ru",  // রাশিয়ান (Russia)
      UA: "uk",  // ইউক্রেনিয়ান (Ukraine)
      PL: "pl",  // পোলিশ (Poland)
      CZ: "cs",  // চেক (Czech Republic)
      HU: "hu",  // হাঙ্গেরিয়ান (Hungary)
      RO: "ro",  // রোমানিয়ান (Romania)
      GR: "el",  // গ্রিক (Greece)
      ZA: "af",  // আফ্রিকান্স (South Africa)
      NG: "yo",  // ইয়োরুবা (Nigeria)
      ET: "am",  // আমহারিক (Ethiopia)
      US: "en",  // ইংরেজি (United States)
      UK: "en",  // ইংরেজি (United Kingdom)
      CA: "en",  // ইংরেজি (Canada)
      AU: "en",  // ইংরেজি (Australia)
      NZ: "en",  // ইংরেজি (New Zealand)
    };
    
    

    setTargetLang(languageMap[countryCode] || "eng_Latn");
  };

  const handleTranslate = async (postId, content) => {
    const detectedLang = franc(content);
    console.log(targetLang, detectedLang);
    const targetLangCode = targetLang.split("_")[0];
    // যদি ভাষা 'ben' হয়, তবে অনুবাদ করার প্রয়োজন নেই
    if (detectedLang === targetLangCode) {
      toast.info("The post is already in your language.");
      return;
    }
    if (translatedTexts[postId]) {
      setShowTranslates((prev) => ({ ...prev, [postId]: !prev[postId] }));
      return;
    }

    setTLoadings((prev) => ({ ...prev, [postId]: true }));
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
        setTranslatedTexts((prev) => ({
          ...prev,
          [postId]: response.data.translation,
        }));
        setShowTranslates((prev) => ({ ...prev, [postId]: true }));
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
      setTLoadings((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const linkifyOptions = {
    render: ({ attributes, content }) => (
      <a {...attributes} className="text-blue-600 hover:underline">
        {content}
      </a>
    ),
  };

  const toggleExpand = (id) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["postsData"], // Unique key for the query
    queryFn: () =>
      axiosPublic.get("/opinion/posts").then((res) => res.data.data), // Use res.data.data for success response
  });

  const handlePostLike = async (postId) => {
    try {
      setLikingPosts((prev) => ({ ...prev, [postId]: true }));

      const response = await axiosPublic.post(
        "/opinion/like",
        { postId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Post liked successfully.");
        refetch();
      } else {
        toast.error("Failed to like the post:", response.data.error);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setLikingPosts((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleUnlike = async (postId) => {
    try {
      setLikingPosts((prev) => ({ ...prev, [postId]: true }));

      const response = await axiosPublic.post(
        "/opinion/unlike",
        { postId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Post unlike successfully.");
        refetch();
      } else {
        toast.error("Failed to like the post:", response.data.error);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setLikingPosts((prev) => ({ ...prev, [postId]: false }));
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

  const handleUpcoming = () => {
    toast.error("Features Upcoming !");
  };
  return (
    <div>
      <Navbar />
      <div className="w-full lg:grid lg:grid-cols-3 mt-5 px-3">
        <div>
          <Categories />
        </div>
        <div className="space-y-5">
          <div className=" space-y-5">
            {data
              .slice()
              .reverse()
              .map((post) => {
                return (
                  <div
                    key={post._id}
                    className="card bg-gray-50 shadow-sm rounded-md"
                  >
                    <div className="card-body p-4">
                      <Link
                        to={
                          user.id == post.userId
                            ? `/my-profile`
                            : `/profile/${post.userId}`
                        }
                        className=" flex items-center gap-3 border-b-2 pb-2 lg:pb-3 shadow-sm px-3"
                      >
                        <div className=" lg:w-[60px] w-[50px] h-[50px] lg:h-[60px] ">
                          <img
                            className=" w-full h-full rounded-full object-cover "
                            src={post.userProfileImage}
                            alt=""
                          />
                        </div>
                        <div className="">
                          <h1 className=" text-lg lg:text-xl font-medium">
                            {post.userName}
                          </h1>
                          <p className=" text-xs text-slate-400 lg:text-sm">{`${
                            post.date
                          } at ${
                            post.time.slice(0, -6) + post.time.slice(-3)
                          }`}</p>
                        </div>
                      </Link>
                      <p
                        className="text-sm lg:text-lg whitespace-pre-wrap"
                        onClick={() => toggleExpand(post._id)}
                      >
                        {expandedPosts[post._id] ? (
                          <div className="space-y-3">
                            <Linkify
                              componentDecorator={(
                                decoratedHref,
                                decoratedText,
                                key
                              ) => (
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
                              {showTranslates[post._id]
                                ? translatedTexts[post._id] ||
                                  "Translation loading..."
                                : post.description}
                            </Linkify>
                          </div>
                        ) : (
                          <>
                            <span className="block sm:hidden">
                              <div className="space-y-3">
                                <Linkify
                                  componentDecorator={(
                                    decoratedHref,
                                    decoratedText,
                                    key
                                  ) => (
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
                                  {showTranslates[post._id]
                                    ? translatedTexts[post._id]
                                      ? translatedTexts[post._id].slice(
                                          0,
                                          100
                                        ) + "..."
                                      : "Translation loading..."
                                    : post.description.slice(0, 100) + "..."}
                                </Linkify>
                              </div>
                            </span>
                            <span className="hidden sm:block">
                              <div className="space-y-3">
                                <Linkify
                                  componentDecorator={(
                                    decoratedHref,
                                    decoratedText,
                                    key
                                  ) => (
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
                                  {showTranslates[post._id]
                                    ? translatedTexts[post._id]
                                      ? translatedTexts[post._id].slice(
                                          0,
                                          180
                                        ) + "..."
                                      : "Translation loading..."
                                    : post.description.slice(0, 180) + "..."}
                                </Linkify>
                              </div>
                            </span>
                          </>
                        )}
                      </p>
                      <button
                          onClick={() =>
                            handleTranslate(post._id, post.description)
                          }
                          className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-700 transition-colors"
                          disabled={tLoadings[post._id]}
                        >
                          {tLoadings[post._id] ? (
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
                          {showTranslates[post._id]
                            ? "Show Original"
                            : "Translate"}
                        </button>
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
                    </div>
                    {post.image && (
                      <figure className="w-full h-full overflow-hidden flex justify-center items-center bg-gray-100">
                        <img
                          className="w-full h-full object-contain"
                          src={post.image}
                        />
                      </figure>
                    )}

                    <div className="p-5 flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        {likingPosts[post._id] ? (
                          <div className="w-8 lg:w-10 h-8 lg:h-10 mr-2 animate-spin border-2 border-gray-300 border-t-red-500 rounded-full"></div>
                        ) : user && post.likedBy?.includes(user.id) ? (
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
                      <div
                        onClick={handleUpcoming}
                        className="flex items-center gap-1 cursor-pointer"
                      >
                        <p className=" text-sm lg:text-lg font-medium">Share</p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        <div className="hidden lg:block">
          <HomeLeft />
        </div>
      </div>
      <div className=" mt-[50px]">
        <DownNav />
      </div>
    </div>
  );
};

export default PublicOpinion;
