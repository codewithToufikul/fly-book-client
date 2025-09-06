import MNavbar from "../MComponent/MNavbar";
import { MFooter } from "../MComponent/MFooter";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import toast from "react-hot-toast";
import usePublicAxios from "../../../Hooks/usePublicAxios";
import { Heart, ShoppingCart, Star } from "lucide-react";
import useCart from "../Hooks/useCart";

const CategoryProduct = () => {
  const { categoryId } = useParams();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const axiosPublic = usePublicAxios();
  const [products, setProducts] = useState([]);
  const [hoveredProduct, setHoveredProduct] = useState(null);
    const { addToCart } = useCart();

  // fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosPublic.get("/get-product-categories");
      setCategories(res.data.categories);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  // fetch initial category by ID
  const fetchCategory = async () => {
    setLoading(true);
    try {
      const res = await axiosPublic.get(`/get-category/${categoryId}`);
      setCategory(res.data.category);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load category");
    } finally {
      setLoading(false);
    }
  };

  // fetch products by category name
  const fetchCategoryProducts = async (categoryName) => {
    try {
      const res = await axiosPublic.get(
        `/get-product-category?category=${categoryName}`
      );
      setProducts(res.data.products);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch products");
    }
  };

  // initial fetch
  useEffect(() => {
    fetchCategories();
    fetchCategory();
  }, []);

  // when category changes, fetch its products
  useEffect(() => {
    if (category?.name) {
      fetchCategoryProducts(category.name);
    }
  }, [category]);

  // handle category click
  const handleSelectCategory = (cat) => {
    setCategory(cat);
    fetchCategoryProducts(cat.name);
  };

    const handleAddToCart = (product) => {
    // product + quantity send করো, default 1
    addToCart(product, 1); 
    // Success/Error toast handled automatically inside hook
  };

  // handle wishlist toggle
  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  };

  // render star rating
  const renderStars = (rating, reviews) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star
            key={i}
            className="w-4 h-4 fill-yellow-400/50 text-yellow-400"
          />
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-gray-200 text-gray-200" />
        );
      }
    }

    return (
      <div className="flex items-center gap-1">
        <div className="flex">{stars}</div>
        <span className="text-sm text-gray-500 ml-1">({reviews})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-teal-700 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MNavbar />

      {/* Category Navigation */}
      <div className="sticky top-20 z-40 bg-white shadow-sm border-b mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex overflow-x-auto scrollbar-hide space-x-1">
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleSelectCategory(cat)}
                className={`flex-shrink-0 px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  category?.name === cat.name
                    ? "bg-teal-700 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Title */}
        {category && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {category.name}
            </h1>
            <p className="text-gray-600">
              {products.length} product{products.length !== 1 ? "s" : ""} found
            </p>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              onMouseEnter={() => setHoveredProduct(product._id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* Product Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                  src={
                    product.image ||
                    product.images?.[0] ||
                    "https://via.placeholder.com/300x225?text=No+Image"
                  }
                  alt={product.title || product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Discount Badge */}
                {product.discount && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    -{product.discount}%
                  </div>
                )}

                {/* Hover Overlay with Add to Cart */}
                <div
                  className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
                    hoveredProduct === product._id ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <button onClick={() => handleAddToCart(product)} className="bg-teal-700 text-white px-6 py-2 rounded-full font-medium hover:bg-teal-800 transition-colors duration-200 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <Link
                to={`/product-details/${product._id}`}
                className="block p-4 space-y-3"
              >
                {/* Category Tag */}
                <span className="inline-block bg-teal-50 text-teal-700 text-xs font-medium px-3 py-1 rounded-full">
                  {product.category || category?.name}
                </span>

                {/* Product Title */}
                <h3 className="font-medium text-gray-900 line-clamp-2 leading-tight">
                  {product.title || product.name}
                </h3>

                {/* Rating */}
                {(product.rating || product.reviews) && (
                  <div className="flex items-center">
                    {renderStars(product.rating || 4.5, product.reviews || 0)}
                  </div>
                )}

                {/* Price Section */}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    ৳{product.currentPrice || product.price || "0.00"}
                  </span>
                  {product.originalPrice &&
                    product.originalPrice !== product.currentPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ৳{product.originalPrice}
                      </span>
                    )}
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {category
                ? `No products available in ${category.name} category.`
                : "Select a category to view products."}
            </p>
          </div>
        )}
      </div>

      <MFooter />
    </div>
  );
};

export default CategoryProduct;
