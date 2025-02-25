import React from "react";
import { useParams } from "react-router";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import { useQuery } from "@tanstack/react-query";

const ThesisRead = () => {
  const { postId } = useParams();
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["adminPostData"],
    queryFn: () =>
      fetch("https://api.flybook.com.bd/thesis").then((res) => res.json()),
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
  const readThesis = data.find((post) => post._id == postId);
  return (
    <div>
      <Navbar />
      <div className=" max-w-[1120px] mx-auto px-2 mt-3">
        <div className=" flex items-center gap-2">
        <p className=" text-lg">Post date:</p>
          <p className=" text-sm">
            {readThesis.time.slice(0, -6) + readThesis.time.slice(-3)}
          </p>
          <p className=" text-sm">{readThesis.date}</p>
        </div>
        <h1 className=" text-lg lg:text-3xl font-semibold mt-2 border-b-2 pb-2">{readThesis.title}</h1>
        <p className=" whitespace-pre-wrap text-base lg:text-lg">{readThesis.message}</p>
      </div>
      <div className=" mt-14 lg:mt-10">
        <DownNav></DownNav>
      </div>
    </div>
  );
};

export default ThesisRead;
