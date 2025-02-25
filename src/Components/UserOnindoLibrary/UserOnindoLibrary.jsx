import React from "react";
import { useParams } from "react-router";
import useAllOnindoBook from "../../Hooks/useAllOnindoBook";
import useUser from "../../Hooks/useUser";
import toast from "react-hot-toast";
import usePublicAxios from "../../Hooks/usePublicAxios";
import { io } from "socket.io-client";

const UserOnindoLibrary = () => {
  const { userId } = useParams();
  const {user, loading} = useUser();
  const axiosPublic = usePublicAxios();
  const token = localStorage.getItem("token");
  const socket = io("https://api.flybook.com.bd");
  const { allOnindoBooks, refetch, isLoading } = useAllOnindoBook();
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
  const userBooks = allOnindoBooks.filter((book) => book.userId === userId);

  const handleRequestBook = async (bookId) => {
    if(user.verificationStatus !== true){
      toast.error('at fast verify your face 😊')
      return;
    }
    if (!bookId) {
      return toast.error("Invalid book ID. Please try again.");
    }

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axiosPublic.post(
        "/onindo/books/request",
        { bookId },
        { headers }
      );

      if (response.status === 200) {
        toast.success("Book request successfully!");
        socket.emit("sendRequest", {
          senderId: user.id,
          senderName: user.name,
          senderProfile: user.profileImage,
          receoientId: userId,
          type: "bookReqOnindo",
          notifyText: "Send a Book Request",
          roomId: [userId],
        });
        refetch()
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
          receoientId: userId,
          type: "bookReqOnindo",
          notifyText: "Cancel Book Request",
          roomId: [userId],
        });
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

  if (userBooks.length == 0) {
    return (
      <div>
        <h1 className=" text-lg lg:text-2xl text-center mt-5">
          No Book!
        </h1>
      </div>
    );
  }
  return (
    <div className=" mt-5 bg-gray-50 p-5 rounded-xl">
      <h1 className=" text-xl lg:text-3xl font-semibold border-b-2 pb-2">
        Onindo Books
      </h1>
      <div className="grid lg:grid-cols-4 grid-cols-2 gap-2 mt-4">
        {userBooks
          .slice()
          .reverse()
          .map((book) => (
            <div
              key={book._id}
              className="flex flex-col rounded overflow-hidden shadow-lg bg-white"
            >
              <div className="">
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
                  <p className=" text-xs lg:text-sm text-gray-500 mt-2">
                    Added on: {book.currentDate}
                  </p>
                </div>
              </div>
              <div className="lg:px-6 px-2 py-4">
                <div className="">
                  {book.requestBy?.includes(user.id) ? (
                    <button
                      onClick={() => handleRequestCancel(book._id)}
                      className="w-full py-2 text-sm lg:text-base px-4 bg-red-400 text-white rounded-full hover:bg-red-500"
                    >
                      Cancel Request
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleRequestBook(book._id, userId)
                      }
                      className="w-full py-2 text-sm lg:text-base px-4 bg-blue-400 text-white rounded-full hover:bg-sky-500"
                    >
                      Request Book
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default UserOnindoLibrary;
