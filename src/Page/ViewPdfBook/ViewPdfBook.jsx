import React, { useState } from "react";
import useAllPdfBook from "../../Hooks/useAllPdfBook";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import { useParams } from "react-router";
import { Link } from "react-router";

const ViewPdfBook = () => {
  const { pdfBooks, refetch, isLoading, isError, error } = useAllPdfBook();
  const { id } = useParams();
  const [isExpanded, setIsExpanded] = useState(false);

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
  const book = pdfBooks.find((bookI) => bookI._id == id);
  
  // Sort books by timestamp to get latest books
  const latestBooks = [...pdfBooks]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 4);

  // Function to handle description text
  const truncateDescription = (text, maxLength = 300) => {
    if (text.length <= maxLength) return text;
    return isExpanded ? text : `${text.slice(0, maxLength)}...`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[1150px] mx-auto px-4">
        <div className="lg:grid grid-cols-3 mt-6 gap-6">
          <div className="col-span-2 bg-white border border-green-100 shadow-lg p-6 rounded-2xl">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-[350px] bg-gray-50 rounded-2xl p-4">
                <div className="relative h-[300px] w-full">
                  <img
                    src={book.coverUrl}
                    alt={book.bookName}
                    className="absolute inset-0 w-full h-full object-contain rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-center">
                    <div className="rating rating-md">
                      <input
                        type="radio"
                        name="rating-2"
                        className="mask mask-star-2 bg-orange-400"
                      />
                      <input
                        type="radio"
                        name="rating-2"
                        className="mask mask-star-2 bg-orange-400"
                        defaultChecked
                      />
                      <input
                        type="radio"
                        name="rating-2"
                        className="mask mask-star-2 bg-orange-400"
                      />
                      <input
                        type="radio"
                        name="rating-2"
                        className="mask mask-star-2 bg-orange-400"
                      />
                      <input
                        type="radio"
                        name="rating-2"
                        className="mask mask-star-2 bg-orange-400"
                      />
                    </div>
                  </div>
                  <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl inline-flex items-center justify-center transition-colors duration-200">
                    <svg
                      className="fill-current w-5 h-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
                    </svg>
                    <a href={book.pdfUrl} className="text-lg">Download PDF</a>
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <h1 className="text-3xl font-bold text-gray-800">
                  {book.bookName}
                </h1>
                <p className="text-lg text-gray-600">By {book.writerName}</p>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {book.category}
                  </span>
                  <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {(book.fileSize / 1024 / 1024).toFixed(2) + " MB"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-green-100 bg-white shadow-lg p-5 rounded-2xl mt-6 lg:mt-0">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Latest Books
            </h2>
            <div className="space-y-4">
              {latestBooks.map((latestBook) => (
                <Link 
                  key={latestBook._id} 
                  to={`/view-pdf-book/${latestBook._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="w-16 h-20 flex-shrink-0 relative">
                    <img
                      src={latestBook.coverUrl}
                      alt={latestBook.bookName}
                      className="absolute inset-0 w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{latestBook.bookName.slice(0, 20)}...</h3>
                    <p className="text-sm text-gray-500">{new Date(latestBook.timestamp).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:grid grid-cols-3 mt-6 gap-6 mb-12">
          <div className="col-span-2 bg-white border border-green-100 shadow-lg p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Book Details
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-2">
                {truncateDescription(book.description)}
              </p>
              {book.description.length > 300 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                >
                  {isExpanded ? 'See Less' : 'See More'}
                </button>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-base lg:text-lg antialiased font-medium leading-normal text-blue-gray-900">
                        Name of Pdf
                      </p>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block text-wrap font-sans text-sm antialiased font-medium leading-normal text-blue-gray-900">
                        {book.bookName.slice(0,15)}..
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-base lg:text-lg antialiased font-medium leading-normal text-blue-gray-900">
                        Writer Name
                      </p>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-sm text-wrap overflow-hidden lg:text-md antialiased font-normal leading-normal text-blue-gray-900">
                        {book.writerName.slice(0,26)}..
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-base lg:text-lg antialiased font-medium leading-normal text-blue-gray-900">
                        Category
                      </p>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-sm lg:text-md antialiased font-normal leading-normal text-blue-gray-900">
                        {book.category}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-base lg:text-lg antialiased font-medium leading-normal text-blue-gray-900">
                        Added on
                      </p>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-sm lg:text-md antialiased font-normal leading-normal text-blue-gray-900">
                        {new Date(book.timestamp).toLocaleString()}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-base lg:text-lg antialiased font-medium leading-normal text-blue-gray-900">
                        Total Page
                      </p>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-sm lg:text-md antialiased font-normal leading-normal text-blue-gray-900">
                        {book.pageCount}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-base lg:text-lg antialiased font-medium leading-normal text-blue-gray-900">
                        File Size
                      </p>
                    </td>
                    <td className="p-4 border-b border-blue-gray-50">
                      <p className="block font-sans text-sm lg:text-md antialiased font-normal leading-normal text-blue-gray-900">
                        {(book.fileSize / 1024 / 1024).toFixed(2) + " MB"}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <DownNav />
    </div>
  );
};

export default ViewPdfBook;
