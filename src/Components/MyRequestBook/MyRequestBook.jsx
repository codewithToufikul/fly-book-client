
import { MdAvTimer } from "react-icons/md";
import useAllBook from "../../Hooks/useAllBook";
import useUser from "../../Hooks/useUser";
import { Link } from "react-router";
import usePublicAxios from "../../Hooks/usePublicAxios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import createSocket from "../../utils/socket";

const MyRequestBook = () => {
  const { allBooks, isLoading, refetch } = useAllBook();
  const { user, loading } = useUser();
  const token = localStorage.getItem("token");
  const axiosPublic = usePublicAxios();
  const [reLoad, setReLoad] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = createSocket();
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);
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
  const myBooks = allBooks.filter((book) => book.requestBy === user.id);
  if (myBooks.length == 0) {
    return (
      <div>
        <h1 className=" text-lg lg:text-2xl text-center mt-5">
          You Have No Requested Book!
        </h1>
      </div>
    );
  }

  const handleReturnBook = async (bookId, requestBy, requestName, ownerId) => {
    setReLoad(true);
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    if (!bookId) {
      return toast.error("Invalid book ID. Please try again.");
    }

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axiosPublic.post(
        "/books/return",
        { bookId, requestBy, requestName, date, time, ownerId },
        { headers }
      );

      if (response.status === 200) {
        toast.success("Book return Success!");
        setReLoad(false);
        refetch();
        if (socket) {
          socket.emit("sendRequest", {
            senderId: user.id,
            senderName: user.name,
            senderProfile: user.profileImage,
            receoientId: ownerId,
            type: "bookReturn",
            notifyText: "Return Your Book Request",
            roomId: [ownerId],
          });
        }
      }
    } catch (error) {
      console.error("Error while return the book:", error);
      setReLoad(false);
      if (error.response) {
        // Server responded with a status other than 200
        const { status, data } = error.response;
        if (status === 401) {
          toast.error("Unauthorized. Please log in to request this book.");
          setReLoad(false);
        } else if (status === 400) {
          toast.error(
            data.error || "Invalid request. Please check the book ID."
          );
          setReLoad(false);
        } else if (status === 404) {
          toast.error(data.error || "Book not found.");
          setReLoad(false);
        } else {
          toast.error("Failed to return the book. Please try again later.");
          setReLoad(false);
        }
      } else {
        // No response from server or network error
        toast.error(
          "Network error. Please check your connection and try again."
        );
        setReLoad(false);
      }
    }
    setReLoad(false);
  };
  return (
    <div className=" mt-5 bg-gray-50 p-5 rounded-xl">
      <h1 className=" text-xl lg:text-3xl font-semibold border-b-2 pb-2">
        Your Requested Books
      </h1>
      <div className="grid lg:grid-cols-4 grid-cols-2 gap-2 mt-4">
        {myBooks
          .slice()
          .reverse()
          .map((book) => (
            <div
              key={book._id}
              className="flex flex-col rounded overflow-hidden shadow-lg bg-white"
            >
              <div className=" relative">
                <img
                  className="w-full h-32 lg:h-48 object-contain"
                  src={book.imageUrl}
                  alt={book.bookName}
                />
                <p className=" text-xs lg:text-sm flex items-center gap-1 absolute right-0 top-1 lg:right-1 text-white bg-green-300 p-2 rounded-2xl">
                  <span className=" lg:text-lg">
                    <MdAvTimer />
                  </span>
                  {book.returnTime}
                </p>
              </div>
              <div className="px-3 py-2 flex flex-col flex-grow justify-between">
                <div>
                  <h2 className=" text-lg lg:text-xl mt-3 font-medium lg:font-semibold text-gray-800">
                    {book.bookName?.slice(0, 27)}
                  </h2>
                </div>

                <div>
                  <p className="text-gray-600 text-sm lg:text-base mt-2">
                    <span className=" text-base lg:text-lg font-medium lg:font-semibold pr-2">
                      Writer:
                    </span>
                    {book.writer?.slice(0, 27)}
                  </p>
                  <p className="text-gray-600 text-sm lg:text-base mt-2">
                    <span className=" text-xs font-medium lg:font-semibold pr-2">
                      Book Owner:
                    </span>
                    <Link
                      to={`/profile/${book.userId}`}
                      className=" hover:underline"
                    >
                      {book.owner?.slice(0, 15)}..
                    </Link>
                  </p>
                </div>
              </div>
              <div className="lg:px-6 px-2 py-4">
                {book.transfer === "success" ? (
                  <button
                    onClick={() =>
                      handleReturnBook(
                        book._id,
                        book.requestBy,
                        book.requestName,
                        book.userId
                      )
                    }
                    className="w-full py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 lg:text-base px-4 rounded-full"
                  >
                    {reLoad ? (
                      <svg
                        className="animate-spin h-5 w-5 mr-3"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                    ) : (
                      "Return Book"
                    )}
                  </button>
                ) : book.transfer === "pending" ? (
                  <button className="w-full py-2 text-sm btn-disabled bg-green-500 text-white hover:bg-green-600 lg:text-base px-4 rounded-full">
                    Request Pending
                  </button>
                ) : (
                  <button className="w-full py-2 text-sm btn-disabled bg-gray-500 text-white hover:bg-gray-600 lg:text-base px-4 rounded-full">
                    Transfered Soon
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default MyRequestBook;
