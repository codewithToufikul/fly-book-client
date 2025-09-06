import React, { useState } from "react";
import { Search, ShoppingCart, User, Menu } from "lucide-react";
import logo from "../../../assets/flymarketlogo.png";
import { NavLink, useNavigate } from "react-router-dom";
import useCart from "../Hooks/useCart";

const MNavbar = ({ sidebarOpen, setSidebarOpen }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { cartItems, isLoading } = useCart();

  if (isLoading) {
    return <p>Loading</p>;
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/product-search?q=${encodeURIComponent(query)}`);
  };
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden mr-3 p-2 rounded-md text-gray-600 hover:text-teal-700"
            >
              <Menu size={20} />
            </button>

            {/* SVG Logo */}
            <svg
              width="180"
              height="40"
              viewBox="0 0 180 40"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Paper plane icon with shopping bag element */}
              <g transform="translate(8, 8)">
                {/* Paper plane body */}
                <path
                  d="M2 12 L18 6 L12 20 L8 16 L2 12 Z"
                  fill="#0f766e"
                  stroke="none"
                />
                {/* Paper plane wing */}
                <path
                  d="M8 16 L12 12 L18 6 L16 8 L8 16 Z"
                  fill="#14b8a6"
                  stroke="none"
                />
                {/* Small shopping bag handle integrated into the design */}
                <circle
                  cx="16"
                  cy="8"
                  r="1.5"
                  fill="none"
                  stroke="#0f766e"
                  strokeWidth="1"
                />
                <path
                  d="M14.5 8.5 Q16 7 17.5 8.5"
                  fill="none"
                  stroke="#0f766e"
                  strokeWidth="1"
                />
              </g>

              {/* Wordmark: FlyMarket */}
              <g transform="translate(40, 8)">
                {/* Fly */}
                <text
                  x="0"
                  y="18"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontSize="20"
                  fontWeight="700"
                  fill="#0f766e"
                >
                  Fly
                </text>
                {/* Market */}
                <text
                  x="38"
                  y="18"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontSize="20"
                  fontWeight="700"
                  fill="#0f766e"
                >
                  Market
                </text>
              </g>

              {/* Subtle upward motion lines for "flying" effect */}
              <g transform="translate(28, 12)" opacity="0.3">
                <path
                  d="M0 8 Q2 6 4 8"
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <path
                  d="M0 12 Q2 10 4 12"
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </g>
            </svg>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1.5 bg-teal-700 text-white px-4 py-1 rounded-md hover:bg-teal-800 transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Right Menu */}
          <div className="flex items-center space-x-4">
            <NavLink
              to={"/market-user"}
              className={({ isActive }) =>
                `flex items-center text-2xl space-x-1 transition-colors ${
                  isActive
                    ? "text-teal-700"
                    : "text-gray-600 hover:text-teal-700"
                }`
              }
            >
              <User size={32} />
              <span className="hidden text-lg sm:inline">User</span>
            </NavLink>

            <NavLink
              to={"/cart"}
              className={({ isActive }) =>
                `relative flex items-center space-x-1 transition-colors ${
                  isActive
                    ? "text-teal-700"
                    : "text-gray-600 hover:text-teal-700"
                }`
              }
            >
              <ShoppingCart size={30} />
              <span className="hidden sm:inline">Cart</span>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MNavbar;
