import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  Plus,
  Heart,
  Share2,
  BookOpen,
  TrendingUp,
  Search,
  Filter,
  Upload,
  X,
  Image,
} from "lucide-react";
import Navbar from "../../../Components/Navbar/Navbar";
import DownNav from "../../../Components/DownNav/DownNav";
import { useNavigate } from "react-router";
import usePublicAxios from "../../../Hooks/usePublicAxios";
import toast from "react-hot-toast";

const CommunitiesHome = () => {
  const [favorites, setFavorites] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const token = localStorage.getItem("token");
  const axiosPublic = usePublicAxios();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiCommunities, setApiCommunities] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "tech",
    logo: null,
    coverImage: null,
  });
  const [logoPreview, setLogoPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [isUploading, setIsUploading] = useState({ logo: false, cover: false });

  // Static fallback for design preview
  const staticCommunities = [
    {
      id: 1,
      name: "Tech Innovators",
      description:
        "Building the future with cutting-edge technology and innovative solutions.",
      logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=80&h=80&fit=crop&crop=center",
      coverImage:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=160&fit=crop&crop=center",
      memberCount: 12500,
      category: "tech",
      isVerified: true,
      trending: true,
    },
    {
      id: 2,
      name: "Creative Studio",
      description:
        "Where art meets imagination. Share your creative journey with fellow artists.",
      logo: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=80&h=80&fit=crop&crop=center",
      coverImage:
        "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=160&fit=crop&crop=center",
      memberCount: 8900,
      category: "creative",
      isVerified: false,
      trending: false,
    },
    {
      id: 3,
      name: "Startup Hub",
      description:
        "Connect with entrepreneurs and build the next unicorn together.",
      logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=center",
      coverImage:
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=160&fit=crop&crop=center",
      memberCount: 15200,
      category: "business",
      isVerified: true,
      trending: true,
    },
    {
      id: 4,
      name: "Mindful Living",
      description:
        "Embrace sustainability and mindful practices for a better tomorrow.",
      logo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=center",
      coverImage:
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=160&fit=crop&crop=center",
      memberCount: 6750,
      category: "lifestyle",
      isVerified: false,
      trending: false,
    },
    {
      id: 5,
      name: "Learning Labs",
      description:
        "Continuous learning and skill development in the digital age.",
      logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=center",
      coverImage:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=160&fit=crop&crop=center",
      memberCount: 18300,
      category: "education",
      isVerified: true,
      trending: false,
    },
    {
      id: 6,
      name: "Future Builders",
      description:
        "Young innovators shaping tomorrow's world through collaboration.",
      logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=80&h=80&fit=crop&crop=center",
      coverImage:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=160&fit=crop&crop=center",
      memberCount: 4200,
      category: "tech",
      isVerified: false,
      trending: true,
    },
  ];

  const categories = [
    { id: "all", name: "All", icon: Filter },
    { id: "tech", name: "Tech", icon: TrendingUp },
    { id: "creative", name: "Creative", icon: Heart },
    { id: "business", name: "Business", icon: BookOpen },
    { id: "lifestyle", name: "Lifestyle", icon: Users },
    { id: "education", name: "Education", icon: BookOpen },
  ];

  const formatMemberCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const handleShare = (community) => {
    if (navigator.share) {
      navigator.share({
        title: community.name,
        text: community.description,
        url: window.location.href,
      });
    }
  };

  // Image upload function using ImgBB API
  const uploadToImgBB = async (file, imageType) => {
    const apiKey = import.meta.env.VITE_IMAGE_HOSTING_KEY;

    setIsUploading((prev) => ({ ...prev, [imageType]: true }));

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("key", apiKey);

      const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const imageUrl = data.data.url;

        setFormData((prev) => ({
          ...prev,
          [imageType === "logo" ? "logo" : "coverImage"]: imageUrl,
        }));

        if (imageType === "logo") {
          setLogoPreview(imageUrl);
        } else {
          setCoverPreview(imageUrl);
        }

        return imageUrl;
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
      return null;
    } finally {
      setIsUploading((prev) => ({ ...prev, [imageType]: false }));
    }
  };

  const handleImageUpload = (event, imageType) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (imageType === "logo") {
        setLogoPreview(e.target.result);
      } else {
        setCoverPreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);

    // Upload to ImgBB
    uploadToImgBB(file, imageType);
  };

  const removeImage = (imageType) => {
    if (imageType === "logo") {
      setLogoPreview("");
      setFormData((prev) => ({ ...prev, logo: null }));
    } else {
      setCoverPreview("");
      setFormData((prev) => ({ ...prev, coverImage: null }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetModal = () => {
    setFormData({
      name: "",
      description: "",
      category: "tech",
      logo: null,
      coverImage: null,
    });
    setLogoPreview("");
    setCoverPreview("");
    setIsUploading({ logo: false, cover: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const communityData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      logo: formData.logo,
      coverImage: formData.coverImage,
      timestamp: new Date().toISOString(),
    };
    try {
      await axiosPublic.post(
        "/community-create",
        {communityData},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.log(error.message);
      toast.error("Failed to create Commu");
    }
    setShowCreateModal(false);
    resetModal();
  };

  // Load from API
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axiosPublic.get("/communities", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (active && res.data?.success) {
          setApiCommunities(res.data.data || []);
        }
        if (token) {
          try {
            const mine = await axiosPublic.get("/my-communities", {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (active && mine.data?.success) {
              setMyCommunities(mine.data.data || []);
            }
          } catch {}
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const communities = useMemo(() => {
    if (apiCommunities.length) {
      // Filter to show only verified communities
      const verifiedCommunities = apiCommunities.filter((c) => c.isVerified === true);
      return verifiedCommunities.map((c) => ({
        id: c._id,
        name: c.name,
        description: c.description,
        logo: c.logo,
        coverImage: c.coverImage,
        memberCount: c.membersCount || 0,
        category: c.category || "general",
        isVerified: !!c.isVerified,
        trending: false,
      }));
    }
    return staticCommunities;
  }, [apiCommunities]);

  const filteredCommunities = communities.filter((community) => {
    const matchesSearch =
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                  Communities
                </h1>
                <p className="text-gray-600">
                  Discover and join amazing communities
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium"
              >
                <Plus size={20} />
                Create Community
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* My Communities */}
          {token && myCommunities.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">My Communities</h2>
                <button
                  onClick={() => navigate("/community-create")}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Create new
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myCommunities.map((c) => (
                  <div key={c._id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                    {c.coverImage && (
                      <div className="h-24 overflow-hidden">
                        <img src={c.coverImage} alt={c.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4 flex items-start gap-3">
                      {c.logo && <img src={c.logo} alt={c.name} className="w-10 h-10 rounded-full object-cover" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium truncate">{c.name}</div>
                          {c.isVerified && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Verified</span>}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-2">{c.description}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-xs text-gray-500">Members: {c.membersCount || 0}</div>
                          <button
                            onClick={() => navigate(`/community/${c._id}`)}
                            className="px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs"
                          >
                            Visit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <category.icon size={16} />
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Communities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <div
                key={community.id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 group"
              >
                {/* Cover Image */}
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={community.coverImage}
                    alt={community.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {community.trending && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <TrendingUp size={12} />
                      Trending
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => toggleFavorite(community.id)}
                      className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                        favorites.has(community.id)
                          ? "bg-red-500 text-white"
                          : "bg-white/80 text-gray-600 hover:bg-white"
                      }`}
                    >
                      <Heart
                        size={16}
                        fill={
                          favorites.has(community.id) ? "currentColor" : "none"
                        }
                      />
                    </button>
                    <button
                      onClick={() => handleShare(community)}
                      className="p-2 rounded-full bg-white/80 text-gray-600 hover:bg-white backdrop-blur-sm transition-colors"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Logo and Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={community.logo}
                      alt={community.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {community.name}
                        </h3>
                        {community.isVerified && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {community.description}
                      </p>
                    </div>
                  </div>

                  {/* Member Count */}
                  <div className="flex items-center text-gray-500 mb-6">
                    <Users size={16} className="mr-2" />
                    <span className="text-sm">
                      {formatMemberCount(community.memberCount)} members
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/community/${community.id}`)}
                      className="flex-1 bg-gray-900 text-white py-2.5 px-4 rounded-full hover:bg-gray-800 transition-colors font-medium text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/community/${community.id}`)}
                      className="flex-1 border border-gray-200 text-gray-700 py-2.5 px-4 rounded-full hover:border-gray-300 hover:bg-gray-50 transition-colors font-medium text-sm"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(filteredCommunities.length === 0 || loading) && (
            <div className="text-center py-12">
              {loading ? (
                <p className="text-gray-500 text-lg">Loading communities...</p>
              ) : (
                <p className="text-gray-500 text-lg">
                  No communities found matching your criteria.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Create Community Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Create New Community
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetModal();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Cover Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Cover Image
                    </label>
                    <div className="relative">
                      {coverPreview ? (
                        <div className="relative w-full h-40 rounded-lg overflow-hidden">
                          <img
                            src={coverPreview}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage("cover")}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                          {isUploading.cover && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "cover")}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isUploading.cover}
                          />
                          {isUploading.cover ? (
                            <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <Image size={32} className="text-gray-400 mb-2" />
                              <p className="text-sm text-gray-600 text-center">
                                Click to upload cover image
                                <br />
                                <span className="text-xs text-gray-500">
                                  (Max 5MB, 16:9 ratio recommended)
                                </span>
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Community Logo
                    </label>
                    <div className="relative">
                      {logoPreview ? (
                        <div className="relative w-24 h-24 mx-auto">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage("logo")}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X size={14} />
                          </button>
                          {isUploading.logo && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-24 h-24 mx-auto border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center hover:border-gray-400 transition-colors relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "logo")}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                            disabled={isUploading.logo}
                          />
                          {isUploading.logo ? (
                            <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <Upload
                                size={20}
                                className="text-gray-400 mb-1"
                              />
                              <p className="text-xs text-gray-600 text-center px-2">
                                Upload Logo
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Community Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Community Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Enter community name"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                      placeholder="Describe your community"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    >
                      <option value="tech">Technology</option>
                      <option value="creative">Creative</option>
                      <option value="business">Business</option>
                      <option value="lifestyle">Lifestyle</option>
                      <option value="education">Education</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        resetModal();
                      }}
                      className="flex-1 border border-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading.logo || isUploading.cover}
                      className="flex-1 bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading.logo || isUploading.cover
                        ? "Uploading..."
                        : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      <DownNav />
    </div>
  );
};

export default CommunitiesHome;
