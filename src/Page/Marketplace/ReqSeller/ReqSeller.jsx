import React, { useState } from "react";
import {
  Store,
  Building,
  Globe,
  MapPin,
  CreditCard,
  Phone,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import MNavbar from "../MComponent/MNavbar";
import { MFooter } from "../MComponent/MFooter";
import useUser from "../../../Hooks/useUser";
import toast from "react-hot-toast";
import usePublicAxios from "../../../Hooks/usePublicAxios";

const ReqSeller = () => {
  const { user } = useUser();
  const axiosPublic = usePublicAxios();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    businessAddress: "",
    websiteUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    tradeLicense: "",
    bankAccountNumber: "",
    bankName: "",
    mobilePaymentNumber: "",
    mobilePaymentProvider: "bKash",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const businessTypes = [
    "Electronics",
    "Fashion & Clothing",
    "Grocery & Food",
    "Home & Kitchen",
    "Health & Beauty",
    "Sports & Outdoor",
    "Books & Education",
    "Automotive",
    "Toys & Games",
    "Jewelry & Accessories",
    "Other",
  ];

  const mobilePaymentProviders = ["bKash", "Nagad", "Rocket"];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }

    if (!formData.businessType) {
      newErrors.businessType = "Business type is required";
    }

    if (!formData.businessAddress.trim()) {
      newErrors.businessAddress = "Business address is required";
    }

    if (formData.websiteUrl && !isValidUrl(formData.websiteUrl)) {
      newErrors.websiteUrl = "Please enter a valid URL";
    }

    if (formData.facebookUrl && !isValidUrl(formData.facebookUrl)) {
      newErrors.facebookUrl = "Please enter a valid Facebook URL";
    }

    if (formData.instagramUrl && !isValidUrl(formData.instagramUrl)) {
      newErrors.instagramUrl = "Please enter a valid Instagram URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // ফর্ম ভ্যালিডেশন
  if (!validateForm()) {
    toast.error("Please fill all required fields.");
    return;
  }

  // seller data বানানো
  const sellerData = {
    ...formData,
    userInfo: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.number || "",
      profileImage: user?.profileImage || "",
    },
  };

  try {
    setIsSubmitting(true); // লোডিং স্টেট শুরু

    const response = await axiosPublic.post(
      "/market-seller-request",
      { sellerData },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response?.status === 201) {
      toast.success("Seller request submitted successfully!");
      setFormData({}); // ফর্ম রিসেট
    } else {
      toast.error(response?.data?.message || "Something went wrong!");
    }

  } catch (error) {
    console.error("Seller request error:", error);
    toast.error(
      error.response?.data?.error || "Failed to submit seller request"
    );
  } finally {
    setIsSubmitting(false); // লোডিং স্টেট শেষ
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      <MNavbar />

      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Store className="w-8 h-8 text-teal-700" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Request to Become Seller
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join our marketplace and start selling your products to thousands
              of customers
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Business Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-2 h-8 bg-teal-700 rounded-full"></div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Business Information
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Business Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Business / Company Name{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                      errors.businessName
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Enter your business or company name"
                  />
                </div>
                {errors.businessName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.businessName}
                  </p>
                )}
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Business Type / Category{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                    errors.businessType
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <option value="">Select business type</option>
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.businessType && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.businessType}
                  </p>
                )}
              </div>

              {/* Business Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Business Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                      errors.businessAddress
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Enter your business address"
                  />
                </div>
                {errors.businessAddress && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.businessAddress}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Online Presence */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-2 h-8 bg-teal-700 rounded-full"></div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Online Presence
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Optional
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Website URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Website URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                      errors.websiteUrl
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                {errors.websiteUrl && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.websiteUrl}
                  </p>
                )}
              </div>

              {/* Facebook URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Facebook Page
                </label>
                <input
                  type="url"
                  name="facebookUrl"
                  value={formData.facebookUrl}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                    errors.facebookUrl
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="https://facebook.com/yourpage"
                />
                {errors.facebookUrl && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.facebookUrl}
                  </p>
                )}
              </div>

              {/* Instagram URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Instagram Page
                </label>
                <input
                  type="url"
                  name="instagramUrl"
                  value={formData.instagramUrl}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
                    errors.instagramUrl
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="https://instagram.com/yourpage"
                />
                {errors.instagramUrl && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.instagramUrl}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Legal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-2 h-8 bg-teal-700 rounded-full"></div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Legal Information
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Optional
              </span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Trade License / NID / Tax ID
              </label>
              <input
                type="text"
                name="tradeLicense"
                value={formData.tradeLicense}
                onChange={handleInputChange}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                placeholder="Enter your trade license, NID, or tax ID number"
              />
            </div>
          </div>

          {/* Banking Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-2 h-8 bg-teal-700 rounded-full"></div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Banking Information
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Optional
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Bank Account Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Bank Account Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    placeholder="Enter account number"
                  />
                </div>
              </div>

              {/* Bank Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  placeholder="Enter bank name"
                />
              </div>

              {/* Mobile Payment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Mobile Payment Provider
                </label>
                <select
                  name="mobilePaymentProvider"
                  value={formData.mobilePaymentProvider}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                >
                  {mobilePaymentProviders.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Payment Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Mobile Payment Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="mobilePaymentNumber"
                    value={formData.mobilePaymentNumber}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl hover:border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    placeholder="Enter mobile payment number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center px-12 py-4 bg-teal-700 text-white font-semibold rounded-xl hover:bg-teal-800 focus:ring-4 focus:ring-teal-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  Submitting Request...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-3" />
                  Submit Seller Request
                </>
              )}
            </button>
            <p className="text-gray-600 mt-4">
              We'll review your request and get back to you within 2-3 business
              days
            </p>
          </div>
        </div>
      </div>

      <MFooter />
    </div>
  );
};

export default ReqSeller;
