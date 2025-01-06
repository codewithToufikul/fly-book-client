import { useState, useEffect } from "react";
import Categories from "../../Components/Categories/Categories";
import Navbar from "../../Components/Navbar/Navbar";
import heartfill from "../../assets/heart.png";
import send from "../../assets/sent.png";
import HomeLeft from "../../Components/HomeLeft/HomeLeft";
import DownNav from "../../Components/DownNav/DownNav";
import { useQuery } from "@tanstack/react-query";
import { FaRegHeart } from "react-icons/fa";
import useUser from "../../Hooks/useUser";
import usePublicAxios from "../../Hooks/usePublicAxios";
import toast from "react-hot-toast";

const Home = () => {
  const { user, loading } = useUser();
  const axiosPublic = usePublicAxios();
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["adminPostData"],
    queryFn: () =>
      fetch("https://fly-book-server.onrender.com/all-home-books").then((res) => res.json()),
  });

  const [expandedPosts, setExpandedPosts] = useState({});
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");

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
        setShowNav(false); // Scrolling down, hide nav
      } else {
        setShowNav(true); // Scrolling up, show nav
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) return "An error has occurred: " + error.message;

  const handlePostLike = async (postId) => {
    try {
      const response = await axiosPublic.post("/admin-post/like", { postId });

      if (response.data.success) {
        refetch();
      } else {
        toast.error("Failed to like the post:", response.data.error);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleUnlike = async (postId) => {
    try {
      const response = await axiosPublic.post("/admin-post/unlike", { postId });

      if (response.data.success) {
        refetch();
      } else {
        toast.error("Failed to unlike the post:", response.data.error);
      }
    } catch (error) {
      console.error("Error unliking post:", error);
    }
  };

  const filteredPosts =
    activeCategory === "All"
      ? data
      : data.filter((post) => post.category === activeCategory);

  return (
    <div>
      <Navbar />
      <div className="w-full lg:grid lg:grid-cols-3 mt-5 px-3">
        <div>
          <Categories />
        </div>
        <div className="space-y-5 mt-10 lg:mt-5">
          <nav
            className={`bg-gray-50 fixed w-[650px] z-20 top-[55px] lg:top-[65px] left-1/2 transform -translate-x-1/2 border-b border-gray-200 transition-transform duration-300 ${
              showNav ? "translate-y-0" : "-translate-y-full"
            }`}
          >
            <div className="p-4 flex justify-center">
              <ul className="flex lg:space-x-8 space-x-4 font-medium">
                {[
                  "All",
                  "History",
                  "Science",
                  "Lifestyle",
                  "Book War",
                ].map((category) => (
                  <li key={category}>
                    <button
                      onClick={() => setActiveCategory(category)}
                      className={`${
                        activeCategory === category
                          ? "text-blue-700"
                          : "text-gray-900"
                      } rounded hover:text-blue-700`}
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {filteredPosts.length === 0 ? (
            <p className="text-center text-gray-500">No posts in this category.</p>
          ) : (
            filteredPosts
              .slice()
              .reverse()
              .map((post) => (
                <div
                  key={post.id}
                  className="card bg-gray-50 shadow-sm rounded-md"
                >
                  <div className="card-body p-4">
                    <h2 className="card-title text-xl lg:text-3xl">
                      {post.title}
                    </h2>
                    <p
                      className="text-sm lg:text-lg"
                      onClick={() => toggleExpand(post.id)}
                    >
                      {expandedPosts[post.id] ? (
                        post.message
                      ) : (
                        <>
                          <span className="block sm:hidden">
                            {post.message.slice(0, 100)}...
                          </span>
                          <span className="hidden sm:block">
                            {post.message.slice(0, 180)}...
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
                        <img
                          onClick={() => handleUnlike(post._id)}
                          className=" w-8 lg:w-10 mr-2 cursor-pointer"
                          src={heartfill}
                          alt=""
                        />
                      ) : (
                        <h1
                          onClick={() => handlePostLike(post._id)}
                          className=" cursor-pointer text-[32px] mr-2"
                        >
                          <FaRegHeart />
                        </h1>
                      )}

                      <p className=" text-sm lg:text-lg font-medium">
                        {post.likes} Likes
                      </p>
                    </div>
                    <div className="flex items-center gap-1 cursor-pointer">
                      <img className=" w-7" src={send} alt="" />
                      <p className=" text-sm lg:text-lg font-medium">Share</p>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
        <div className="hidden lg:block">
          <HomeLeft />
        </div>
      </div>
      <div className=" mt-10">
        <DownNav />
      </div>
    </div>
  );
};

export default Home;
