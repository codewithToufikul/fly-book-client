import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  ChevronRight,
  Star,
  Heart,
  Eye,
  X,
  Plus,
  Menu,
  ChevronLeft,
  Grid3X3,
} from "lucide-react";
import MNavbar from "../MComponent/MNavbar";
import { MFooter } from "../MComponent/MFooter";
import { Link, useNavigate } from "react-router";
import usePublicAxios from "../../../Hooks/usePublicAxios";
import toast from "react-hot-toast";
import useCart from "../Hooks/useCart";

const MarketplaceHome = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const axiosPublic = usePublicAxios();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  // Consolidated state for better performance
  const [data, setData] = useState({
    products: [],
    categories: [],
    banners: [],
    featuredProducts: [],
    topRatingProducts: [],
    popularCategoryProducts: [],
    latestProducts: [],
    bestDealProducts: [],
  });

  const [loading, setLoading] = useState({
    initial: true,
    banners: false,
    categories: false,
    products: false,
  });

  const { addToCart } = useCart();

  // Optimized data fetching with Promise.allSettled for better performance
  const fetchAllData = useCallback(async () => {
    setLoading((prev) => ({ ...prev, initial: true }));

    try {
      const endpoints = [
        "/get-market-product",
        "/products/featured",
        "/products/top-rated",
        "/products/most-popular-category",
        "/products/latest",
        "/products/high-discounts",
        "/home-banners",
        "/get-product-categories",
      ];

      const promises = endpoints.map((endpoint) =>
        axiosPublic.get(endpoint).catch((error) => ({ error, endpoint }))
      );

      const results = await Promise.allSettled(promises);

      const newData = { ...data };
      const dataKeys = [
        "products",
        "featuredProducts",
        "topRatingProducts",
        "popularCategoryProducts",
        "latestProducts",
        "bestDealProducts",
        "banners",
        "categories",
      ];

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && !result.value.error) {
          const key = dataKeys[index];
          const responseData = result.value.data;

          if (key === "banners") {
            newData[key] = responseData.banners || [];
          } else if (key === "categories") {
            newData[key] = responseData.categories || [];
          } else {
            newData[key] = responseData.products || [];
          }
        } else {
          console.error(
            `Failed to fetch ${endpoints[index]}:`,
            result.reason || result.value.error
          );
          toast.error(`Failed to load ${endpoints[index].split("/").pop()}`);
        }
      });

      setData(newData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load marketplace data");
    } finally {
      setLoading((prev) => ({ ...prev, initial: false }));
    }
  }, [axiosPublic]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleAddToCart = useCallback(
    (product) => {
      addToCart(product, 1);
    },
    [addToCart]
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/product-search?q=${encodeURIComponent(query)}`);
  };

  // Enhanced Mobile-First Hero Banner
  const HeroBanner = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    React.useEffect(() => {
      if (data.banners.length > 0 && isAutoPlaying) {
        const timer = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % data.banners.length);
        }, 4000);
        return () => clearInterval(timer);
      }
    }, [data.banners.length, isAutoPlaying]);

    const nextSlide = useCallback(() => {
      setCurrentSlide((prev) => (prev + 1) % data.banners.length);
    }, [data.banners.length]);

    const prevSlide = useCallback(() => {
      setCurrentSlide(
        (prev) => (prev - 1 + data.banners.length) % data.banners.length
      );
    }, [data.banners.length]);

    if (!data.banners.length) {
      return (
        <div className="h-64 sm:h-80 md:h-[400px] bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl md:rounded-3xl flex items-center justify-center mx-2 sm:mx-0">
          <div className="text-center text-teal-600">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-200 rounded-full animate-pulse mx-auto mb-4"></div>
            <h2 className="text-lg sm:text-2xl font-bold mb-2">
              Loading Banners...
            </h2>
            <p className="text-sm sm:text-base text-teal-500">
              Preparing something amazing for you
            </p>
          </div>
        </div>
      );
    }

    const currentBanner = data.banners[currentSlide];

    return (
      <div
        className="relative h-64 sm:h-80 md:h-[400px] rounded-2xl md:rounded-3xl overflow-hidden group mx-2 sm:mx-0"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Main Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out transform"
          style={{ backgroundImage: `url(${currentBanner.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>

        {/* Mobile-Optimized Content */}
        <div className="relative z-20 flex items-center h-full px-4 sm:px-6 md:px-12">
          <div className="text-white max-w-full sm:max-w-2xl">
            <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4 border border-white/30">
              Special Offer
            </div>
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
              {currentBanner.title}
            </h1>
            <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 opacity-90 leading-relaxed max-w-md line-clamp-2 sm:line-clamp-none">
              {currentBanner.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                to={currentBanner.ctaLink}
                className="inline-flex items-center justify-center bg-white text-gray-900 px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl hover:bg-gray-100 transition-all duration-300 font-bold text-sm sm:text-base md:text-lg transform hover:scale-105 hover:shadow-2xl"
              >
                {currentBanner.ctaText}
                <ChevronRight size={16} className="ml-2 sm:hidden" />
                <ChevronRight size={20} className="ml-2 hidden sm:block" />
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows - Hidden on Mobile */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-6 top-1/2 transform -translate-y-1/2 z-30 w-8 h-8 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft size={16} className="sm:hidden" />
          <ChevronLeft size={24} className="hidden sm:block" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-6 top-1/2 transform -translate-y-1/2 z-30 w-8 h-8 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
        >
          <ChevronRight size={16} className="sm:hidden" />
          <ChevronRight size={24} className="hidden sm:block" />
        </button>

        {/* Mobile-Friendly Slide Indicators */}
        <div className="absolute bottom-3 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3 z-30">
          {data.banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 ${
                currentSlide === index
                  ? "w-6 sm:w-8 h-2 sm:h-3 bg-white rounded-full"
                  : "w-2 sm:w-3 h-2 sm:h-3 bg-white/50 hover:bg-white/75 rounded-full"
              }`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
          <div
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{
              width: isAutoPlaying ? "100%" : "0%",
              animation: isAutoPlaying ? "progress 4s linear infinite" : "none",
            }}
          />
        </div>
      </div>
    );
  };

  // Compact Mobile-First Sidebar - Reduced width for desktop
  const Sidebar = () => (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Reduced width from w-72/w-80 to w-60/w-64 */}
      <div
        className={`
        fixed top-16 bottom-0 left-0 z-40 w-60 sm:w-64 bg-white/90 backdrop-blur-xl border-r border-teal-100 transform 
        ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:bg-white/70 lg:backdrop-blur-xl
        transition-transform duration-300 ease-in-out overflow-y-auto
      `}
      >
        {/* Compact Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-teal-100 lg:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
              <Grid3X3 size={14} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-teal-800">Categories</h2>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-xl hover:bg-teal-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-3 sm:p-4 mt-3">
          <div className="hidden lg:flex items-center space-x-2 mb-4">
            <div className="w-5 h-5 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
              <Grid3X3 size={12} className="text-white" />
            </div>
            <h3 className="text-base font-bold text-teal-800">Categories</h3>
          </div>

          {/* More Compact Categories List */}
          <div className="space-y-1">
            {data.categories.map((category, index) => (
              <Link to={`/category-product/${category._id}`} key={category._id}>
                <div className="group flex items-center justify-between p-2 sm:p-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-teal-100 rounded-xl transition-all duration-300 border border-transparent hover:border-teal-200 hover:shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${
                        index % 6 === 0
                          ? "from-red-400 to-pink-400"
                          : index % 6 === 1
                          ? "from-blue-400 to-cyan-400"
                          : index % 6 === 2
                          ? "from-green-400 to-emerald-400"
                          : index % 6 === 3
                          ? "from-yellow-400 to-orange-400"
                          : index % 6 === 4
                          ? "from-purple-400 to-indigo-400"
                          : "from-teal-400 to-blue-400"
                      }`}
                    />
                    <span className="text-sm font-medium group-hover:text-teal-800 transition-colors truncate">
                      {category.name}
                    </span>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  // Enhanced Mobile-First Product Card
  const ProductCard = React.memo(({ product }) => (
    <div
      className="bg-white rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 group border border-gray-100 hover:border-teal-200 overflow-hidden hover:-translate-y-1"
      onMouseEnter={() => setHoveredProduct(product._id)}
      onMouseLeave={() => setHoveredProduct(null)}
    >
      <div className="relative overflow-hidden">
        <div className="aspect-square overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        </div>

        {/* Enhanced Discount Badge */}
        {product.discount && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold shadow-lg">
            -{product.discount}%
          </div>
        )}

        {/* Heart Icon */}
        <button className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110">
          <Heart
            size={14}
            className="text-gray-600 hover:text-red-500 transition-colors sm:hidden"
          />
          <Heart
            size={16}
            className="text-gray-600 hover:text-red-500 transition-colors hidden sm:block"
          />
        </button>

        {/* Quick Action Overlay - Simplified for Mobile */}
        {hoveredProduct === product._id && (
          <div
            onClick={() => handleAddToCart(product)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center cursor-pointer"
          >
            <button className="bg-white text-gray-900 px-3 py-2 sm:px-6 sm:py-3 rounded-full hover:bg-gray-100 transition-all duration-200 flex items-center space-x-1 sm:space-x-2 font-semibold shadow-2xl hover:scale-105 text-sm sm:text-base">
              <Plus size={14} className="sm:hidden" />
              <Plus size={18} className="hidden sm:block" />
              <span>Add to Cart</span>
            </button>
          </div>
        )}
      </div>

      <Link to={`/product-details/${product._id}`} className="block p-3 sm:p-4">
        {/* Category Tag */}
        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full font-medium">
          {product.category}
        </span>

        {/* Product Title */}
        <h3 className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base font-semibold text-gray-800 line-clamp-2 leading-tight group-hover:text-teal-800 transition-colors">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="mt-2 sm:mt-3 flex items-center space-x-1 sm:space-x-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={`sm:w-3.5 sm:h-3.5 ${
                  i < Math.floor(product.rating || 0)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-medium">
            ({product.reviews || 0})
          </span>
        </div>

        {/* Price Section */}
        <div className="mt-2 sm:mt-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span className="text-sm sm:text-lg md:text-xl font-bold text-gray-900">
              ৳{product.price?.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-xs sm:text-sm text-gray-500 line-through">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  ));

  // Enhanced Product Section without View All for specific sections
  const ProductSection = React.memo(
    ({
      title,
      products,
      showViewAll = true,
      emoji = "",
      gradient = "from-teal-700 to-teal-800",
    }) => {
      if (!products || products.length === 0) return null;

      return (
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 px-2 sm:px-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h2
                className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
              >
                {title}
              </h2>
              {emoji && (
                <span className="text-xl sm:text-2xl md:text-3xl">{emoji}</span>
              )}
            </div>
          </div>

          {/* Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 px-2 sm:px-0">
            {products.slice(0, 10).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      );
    }
  );

  // Beautiful Loading Component
  const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-teal-50">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-teal-200 rounded-full animate-spin mx-auto"></div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-teal-700 mb-2">
            Loading Amazing Products
          </h3>
          <p className="text-sm sm:text-base text-teal-500">
            Preparing something special for you...
          </p>
        </div>
      </div>
    </div>
  );

  // Memoized electronics products
  const electronicsProducts = useMemo(
    () => data.products.filter((p) => p.category === "Electronics"),
    [data.products]
  );

  if (loading.initial) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-16">
      <MNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <div className="flex">
        <Sidebar />

        {/* Main Content - Updated margin for smaller sidebar */}
        <div className="flex-1 lg:ml-64">
          <div className="max-w-full lg:max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
            {/* Hero Section */}
            <div className="mb-8 sm:mb-12">
              <HeroBanner />
            </div>

            {/* Enhanced Search Bar for Mobile */}
            <div className="md:hidden mb-6 sm:mb-10 px-2">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for anything..."
                  className="w-full pl-12 pr-16 py-3 sm:pl-14 sm:pr-20 sm:py-4 border-2 border-teal-200 rounded-2xl sm:rounded-3xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 bg-white shadow-sm text-base sm:text-lg placeholder-gray-500"
                />
                <Search className="absolute left-4 top-3.5 sm:left-5 sm:top-5 h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                <button
                  type="submit"
                  className="absolute right-1 top-1 sm:right-2 sm:top-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold text-sm sm:text-base"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Product Sections - No View All for Flash Deals and Featured */}
            <ProductSection
              title="Flash Deals"
              emoji="⚡"
              products={data.bestDealProducts}
              showViewAll={false}
              gradient="from-teal-700 to-teal-800"
            />

            <ProductSection
              title="Featured Collection"
              emoji="🎯"
              products={data.featuredProducts}
              showViewAll={false}
              gradient="from-teal-600 to-teal-700"
            />

            <ProductSection
              title="New Arrivals"
              emoji="✨"
              products={data.latestProducts}
              showViewAll={true}
              gradient="from-teal-500 to-teal-600"
            />

            <ProductSection
              title="Top Rated"
              emoji="🏆"
              products={data.topRatingProducts}
              showViewAll={true}
              gradient="from-teal-800 to-teal-900"
            />

            <ProductSection
              title="Trending Now"
              emoji="🔥"
              products={data.popularCategoryProducts}
              showViewAll={true}
              gradient="from-teal-700 to-cyan-700"
            />

            {/* Electronics Section */}
            {electronicsProducts.length > 0 && (
              <ProductSection
                title="Electronics Hub"
                emoji="📱"
                products={electronicsProducts}
                showViewAll={true}
                gradient="from-teal-600 to-cyan-600"
              />
            )}
          </div>

          {/* Footer */}
          <MFooter />
        </div>
      </div>
    </div>
  );
};

export default MarketplaceHome;
