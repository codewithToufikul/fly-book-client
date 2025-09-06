import React from "react";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from "lucide-react";

export const MFooter = () => (
  <footer className="bg-gray-900 text-gray-400 mt-10">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Brand Section */}
          <div>
            <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              MarketPlace
            </h3>
            <p className="text-sm leading-relaxed">
              Trusted online marketplace for quality products.
            </p>

            {/* Social Links */}
            <div className="flex space-x-3 mt-4">
              <a className="w-8 h-8 bg-gray-800 hover:bg-teal-600 rounded-full flex items-center justify-center transition">
                <Facebook size={14} />
              </a>
              <a className="w-8 h-8 bg-gray-800 hover:bg-teal-600 rounded-full flex items-center justify-center transition">
                <Twitter size={14} />
              </a>
              <a className="w-8 h-8 bg-gray-800 hover:bg-teal-600 rounded-full flex items-center justify-center transition">
                <Instagram size={14} />
              </a>
              <a className="w-8 h-8 bg-gray-800 hover:bg-teal-600 rounded-full flex items-center justify-center transition">
                <Linkedin size={14} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-teal-400 transition">Help Center</li>
              <li className="hover:text-teal-400 transition">About Us</li>
              <li className="hover:text-teal-400 transition">Privacy Policy</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Contact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Mail size={14} className="text-teal-400" />
                <span>support@marketplace.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={14} className="text-teal-400" />
                <span>+880 1XXX-XXXXXX</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        &copy; 2025 MarketPlace. All rights reserved.
      </div>
    </div>
  </footer>
);
