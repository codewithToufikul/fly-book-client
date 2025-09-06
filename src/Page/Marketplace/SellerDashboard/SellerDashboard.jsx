import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react"; // for responsive toggle icons

const SellerDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Overview", path: "/seller-dashboard" },
    { name: "Products", path: "/seller-dashboard/products" },
    { name: "Add Product", path: "/seller-dashboard/add-product" },
    { name: "Orders", path: "/seller-dashboard/orders" },
    { name: "Payments", path: "/seller-dashboard/payments" },
    { name: "Profile", path: "/seller-dashboard/profile" },
    { name: "Withdraw", path: "/seller-dashboard/withdraw" },
    { name: "Banner Request", path: "/seller-dashboard/home-banner" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed md:static z-20 bg-white shadow-md w-64 h-full flex flex-col transform transition-transform duration-300 
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h1 className="text-xl font-bold text-teal-700">Seller Panel</h1>
          <button className="md:hidden" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1 p-4">
            {menuItems.map((item, idx) => (
              <li key={idx}>
                <NavLink
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg font-medium transition ${
                      isActive
                        ? "bg-teal-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar for mobile */}
        <div className="md:hidden p-4 shadow bg-white flex items-center justify-between">
          <h2 className="text-lg font-semibold text-teal-700">Seller Dashboard</h2>
          <button onClick={() => setIsOpen(true)}>
            <Menu size={24} />
          </button>
        </div>

        {/* Outlet */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerDashboard;
