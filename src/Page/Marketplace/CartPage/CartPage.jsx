import React from "react";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Package } from "lucide-react";
import { toast } from "react-hot-toast";
import useCart from "../Hooks/useCart";
import MNavbar from "../MComponent/MNavbar";
import { MFooter } from "../MComponent/MFooter";
import { Link } from "react-router";

const CartPage = () => {
  const { cartItems, isLoading, updateQuantity, removeFromCart, getTotal } =
    useCart();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
        <MNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your cart...</p>
          </div>
        </div>
        <MFooter />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
        <MNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center px-4">
            <div className="bg-white rounded-full p-6 w-24 h-24 mx-auto mb-6 shadow-lg">
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet</p>
            <Link
              to="/marketplace"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-teal-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
        <MFooter />
      </div>
    );
  }

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
    toast.success("Quantity updated!", {
      style: {
        background: '#10B981',
        color: '#fff',
      },
    });
  };

  const handleRemove = (productId) => {
    removeFromCart(productId);
    toast.success("Product removed from cart!", {
      style: {
        background: '#EF4444',
        color: '#fff',
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
      <MNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Shopping Cart</h1>
              <p className="text-gray-600">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
            </div>
            <Link
              to="/marketplace"
              className="hidden sm:inline-flex items-center px-4 py-2 text-teal-600 border border-teal-600 rounded-lg hover:bg-teal-50 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <div
                key={item._id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Image */}
                  <div className="relative group">
                    <img
                      src={item.images?.[0] || "https://via.placeholder.com/150"}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200"></div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-800 mb-1 truncate">{item.title}</h3>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-2xl font-bold text-teal-600">৳{item.price}</span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Unit Price
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium">
                      Subtotal: <span className="text-gray-800 font-semibold">৳{item.price * item.quantity}</span>
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} className="text-gray-600" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item._id, Number(e.target.value))
                        }
                        className="w-16 text-center py-2 bg-transparent border-0 focus:outline-none font-semibold"
                      />
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors duration-200"
                      >
                        <Plus size={16} className="text-gray-600" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item._id)}
                      className="flex items-center gap-1 px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-teal-600" />
                <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                  <span className="font-semibold text-gray-800">৳{getTotal()}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-gray-800">৳{cartItems.length * 50}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-teal-600">৳{getTotal() + 50}</span>
                  </div>
                </div>
              </div>

              <Link to={'/cart-checkout'} className=" block text-center w-full py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-teal-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl mb-3">
                Proceed to Checkout
              </Link>
              
              <div className="text-center">
                <Link
                  to="/marketplace"
                  className="text-teal-600 hover:text-teal-700 text-sm font-medium hover:underline transition-colors duration-200"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secure Checkout
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MFooter />
      
      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default CartPage;