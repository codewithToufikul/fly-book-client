import React from "react";
import useAllOnindoBook from "../../Hooks/useAllOnindoBook";
import useUser from "../../Hooks/useUser";
import usePublicAxios from "../../Hooks/usePublicAxios";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const MyOnindoRequest = () => {
  const { allOnindoBooks, refetch, isLoading } = useAllOnindoBook();
  const { user, loading } = useUser();
  const axiosPublic = usePublicAxios();
  const token = localStorage.getItem("token");
  const socket = io("https://api.flybook.com.bd");
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
  const myBooks = allOnindoBooks.filter((book) => book.userId === user.id);
  const requestBooks = myBooks.filter((book) => book.requestBy?.length > 0);

  const handleRequestCancel = async (bookId, requestBy) => {
    if (!bookId) {
      return toast.error("Invalid book ID. Please try again.");
    }

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axiosPublic.post(
        "/onindo/books/request/cancel",
        { bookId },
        { headers }
      );

      if (response.status === 200) {
        toast.success("Book request Canceled!");
        socket.emit("sendRequest", {
          senderId: user.id,
          senderName: user.name,
          senderProfile: user.profileImage,
          receoientId: requestBy,
          type: "bookReqClO",
          notifyText: "Cancel Your Book Request",
          roomId: [requestBy],
        });
        refetch();
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
  const handleTransBookRequest = async (bookId, requestBy, requestName) => {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    if (!bookId) {
      return toast.error("Invalid book ID. Please try again.");
    }

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axiosPublic.post(
        "/onindo/books/request/trans",
        { bookId, requestBy, requestName, date, time },
        { headers }
      );

      if (response.status === 200) {
        toast.success("Book Transfered!");
        socket.emit("sendRequest", {
          senderId: user.id,
          senderName: user.name,
          senderProfile: user.profileImage,
          receoientId: requestBy,
          type: "bookReqTns",
          notifyText: "Transfer a Book",
          roomId: [requestBy],
        });
        refetch();
      }
    } catch (error) {
      console.error("Error while transfer the book:", error);

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
          toast.error("Failed to transfer the book. Please try again later.");
        }
      } else {
        // No response from server or network error
        toast.error(
          "Network error. Please check your connection and try again."
        );
      }
    }
  };

  if (requestBooks.length == 0) {
    return (
      <div>
        <h1 className=" text-lg lg:text-2xl text-center mt-5">
          You Have No Book Request!
        </h1>
      </div>
    );
  }
  return (
    <div className=" mt-5 bg-gray-50 p-5 rounded-xl">
      <h1 className=" text-xl lg:text-3xl font-semibold border-b-2 pb-2">
        Your Books Request
      </h1>
      <div className="grid lg:grid-cols-4 grid-cols-2 gap-2 mt-4">
        {requestBooks
          .slice()
          .reverse()
          .map((book) => (
            <div
              key={book._id}
              className="flex flex-col rounded overflow-hidden shadow-lg bg-white"
            >
              <div className=" ">
                <img
                  className="w-full h-32 lg:h-48 object-contain"
                  src={book.imageUrl}
                  alt={book.bookName}
                />
              </div>
              <div className="px-3 py-2 flex flex-col flex-grow justify-between">
                <div>
                  <h2 className=" text-lg lg:text-xl mt-3 font-medium lg:font-semibold text-gray-800">
                    {book.bookName.slice(0, 27)}
                  </h2>
                </div>

                <div>
                  <p className="text-gray-600 text-sm lg:text-base mt-2">
                    <span className=" text-base lg:text-lg font-medium lg:font-semibold pr-2">
                      Writer:
                    </span>
                    {book.writer.slice(0, 27)}
                  </p>
                  <p className="text-gray-600 text-base lg:text-base mt-2">
                    <span className=" text-base font-medium lg:font-semibold pr-2">
                      Request by:
                    </span>
                    <Link
                      to={`/profile/${book.requestBy}`}
                      className=" hover:underline"
                    >
                      {book.requestName}
                    </Link>
                  </p>
                </div>
              </div>
              <div className="lg:px-6 px-2 py-4 flex items-center flex-col lg:flex-row gap-2">
                <button
                  onClick={() =>
                    handleTransBookRequest(
                      book._id,
                      book.requestBy,
                      book.requestName
                    )
                  }
                  className="w-full py-2 text-sm lg:text-base px-4 bg-blue-400 text-white rounded-full hover:bg-blue-500"
                >
                  Transfer
                </button>
                <button
                  onClick={() => handleRequestCancel(book._id, book.requestBy)}
                  className="w-full py-2 text-sm lg:text-base px-4 bg-red-400 text-white rounded-full hover:bg-red-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default MyOnindoRequest;
