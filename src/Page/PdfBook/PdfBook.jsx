import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import bookCover from "../../assets/bookCover.jpg";
import { IoIosArrowDown } from "react-icons/io";
import useAllPdfBook from "../../Hooks/useAllPdfBook";
import { Link } from "react-router";

const PdfBook = () => {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("")
  
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 10;
  const { pdfBooks, refetch, isLoading, isError, error } = useAllPdfBook();
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Only set books when pdfBooks changes and books is empty
  useEffect(() => {
    if (pdfBooks?.length && !books.length) {
      setBooks(pdfBooks);
    }
  }, [pdfBooks]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  };
  const uploadBook = pdfBooks.filter(book => book.uploadMethod == "Direct Upload")
  const linkBook = pdfBooks.filter(book => book.uploadMethod == "Via Link")
  const handleFilter = (filterBy) => {
    // Close the dropdown by removing focus
    document.activeElement?.blur();
    
    if (filterBy === "all") {
      setBooks(pdfBooks);
    } else if (filterBy === "upload") {
      const filteredBooks = uploadBook;
      setBooks(filteredBooks);
    } else if (filterBy === "web") {
      const filteredBooks = linkBook;
      setBooks(filteredBooks);
    }
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    // Close the dropdown by removing focus
    document.activeElement?.blur();
    
    if (category === "all") {
      setBooks(pdfBooks);
    } else {
      const filteredBooks = pdfBooks.filter(book => book.category === category);
      setBooks(filteredBooks);
    }
  };

  const handleBookSearch = () => {
    const searchResults = pdfBooks.filter(book => 
      book.bookName.toLowerCase().includes(query.toLowerCase())
    );
    setBooks(searchResults);
  }

  // Get current books
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <Navbar />
      <div className=" max-w-[1320px] mx-auto">
        <div
          className="hero h-[300px] max-w-[1320px] lg:h-[400px] rounded-xl mt-2"
          style={{
            backgroundImage: `url(${bookCover})`,
          }}
        >
          <div className="hero-overlay max-w-full bg-opacity-50 rounded-xl"></div>
          <div className=" text-neutral-content text-center">
            <div className=" max-w-sm lg:max-w-md">
              <h1 className="mb-5 text-3xl lg:text-5xl font-bold ">
                Free PDF Books for Everyone
              </h1>
              <p className="mb-5 text-sm lg:text-base">
                Explore a collection of free PDF books on various topics.
                Download and enjoy reading anytime, anywhere!
              </p>
              <div className="flex rounded-md border-2 border-blue-500 overflow-hidden max-w-[300px] mx-auto font-sans">
                <input
                  type="text"
                  placeholder="Search Book Name"
                  onChange={(e)=>setQuery(e.target.value)}
                  className="w-full outline-none bg-white text-gray-600 text-sm px-4 py-3"
                />
                <button
                  type="button"
                  onClick={handleBookSearch}
                  className="flex items-center justify-center bg-[#007bff] px-5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 192.904 192.904"
                    width="16px"
                    className="fill-white"
                  >
                    <path d="M190.707 180.101l-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className=" mt-5 px-2">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h1 className="font-semibold text-slate-500 pb-2 border-b-2 text-2xl lg:text-3xl">
              All PDF Books
            </h1>
            <div className="flex gap-4">
              <div className="dropdown">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn m-0 p-0 px-3 flex items-center"
                >
                  Upload Type
                  <span>
                    <IoIosArrowDown />
                  </span>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
                >
                  <li onClick={() => handleFilter("all")}>
                    <a>All</a>
                  </li>
                  <li onClick={() => handleFilter("upload")}>
                    <a>Direct Upload</a>
                  </li>
                  <li onClick={() => handleFilter("web")}>
                    <a>Web Link</a>
                  </li>
                </ul>
              </div>

              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn m-0 p-0 px-3 flex items-center"
                >
                  Categories
                  <span>
                    <IoIosArrowDown />
                  </span>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-[1] w-72 p-2 shadow max-h-96 overflow-y-auto"
                >
                  <li onClick={() => handleCategoryFilter("all")}>
                    <a className={selectedCategory === "all" ? "active" : ""}>All Categories</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("Editor's Choice")}>
                    <a className={selectedCategory === "Editor's Choice" ? "active" : ""}>Editor's Choice</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("English Books")}>
                    <a className={selectedCategory === "English Books" ? "active" : ""}>English Books</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("অনুবাদ বই")}>
                    <a className={selectedCategory === "অনুবাদ বই" ? "active" : ""}>অনুবাদ বই</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("অসম্পূর্ণ বই")}>
                    <a className={selectedCategory === "অসম্পূর্ণ বই" ? "active" : ""}>অসম্পূর্ণ বই</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("আত্মউন্নয়নমূলক বই")}>
                    <a className={selectedCategory === "আত্মউন্নয়নমূলক বই" ? "active" : ""}>আত্মউন্নয়নমূলক বই</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("আত্মজীবনী ও স্মৃতিকথা")}>
                    <a className={selectedCategory === "আত্মজীবনী ও স্মৃতিকথা" ? "active" : ""}>আত্মজীবনী ও স্মৃতিকথা</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("ইতিহাস ও সংস্কৃতি")}>
                    <a className={selectedCategory === "ইতিহাস ও সংস্কৃতি" ? "active" : ""}>ইতিহাস ও সংস্কৃতি</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("ইসলামিক বই")}>
                    <a className={selectedCategory === "ইসলামিক বই" ? "active" : ""}>ইসলামিক বই</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("উপন্যাস")}>
                    <a className={selectedCategory === "উপন্যাস" ? "active" : ""}>উপন্যাস</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("কাব্যগ্রন্থ / কবিতা")}>
                    <a className={selectedCategory === "কাব্যগ্রন্থ / কবিতা" ? "active" : ""}>কাব্যগ্রন্থ / কবিতা</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("কিশোর সাহিত্য")}>
                    <a className={selectedCategory === "কিশোর সাহিত্য" ? "active" : ""}>কিশোর সাহিত্য</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("গণিত, বিজ্ঞান ও প্রযুক্তি")}>
                    <a className={selectedCategory === "গণিত, বিজ্ঞান ও প্রযুক্তি" ? "active" : ""}>গণিত, বিজ্ঞান ও প্রযুক্তি</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("গল্পগ্রন্থ / গল্পের বই")}>
                    <a className={selectedCategory === "গল্পগ্রন্থ / গল্পের বই" ? "active" : ""}>গল্পগ্রন্থ / গল্পের বই</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("গান / গানের বই")}>
                    <a className={selectedCategory === "গান / গানের বই" ? "active" : ""}>গান / গানের বই</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("গোয়েন্দা (ডিটেকটিভ)")}>
                    <a className={selectedCategory === "গোয়েন্দা (ডিটেকটিভ)" ? "active" : ""}>গোয়েন্দা (ডিটেকটিভ)</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("থ্রিলার রহস্য রোমাঞ্চ অ্যাডভেঞ্চার")}>
                    <a className={selectedCategory === "থ্রিলার রহস্য রোমাঞ্চ অ্যাডভেঞ্চার" ? "active" : ""}>থ্রিলার রহস্য রোমাঞ্চ অ্যাডভেঞ্চার</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("ধর্ম ও দর্শন")}>
                    <a className={selectedCategory === "ধর্ম ও দর্শন" ? "active" : ""}>ধর্ম ও দর্শন</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("ধর্মীয় বই")}>
                    <a className={selectedCategory === "ধর্মীয় বই" ? "active" : ""}>ধর্মীয় বই</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("নাটক")}>
                    <a className={selectedCategory === "নাটক" ? "active" : ""}>নাটক</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("প্রবন্ধ ও গবেষণা")}>
                    <a className={selectedCategory === "প্রবন্ধ ও গবেষণা" ? "active" : ""}>প্রবন্ধ ও গবেষণা</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("প্রাপ্তবয়স্কদের বই ১৮+")}>
                    <a className={selectedCategory === "প্রাপ্তবয়স্কদের বই ১৮+" ? "active" : ""}>প্রাপ্তবয়স্কদের বই ১৮+</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("বাংলাদেশ ও মুক্তিযুদ্ধ বিষয়ক")}>
                    <a className={selectedCategory === "বাংলাদেশ ও মুক্তিযুদ্ধ বিষয়ক" ? "active" : ""}>বাংলাদেশ ও মুক্তিযুদ্ধ বিষয়ক</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("ভৌতিক, হরর, ভূতের বই")}>
                    <a className={selectedCategory === "ভৌতিক, হরর, ভূতের বই" ? "active" : ""}>ভৌতিক, হরর, ভূতের বই</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("ভ্রমণ কাহিনী")}>
                    <a className={selectedCategory === "ভ্রমণ কাহিনী" ? "active" : ""}>ভ্রমণ কাহিনী</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("রচনাসমগ্র / রচনাবলী / রচনা সংকলন")}>
                    <a className={selectedCategory === "রচনাসমগ্র / রচনাবলী / রচনা সংকলন" ? "active" : ""}>রচনাসমগ্র / রচনাবলী / রচনা সংকলন</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("সায়েন্স ফিকশন / বৈজ্ঞানিক কল্পকাহিনী")}>
                    <a className={selectedCategory === "সায়েন্স ফিকশন / বৈজ্ঞানিক কল্পকাহিনী" ? "active" : ""}>সায়েন্স ফিকশন / বৈজ্ঞানিক কল্পকাহিনী</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("সাহিত্য ও ভাষা")}>
                    <a className={selectedCategory === "সাহিত্য ও ভাষা" ? "active" : ""}>সাহিত্য ও ভাষা</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("সেবা প্রকাশনী")}>
                    <a className={selectedCategory === "সেবা প্রকাশনী" ? "active" : ""}>সেবা প্রকাশনী</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("Fiction")}>
                    <a className={selectedCategory === "Fiction" ? "active" : ""}>Fiction</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("Non-Fiction")}>
                    <a className={selectedCategory === "Non-Fiction" ? "active" : ""}>Non-Fiction</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("Children's Books")}>
                    <a className={selectedCategory === "Children's Books" ? "active" : ""}>Children's Books</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("Educational/Academic")}>
                    <a className={selectedCategory === "Educational/Academic" ? "active" : ""}>Educational/Academic</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("Poetry")}>
                    <a className={selectedCategory === "Poetry" ? "active" : ""}>Poetry</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("Art & Photography")}>
                    <a className={selectedCategory === "Art & Photography" ? "active" : ""}>Art & Photography</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("Cookbooks")}>
                    <a className={selectedCategory === "Cookbooks" ? "active" : ""}>Cookbooks</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("Travel Guides")}>
                    <a className={selectedCategory === "Travel Guides" ? "active" : ""}>Travel Guides</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("Comics & Graphic Novels")}>
                    <a className={selectedCategory === "Comics & Graphic Novels" ? "active" : ""}>Comics & Graphic Novels</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("Movies")}>
                    <a className={selectedCategory === "Movies" ? "active" : ""}>Movies</a>
                  </li>
                  <li onClick={() => handleCategoryFilter("Tech Gadgets")}>
                    <a className={selectedCategory === "Tech Gadgets" ? "active" : ""}>Tech Gadgets</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5">
          {currentBooks.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-2xl text-gray-600">No books found in this category</h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {currentBooks
                .slice()
                .reverse()
                .map((book) => (
                  <Link
                    to={`/view-pdf-book/${book._id}`}
                    className="max-w-[250px] p-4 cursor-pointer hover:shadow-lg bg-white rounded-2xl shadow-md border border-gray-200"
                  >
                    <div className=" h-[200px]">
                      <img
                        src={
                          book.coverUrl
                            ? book.coverUrl
                            : "https://dictionary.cambridge.org/images/thumb/book_noun_001_01679.jpg?version=6.0.45"
                        }
                        alt="Adventures of Huckleberry Finn"
                        className=" w-full h-full rounded-t-2xl"
                      />
                    </div>
                    <div className="mt-4">
                      <h3 className="text-base font-semibold text-center text-gray-800">
                        {book.bookName.slice(0, 40)}
                      </h3>
                      <p className="text-sm text-center text-gray-500">
                        {book.writerName.slice(0, 40)}
                      </p>
                      <div className="flex justify-center mt-2">
                        <div className="rating rating-sm">
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
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8 mb-8">
          <div className="join">
            {[...Array(Math.ceil(books.length / booksPerPage))].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`join-item btn ${currentPage === index + 1 ? 'btn-active' : ''}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className=" mt-12">
        <DownNav></DownNav>
      </div>
    </div>
  );
};

export default PdfBook;
