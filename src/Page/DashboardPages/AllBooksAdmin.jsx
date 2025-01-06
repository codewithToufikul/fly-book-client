import React from "react";
import useAllBook from "../../Hooks/useAllBook";
import { MdAvTimer } from "react-icons/md";
import { Link } from "react-router";
import useUser from "../../Hooks/useUser";
import Swal from "sweetalert2";
import usePublicAxios from "../../Hooks/usePublicAxios";

const AllBooksAdmin = () => {
  const { allBooks, isLoading, refetch } = useAllBook();
  const { user, loading } = useUser();
  const axiosPublic = usePublicAxios();
  if ((isLoading, loading)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  const handleRemoveBook = async (bookId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to remove this book!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosPublic.delete(`/books/delete/${bookId}`);
          if (res.data.success) {
            Swal.fire({
              title: "Removed!",
              text: "This book has been removed!.",
              icon: "success",
            });
            refetch();
          }
        } catch (error) {
          console.log(error);
        }
      }
    });
  };

  return (
    <div>
      <h1 className=" sticky top-0 z-[1] py-2 bg-gray-100 mb-5 text-xl lg:text-3xl font-semibold text-center">
        All Books
      </h1>
      <div className="grid lg:px-2 lg:grid-cols-5 grid-cols-2 gap-2 mt-4">
        {allBooks
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
                  <Link
                    to={
                      user.id == book.userId
                        ? `/my-profile`
                        : `/profile/${book.userId}`
                    }
                    className=" hover:underline text-xs lg:text-sm text-gray-500 mt-2"
                  >
                    Owner: {book.owner}
                  </Link>
                </div>
              </div>
              <div className="lg:px-6 px-2 py-4">
                <button
                  onClick={() => handleRemoveBook(book._id)}
                  className="w-full py-2 text-sm lg:text-base px-4 bg-red-400 text-white rounded-full hover:bg-red-500"
                >
                  Remove Book
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AllBooksAdmin;
