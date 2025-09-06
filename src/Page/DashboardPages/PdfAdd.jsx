import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import * as pdfjsLib from "pdfjs-dist";

// PDF.js worker init
const initPdfJs = async () => {
  try {
    const worker = await import("pdfjs-dist/build/pdf.worker.mjs");
    pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default;
  } catch (error) {
    console.error("Error initializing PDF.js worker:", error);
  }
};

const PdfAdd = () => {
  const [uploadMethod, setUploadMethod] = useState("");
  const [bookCategory, setBookCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  const [formData, setFormData] = useState({
    bookName: "",
    writerName: "",
    pdfLink: "",
    pdfFile: null,
    coverPhoto: null,
    embedLink: "",
    description: "",
  });

  useEffect(() => {
    initPdfJs();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { id, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: files[0],
    }));
  };

  const calculatePdfMetadata = async (file) => {
    try {
      const fileSizeKB = (file.size / 1024).toFixed(2);
      const fileUrl = URL.createObjectURL(file);
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;
      const pageCount = pdf.numPages;
      URL.revokeObjectURL(fileUrl);
      return {
        pageCount,
        fileSize: Number(fileSizeKB),
      };
    } catch (error) {
      console.error("PDF metadata error:", error);
      return {
        pageCount: 0,
        fileSize: Number((file.size / 1024).toFixed(2)),
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let metadata = { pageCount: 0, fileSize: 0 };
      let pdfUrl = "";

      if (uploadMethod === "Direct Upload" && formData.pdfFile) {
        metadata = await calculatePdfMetadata(formData.pdfFile);

        if (metadata.pageCount === 0) {
          toast.warning("Could not read page count.");
        }

        const pdfData = new FormData();
        pdfData.append("file", formData.pdfFile);
        pdfData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const pdfRes = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
          { method: "POST", body: pdfData }
        );
        const pdfResult = await pdfRes.json();
        pdfUrl = pdfResult.secure_url;
      } else if (uploadMethod === "Via Link") {
        pdfUrl = formData.pdfLink;
      } else if (uploadMethod === "Google Books Embed") {
        pdfUrl = formData.embedLink;
      }

      const coverData = new FormData();
      coverData.append("file", formData.coverPhoto);
      coverData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const coverRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: coverData }
      );
      const coverResult = await coverRes.json();
      const coverUrl = coverResult.secure_url;

      const bookData = {
        bookName: formData.bookName,
        writerName: formData.writerName,
        category: bookCategory,
        uploadMethod,
        description: formData.description,
        pdfUrl,
        coverUrl,
        pageCount: metadata.pageCount,
        fileSize: metadata.fileSize || 0,
      };

      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Book uploaded successfully!");
        setFormData({
          bookName: "",
          writerName: "",
          pdfLink: "",
          pdfFile: null,
          coverPhoto: null,
          embedLink: "",
          description: "",
        });
        setUploadMethod("");
      } else {
        toast.error(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <h1 className="text-xl lg:text-3xl font-semibold text-center mt-5">
        Add PDF Book
      </h1>
      <section>
        <div className="mx-auto lg:min-w-[800px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-gray-100 p-8 shadow-lg">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="lg:text-lg font-medium">Book Name</label>
                <input
                  id="bookName"
                  value={formData.bookName}
                  onChange={handleChange}
                  required
                  className="w-full border-2 rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="Title"
                />
              </div>

              <div>
                <label className="lg:text-lg font-medium">Writer Name</label>
                <input
                  id="writerName"
                  value={formData.writerName}
                  onChange={handleChange}
                  required
                  className="w-full border-2 rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="Writer"
                />
              </div>

              <div>
                <label className="lg:text-lg font-medium">Category</label>
                <select
                  required
                  onChange={(e) => setBookCategory(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option>Select One</option>
                  <option>Editor's Choice</option>
                  <option>English Books</option>
                  <option>অনুবাদ বই</option>
                  <option>অসম্পূর্ণ বই</option>
                  <option>আত্মউন্নয়নমূলক বই</option>
                  <option>আত্মজীবনী ও স্মৃতিকথা</option>
                  <option>ইতিহাস ও সংস্কৃতি</option>
                  <option>ইসলামিক বই</option>
                  <option>উপন্যাস</option>
                  <option>কাব্যগ্রন্থ / কবিতা</option>
                  <option>কিশোর সাহিত্য</option>
                  <option>গণিত, বিজ্ঞান ও প্রযুক্তি</option>
                  <option>গল্পগ্রন্থ / গল্পের বই</option>
                  <option>গান / গানের বই</option>
                  <option>গোয়েন্দা (ডিটেকটিভ)</option>
                  <option>থ্রিলার রহস্য রোমাঞ্চ অ্যাডভেঞ্চার</option>
                  <option>ধর্ম ও দর্শন</option>
                  <option>ধর্মীয় বই</option>
                  <option>নাটক</option>
                  <option>প্রবন্ধ ও গবেষণা</option>
                  <option>প্রাপ্তবয়স্কদের বই ১৮+</option>
                  <option>বাংলাদেশ ও মুক্তিযুদ্ধ বিষয়ক</option>
                  <option>ভৌতিক, হরর, ভূতের বই</option>
                  <option>ভ্রমণ কাহিনী</option>
                  <option>রচনাসমগ্র / রচনাবলী / রচনা সংকলন</option>
                  <option>সায়েন্স ফিকশন / বৈজ্ঞানিক কল্পকাহিনী</option>
                  <option>সাহিত্য ও ভাষা</option>
                  <option>সেবা প্রকাশনী</option>
                  <option>Fiction</option>
                  <option>Non-Fiction</option>
                  <option>Children's Books</option>
                  <option>Educational/Academic</option>
                  <option>Poetry</option>
                  <option>Art & Photography</option>
                  <option>Cookbooks</option>
                  <option>Travel Guides</option>
                  <option>Comics & Graphic Novels</option>
                  <option>Movies</option>
                  <option>Tech Gadgets</option>
                </select>
              </div>

              <div>
                <label className="lg:text-lg font-medium">Upload Method</label>
                <select
                  required
                  onChange={(e) => setUploadMethod(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option>Select One</option>
                  <option>Via Link</option>
                  <option>Direct Upload</option>
                  <option>Google Books Embed</option>
                </select>
              </div>

              {uploadMethod === "Via Link" && (
                <div>
                  <label className="lg:text-lg font-medium">PDF Link</label>
                  <input
                    id="pdfLink"
                    value={formData.pdfLink}
                    onChange={handleChange}
                    className="w-full border-2 rounded-lg border-gray-200 p-3 text-sm"
                    placeholder="https://example.com/file.pdf"
                  />
                </div>
              )}

              {uploadMethod === "Direct Upload" && (
                <div>
                  <label className="lg:text-lg font-medium">Upload PDF File</label>
                  <input
                    id="pdfFile"
                    onChange={handleFileChange}
                    type="file"
                    accept="application/pdf"
                    className="w-full file:cursor-pointer border-2 rounded p-2"
                  />
                </div>
              )}

              {uploadMethod === "Google Books Embed" && (
                <div>
                  <label className="lg:text-lg font-medium">Google Embed Link</label>
                  <input
                    id="embedLink"
                    value={formData.embedLink}
                    onChange={handleChange}
                    className="w-full border-2 rounded-lg border-gray-200 p-3 text-sm"
                    placeholder="https://books.google.com/books?id=XXXX&output=embed"
                  />
                </div>
              )}

              <div>
                <label className="lg:text-lg font-medium">Cover Photo</label>
                <input
                  id="coverPhoto"
                  onChange={handleFileChange}
                  type="file"
                  accept="image/*"
                  required
                  className="w-full file:cursor-pointer border-2 rounded p-2"
                />
              </div>

              <div>
                <label className="lg:text-lg font-medium">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="w-full border-2 rounded-lg border-gray-200 p-3 text-sm"
                  rows="6"
                  placeholder="Description of the book"
                ></textarea>
              </div>



              <button
                type="submit"
                className="w-full bg-gray-700 text-white py-2 rounded-lg font-medium"
              >
                {loading ? "Uploading..." : "Publish Book"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PdfAdd;
