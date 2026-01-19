import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
const FreeAi = () => {
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["adminPostData"],
    queryFn: () =>
      fetch("https://fly-book-server-lzu4.onrender.com/admin/post-ai").then((res) => res.json()),
  });

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
  return (
    <div>
      <Navbar />
      <div className=" max-w-[1220px] mx-auto px-2">
        <h1 className=" hidden lg:block text-3xl font-medium py-6 px-4 bg-slate-100 ">
          Ai Related Posts
        </h1>
        <h1 className=" lg:hidden block text-xl lg:text-3xl font-medium py-3 lg:py-6 px-4 bg-slate-100 ">
          Ai Related Posts
        </h1>
        <div className=" mt-2 max-w-[650px] mx-auto">
          {data
            .slice()
            .reverse()
            .map((post) => (
              <div className=" p-3 border-2 rounded-lg hover:shadow-xl shadow-md cursor-pointer">
                <Link to={`/ai-post/${post._id}`} key={post._id}>
                  <div className=" flex items-center gap-2">
                    <p className=" text-xs italic lg:text-sm">
                      {post.time.slice(0, -6) + post.time.slice(-3)}
                    </p>
                    <p className=" text-xs italic lg:text-sm">{post.date}</p>
                  </div>
                  <h2 className=" text-lg font-semibold">{post.title}</h2>
                  <p className=" text-base">
                    {window.innerWidth <= 768
                      ? post.message.slice(0, 80)
                      : post.message.slice(0, 120)}
                    ...
                    <span className=" text-blue-400">see more</span>
                  </p>
                </Link>
              </div>
            ))}
        </div>
      </div>
      <div className=" mt-12">
        <DownNav />
      </div>
    </div>
  );
};

export default FreeAi;
