import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Linkify from "react-linkify";

const ViewAiPost = () => {
  const { id } = useParams();
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["aiPostData"],
    queryFn: () =>
      fetch(`https://fly-book-server-lzu4.onrender.com/admin/post-ai/${id}`).then((res) => res.json()),
  });

  const componentDecorator = (href, text, key) => (
    <a
      href={href}
      key={key}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline"
    >
      {text}
    </a>
  );

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
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div>
      <Navbar />
      <div className="max-w-[1220px] mx-auto px-2">
        <h1 className="text-3xl font-medium py-6 px-4 bg-slate-100">
          {data.title}
        </h1>
        {data.image && (
          <div className="my-4">
            <img
              src={data.image}
              alt={data.title}
              className="max-w-full h-auto rounded-lg shadow-md"
            />
          </div>
        )}
        <div className="text-base whitespace-pre-wrap">
          <Linkify componentDecorator={componentDecorator}>
            {data.message}
          </Linkify>
        </div>
      </div>
      <div>
        <DownNav />
      </div>
    </div>
  );
};

export default ViewAiPost;
