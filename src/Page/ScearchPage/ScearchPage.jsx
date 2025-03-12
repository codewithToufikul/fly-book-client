import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import useUser from "../../Hooks/useUser";
import toast from "react-hot-toast";
import heartfill from "../../assets/heart.png";
import usePublicAxios from "../../Hooks/usePublicAxios";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";

const ScearchPage = () => {
  const { user, loading, refetch } = useUser();
  const axiosPublic = usePublicAxios();
  const token = localStorage.getItem("token");
  const [expandedPosts, setExpandedPosts] = useState({});
  const location = useLocation();
  const { searchResults } = location.state || {};
  const [users, setUsers] = useState([]);
  const [opinions, setOpinions] = useState([]);
  const [books, setBooks] = useState([]);
  const [onindoBooks, setOnindoBooks] = useState([]);
  const [pdfBooks, setPdfBooks] = useState([]);
  const [searchCate,  setSearchCate] = useState("all")

  const toggleExpand = (id) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }
  const fetchSearchResult = () => {
    if (searchResults) {
      setUsers(searchResults.websiteResults?.users || []);
      setOpinions(searchResults.websiteResults?.opinions || []);
      setBooks(searchResults.websiteResults?.books || []);
      setOnindoBooks(searchResults.websiteResults?.onindoBooks || []);
      setPdfBooks(searchResults.websiteResults?.pdfBooks || []);
    }
  };

  useEffect(() => {
    fetchSearchResult();
  }, [searchResults]);

  let peoples = users.filter((userP) => userP?._id !== user?.id);
  let sBooks = books.filter((book) => book?.userId !== user?.id);
  let sOpinions = opinions.filter((post) => post?.userId !== user?.id);
  let sOnindoBooks = onindoBooks.filter((book) => book?.userId !== user?.id);
  let sPdfBooks = pdfBooks.filter((book) => book?.userId !== user?.id);

  //   sendFriendRequest
  const sendFriendRequest = async (recipientId) => {
    try {
      await axiosPublic.post(
        "/friend-request/send",
        { recipientId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("request sent !");
      refetch();
    } catch (error) {
      console.log(error);
      toast.error("something went wrong !");
    }
  };

  const cancelFriendRequest = async (recipientId) => {
    try {
      await axiosPublic.post(
        "/friend-request/cancel",
        { recipientId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.error("Request Cancel !");
      refetch();
    } catch (error) {
      console.log(error);
      toast.error("something went wrong !");
    }
  };
  const sortSearch = (category) => {
    setSearchCate(category)
  }; 
  console.log(searchResults)
  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="border-b-2 pb-4 shadow-sm mb-3">
          <ul className="flex items-center justify-center lg:justify-start gap-2 flex-wrap">
            <li onClick={() => sortSearch("all")} className={`text-xs lg:text-lg p-2 bg-blue-50 font-semibold cursor-pointer rounded-md ${searchCate === "all" ? "bg-gray-200" : ""}`}>All</li>
            <li onClick={() => sortSearch("peoples")} className={`text-xs lg:text-lg p-2 bg-blue-50 font-semibold cursor-pointer rounded-md ${searchCate === "peoples" ? "bg-gray-200" : ""}`}>Peoples</li>
            <li onClick={() => sortSearch("books")} className={`text-xs lg:text-lg p-2 bg-blue-50 font-semibold cursor-pointer rounded-md ${searchCate === "books" ? "bg-gray-200" : ""}`}>Books</li>
            <li onClick={() => sortSearch("opinions")} className={`text-xs lg:text-lg p-2 bg-blue-50 font-semibold cursor-pointer rounded-md ${searchCate === "opinions" ? "bg-gray-200" : ""}`}>Opinion</li>
            <li onClick={() => sortSearch("onindo")} className={`text-xs lg:text-lg px-1 py-2 bg-blue-50 font-semibold cursor-pointer rounded-md ${searchCate === "onindo" ? "bg-gray-200" : ""}`}>Onindo Books</li>
            <li onClick={() => sortSearch("pdf")} className={`text-xs lg:text-lg p-2 bg-blue-50 font-semibold cursor-pointer rounded-md ${searchCate === "pdf" ? "bg-gray-200" : ""}`}>PDF Books</li>
          </ul>
        </div>

        <h1 className="text-2xl font-bold mb-6">Search Results</h1>

        {/* Main Content Layout */}
        <div className="lg:flex gap-6">
          {/* Website Results Column */}
          {(peoples?.length > 0 || opinions?.length > 0 || books?.length > 0 || onindoBooks?.length > 0 || pdfBooks?.length > 0) ? (
            <div className="lg:w-2/3">
              {/* Users Section */}
              {peoples?.length > 0 && searchCate !== "books" && searchCate !== "opinions" && searchCate !== "onindo" && searchCate !== "pdf" && (
                <div className={`category-section mb-6 p-4 border border-gray-300 rounded-lg ${searchCate !== "peoples" && searchCate !== "all" ? "hidden" : "block"}`}>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Peoples
                  </h2>
                  <ul className=" grid grid-cols-1 lg:grid-cols-4">
                    {peoples.map((userItem) => (
                      <div
                        className="lg:w-[210px] lg:h-[280px] w-full h-[120px] bg-white shadow-sm rounded-lg flex flex-row lg:flex-col items-center"
                        key={userItem._id}
                      >
                        <div className="w-[160px] lg:w-[210px] h-full lg:h-[170px]">
                          <img
                            className="w-full h-full lg:h-[170px] rounded-l-2xl lg:rounded-l-none lg:rounded-t-2xl object-cover"
                            src={userItem.profileImage}
                            alt={userItem.name}
                          />
                        </div>
                        <div className=" w-full pl-3 lg:pl-0 px-1 flex flex-col lg: gap-3 justify-between pb-3">
                          <Link
                            to={`/profile/${userItem._id}`}
                            className=" text-xl lg:text-[22px] font-medium lg:font-semibold text-center py-2"
                          >
                            {userItem.name}
                          </Link>
                          {user.friends?.includes(userItem._id) ? (
                            <button className="w-full btn text-base lg:text-[17px] bg-gray-100 text-gray-600 py-2 rounded">
                              Friend
                            </button>
                          ) : user.friendRequestsSent?.includes(userItem._id) ? (
                            <button
                              onClick={() => cancelFriendRequest(userItem._id)}
                              className="w-full btn text-base bg-yellow-50 lg:text-[17px] text-yellow-600 py-2 rounded"
                            >
                              Cancel Request
                            </button>
                          ) : user.friendRequestsReceived?.includes(userItem._id) ? (
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleAcceptReq(userItem._id)}
                                className=" btn bg-blue-50 text-blue-600 rounded"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => removeFriendRequest(userItem._id)}
                                className=" btn bg-red-50 text-red-600 rounded"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => sendFriendRequest(userItem._id)}
                              className="w-full btn text-base lg:text-[17px] bg-green-50 text-green-600 py-2 rounded"
                            >
                              Add Friend
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </ul>
                </div>
              )}

              {/* Opinions Section */}
              {opinions?.length > 0 && searchCate !== "peoples" && searchCate !== "books" && searchCate !== "onindo" && searchCate !== "pdf" && (
                <div className={`category-section mb-6 p-4 border border-gray-300 rounded-lg ${searchCate !== "opinions" && searchCate !== "all" ? "hidden" : "block"}`}>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Opinions
                  </h2>
                  <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {opinions.map((post) => {
                      const isPostLiked =
                        Array.isArray(post?.likedBy) &&
                        post.likedBy.some((id) => id === user?.id);

                      return (
                        <div
                          key={post._id}
                          className="card bg-gray-50 shadow-sm rounded-md pb-5"
                        >
                          <div className="card-body p-4">
                            <Link
                              to={
                                user.id === post.userId
                                  ? `/my-profile`
                                  : `/profile/${post.userId}`
                              }
                              className="flex items-center gap-3 border-b-2 pb-2 lg:pb-3 shadow-sm px-3"
                            >
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
                                <p className="text-xs text-slate-400 lg:text-sm">{`${
                                  post.date
                                } at ${post.time.slice(0, -6)}${post.time.slice(
                                  -3
                                )}`}</p>
                              </div>
                            </Link>
                            <pre
                              style={{
                                fontFamily: "inherit",
                                fontSize: "1rem",
                                whiteSpace: "pre-wrap",
                                wordWrap: "break-word",
                              }}
                              className="text-sm lg:text-base w-fit"
                              onClick={() => toggleExpand(post._id)}
                            >
                              {expandedPosts[post._id] ? (
                                post.description
                              ) : (
                                <>
                                  <span className="block sm:hidden">
                                    {post.description.slice(0, 140)}...
                                  </span>
                                  <span className="hidden sm:block">
                                    {post.description.slice(0, 220)}...
                                  </span>
                                </>
                              )}
                            </pre>
                          </div>
                          {post.image && (
                            <figure className="w-full h-full overflow-hidden flex justify-center items-center bg-gray-100">
                              <img
                                className="w-full h-full object-contain"
                                src={post.image}
                              />
                            </figure>
                          )}
                        </div>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Books Section */}
              {books?.length > 0 && searchCate !== "peoples" && searchCate !== "opinions" && searchCate !== "onindo" && searchCate !== "pdf" && (
                <div className={`category-section mb-6 p-4 border border-gray-300 rounded-lg ${searchCate !== "books" && searchCate !== "all" ? "hidden" : "block"}`}>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Books</h2>
                  <ul className=" grid grid-cols-2 lg:grid-cols-4 justify-center gap-2 ">
                    {books.map((book, index) => (
                      <li
                        key={index}
                        className="mb-3 text-gray-800 "
                      >
                        <div
                          key={book._id}
                          className="flex cursor-pointer flex-col rounded overflow-hidden shadow-lg h-full bg-white"
                        >
                          <img
                            onClick={() =>
                              document
                                .getElementById(`my_modal_${book._id}`)
                                .showModal()
                            }
                            className="w-full h-32 lg:h-48 object-contain"
                            src={book.imageUrl}
                            alt={book.bookName}
                          />
                          <div
                            onClick={() =>
                              document
                                .getElementById(`my_modal_${book._id}`)
                                .showModal()
                            }
                            className="px-3 py-2 flex flex-col flex-grow justify-between"
                          >
                            <div>
                              <h2 className="text-lg lg:text-xl mt-3 font-medium lg:font-semibold text-gray-800">
                                {book.bookName.slice(0, 27)}
                              </h2>
                            </div>

                            <div>
                              <p className="text-gray-600 text-sm lg:text-base mt-2">
                                <span className="text-base lg:text-lg font-medium lg:font-semibold pr-2">
                                  Writer:
                                </span>
                                {book.writer.slice(0, 27)}
                              </p>
                              <p className="text-gray-600 text-sm lg:text-base mt-2">
                                <span className="text-base lg:text-lg font-medium lg:font-semibold pr-2">
                                  Owner:
                                </span>
                                <Link
                                  to={`/profile/${book.userId}`}
                                  className=" hover:underline"
                                >
                                  {book.owner}
                                </Link>
                              </p>
                              <p className="text-xs lg:text-sm text-gray-500 mt-2">
                                Added on: {book.currentDate}
                              </p>
                            </div>
                          </div>
                          <dialog id={`my_modal_${book._id}`} className="modal">
                            <div className="modal-box max-w-[700px]">
                              <div className=" lg:grid grid-cols-2 gap-5 items-center">
                                <div className=" border-b-2 lg:border-none pb-2 mb-2">
                                  <div className=" w-full h-[200px] lg:h-[300px] ">
                                    <img
                                      className=" w-full h-full object-contain"
                                      src={book.imageUrl}
                                      alt=""
                                    />
                                  </div>
                                  <h2 className=" text-sm font-semibold mt-2">
                                    Sort Details:{" "}
                                    <span className=" font-normal text-xs">
                                      {book.details}
                                    </span>
                                  </h2>
                                </div>
                                <div>
                                  <h1 className=" lg:text-2xl ">
                                    <span className=" lg:text-xl font-semibold pr-2">
                                      Book Name:
                                    </span>
                                    {book.bookName}
                                  </h1>
                                  <h1 className=" text-sm lg:text-lg mt-4 ">
                                    <span className=" lg:text-lg font-semibold pr-2">
                                      Book Writer:
                                    </span>
                                    {book.writer}
                                  </h1>
                                  <p className=" text-sm lg:text-lg text-slate-400 mt-2">
                                    <span className=" text-base lg:text-lg text-slate-700 pr-2">
                                      Added on:
                                    </span>
                                    {`${book.currentDate} at ${
                                      book.currentTime.slice(0, -6) +
                                      book.currentTime.slice(-3)
                                    }`}
                                  </p>
                                  <h1 className=" lg:text-lg text-slate-600 ">
                                    <span className=" lg:text-lg font-medium mt-2 pr-2">
                                      Return Time:
                                    </span>
                                    {book?.returnTime}
                                  </h1>
                                  <div className="lg:px-6 px-2 lg:mt-3 py-4">
                                    <Link
                                      to={`/library/${book.userId}`}
                                      className=" btn w-full py-2 text-sm lg:text-base px-4 bg-blue-400 text-white rounded-full hover:bg-sky-500"
                                    >
                                      Visit Library
                                    </Link>
                                  </div>
                                </div>
                              </div>
                              <div className="modal-action">
                                <form method="dialog">
                                  <button className="btn">Close</button>
                                </form>
                              </div>
                            </div>
                          </dialog>
                          <div className="lg:px-6 px-2 py-4">
                            <Link
                              to={`/library/${book.userId}`}
                              className=" btn w-full py-2 text-sm lg:text-base px-4 bg-blue-400 text-white rounded-full hover:bg-sky-500"
                            >
                              Visit Library
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Onindo Books Section */}
              {onindoBooks?.length > 0 && searchCate !== "peoples" && searchCate !== "opinions" && searchCate !== "books" && searchCate !== "pdf" && (
                <div className={`category-section mb-6 p-4 border border-gray-300 rounded-lg ${searchCate !== "onindo" && searchCate !== "all" ? "hidden" : "block"}`}>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Onindo Books
                  </h2>
                  <ul className=" grid grid-cols-2 lg:grid-cols-4 justify-center gap-2 ">
                    {onindoBooks.map((book, index) => (
                      <li
                        key={index}
                        className="mb-3 text-gray-800 "
                      >
                        <div
                          key={book._id}
                          className="flex cursor-pointer flex-col rounded overflow-hidden shadow-lg h-full bg-white"
                        >
                          <img
                            onClick={() =>
                              document
                                .getElementById(`my_modal_${book._id}`)
                                .showModal()
                            }
                            className="w-full h-32 lg:h-48 object-contain"
                            src={book.imageUrl}
                            alt={book.bookName}
                          />
                          <div
                            onClick={() =>
                              document
                                .getElementById(`my_modal_${book._id}`)
                                .showModal()
                            }
                            className="px-3 py-2 flex flex-col flex-grow justify-between"
                          >
                            <div>
                              <h2 className="text-lg lg:text-xl mt-3 font-medium lg:font-semibold text-gray-800">
                                {book.bookName.slice(0, 27)}
                              </h2>
                            </div>

                            <div>
                              <p className="text-gray-600 text-sm lg:text-base mt-2">
                                <span className="text-base lg:text-lg font-medium lg:font-semibold pr-2">
                                  Writer:
                                </span>
                                {book.writer.slice(0, 27)}
                              </p>
                              <p className="text-gray-600 text-sm lg:text-base mt-2">
                                <span className="text-base lg:text-lg font-medium lg:font-semibold pr-2">
                                  Owner:
                                </span>
                                <Link
                                  to={`/profile/${book.userId}`}
                                  className=" hover:underline"
                                >
                                  {book.owner}
                                </Link>
                              </p>
                              <p className="text-xs lg:text-sm text-gray-500 mt-2">
                                Added on: {book.currentDate}
                              </p>
                            </div>
                          </div>
                          <dialog id={`my_modal_${book._id}`} className="modal">
                            <div className="modal-box max-w-[700px]">
                              <div className=" lg:grid grid-cols-2 gap-5 items-center">
                                <div className=" border-b-2 lg:border-none pb-2 mb-2">
                                  <div className=" w-full h-[200px] lg:h-[300px] ">
                                    <img
                                      className=" w-full h-full object-contain"
                                      src={book.imageUrl}
                                      alt=""
                                    />
                                  </div>
                                  <h2 className=" text-sm font-semibold mt-2">
                                    Sort Details:{" "}
                                    <span className=" font-normal text-xs">
                                      {book.details}
                                    </span>
                                  </h2>
                                </div>
                                <div>
                                  <h1 className=" lg:text-2xl ">
                                    <span className=" lg:text-xl font-semibold pr-2">
                                      Book Name:
                                    </span>
                                    {book.bookName}
                                  </h1>
                                  <h1 className=" text-sm lg:text-lg mt-4 ">
                                    <span className=" lg:text-lg font-semibold pr-2">
                                      Book Writer:
                                    </span>
                                    {book.writer}
                                  </h1>
                                  <p className=" text-sm lg:text-lg text-slate-400 mt-2">
                                    <span className=" text-base lg:text-lg text-slate-700 pr-2">
                                      Added on:
                                    </span>
                                    {`${book.currentDate} at ${
                                      book.currentTime.slice(0, -6) +
                                      book.currentTime.slice(-3)
                                    }`}
                                  </p>
                                  <h1 className=" lg:text-lg text-slate-600 ">
                                    <span className=" lg:text-lg font-medium mt-2 pr-2">
                                      Return Time:
                                    </span>
                                    {book?.returnTime}
                                  </h1>
                                  <div className="lg:px-6 px-2 lg:mt-3 py-4">
                                    <Link
                                      to={`/library/${book.userId}`}
                                      className=" btn w-full py-2 text-sm lg:text-base px-4 bg-blue-400 text-white rounded-full hover:bg-sky-500"
                                    >
                                      Visit Library
                                    </Link>
                                  </div>
                                </div>
                              </div>
                              <div className="modal-action">
                                <form method="dialog">
                                  <button className="btn">Close</button>
                                </form>
                              </div>
                            </div>
                          </dialog>
                          <div className="lg:px-6 px-2 py-4">
                            <Link
                              to={`/library/${book.userId}`}
                              className=" btn w-full py-2 text-sm lg:text-base px-4 bg-blue-400 text-white rounded-full hover:bg-sky-500"
                            >
                              Visit Library
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* PDF Books Section */}
              {pdfBooks?.length > 0 && searchCate !== "peoples" && searchCate !== "opinions" && searchCate !== "books" && searchCate !== "onindo" && (
                <div className={`category-section mb-6 p-4 border border-gray-300 rounded-lg ${searchCate !== "pdf" && searchCate !== "all" ? "hidden" : "block"}`}>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">PDF Books</h2>
                  <ul className="grid grid-cols-2 lg:grid-cols-4 justify-center gap-2">
                    {pdfBooks.map((book, index) => (
                      <li key={index} className="mb-3 text-gray-800">
                        <div className="flex cursor-pointer flex-col rounded overflow-hidden shadow-lg h-full bg-white">
                          <img
                            onClick={() => document.getElementById(`my_modal_${book._id}`).showModal()}
                            className="w-full h-32 lg:h-48 object-contain"
                            src={book.coverUrl || book.imageUrl}
                            alt={book.bookName}
                          />
                          <div className="px-3 py-2 flex flex-col flex-grow justify-between">
                            <div>
                              <h2 className="text-lg lg:text-xl mt-3 font-medium lg:font-semibold text-gray-800">
                                {book.bookName.slice(0, 27)}
                              </h2>
                            </div>
                            <div>
                              <p className="text-gray-600 text-sm lg:text-base mt-2">
                                <span className="text-base lg:text-lg font-medium lg:font-semibold pr-2">
                                  Writer:
                                </span>
                                {book.writerName?.slice(0, 27)}
                              </p>
                              <p className="text-xs lg:text-sm text-gray-500 mt-2">
                                Added on: {new Date(book.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="lg:px-6 px-2 py-4">
                            <a
                              href={book.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn w-full py-2 text-sm lg:text-base px-4 bg-blue-400 text-white rounded-full hover:bg-sky-500"
                            >
                              View PDF
                            </a>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          {/* Google Results Column */}
          <div className={`${(peoples?.length > 0 || opinions?.length > 0 || books?.length > 0 || onindoBooks?.length > 0 || pdfBooks?.length > 0) ? 'lg:w-1/3' : 'w-full'} lg:mt-0 mt-6`}>
            {searchResults?.googleResults?.items?.length > 0 && (
              <div className="sticky top-4">
                <div className="category-section p-4 border border-gray-300 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Web Results
                  </h2>
                  <ul className="space-y-4">
                    {searchResults.googleResults.items.map((item, index) => (
                      <li key={index} className="border-b pb-4 last:border-b-0">
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block hover:bg-gray-50 p-2 rounded"
                        >
                          <h3 className="text-lg font-medium text-blue-600 hover:underline">
                            {item.title}
                          </h3>
                          <p className="text-sm text-green-700 text-ellipsis overflow-hidden whitespace-nowrap max-w-[300px]">{item.link}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.snippet}
                          </p>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* No Results Message */}
        {(!searchResults?.googleResults?.items?.length && 
          !peoples?.length &&
          !opinions?.length &&
          !books?.length &&
          !onindoBooks?.length &&
          !pdfBooks?.length) && (
          <div className="text-center py-8">
            <p className="text-xl text-gray-600">No results found for your query.</p>
            <p className="text-sm text-gray-500 mt-2">Try searching with different keywords or filters.</p>
          </div>
        )}
      </div>
      <div className="mt-10">
        <DownNav />
      </div>
    </div>
  );
};

export default ScearchPage;
