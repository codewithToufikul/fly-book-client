import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Store,
  UserCheck,
  Package,
  Tag,
  ShoppingCart,
  CreditCard,
  ArrowRightLeft,
  FileText,
  Settings,
  Bell,
  ChevronRight,
} from "lucide-react";
import { PiFlagBannerBold } from "react-icons/pi";

const MarketAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: "/market-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/market-dashboard/sellers", label: "Sellers", icon: Store },
    { path: "/market-dashboard/seller-requests", label: "Seller Requests", icon: UserCheck },
    { path: "/market-dashboard/products", label: "Products", icon: Package },
    { path: "/market-dashboard/product-categories", label: "Categories", icon: Tag },
    { path: "/market-dashboard/orders", label: "Orders", icon: ShoppingCart },
    { path: "/market-dashboard/payments", label: "Payments", icon: CreditCard },
    { path: "/market-dashboard/banner-manage", label: "Home Banner", icon: PiFlagBannerBold },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed z-30 inset-y-0 left-0 w-72 bg-white shadow-2xl transform 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        transition-transform duration-300 ease-in-out 
        md:translate-x-0 md:static md:inset-0 md:shadow-lg border-r border-gray-200`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-teal-700 to-teal-600">
          <div className="text-white">
            <h2 className="text-xl font-bold">Market Admin</h2>
            <p className="text-teal-100 text-sm">Control Panel</p>
          </div>
          <button
            className="md:hidden text-white hover:text-teal-200 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `w-full group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-teal-700 text-white shadow-lg shadow-teal-700/25 transform scale-[1.02]"
                      : "text-gray-700 hover:bg-teal-50 hover:text-teal-700 hover:translate-x-1"
                  }`
                }
              >
                <IconComponent
                  className="w-5 h-5 mr-3 transition-colors group-hover:text-teal-600"
                />
                <span className="font-medium flex-1 text-left">{item.label}</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:text-teal-600 transition-all duration-200" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <button className="relative p-2 text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MarketAdmin;
