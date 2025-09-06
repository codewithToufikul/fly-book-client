import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import useUser from "../../../Hooks/useUser";
import usePublicAxios from "../../../Hooks/usePublicAxios";
import { Pencil, Star, Trash2 } from "lucide-react";

const AdminProducts = () => {
  const { user, loading: userLoading } = useUser();
  const axiosPublic = usePublicAxios();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({});
  const token = localStorage.getItem("token");

  const fetchCategories = async () => {
    try {
      const res = await axiosPublic.get("/get-product-categories");
      const namesOnly = res.data.categories.map((cat) => cat.name);
      setCategories(namesOnly);
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Failed to fetch categories", "error");
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosPublic.get("/get-admin-products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(res.data.products || []);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the product!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f766e",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosPublic.delete(`/delete-admin-product/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setProducts(products.filter((p) => p._id !== id));
          Swal.fire("Deleted!", "Product has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error", "Failed to delete product", "error");
        }
      }
    });
  };

  // inside AdminProducts component
  const handleFeaturedToggle = async (product) => {
    try {
      const updated = { isFeatured: !product.isFeatured };
      await axiosPublic.put(`/update-admin-product/${product._id}`, updated, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(
        products.map((p) => (p._id === product._id ? { ...p, ...updated } : p))
      );

      Swal.fire(
        "Updated!",
        `Product ${
          updated.isFeatured ? "marked as Featured" : "removed from Featured"
        }`,
        "success"
      );
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to update featured status", "error");
    }
  };

  const calculateDiscount = (originalPrice, currentPrice) => {
    if (!originalPrice || !currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };

    // Auto-calculate discount when original price or current price changes
    if (name === "originalPrice" || name === "price") {
      const originalPrice = parseFloat(newFormData.originalPrice || 0);
      const currentPrice = parseFloat(newFormData.price || 0);
      newFormData.discount = calculateDiscount(originalPrice, currentPrice);
    }

    setFormData(newFormData);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const updatedProduct = {
      title: form.title.value,
      description: form.description.value,
      price: parseFloat(form.price.value),
      originalPrice: parseFloat(form.originalPrice.value),
      discount: calculateDiscount(
        parseFloat(form.originalPrice.value),
        parseFloat(form.price.value)
      ),
      stock: parseInt(form.stock.value),
      category: form.category.value,
    };

    try {
      await axiosPublic.put(
        `/update-admin-product/${editingProduct._id}`,
        updatedProduct,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProducts(
        products.map((p) =>
          p._id === editingProduct._id ? { ...p, ...updatedProduct } : p
        )
      );

      setEditingProduct(null);
      setFormData({});
      Swal.fire("Updated!", "Product updated successfully", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to update product", "error");
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || "",
      description: product.description || "",
      price: product.price || "",
      originalPrice: product.originalPrice || "",
      discount: product.discount || 0,
      stock: product.stock || "",
      category: product.category || "",
    });
  };

  useEffect(() => {
    if (!userLoading && user) {
      fetchCategories();
      fetchProducts();
    }
  }, [user, userLoading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 mx-auto border-4 border-transparent border-t-teal-400 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <p className="text-slate-600 font-medium text-sm sm:text-base">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-teal-700 mb-1 sm:mb-2">
                  All Products
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Manage product inventory
                </p>
              </div>
              <div className="bg-teal-100 rounded-full p-3 sm:p-4">
                <span className="text-xl sm:text-2xl">📦</span>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span className="text-gray-600">Total Products:</span>
                    <span className="font-semibold text-gray-900">
                      {products.length}
                    </span>
                  </div>
                  {products.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">In Stock:</span>
                      <span className="font-semibold text-gray-900">
                        {products.filter((p) => p.stock > 0).length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid - Mobile: 2 columns, Tablet: 3 columns, Desktop: 4+ columns */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-md border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                {/* Product Image */}
                <div className="relative">
                  <img
                    src={product.images?.[0] || "/api/placeholder/300/200"}
                    alt={product.title}
                    className="w-full h-32 sm:h-40 lg:h-48 object-cover"
                  />
                  {product.discount > 0 && (
                    <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold">
                      -{product.discount}%
                    </div>
                  )}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold text-xs sm:text-sm">
                        OUT OF STOCK
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-2 sm:p-3 lg:p-4">
                  <h2
                    className="text-sm sm:text-base lg:text-lg font-semibold mb-2 line-clamp-2 leading-tight"
                    title={product.title}
                  >
                    {product.title}
                  </h2>

                  {/* Price Section */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <span className="text-base sm:text-lg lg:text-xl font-bold text-teal-700">
                        ${product.price}
                      </span>
                      {product.originalPrice &&
                        product.originalPrice > product.price && (
                          <span className="text-xs sm:text-sm text-gray-500 line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                    </div>

                    {/* Category and Stock - Mobile Optimized */}
                    <div className="space-y-1">
                      <p
                        className="text-xs text-gray-600 truncate"
                        title={product.category}
                      >
                        📂 {product.category}
                      </p>
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-xs ${
                            product.stock > 10
                              ? "text-green-600"
                              : product.stock > 0
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          📦 Stock: {product.stock || 0}
                        </p>
                        {product.rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500 text-xs">★</span>
                            <span className="text-xs text-gray-600">
                              {product.rating}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1 sm:gap-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 flex items-center justify-center bg-teal-700 text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg hover:bg-teal-800 transition-colors"
                    >
                      <Pencil size={16} />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 flex items-center justify-center bg-red-600 text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>

                    {/* Feature Toggle Button */}
                    <button
                      onClick={() => handleFeaturedToggle(product)}
                      className={`flex-1 flex items-center justify-center ${
                        product.isFeatured
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-gray-400 hover:bg-gray-500"
                      } text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg transition-colors`}
                    >
                      <Star
                        size={16}
                        fill={product.isFeatured ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center border border-gray-100">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center">
              <span className="text-3xl sm:text-4xl">📦</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
              No Products Yet
            </h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Start building your inventory by adding your first product.
            </p>
            <button className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Add Your First Product
            </button>
          </div>
        )}

        {/* Enhanced Edit Modal - Mobile Optimized */}
        {editingProduct && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
            <div
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={() => {
                setEditingProduct(null);
                setFormData({});
              }}
            />

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden relative">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl sm:rounded-t-2xl z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-teal-700">
                    Edit Product
                  </h2>
                  <button
                    className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl font-bold p-1"
                    onClick={() => {
                      setEditingProduct(null);
                      setFormData({});
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(95vh-60px)] sm:max-h-[calc(90vh-80px)]">
                <form
                  onSubmit={handleEdit}
                  className="p-4 sm:p-6 space-y-4 sm:space-y-6"
                >
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Title *
                    </label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      required
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm sm:text-base"
                      placeholder="Enter product title"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none text-sm sm:text-base"
                      placeholder="Enter product description"
                    />
                  </div>

                  {/* Price Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Current Price * ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        value={formData.price}
                        onChange={handleFormChange}
                        required
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm sm:text-base"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Original Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleFormChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm sm:text-base"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Stock and Discount Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleFormChange}
                        required
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm sm:text-base"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Discount (Auto-calculated)
                      </label>
                      <div className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-600 text-sm sm:text-base">
                        {formData.discount || 0}%
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      required
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm sm:text-base"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Summary */}
                  {formData.originalPrice && formData.price && (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 sm:p-4">
                      <h3 className="font-semibold text-teal-800 mb-2 text-sm sm:text-base">
                        Price Summary
                      </h3>
                      <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <span className="text-gray-600">Original Price:</span>
                          <span className="ml-1 sm:ml-2 font-semibold">
                            ${formData.originalPrice}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Current Price:</span>
                          <span className="ml-1 sm:ml-2 font-semibold text-teal-700">
                            ${formData.price}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">You Save:</span>
                          <span className="ml-1 sm:ml-2 font-semibold text-green-600">
                            $
                            {(
                              parseFloat(formData.originalPrice || 0) -
                              parseFloat(formData.price || 0)
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Discount:</span>
                          <span className="ml-1 sm:ml-2 font-semibold text-red-600">
                            {formData.discount || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setFormData({});
                      }}
                      className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-teal-700 text-white py-3 rounded-lg hover:bg-teal-800 transition-colors font-medium text-sm sm:text-base"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
