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
            // Parse date in MM/DD/YYYY format and combine with time
            const parseDateTime = (dateStr, timeStr) => {
              if (!dateStr || !timeStr) return new Date(0);

              const [month, day, year] = dateStr.split("/");
              // Convert 12-hour format to 24-hour format
              let [time, period] = timeStr.split(" ");
              let [hours, minutes, seconds] = time.split(":");

              if (period === "PM" && hours !== "12") {
                hours = parseInt(hours) + 12;
              }
              if (period === "AM" && hours === "12") {
                hours = "00";
              }

              return new Date(year, month - 1, day, hours, minutes, seconds);
            };

            const dateA = parseDateTime(a.date, a.time);
            const dateB = parseDateTime(b.date, b.time);

            return dateB - dateA;
          } catch (error) {
            console.error("Error sorting dates:", error);
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
            className={`bg-gray-50 fixed w-full lg:w-[650px] z-20 top-[115px] lg:top-[65px] left-1/2 transform -translate-x-1/2 border-b border-gray-200 transition-transform duration-300 ${
              showNav ? "translate-y-0" : "-translate-y-full  top-[50px]"
            }`}
          >
            <div className="p-4 flex justify-center">
              <div className="overflow-x-auto w-full">
                <ul className="flex w-[650px] justify-between justify-evenly font-medium whitespace-nowrap ">
                  {categories.map((category) => (
                    <li key={category._id}>
                      <button
                        onClick={() => setActiveCategory(category.category)}
                        className={`${
                          activeCategory === category.category
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
                              {post.message}
                            </Linkify>
                          ) : (
                            <>
                              <span className="block sm:hidden">
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
                                  {post.message.slice(0, 100)}...
                                </Linkify>
                              </span>
                              <span className="hidden sm:block">
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
                                  {post.message.slice(0, 180)}...
                                </Linkify>
                              </span>
                            </>
                          )}
                        </p>
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
    </div>
  );
};

export default Home;
