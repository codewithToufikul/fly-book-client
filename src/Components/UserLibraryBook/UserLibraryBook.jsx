import React from "react";
import { useParams } from "react-router";
import useUser from "../../Hooks/useUser";
import useAllBook from "../../Hooks/useAllBook";
import usePublicAxios from "../../Hooks/usePublicAxios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const UserLibraryBook = () => {
  const { userId } = useParams();
  const { user, loading } = useUser();
  const { allBooks, isLoading, refetch } = useAllBook();
  const token = localStorage.getItem("token");
  const axiosPublic = usePublicAxios();
  const socket = io("https://fly-book-server.onrender.com");

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  const userBooks = allBooks.filter((book) => book.userId === userId);
  const myBooks = userBooks.filter((book) => book.transfer !== "success");

  const handleRequestBook = async (bookId, request) => {
    if(request){
      return toast.error('An user already Request for this book');
    }
    if (!bookId) {
      return toast.error("Invalid book ID. Please try again.");
    }

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axiosPublic.post(
        "/books/request",
        { bookId },
        { headers }
      );

      if (response.status === 200) {
        toast.success("Book request submitted successfully!");
        refetch()
        socket.emit("sendRequest", {
          senderId: user.id,
          senderName: user.name,
          senderProfile: user.profileImage,
          receoientId: userId,
          type: "bookReq",
          notifyText: "Send a Book Request",
          roomId: [userId],
        });
      }
    } catch (error) {
      console.error("Error while requesting the book:", error);

      if (error.response) {
        // Server responded with a status other than 200
        const { status, data } = error.response;
        if (status === 401) {
          toast.error("Unauthorized. Please log in to request this book.");
        } else if (status === 400) {
          toast.error(
            data.error || "Invalid request. Please check the book ID."
          );
        } else if (status === 404) {
          toast.error(data.error || "Book not found.");
        } else {
          toast.error("Failed to request the book. Please try again later.");
        }
      } else {
        // No response from server or network error
        toast.error(
          "Network error. Please check your connection and try again."
        );
      }
    }
  };

  const handleRequestCancel = async (bookId) => {
    if (!bookId) {
      return toast.error("Invalid book ID. Please try again.");
    }

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axiosPublic.post(
        "/books/request/cancel",
        { bookId },
        { headers }
      );

      if (response.status === 200) {
        toast.success("Book request Canceled!");
        refetch()
      }
    } catch (error) {
      console.error("Error while Canceling the book:", error);

      if (error.response) {
        // Server responded with a status other than 200
        const { status, data } = error.response;
        if (status === 401) {
          toast.error("Unauthorized. Please log in to request this book.");
        } else if (status === 400) {
          toast.error(
            data.error || "Invalid request. Please check the book ID."
          );
        } else if (status === 404) {
          toast.error(data.error || "Book not found.");
        } else {
          toast.error("Failed to request the book. Please try again later.");
        }
      } else {
        // No response from server or network error
        toast.error(
          "Network error. Please check your connection and try again."
        );
      }
    }
  };

  if (myBooks.length == 0) {
    return (
      <div>
        <h1 className=" text-lg lg:text-2xl text-center mt-5">
          No Book!
        </h1>
      </div>
    );
  }

  return (
    <div className="mt-5 bg-gray-50 p-5 rounded-xl">
      <h1 className="text-xl lg:text-3xl font-semibold border-b-2 pb-2">
        All Books
      </h1>
      <div className="grid lg:grid-cols-4 grid-cols-2 gap-2 mt-4">
        {myBooks
          .slice()
          .reverse()
          .map((book) => (
            <div
              key={book._id}
              className="flex cursor-pointer flex-col rounded overflow-hidden shadow-lg bg-white"
            >
              <img
                onClick={() =>
                  document.getElementById(`my_modal_${book._id}`).showModal()
                }
                className="w-full h-32 lg:h-48 object-contain"
                src={book.imageUrl}
                alt={book.bookName}
              />
              <div
                onClick={() =>
                  document.getElementById(`my_modal_${book._id}`).showModal()
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
                        {book.requestBy?.includes(user.id) ? (
                          <button
                            onClick={() => handleRequestCancel(book._id)}
                            className="w-full py-2 text-sm lg:text-base px-4 bg-red-400 text-white rounded-full hover:bg-red-500"
                          >
                            Cancel Request
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRequestBook(book._id, book.requestBy)}
                            className="w-full py-2 text-sm lg:text-base px-4 bg-blue-400 text-white rounded-full hover:bg-sky-500"
                          >
                            Request Book
                          </button>
                        )}
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
                {book.requestBy?.includes(user.id) ? (
                  <button
                    onClick={() => handleRequestCancel(book._id)}
                    className="w-full py-2 text-sm lg:text-base px-4 bg-red-400 text-white rounded-full hover:bg-red-500"
                  >
                    Cancel Request
                  </button>
                ) : (
                  <button
                    onClick={() => handleRequestBook(book._id, book.requestBy)}
                    className="w-full py-2 text-sm lg:text-base px-4 bg-blue-400 text-white rounded-full hover:bg-sky-500"
                  >
                    Request Book
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default UserLibraryBook;
