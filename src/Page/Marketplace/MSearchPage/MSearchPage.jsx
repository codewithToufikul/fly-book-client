import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import usePublicAxios from "../../../Hooks/usePublicAxios";
import MNavbar from "../MComponent/MNavbar";
import { MFooter } from "../MComponent/MFooter";
import { Search, SlidersHorizontal, Star, Heart, ShoppingCart, ArrowUpDown } from "lucide-react";
import useCart from "../Hooks/useCart";

const MSearchPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("q");
  const axiosPublic = usePublicAxios();
const { addToCart } = useCart();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState(new Set());

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const res = await axiosPublic.get(`/search-products?q=${query}`);
        setResults(res.data.products);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, axiosPublic]);

  // Sort products
  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.price || a.currentPrice || 0) - (b.price || b.currentPrice || 0);
      case "price-high":
        return (b.price || b.currentPrice || 0) - (a.price || a.currentPrice || 0);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "newest":
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      default:
        return 0;
    }
  });

    const handleAddToCart = (product) => {
    // product + quantity send করো, default 1
    addToCart(product, 1); 
    // Success/Error toast handled automatically inside hook
  };

  // Handle wishlist toggle
  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  };

  // Render stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-3 h-3 ${i < fullStars ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} 
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-teal-700 border-t-transparent"></div>
        </div>
        <MFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MNavbar />
      
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-6 h-6 text-teal-700" />
            <h1 className="text-2xl font-bold text-gray-900">
              Search Results
            </h1>
          </div>
          
          {query && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-gray-600">
                Showing {sortedResults.length} result{sortedResults.length !== 1 ? 's' : ''} for 
                <span className="font-semibold text-gray-900 ml-1">"{query}"</span>
              </p>
              
              {/* Sort & Filter Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="text-sm font-medium">Filters</span>
                </button>
                
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* No Query State */}
        {!query && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Start your search
            </h3>
            <p className="text-gray-600">
              Enter a keyword to find products you're looking for
            </p>
          </div>
        )}

        {/* No Results State */}
        {query && sortedResults.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any products matching "{query}". Try adjusting your search terms.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Check your spelling</p>
              <p>• Try different keywords</p>
              <p>• Use more general terms</p>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {sortedResults.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {sortedResults.map((product) => (
              <div
                key={product._id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.image || product.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image'}
                    alt={product.title || product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Discount Badge */}
                  {product.discount && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      -{product.discount}%
                    </div>
                  )}

                  {/* Quick Add Button */}
                  <button onClick={() => handleAddToCart(product)} className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-teal-700 text-white px-3 py-1.5 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1 hover:bg-teal-800">
                    <ShoppingCart className="w-3 h-3" />
                    Add
                  </button>
                </div>

                {/* Product Details */}
                <Link to={`/product-details/${product._id}`} className=" block p-3 space-y-2">
                  {/* Category */}
                  {product.category && (
                    <span className="inline-block bg-teal-50 text-teal-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                  )}

                  {/* Title */}
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-tight">
                    {product.title || product.name}
                  </h3>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      {renderStars(product.rating)}
                      <span className="text-xs text-gray-500 ml-1">
                        ({product.reviews || 0})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">
                      ৳{product.currentPrice || product.price || '0.00'}
                    </span>
                    {product.originalPrice && product.originalPrice !== (product.currentPrice || product.price) && (
                      <span className="text-xs text-gray-500 line-through">
                        ৳{product.originalPrice}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <MFooter />
    </div>
  );
};

export default MSearchPage;