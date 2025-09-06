import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Add useNavigate
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  RotateCcw,
  Shield,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  User,
} from "lucide-react";
import MNavbar from "../MComponent/MNavbar";
import { MFooter } from "../MComponent/MFooter";
import usePublicAxios from "../../../Hooks/usePublicAxios";
import toast from "react-hot-toast";
import useCart from "../Hooks/useCart";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate(); // Add navigate hook
  const axiosPublic = usePublicAxios();
  const token = localStorage.getItem("token");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [getProduct, setGetProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosPublic.get(`/get-product/${productId}`);
        setGetProduct(res.data.product);
      } catch (error) {
        console.log(error);
        setError("Failed to fetch product");
        toast.error("Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, axiosPublic]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MNavbar />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Loading Product...
            </h2>
          </div>
        </div>
        <MFooter />
      </div>
    );
  }

  // Error state
  if (error || !getProduct) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MNavbar />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Product Not Found
            </h2>
            <p className="text-gray-600">
              The product you're looking for doesn't exist.
            </p>
          </div>
        </div>
        <MFooter />
      </div>
    );
  }

  const renderStars = (rating, size = "w-4 h-4") => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < Math.floor(rating)
            ? "text-teal-500 fill-current"
            : i < rating
            ? "text-teal-500 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const handleAddToCart = (product) => {
    addToCart(product, quantity); // Use selected quantity instead of hardcoded 1
  };

  // NEW: Handle Buy Now functionality
  const handleBuyNow = () => {
    if (!getProduct.stock || getProduct.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }

    if (quantity > getProduct.stock) {
      toast.error("Selected quantity exceeds available stock");
      return;
    }

    // Create buy now item with selected quantity
    const buyNowItem = {
      ...getProduct,
      quantity: quantity,
      buyNowMode: true // Flag to identify this as a buy now purchase
    };

    // Navigate to buy now page with product data in state
    navigate('/cart-checkout', {
      state: {
        buyNowItem: buyNowItem,
        source: 'product-details'
      }
    });
  };

  const handleImageNavigation = (direction) => {
    if (!getProduct.images || getProduct.images.length <= 1) return;
    
    if (direction === "prev") {
      setSelectedImage((prev) =>
        prev === 0 ? getProduct.images.length - 1 : prev - 1
      );
    } else {
      setSelectedImage((prev) =>
        prev === getProduct.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const relatedProducts = [
    {
      id: 1,
      title: "Wireless Gaming Headset",
      price: 1800,
      originalPrice: 2200,
      image:
        "https://images.unsplash.com/photo-1599669454699-248893623440?w=300&h=300&fit=crop",
      rating: 4.6,
    },
    {
      id: 2,
      title: "Smart Watch Series 7",
      price: 4500,
      originalPrice: 5500,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
      rating: 4.7,
    },
    {
      id: 3,
      title: "Portable Bluetooth Speaker",
      price: 1200,
      originalPrice: 1600,
      image:
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop",
      rating: 4.4,
    },
    {
      id: 4,
      title: "USB-C Fast Charger",
      price: 800,
      originalPrice: 1000,
      image:
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&h=300&fit=crop",
      rating: 4.3,
    },
  ];

  const sampleReviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      rating: 5,
      date: "Jan 20, 2024",
      comment:
        "Amazing sound quality! The noise cancellation works perfectly and they're super comfortable for long listening sessions.",
    },
    {
      id: 2,
      name: "Mike Chen",
      rating: 4,
      date: "Jan 18, 2024",
      comment:
        "Great value for money. Battery life is impressive and the touch controls are responsive.",
    },
    {
      id: 3,
      name: "Emily Davis",
      rating: 5,
      date: "Jan 15, 2024",
      comment:
        "Perfect for workouts! IPX5 rating really works. Sound is crisp and clear.",
    },
  ];
  
  return (
    <div className="min-h-screen mt-16 bg-gray-50">
      <MNavbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-12">
          {/* Product Images Gallery */}
          <div className="space-y-3 lg:space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-lg lg:rounded-2xl overflow-hidden shadow-sm group">
              <img
                src={getProduct.images?.[selectedImage] || '/placeholder-image.jpg'}
                alt={getProduct.title || 'Product'}
                className="w-full h-full object-cover"
              />

              {/* Navigation Arrows - Hidden on mobile */}
              {getProduct.images && getProduct.images.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageNavigation("prev")}
                    className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 items-center justify-center"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleImageNavigation("next")}
                    className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 items-center justify-center"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {getProduct.images && getProduct.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 lg:gap-3">
                {getProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-md lg:rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index
                        ? "border-teal-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${getProduct.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-4 lg:space-y-6">
            {/* Category & Title */}
            <div>
              <p className="text-xs sm:text-sm text-teal-700 font-medium mb-1 lg:mb-2">
                {getProduct.category || 'Category'}
              </p>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                {getProduct.title || 'Product Title'}
              </h1>
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center flex-wrap gap-2 sm:gap-4">
              <div className="flex items-center space-x-1">
                {renderStars(getProduct.rating || 0)}
                <span className="text-sm font-medium text-gray-700 ml-1">
                  {getProduct.rating || 0}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>•</span>
                <span>{getProduct.reviews || 0} reviews</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">
                  {getProduct.reviewerIds?.length || 0} customers
                </span>
              </div>
            </div>

            {/* Price & Discount */}
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-gray-900">
                ৳{getProduct.price?.toLocaleString() || '0'}
              </span>

              {getProduct.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ৳{getProduct.originalPrice.toLocaleString()}
                </span>
              )}

              {getProduct.discount && (
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                  {getProduct.discount}% OFF
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {(getProduct.stock || 0) > 0 ? (
                <>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm sm:text-base text-green-600 font-medium">
                    In Stock ({getProduct.stock} available)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm sm:text-base text-red-600 font-medium">
                    Out of Stock
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2 lg:space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Description
              </h3>
              <div className="text-sm sm:text-base text-gray-600 leading-relaxed">
                <p>
                  {showFullDescription
                    ? (getProduct.description || 'No description available')
                    : `${(getProduct.description || 'No description available').substring(0, 180)}...`}
                </p>
                {getProduct.description && getProduct.description.length > 180 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-teal-700 hover:text-teal-800 font-medium mt-2 inline-block text-sm"
                  >
                    {showFullDescription ? "Show Less" : "Read More"}
                  </button>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <span className="text-sm sm:text-base text-gray-700 font-medium">
                Qty:
              </span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 sm:p-3 hover:bg-gray-50 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                </button>
                <span className="px-3 sm:px-4 py-2 sm:py-3 font-medium text-gray-900 min-w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(getProduct.stock || 0, quantity + 1))
                  }
                  className="p-2 sm:p-3 hover:bg-gray-50 transition-colors"
                  disabled={quantity >= (getProduct.stock || 0)}
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <button
                onClick={() => handleAddToCart(getProduct)}
                className="flex-1 bg-teal-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-semibold hover:bg-teal-800 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                disabled={!getProduct.stock || getProduct.stock === 0}
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleBuyNow} // Updated: Use new handleBuyNow function
                className="flex-1 bg-gray-900 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm sm:text-base"
                disabled={!getProduct.stock || getProduct.stock === 0}
              >
                Buy Now
              </button>
            </div>

            {/* Service Info - Compact on mobile */}
            <div className="grid grid-cols-2 gap-3 pt-4 sm:pt-6 border-t border-gray-200">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Free Delivery
                  </p>
                  <p className="text-xs text-gray-600">2-5 days</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 sm:space-x-3">
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Easy Returns
                  </p>
                  <p className="text-xs text-gray-600">7 days</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 sm:space-x-3">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Cash on Delivery
                  </p>
                  <p className="text-xs text-gray-600">Available</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 sm:space-x-3">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Vendor1
                  </p>
                  <p className="text-xs text-gray-600">Rating: 4.5/5</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white rounded-lg lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm mb-8 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Customer Reviews
            </h2>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center space-x-2">
                {renderStars(getProduct.rating || 0, "w-4 h-4 sm:w-5 sm:h-5")}
                <span className="text-base sm:text-lg font-semibold">
                  {getProduct.rating || 0}
                </span>
              </div>
              <span className="text-sm sm:text-base text-gray-600">
                ({getProduct.reviewerIds?.length || 0} reviews)
              </span>
            </div>
          </div>

          {/* Review Cards */}
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 lg:gap-6">
            {sampleReviews.map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-lg p-4 sm:p-5">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="flex items-center space-x-1">
                    {renderStars(review.rating, "w-3 h-3 sm:w-4 sm:h-4")}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {review.date}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                  {review.name}
                </h4>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8">
            Related Products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {relatedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base leading-tight">
                    {product.title}
                  </h3>
                  <div className="flex items-center space-x-1 mb-2">
                    {renderStars(product.rating, "w-3 h-3 sm:w-4 sm:h-4")}
                    <span className="text-xs sm:text-sm text-gray-600">
                      ({product.rating})
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                    <span className="font-bold text-gray-900 text-sm sm:text-base">
                      ৳{product.price.toLocaleString()}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 line-through">
                      ৳{product.originalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MFooter />
    </div>
  );
};

export default ProductDetails;