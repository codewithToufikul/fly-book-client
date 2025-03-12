import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
const initPdfJs = async () => {
  try {
    const worker = await import('pdfjs-dist/build/pdf.worker.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default;
  } catch (error) {
    console.error('Error initializing PDF.js worker:', error);
  }
};

const PdfAdd = () => {
  const [uploadMethod, setUploadMethod] = useState("");
  const [bookCategory, setBookCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env
  .VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const [formData, setFormData] = useState({
    bookName: "",
    writerName: "",
    pdfLink: "",
    pdfFile: null,
    coverPhoto: null,
    description: "",
  });
  const [pdfMetadata, setPdfMetadata] = useState({ pageCount: 0, fileSize: 0 });

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
      [id]: files[0], // Store the first selected file
    }));
  };

  const calculatePdfMetadata = async (file) => {
    try {
      // Calculate file size in KB with precision
      const fileSizeBytes = file.size;
      const fileSizeKB = (fileSizeBytes / 1024).toFixed(2);
      
      // Create a URL from the file
      const fileUrl = URL.createObjectURL(file);
      
      // Load and get page count
      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;
      const pageCount = pdf.numPages;
      
      // Clean up
      URL.revokeObjectURL(fileUrl);
      
      console.log('PDF Metadata:', { 
        pageCount, 
        fileSize: fileSizeKB,
        originalSize: file.size,
        unit: 'KB'
      }); // Debug log
      
      return { 
        pageCount, 
        fileSize: Number(fileSizeKB) // Convert to number to ensure proper type
      };
    } catch (error) {
      console.error('Error calculating PDF metadata:', error);
      // Calculate at least the file size if page count fails
      const fallbackSize = (file.size / 1024).toFixed(2); // Convert to KB
      return { 
        pageCount: 0, 
        fileSize: Number(fallbackSize) // Convert to number
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let metadata = { pageCount: 0, fileSize: 0 };
      
      // Calculate metadata first if it's a direct upload
      if (uploadMethod === "Direct Upload" && formData.pdfFile) {
        metadata = await calculatePdfMetadata(formData.pdfFile);
        console.log('Metadata before upload:', metadata); // Debug log
        
        if (metadata.pageCount === 0) {
          toast.warning("Could not read PDF page count, but continuing upload...");
        }
        if (metadata.fileSize === 0) {
          toast.warning("Could not calculate file size, but continuing upload...");
        }
      }

      // Upload cover photo to Cloudinary
      const coverPhotoData = new FormData();
      coverPhotoData.append('file', formData.coverPhoto);
      coverPhotoData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      
      const coverPhotoRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: coverPhotoData,
        }
      );
      const coverPhotoResult = await coverPhotoRes.json();
      const coverUrl = coverPhotoResult.secure_url;

      // Handle PDF upload based on method
      let pdfUrl = '';

      if (uploadMethod === "Via Link") {
        pdfUrl = formData.pdfLink;
      } else if (uploadMethod === "Direct Upload" && formData.pdfFile) {
        // Upload PDF to Cloudinary
        const pdfData = new FormData();
        pdfData.append('file', formData.pdfFile);
        pdfData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        
        const pdfRes = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
          {
            method: 'POST',
            body: pdfData,
          }
        );
        const pdfResult = await pdfRes.json();
        pdfUrl = pdfResult.secure_url;
      }

      // Send data to backend
      const bookData = {
        bookName: formData.bookName,
        writerName: formData.writerName,
        category: bookCategory,
        uploadMethod,
        description: formData.description,
        pdfUrl,
        coverUrl,
        pageCount: metadata.pageCount,
        fileSize: metadata.fileSize || 0 // Provide fallback if undefined
      };

      const response = await fetch("https://api.flybook.com.bd/upload", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });
  
      const result = await response.json();
      if (response.ok) {
        toast.success("PDF Book Uploaded Successfully!");
        setLoading(false)
        setFormData({
          bookName: "",
          writerName: "",
          pdfLink: "",
          pdfFile: null,
          coverPhoto: null,
          description: "",
        });
        setUploadMethod("");
      } else {
        toast.error(`Error: ${result.message}`);
        setLoading(false)
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload. Try again.");
      setLoading(false)
    }
  };
  

  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <h1 className="text-xl lg:text-3xl font-semibold text-center mt-5">
        Add PDF Book
      </h1>
      <section>
        <div className="mx-auto lg:min-w-[800px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-gray-100 p-8 shadow-lg lg:col-span-3 lg:p-12">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="lg:text-lg font-medium">Book Name</label>
                <input
                  className="w-full border-2 rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="Title"
                  type="text"
                  id="bookName"
                  required
                  value={formData.bookName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="lg:text-lg font-medium">Writer Name</label>
                <input
                required
                  className="w-full border-2 rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="Writer"
                  type="text"
                  id="writerName"
                  value={formData.writerName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="lg:text-lg font-medium">Select Book Category</label>
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
                <label className="lg:text-lg font-medium">Select Upload Method</label>
                <select
                required
                  onChange={(e) => setUploadMethod(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option>Select One</option>
                  <option>Via Link</option>
                  <option>Direct Upload</option>
                </select>
              </div>
              {uploadMethod === "Via Link" ? (
                <div>
                  <label className="lg:text-lg font-medium">PDF Link</label>
                  <input
                    className="w-full border-2 rounded-lg border-gray-200 p-3 text-sm"
                    placeholder="link"
                    type="text"
                    id="pdfLink"
                    value={formData.pdfLink}
                    onChange={handleChange}
                  />
                </div>
              ) : uploadMethod === "Direct Upload" ? (
                <div>
                  <label className="block mb-2 text-sm mt-3 lg:text-lg font-medium text-gray-800">
                    Select Pdf file
                  </label>
                  <input
                    type="file"
                    id="pdfFile"
                    onChange={handleFileChange}
                    className="w-full text-gray-500 font-medium text-sm border-2 bg-gray-100 file:cursor-pointer cursor-pointer file:border-0 file:py-2 file:px-4 file:mr-4 file:bg-gray-800 file:hover:bg-gray-700 file:text-white rounded"
                  />
                </div>
              ) : null}

              <div>
                <label className="block mb-2 text-sm mt-3 lg:text-lg font-medium text-gray-800">
                  Select Book Cover Photo
                </label>
                <input
                required
                  type="file"
                  id="coverPhoto"
                  onChange={handleFileChange}
                  className="w-full text-gray-500 font-medium text-sm border-2 bg-gray-100 file:cursor-pointer cursor-pointer file:border-0 file:py-2 file:px-4 file:mr-4 file:bg-gray-800 file:hover:bg-gray-700 file:text-white rounded"
                />
              </div>

              <div>
                <label className="lg:text-lg font-medium">Description</label>
                <textarea
                required
                  className="w-full border-2 rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="Description"
                  rows="8"
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  className="inline-block w-full rounded-lg bg-gray-500 px-5 py-3 font-medium text-white sm:w-auto"
                >
                  {
                    loading ? "Loading.." : "Publish"
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PdfAdd;
