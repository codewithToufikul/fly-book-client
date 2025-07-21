import {
  useState,
  useEffect,
  lazy,
  Suspense,
  useRef,
  useCallback,
} from "react";
import Navbar from "../../Components/Navbar/Navbar";
import heartfill from "../../assets/heart.png";
import send from "../../assets/sent.png";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FaRegHeart } from "react-icons/fa";
import useUser from "../../Hooks/useUser";
import usePublicAxios from "../../Hooks/usePublicAxios";
import toast from "react-hot-toast";
import { Link } from "react-router";
import loadingLogo from "../../assets/load.webp";
import useCategories from "../../Hooks/useCategories";
import Linkify from "react-linkify";
import { franc } from "franc-min";
import ChatBotButton from "../../Components/ChatBotButton/ChatBotButton";

const Categories = lazy(() => import("../../Components/Categories/Categories"));
const HomeLeft = lazy(() => import("../../Components/HomeLeft/HomeLeft"));
const DownNav = lazy(() => import("../../Components/DownNav/DownNav"));

const Home = () => {
  const { user, loading: isLoading } = useUser();
  const {
    categories,
    isLoading: categoriesLoading,
    isError,
    error: categoriesError,
  } = useCategories();
  const axiosPublic = usePublicAxios();
  const [expandedPosts, setExpandedPosts] = useState({});
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [likingPosts, setLikingPosts] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [visiblePosts, setVisiblePosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const observer = useRef();
  const POSTS_PER_PAGE = 5;
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [postLikes, setPostLikes] = useState({});
  const queryClient = useQueryClient();
  const [userCountry, setUserCountry] = useState("");
  const [targetLang, setTargetLang] = useState("eng_Latn");
  const [translatedTexts, setTranslatedTexts] = useState({});
  const [showTranslates, setShowTranslates] = useState({});
  const [tLoadings, setTLoadings] = useState({});

  // CSS styles for translation loading animation
  const loadingTextStyle = {
    display: 'inline-block',
    background: 'linear-gradient(90deg, #4b6cb7 0%, #182848 50%, #4b6cb7 100%)',
    backgroundSize: '200% auto',
    color: 'transparent',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    animation: 'shine 1.5s ease-in-out infinite',
    fontWeight: 'bold',
    padding: '4px 8px',
    borderRadius: '4px'
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
    const style = document.createElement('style');
    style.textContent = keyframes;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const {
    isLoading: dataLoading,
    error,
    data,
    refetch,
  } = useQuery({
    queryKey: ["adminPostData", activeCategory],
    queryFn: async () => {
      try {
        setCategoryLoading(true);

        const url =
          activeCategory === "All"
            ? "https://api.flybook.com.bd/all-home-books"
            : `https://api.flybook.com.bd/all-home-books?category=${activeCategory}`;

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();

        const posts = Array.isArray(data) ? data : [];
        const sortedData = [...posts].sort((a, b) => {
          try {
            const dateA = (a.date || "").replace(/["']/g, "").trim();
            const dateB = (b.date || "").replace(/["']/g, "").trim();
            const timeA = (a.time || "").replace(/["']/g, "").trim();
            const timeB = (b.time || "").replace(/["']/g, "").trim();

            const getTimestamp = (date, time) => {
              const [month, day, year] = date
                .split("/")
                .map((n) => parseInt(n, 10));
              const [timeStr, period] = time.split(" ");
              const [hours, minutes, seconds] = timeStr
                .split(":")
                .map((n) => parseInt(n, 10));
              let hours24 = hours;
              if (period === "PM" && hours !== 12) hours24 += 12;
              if (period === "AM" && hours === 12) hours24 = 0;
              return new Date(
                year,
                month - 1,
                day,
                hours24,
                minutes,
                seconds
              ).getTime();
            };
            const timestampA = getTimestamp(dateA, timeA);
            const timestampB = getTimestamp(dateB, timeB);

            return timestampB - timestampA;
          } catch (error) {
            console.error(
              "Sorting error:",
              error,
              "\nPost A:",
              a,
              "\nPost B:",
              b
            );
            return 0;
          }
        });
        setVisiblePosts(sortedData.slice(0, POSTS_PER_PAGE));
        setCategoryLoading(false);
        return sortedData;
      } catch (error) {
        setCategoryLoading(false);
        console.error("Error fetching posts:", error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

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
    toast.loading(
      <div style={loadingTextStyle}>
        AI Translating...
      </div>,
      { duration: 2000 }
    );
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

  useEffect(() => {
    if (activeCategory) {
      setPage(1);
      setHasMore(true);
      setVisiblePosts([]);
      refetch();
    }
  }, [activeCategory]);

  const toggleExpand = (id) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const loadMorePosts = useCallback(() => {
    if (!data || loading) return;

    setLoading(true);
    const startIndex = visiblePosts.length;
    const nextPosts = data.slice(startIndex, startIndex + POSTS_PER_PAGE);

    setTimeout(() => {
      if (nextPosts.length) {
        setVisiblePosts((prev) => [...prev, ...nextPosts]);
        setPage((prev) => prev + 1);
      }
      if (startIndex + nextPosts.length >= data.length) {
        setHasMore(false);
      }
      setLoading(false);
    }, 500);
  }, [data, loading, visiblePosts.length]);

  const lastPostElementRef = useCallback(
    (node) => {
      if (dataLoading || loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts();
        }
      });

      if (node) observer.current.observe(node);
    },
    [dataLoading, hasMore, loading, loadMorePosts]
  );

  if (isLoading || dataLoading || categoriesLoading) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center">
        <div className="w-[100px] lg:w-[200px]">
          <img className="w-full" src={loadingLogo} alt="" />
        </div>
        <span className="loading loading-dots loading-lg"></span>
      </div>
    );
  }

  if (error || isError || !data) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center">
        <h2 className="text-xl text-red-500 mb-4">Something went wrong!</h2>
        <p className="text-gray-600">
          Please check your internet connection and try again
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const handlePostLike = async (postId) => {
    try {
      setLikingPosts((prev) => ({ ...prev, [postId]: true }));

      const response = await axiosPublic.post("/admin-post/like", { postId });

      if (response.data.success) {
        setVisiblePosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? {
                ...post,
                likes: post.likes + 1,
                likedBy: [...(post.likedBy || []), user.id],
              }
              : post
          )
        );
        if (data) {
          const updatedData = data.map((post) =>
            post._id === postId
              ? {
                ...post,
                likes: post.likes + 1,
                likedBy: [...(post.likedBy || []), user.id],
              }
              : post
          );
          queryClient.setQueryData(
            ["adminPostData", activeCategory],
            updatedData
          );
        }
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

      const response = await axiosPublic.post("/admin-post/unlike", { postId });

      if (response.data.success) {
        setVisiblePosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? {
                ...post,
                likes: post.likes - 1,
                likedBy: post.likedBy.filter((id) => id !== user.id),
              }
              : post
          )
        );
        if (data) {
          const updatedData = data.map((post) =>
            post._id === postId
              ? {
                ...post,
                likes: post.likes - 1,
                likedBy: post.likedBy.filter((id) => id !== user.id),
              }
              : post
          );
          queryClient.setQueryData(
            ["adminPostData", activeCategory],
            updatedData
          );
        }
        toast.success("Post unliked successfully");
      } else {
        toast.error(`Failed to unlike the post: ${response.data.error}`);
      }
    } catch (error) {
      console.error("Error unliking post:", error);
      toast.error("Something went wrong while unliking the post");
    } finally {
      setLikingPosts((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleUpcoming = () => {
    toast.error("🚀 Exciting new features coming soon!🎉");
  };
  return (
    <div>
      <Navbar />
      <div className="w-full lg:grid lg:grid-cols-3 mt-5 px-3">
        <div>
          <Suspense
            fallback={
              <div className="flex justify-center items-center">
                <span className="loading loading-dots loading-lg"></span>
              </div>
            }
          >
            <Categories />
          </Suspense>
        </div>
        <div className="space-y-5 mt-10 lg:mt-5">
          <nav
            className={`bg-gray-50 fixed w-full lg:w-[650px] z-20 top-[115px] lg:top-[65px] left-1/2 transform -translate-x-1/2 border-b border-gray-200 transition-transform duration-300 ${showNav ? "translate-y-0" : "-translate-y-full  top-[50px]"
              }`}
          >
            <div className="p-4 flex justify-center">
              <div className="overflow-x-auto w-full">
                <ul className="flex w-[650px] justify-between justify-evenly font-medium whitespace-nowrap ">
                  {categories.map((category) => (
                    <li key={category._id}>
                      <button
                        onClick={() => setActiveCategory(category.category)}
                        className={`${activeCategory === category.category
                          ? "text-blue-700"
                          : "text-gray-900"
                          } rounded hover:text-blue-700`}
                      >
                        {category.category}
                      </button>
                    </li>
                  ))}
                  <li>
                    <Link
                      to={"/thesis"}
                      className=" text-gray-900 rounded hover:text-blue-700 font-semibold"
                    >
                      Research Articles
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={"/free-ai"}
                      className=" text-gray-900 rounded hover:text-blue-700 font-semibold"
                    >
                      Free Ai
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          {isLoading ? (
            <div className=" lg:flex flex-col min-h-screen justify-center hidden lg:block items-center">
              <div className=" w-[100px] lg:w-[200px]">
                <img className=" w-full " src={loadingLogo} alt="" />
              </div>
              <span className="loading loading-dots loading-lg"></span>
            </div>
          ) : (
            <div className="space-y-5">
              {categoryLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[200px]">
                  <span className="loading loading-spinner loading-lg"></span>
                  <p className="mt-4 text-gray-600">Loading posts...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center min-h-[200px]">
                  <p className="text-center text-red-500">
                    Error loading posts. Please try again.
                  </p>
                  <button
                    onClick={() => refetch()}
                    className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800"
                  >
                    Retry
                  </button>
                </div>
              ) : !data || data.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[200px]">
                  <p className="text-center text-gray-500">
                    No posts available in{" "}
                    {activeCategory === "All"
                      ? "any category"
                      : `the ${activeCategory} category`}
                    .
                  </p>
                  {activeCategory !== "All" && (
                    <button
                      onClick={() => setActiveCategory("All")}
                      className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800"
                    >
                      View all posts
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {visiblePosts.map((post, index) => (
                    <div
                      key={post._id}
                      ref={
                        index === visiblePosts.length - 1
                          ? lastPostElementRef
                          : null
                      }
                      className="card bg-gray-50 shadow-sm border-b-4 border-b-blue-200 border-t-2 rounded-md"
                    >
                      <div className="card-body p-4">
                        <h2 className="card-title text-xl lg:text-3xl">
                          {post.title}
                        </h2>

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
                                  : post.message}
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
                                      : post.message.slice(0, 100) + "..."}
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
                                      : post.message.slice(0, 180) + "..."}
                                  </Linkify>
                                </div>
                              </span>
                            </>
                          )}
                        </p>
                        <button
                          onClick={() =>
                            handleTranslate(post._id, post.message)
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
                      </div>
                      <figure className="w-full">
                        <img
                          className="h-[200px] lg:h-[300px] w-full"
                          src={post.image}
                          alt={post.title}
                        />
                      </figure>
                      <div className="p-5 flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          {user && post.likedBy?.includes(user.id) ? (
                            likingPosts[post._id] ? (
                              <span className="loading loading-spinner loading-md mr-2"></span>
                            ) : (
                              <img
                                onClick={() => handleUnlike(post._id)}
                                className="w-8 lg:w-10 mr-2 cursor-pointer"
                                src={heartfill}
                                alt=""
                              />
                            )
                          ) : likingPosts[post._id] ? (
                            <span className="loading loading-spinner loading-md mr-2"></span>
                          ) : (
                            <h1
                              onClick={() => handlePostLike(post._id)}
                              className="cursor-pointer text-[32px] mr-2"
                            >
                              <FaRegHeart />
                            </h1>
                          )}

                          <p className=" text-sm lg:text-lg font-medium">
                            {post.likes} Likes
                          </p>
                        </div>
                        <div
                          onClick={handleUpcoming}
                          className="flex items-center gap-1 cursor-pointer"
                        >
                          <img className=" w-7" src={send} alt="" />
                          <p className=" text-sm lg:text-lg font-medium">
                            Share
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-center p-4">
                      <span className="loading loading-spinner loading-lg"></span>
                    </div>
                  )}

                  {!hasMore && visiblePosts.length > 0 && (
                    <p className="text-center text-gray-500 py-4">
                      No more posts to load
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <div className="hidden lg:block">
          <Suspense
            fallback={
              <div className="flex justify-center items-center">
                <span className="loading loading-dots loading-lg"></span>
              </div>
            }
          >
            <HomeLeft />
          </Suspense>
        </div>
      </div>
      <div className=" mt-10">
        <Suspense
          fallback={
            <div className="flex justify-center items-center">
              <span className="loading loading-dots loading-lg"></span>
            </div>
          }
        >
          <DownNav />
        </Suspense>
      </div>
      <ChatBotButton />
    </div>
  );
};

export default Home;
