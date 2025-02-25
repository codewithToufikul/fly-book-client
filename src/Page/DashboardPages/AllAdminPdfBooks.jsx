import React, { useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import useAllPdfBook from "../../Hooks/useAllPdfBook";
import axios from "axios";
import toast from "react-hot-toast";
import usePublicAxios from "../../Hooks/usePublicAxios";

const categories = [
  "Editor's Choice",
  "English Books",
  "অনুবাদ বই",
  "অসম্পূর্ণ বই",
  "আত্মউন্নয়নমূলক বই",
  "আত্মজীবনী ও স্মৃতিকথা",
  "ইতিহাস ও সংস্কৃতি",
  "ইসলামিক বই",
  "উপন্যাস",
  "কাব্যগ্রন্থ / কবিতা",
  "কিশোর সাহিত্য",
  "গণিত, বিজ্ঞান ও প্রযুক্তি",
  "গল্পগ্রন্থ / গল্পের বই",
  "গান / গানের বই",
  "গোয়েন্দা (ডিটেকটিভ)",
  "থ্রিলার রহস্য রোমাঞ্চ অ্যাডভেঞ্চার",
  "ধর্ম ও দর্শন",
  "ধর্মীয় বই",
  "নাটক",
  "প্রবন্ধ ও গবেষণা",
  "প্রাপ্তবয়স্কদের বই ১৮+",
  "বাংলাদেশ ও মুক্তিযুদ্ধ বিষয়ক",
  "ভৌতিক, হরর, ভূতের বই",
  "ভ্রমণ কাহিনী",
  "রচনাসমগ্র / রচনাবলী / রচনা সংকলন",
  "সায়েন্স ফিকশন / বৈজ্ঞানিক কল্পকাহিনী",
  "সাহিত্য ও ভাষা",
  "সেবা প্রকাশনী",
  "Fiction",
  "Non-Fiction",
  "Children's Books",
  "Educational/Academic",
  "Poetry",
  "Art & Photography",
  "Cookbooks",
  "Travel Guides",
  "Comics & Graphic Novels",
  "Movies",
  "Tech Gadgets"
];

const AllAdminPdfBooks = () => {
  const { pdfBooks, refetch, isLoading, isError, error } = useAllPdfBook();
  const [editingBook, setEditingBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingBook, setDeletingBook] = useState(null);
  const axiosPublic = usePublicAxios();
  const token = localStorage.getItem("token");

  if (isLoading) {
    return <p>Loading...</p>;
  }

  const handleEditClick = (book) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const updatedBook = {
      bookName: form.bookName.value,
      writerName: form.writerName.value,
      category: form.category.value,
      pdfUrl: form.pdfUrl.value,
      coverUrl: form.coverUrl.value,
      description: form.description.value,
    };

    try {
      const response = await axiosPublic.put(`/pdf-books/${editingBook._id}`, updatedBook, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data.success) {
        toast.success('Book updated successfully!');
        refetch();
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error('Failed to update book');
      console.error('Error updating book:', error);
    }
  };

  const handleDeleteClick = (book) => {
    setDeletingBook(book);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axiosPublic.delete(`/pdf-books/${deletingBook._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (response.data.success) {
        toast.success('Book deleted successfully!');
        refetch();
        setDeletingBook(null);
      }
    } catch (error) {
      toast.error('Failed to delete book');
      console.error('Error deleting book:', error);
    }
  };

  return (
    <div>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold">All PDF Books</h1>
      </div>
      <div className="mt-5 lg:m-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {pdfBooks.map((book) => (
          <div
            key={book._id}
            className="max-w-[250px] p-4 hover:shadow-lg bg-white rounded-2xl shadow-md border border-gray-200 flex flex-col h-full"
          >
            <div className="h-[200px]">
              <img
                src={
                  book.coverUrl
                    ? book.coverUrl
                    : "https://dictionary.cambridge.org/images/thumb/book_noun_001_01679.jpg?version=6.0.45"
                }
                alt="Adventures of Huckleberry Finn"
                className="w-full h-full rounded-t-2xl object-cover"
              />
            </div>
            <div className="flex flex-col flex-grow">
              <div className="mt-4">
                <h3 className="text-base font-semibold text-center text-gray-800">
                  {book.bookName.slice(0, 40)}
                </h3>
                <p className="text-sm text-center text-gray-500">
                  {book.writerName.slice(0, 40)}
                </p>
              </div>
              <div className="flex justify-center gap-2 mt-auto pt-4">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleEditClick(book)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-error btn-sm"
                  onClick={() => handleDeleteClick(book)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box w-11/12 max-w-3xl">
            <form onSubmit={handleEditSubmit}>
              <h3 className="font-bold text-lg mb-4">Edit Book Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Book Name</span>
                  </label>
                  <input
                    type="text"
                    name="bookName"
                    defaultValue={editingBook?.bookName}
                    className="input input-bordered"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Writer Name</span>
                  </label>
                  <input
                    type="text"
                    name="writerName"
                    defaultValue={editingBook?.writerName}
                    className="input input-bordered"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Category</span>
                  </label>
                  <select
                    name="category"
                    defaultValue={editingBook?.category}
                    className="select select-bordered w-full"
                    required
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">PDF URL</span>
                  </label>
                  <input
                    type="url"
                    name="pdfUrl"
                    defaultValue={editingBook?.pdfUrl}
                    className="input input-bordered"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Cover Image URL</span>
                  </label>
                  <input
                    type="url"
                    name="coverUrl"
                    defaultValue={editingBook?.coverUrl}
                    className="input input-bordered"
                    required
                  />
                </div>
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  name="description"
                  defaultValue={editingBook?.description}
                  className="textarea textarea-bordered h-24"
                  required
                ></textarea>
              </div>

              <div className="modal-action">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setIsModalOpen(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBook && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Delete</h3>
            <p className="py-4">
              Are you sure you want to delete "{deletingBook.bookName}"? This action cannot be undone.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-error"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
              <button
                className="btn"
                onClick={() => setDeletingBook(null)}
              >
                Cancel
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setDeletingBook(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default AllAdminPdfBooks;
