import React from "react";
import useAllOnindoBook from "../../Hooks/useAllOnindoBook";
import useUser from "../../Hooks/useUser";
import Swal from "sweetalert2";
import usePublicAxios from "../../Hooks/usePublicAxios";

const MyOnindoAllBook = () => {
  const { allOnindoBooks, refetch, isLoading } = useAllOnindoBook();
  const { user, loading } = useUser();
  const axiosPublic = usePublicAxios();
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

  const handleRemoveBook = async (bookId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to remove this book from the Onindo Library!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosPublic.delete(`http://localhost:3000/onindo/delete/${bookId}`);
          if (res.data.success) {
            Swal.fire("Removed!", "Your book has been removed!", "success");
            refetch();
          } else {
            Swal.fire("Error", res.data.message || "An error occurred", "error");
          }
        } catch (error) {
          Swal.fire("Error", error.response?.data?.error || "An error occurred", "error");
        }
      }
    });
  };

  if (myBooks.length == 0) {
    return (
      <div>
        <h1 className=" text-lg lg:text-2xl text-center mt-5">
          You Have No Book!
        </h1>
      </div>
    );
  }

  return (
    <div className=" mt-5 bg-gray-50 p-5 rounded-xl">
      <h1 className=" text-xl lg:text-3xl font-semibold border-b-2 pb-2">
        Your Onindo Books
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

export default MyOnindoAllBook;
