import React, { useEffect, useState } from "react";
import useUser from "../../../../Hooks/useUser";
import usePublicAxios from "../../../../Hooks/usePublicAxios";
import toast from "react-hot-toast";

const AddProduct = () => {
  const { user, loading: userLoading } = useUser();
  const axiosPublic = usePublicAxios();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUploading, setImageUploading] = useState(false);
  const token = localStorage.getItem("token");
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    images: [],
  });

const fetchCategories = async () => {
  setLoading(true);
  try {
    const res = await axiosPublic.get("/get-product-categories");
    // শুধু name গুলো নিলাম
    const namesOnly = res.data.categories.map(cat => cat.name);
    setCategories(namesOnly);
  } catch (error) {
    console.log(error);
    toast.error("Failed to fetch categories");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchCategories();
  }, []);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Check total image limit
    if (formData.images.length + files.length > 6) {
      toast.error("Maximum 6 images allowed!");
      return;
    }

    // Validate file types and size
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit

      if (!isValidType) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [
          ...prev,
          {
            file,
            url: e.target.result,
            id: Math.random().toString(36).substr(2, 9),
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    e.target.value = "";
  };

  const removeImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
    setImagePreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!formData.title.trim()) {
      toast.error("Product title is required!");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Product description is required!");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Please enter a valid price!");
      return;
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      toast.error("Please enter a valid stock quantity!");
      return;
    }

    if (!formData.category.trim()) {
      toast.error("Please select a category!");
      return;
    }

    if (formData.images.length < 2) {
      toast.error("Product must have at least 2 images!");
      return;
    }

    if (formData.images.length > 6) {
      toast.error("Maximum 6 images allowed!");
      return;
    }

    setLoading(true);
    setUploadProgress(10);

    try {
      setImageUploading(true);

      const uploadToastId = toast.loading("Uploading images...", {
        style: {
          background: "#3B82F6",
          color: "#fff",
        },
      });

      // Upload images to ImgBB with progress tracking
      const uploadPromises = formData.images.map(async (image, index) => {
        const imgData = new FormData();
        imgData.append("image", image);

        const res = await fetch(
          `https://api.imgbb.com/1/upload?key=${
            import.meta.env.VITE_IMAGE_HOSTING_KEY
          }`,
          {
            method: "POST",
            body: imgData,
          }
        );

        const data = await res.json();

        // Update progress for each uploaded image
        const progress = Math.round(
          10 + ((index + 1) / formData.images.length) * 60
        );
        setUploadProgress(progress);

        if (!data.success) {
          throw new Error(`Failed to upload ${image.name}`);
        }

        return data.data.url;
      });

      const uploadedImageUrls = await Promise.all(uploadPromises);

      toast.dismiss(uploadToastId);
      setImageUploading(false);
      setUploadProgress(75);

      const createToastId = toast.loading("Creating product...", {
        style: {
          background: "#10B981",
          color: "#fff",
        },
      });

      // Product object
      const productData = {
        vendorId: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category.trim(),
        images: uploadedImageUrls,
        createdAt: new Date().toISOString(),
        rating: 0,
        reviews: 0,
        reviewerIds: [],
      };

      // Send to backend
      const response = await axiosPublic.post(
        "/add-seller-product",
        productData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUploadProgress(100);
      toast.dismiss(createToastId);

      if (response.data.success) {
        // Success toast with custom styling
        toast.success("🎉 Product added successfully!", {
          duration: 5000,
          style: {
            background: "#10B981",
            color: "#fff",
            fontWeight: "bold",
            padding: "16px",
            borderRadius: "12px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#10B981",
          },
        });

        // Reset form with animation
        setTimeout(() => {
          setFormData({
            title: "",
            description: "",
            price: "",
            stock: "",
            category: "",
            images: [],
          });
          setImagePreviews([]);
          setUploadProgress(0);
        }, 1000);
      } else {
        throw new Error(response.data.message || "Failed to create product");
      }
    } catch (error) {
      console.error("Product creation error:", error);

      // Dismiss any existing toasts
      toast.dismiss();

      // Show error toast
      toast.error(error.message || "Failed to add product. Please try again.", {
        duration: 5000,
        style: {
          background: "#EF4444",
          color: "#fff",
          fontWeight: "bold",
          padding: "16px",
          borderRadius: "12px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#EF4444",
        },
      });
    } finally {
      setLoading(false);
      setImageUploading(false);

      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 rounded-full mb-4 sm:mb-6 shadow-lg">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3 px-2">
            Add New Product
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Create your product listing with beautiful images and detailed
            information to attract customers
          </p>
        </div>

        {/* Progress Bar Section */}
        {(loading || imageUploading) && (
          <div className="mb-6 sm:mb-8 mx-2 sm:mx-0">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                    <svg
                      className={`w-3 h-3 sm:w-5 sm:h-5 text-white ${
                        loading ? "animate-spin" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </div>
                  <span className="text-sm sm:text-lg font-semibold text-gray-800">
                    {imageUploading
                      ? "Uploading Images..."
                      : uploadProgress === 100
                      ? "Product Created Successfully!"
                      : "Creating Product..."}
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                <div
                  className="h-2 sm:h-3 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${uploadProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
              <div className="mt-2 text-xs sm:text-sm text-gray-500">
                {imageUploading && "Please wait while we upload your images..."}
                {!imageUploading &&
                  uploadProgress < 100 &&
                  "Creating your product listing..."}
                {uploadProgress === 100 && "Redirecting..."}
              </div>
            </div>
          </div>
        )}

        {/* Main Form Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mx-2 sm:mx-0">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"
                />
              </svg>
              Product Information
            </h2>
            <p className="text-blue-100 mt-1 text-sm sm:text-base">
              Fill in the details below to create your product listing
            </p>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            {/* Product Title */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                Product Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter an attractive and descriptive product title"
                className="w-full px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
                maxLength={100}
                required
              />
              <div className="text-right text-xs text-gray-400">
                {formData.title.length}/100 characters
              </div>
            </div>

            {/* Product Description */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                Product Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product features, benefits, specifications, and what makes it special..."
                className="w-full px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none text-gray-800 placeholder-gray-400 text-sm sm:text-base"
                rows="4"
                maxLength={500}
                required
              />
              <div className="text-right text-xs text-gray-400">
                {formData.description.length}/500 characters
              </div>
            </div>

            {/* Price, Stock, and Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {/* Price */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  Price ($) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-6 sm:pl-8 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800 text-sm sm:text-base"
                    required
                  />
                  <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold text-sm sm:text-base">
                    $
                  </div>
                </div>
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800 text-sm sm:text-base"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800 bg-white text-sm sm:text-base"
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                Product Images * (2-6 images)
              </label>

              {/* Upload Area */}
              <div
                className={`relative border-3 border-dashed rounded-2xl p-6 sm:p-12 text-center transition-all duration-300 ${
                  formData.images.length >= 6
                    ? "border-gray-300 bg-gray-50"
                    : "border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100"
                }`}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="image-upload"
                  disabled={loading || formData.images.length >= 6}
                />

                <div className="flex flex-col items-center">
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4 sm:mb-6 ${
                      formData.images.length >= 6
                        ? "bg-gray-200"
                        : "bg-gradient-to-r from-blue-400 to-indigo-500"
                    }`}
                  >
                    <svg
                      className={`w-8 h-8 sm:w-10 sm:h-10 ${
                        formData.images.length >= 6
                          ? "text-gray-400"
                          : "text-white"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>

                  <h3
                    className={`text-lg sm:text-xl font-bold mb-2 ${
                      formData.images.length >= 6
                        ? "text-gray-500"
                        : "text-gray-800"
                    }`}
                  >
                    {formData.images.length >= 6
                      ? "Maximum images reached"
                      : "Click to upload or drag and drop"}
                  </h3>

                  <p className="text-gray-500 mb-4 text-sm sm:text-base px-2">
                    PNG, JPG, JPEG, WebP up to 5MB each
                  </p>

                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full ${
                        formData.images.length >= 2
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {formData.images.length}/6 images
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full ${
                        formData.images.length >= 2
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {formData.images.length >= 2
                        ? "✓ Minimum met"
                        : "⚠ Need 2+ images"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                      Uploaded Images ({imagePreviews.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, images: [] }));
                        setImagePreviews([]);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors duration-200"
                      disabled={loading}
                    >
                      Remove All
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 border-2 sm:border-3 border-gray-200 shadow-md group-hover:shadow-lg transition-all duration-300">
                          <img
                            src={preview.url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />

                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="opacity-0 group-hover:opacity-100 w-7 h-7 sm:w-8 sm:h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-200 transform hover:scale-110"
                              disabled={loading}
                            >
                              <svg
                                className="w-4 h-4 sm:w-5 sm:h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>

                          {/* Image badges */}
                          {index === 0 && (
                            <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold shadow-lg">
                              Main Image
                            </div>
                          )}

                          <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 bg-black bg-opacity-60 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                            #{index + 1}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Requirements Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                <div className="flex items-start">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">
                      Image Upload Guidelines
                    </h4>
                    <ul className="space-y-1 text-xs sm:text-sm text-blue-700">
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                        <span>Minimum 2 images required (first image becomes the main product image)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                        <span>Maximum 6 images allowed</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                        <span>Supported formats: PNG, JPG, JPEG, WebP</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                        <span>Maximum file size: 5MB per image</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                        <span>High-quality images improve sales - use good lighting and clear shots</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 sm:pt-6">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || userLoading || formData.images.length < 2}
                className={`w-full py-4 sm:py-5 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 transform ${
                  loading || userLoading || formData.images.length < 2
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 text-white hover:from-blue-600 hover:via-purple-600 hover:to-teal-600 hover:shadow-2xl hover:-translate-y-1 active:transform-none"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 sm:h-6 sm:w-6 text-white"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-sm sm:text-base">
                      {imageUploading
                        ? "Uploading Images..."
                        : "Creating Product..."}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span className="text-sm sm:text-base">Create Product Listing</span>
                  </div>
                )}
              </button>

              {/* Form validation messages */}
              {formData.images.length < 2 && (
                <div className="mt-4 p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <div className="flex items-start">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <p className="text-xs sm:text-sm text-orange-700 font-medium">
                      Please upload at least 2 images to create your product
                      listing
                    </p>
                  </div>
                </div>
              )}

              {/* Success state hint */}
              {formData.images.length >= 2 &&
                formData.title &&
                formData.description &&
                formData.price &&
                formData.stock &&
                formData.category && (
                  <div className="mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-start">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-xs sm:text-sm text-green-700 font-medium">
                        Great! All required fields are completed. Ready to
                        create your product.
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 sm:mt-8 text-center px-4">
          <p className="text-gray-500 text-xs sm:text-sm">
            Need help? Check out our{" "}
            <a
              href="#"
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              seller guidelines
            </a>{" "}
            or{" "}
            <a
              href="#"
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;