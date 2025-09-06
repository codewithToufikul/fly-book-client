import React, { useEffect, useState } from "react";
import useUser from "../../../../Hooks/useUser";
import usePublicAxios from "../../../../Hooks/usePublicAxios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const BannerRequest = () => {
  const { user, loading: userLoading } = useUser();
  const axiosPublic = usePublicAxios();
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ctaText: "",
    ctaLink: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [showForm, setShowForm] = useState(true);

  const imageHostingKey = import.meta.env.VITE_IMAGE_HOSTING_KEY;
  const imageHostingApi = `https://api.imgbb.com/1/upload?key=${imageHostingKey}`;

  // Fetch seller's banners & products
  useEffect(() => {
    if (user?.id) {
      fetchBanners();
      fetchProducts();
    }
  }, [user]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await axiosPublic.get(
        `/seller/banner-requests/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBanners(res.data.banners || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axiosPublic.get("/get-seller-products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.products || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch products");
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image Upload - Fixed to properly save URL
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const form = new FormData();
    form.append("image", file);

    try {
      setImageUploading(true);
      const res = await fetch(imageHostingApi, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      
      if (data.success) {
        // Fixed: Properly update the image URL in formData
        setFormData(prev => ({ 
          ...prev, 
          image: data.data.display_url 
        }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Image upload failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Image upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  // Add / Update banner
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!formData.title.trim()) {
      toast.error("Please enter a banner title!");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a banner description!");
      return;
    }
    if (!formData.ctaText.trim()) {
      toast.error("Please enter CTA text!");
      return;
    }
    if (!formData.ctaLink) {
      toast.error("Please select a product for CTA link!");
      return;
    }
    if (!formData.image) {
      toast.error("Please upload a banner image!");
      return;
    }

    try {
      setLoading(true);
      if (editingBanner) {
        await axiosPublic.patch(
          `/seller/banner-request/${editingBanner._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Banner updated successfully!");
      } else {
        await axiosPublic.post(
          "/seller/banner-request",
          {
            ...formData,
            sellerId: user.id,
            sellerName: user.name,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Banner request submitted!");
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        ctaText: "",
        ctaLink: "",
        image: "",
      });
      setEditingBanner(null);
      setShowForm(false);
      fetchBanners();
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit banner request");
    } finally {
      setLoading(false);
    }
  };

  // Edit banner
  const handleEdit = (banner) => {
    setFormData({
      title: banner.title,
      description: banner.description,
      ctaText: banner.ctaText,
      ctaLink: banner.ctaLink,
      image: banner.image,
    });
    setEditingBanner(banner);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  // Delete banner
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axiosPublic.delete(`/seller/banner-request/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Banner deleted successfully");
        fetchBanners();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete banner");
      }
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setFormData({
      title: "",
      description: "",
      ctaLink: "",
      ctaText: "",
      image: "",
    });
    setEditingBanner(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Banner Management
              </h1>
              <p className="text-gray-600">
                Create and manage your promotional banners
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 sm:mt-0 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Banner
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Banner Form */}
          {showForm && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {editingBanner ? "Edit Banner" : "Create New Banner"}
                    </h2>
                    <button
                      onClick={() => setShowForm(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Banner Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Banner Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter an engaging banner title"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>

                  {/* Banner Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your banner content and purpose"
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors resize-none"
                      required
                    />
                  </div>

                  {/* CTA Text */}
                  <div>
                    <label htmlFor="ctaText" className="block text-sm font-medium text-gray-700 mb-2">
                      Call-to-Action Text *
                    </label>
                    <input
                      id="ctaText"
                      type="text"
                      name="ctaText"
                      value={formData.ctaText}
                      onChange={handleChange}
                      placeholder="e.g., Shop Now, Learn More, Get Started"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>

                  {/* Product Select */}
                  <div>
                    <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">
                      Link to Product *
                    </label>
                    <select
                      id="product"
                      name="product"
                      value={formData.ctaLink.replace("/product-details/", "")}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ctaLink: `/product-details/${e.target.value}`,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                      required
                    >
                      <option value="">Select a product to link</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                      Banner Image *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 transition-colors">
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={imageUploading}
                      />
                      
                      {formData.image ? (
                        <div className="space-y-4">
                          <img
                            src={formData.image}
                            alt="Banner preview"
                            className="mx-auto max-h-48 rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById('image').click()}
                            disabled={imageUploading}
                            className="px-4 py-2 text-sm text-teal-600 hover:text-teal-700 disabled:opacity-50"
                          >
                            {imageUploading ? 'Uploading...' : 'Change Image'}
                          </button>
                        </div>
                      ) : (
                        <div>
                          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <button
                            type="button"
                            onClick={() => document.getElementById('image').click()}
                            disabled={imageUploading}
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {imageUploading ? 'Uploading...' : 'Upload Image'}
                          </button>
                          <p className="text-sm text-gray-500 mt-2">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading || imageUploading}
                      className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : editingBanner ? 'Update Banner' : 'Create Banner'}
                    </button>
                    {editingBanner && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Banner List */}
          <div className={showForm ? 'lg:col-span-1' : 'lg:col-span-3'}>
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Your Banners ({banners.length})
                </h3>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  </div>
                ) : banners.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V4M7 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4H17M7 4H17" />
                    </svg>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No banners yet</h4>
                    <p className="text-gray-600">Create your first banner to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {banners.map((banner) => (
                      <div
                        key={banner._id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {banner.image && (
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-full h-32 sm:h-40 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 flex-1 mr-2">
                              {banner.title}
                            </h4>
                            {getStatusBadge(banner.status)}
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {banner.description}
                          </p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.1a4 4 0 105.656-5.656l-1.1-1.102zM15 7l3 3L9 19l-3-3 9-9z" />
                              </svg>
                              CTA: {banner.ctaText}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Links to: {banner.ctaLink}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => handleEdit(banner)}
                              className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(banner._id)}
                              className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerRequest;