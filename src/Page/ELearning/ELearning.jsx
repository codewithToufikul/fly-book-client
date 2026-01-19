import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import { Link } from "react-router";
import { ChevronDown, Menu, X, Clock, Globe, DollarSign, User, Star, Search, Filter, SlidersHorizontal, Tag } from "lucide-react";

function ELearning() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [error, setError] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('All');

  // Navigation data
  const navItems = [
    {
      id: 'class',
      title: 'Class 1-12',
      items: [
        'Free School',
        'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6',
        'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
      ]
    },
    {
      id: 'university',
      title: 'University Level',
      items: [
        'Computer Science', 'Engineering', 'Economics', 'Education', 'Law',
        'Health Studies', 'Sciences', 'Financial Accounting', 'Architecture',
        'Social Science', 'Art', 'Humanities', 'Design', 'Journalism', 'Medicine'
      ]
    },
    {
      id: 'expert',
      title: 'Expert Courses',
      items: [
        'Artificial Intelligence', 'Technology', 'Medical', 'Career Development',
        'Engineering', 'Languages', 'Humanities', 'Soft Skills', 'Kitchen and Cooking'
      ]
    },
    {
      id: 'other',
      title: 'Other',
      items: [
        'Quiz', 'Admission', 'Religion', 'Competition', 'Upload Your Courses', 'Job'
      ]
    }
  ];

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://fly-book-server-lzu4.onrender.com/api/courses');
        const data = await res.json();
        setCourses(data);
        setFilteredCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // FIXED: Filter courses based on selected filters with exact category matching
  useEffect(() => {
    let filtered = [...courses];

    // Category filter - EXACT MATCH ONLY
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(course => {
        const courseCategory = course.categories?.trim() || '';
        
        // Exact match for specific category selection
        return courseCategory.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    // Level filter
    if (selectedLevel !== 'All') {
      filtered = filtered.filter(course =>
        course.level?.toLowerCase() === selectedLevel.toLowerCase()
      );
    }

    // Price filter
    if (priceFilter === 'Free') {
      filtered = filtered.filter(course => course.isFree === true);
    } else if (priceFilter === 'Paid') {
      filtered = filtered.filter(course => course.isFree === false);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.categories?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  }, [courses, selectedCategory, selectedLevel, priceFilter, searchTerm]);

  // Get all unique categories from courses (not from navItems)
  const getUniqueCategories = () => {
    const categories = ['All'];
    const uniqueCategories = new Set();
    
    courses.forEach(course => {
      if (course.categories && course.categories.trim()) {
        uniqueCategories.add(course.categories.trim());
      }
    });
    
    return [...categories, ...Array.from(uniqueCategories).sort()];
  };

  // Get unique levels from courses
  const getUniqueLevels = () => {
    const levels = courses.map(course => course.level).filter(Boolean);
    return ['All', ...new Set(levels)];
  };

  const handleDropdownToggle = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setActiveDropdown(null);
  };

  const toggleMobileFilters = () => {
    setMobileFiltersOpen(!mobileFiltersOpen);
  };

  // Calculate total video duration for a course
  const getTotalDuration = (videos) => {
    if (!videos || videos.length === 0) return 0;
    return videos.reduce((total, video) => total + parseInt(video.videoDuration || 0), 0);
  };

  // Format duration in minutes
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Handle category selection from navigation
  const handleNavCategoryClick = (navItem, item = null) => {
    if (item) {
      setSelectedCategory(item);
    } else {
      setSelectedCategory(navItem.title);
    }
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.mobile-menu-container') && !event.target.closest('.dropdown-button')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close mobile menu when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
        setMobileFiltersOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* E-Learning Navigation */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center justify-between py-3">
            <h2 className="text-white font-semibold text-lg">Courses</h2>
            <button
              onClick={toggleMobileMenu}
              className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mobile-menu-container bg-white rounded-t-xl shadow-2xl absolute left-0 right-0 top-full mx-4 max-h-96 overflow-y-auto z-50">
              {navItems.map((navItem) => (
                <div key={navItem.id} className="border-b border-gray-100 last:border-b-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDropdownToggle(navItem.id);
                    }}
                    className="dropdown-button w-full flex items-center justify-between p-4 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    <span>{navItem.title}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === navItem.id ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {activeDropdown === navItem.id && (
                    <div className="bg-gray-50 px-4 pb-4">
                      <div className="grid grid-cols-2 gap-2">
                        {navItem.items.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleNavCategoryClick(navItem, item)}
                            className="block p-3 text-sm text-gray-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors text-left"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center py-4">
            <div className="flex space-x-1 lg:space-x-8">
              {navItems.map((navItem) => (
                <div key={navItem.id} className="relative group">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDropdownToggle(navItem.id);
                    }}
                    className="dropdown-button text-xs flex items-center md:space-x-1 lg:space-x-2 text-white hover:text-blue-200 font-medium py-2 md:px-2 lg:px-4 rounded-lg transition-all duration-200 hover:bg-white/10 md:text-sm lg:text-base"
                  >
                    <span className="whitespace-nowrap">{navItem.title}</span>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${activeDropdown === navItem.id ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {activeDropdown === navItem.id && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="max-h-80 overflow-y-auto">
                        {navItem.items.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleNavCategoryClick(navItem, item)}
                            className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 text-sm font-medium"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center py-6 sm:py-8 lg:py-12">
          <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            Transform Your Future with
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block sm:inline"> E-Learning</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed px-4">
            Discover world-class courses from expert instructors and boost your skills with our comprehensive learning platform
          </p>
        </div>

        {/* Active Filter Display */}
        {selectedCategory !== 'All' && (
          <div className="mb-4 px-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Filtered by:</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="ml-2 hover:text-blue-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            </div>
          </div>
        )}

        {/* Mobile Search Bar */}
        <div className="md:hidden mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
            <button
              onClick={toggleMobileFilters}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        {mobileFiltersOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden "
              onClick={toggleMobileFilters}
            ></div>

            {/* Filters Drawer */}
            <div className="fixed bottom-10 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 md:hidden transform transition-transform duration-300 translate-y-0">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={toggleMobileFilters}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-base"
                  >
                    {getUniqueCategories().map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-base"
                  >
                    {getUniqueLevels().map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-base"
                  >
                    <option value="All">All Prices</option>
                    <option value="Free">Free</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                {/* Apply/Clear Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedLevel('All');
                      setPriceFilter('All');
                      setMobileFiltersOpen(false);
                    }}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={toggleMobileFilters}
                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Desktop Search and Filter Section */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 w-full lg:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses, instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Level Filter */}
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {getUniqueLevels().map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>

              {/* Price Filter */}
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="All">All Prices</option>
                <option value="Free">Free</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </div>

        {/* Mobile Results Count */}
        <div className="md:hidden mb-4 px-1">
          <p className="text-sm text-gray-600">
            {filteredCourses.length} courses found
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-12 sm:py-16">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading amazing courses...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8 px-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 sm:px-6 py-4 rounded-xl inline-block shadow-sm">
              <strong>Oops!</strong> {error}
            </div>
          </div>
        )}

        {/* No Courses Found */}
        {!loading && !error && filteredCourses.length === 0 && (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="bg-gray-50 rounded-xl p-6 sm:p-8 max-w-md mx-auto">
              <Filter className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">Try adjusting your filters or search terms</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedLevel('All');
                  setPriceFilter('All');
                  setSearchTerm('');
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-8 sm:pb-12">
            {filteredCourses.map((course) => (
              <Link
                key={course._id}
                to={`/course-details/${course._id}`}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Course Thumbnail */}
                <div className="w-full h-40 sm:h-48 relative overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback to gradient background if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}

                  {/* Fallback gradient background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 ${course.thumbnail ? 'hidden' : 'flex'} items-center justify-center`}
                  >
                    <div className="text-white text-center p-3 sm:p-4">
                      <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2">{course.title}</h3>
                      <p className="text-xs sm:text-sm opacity-90 line-clamp-2">{course.categories}</p>
                    </div>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-3 left-3">
                    {course.isFree ? (
                      <span className="bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                        Free
                      </span>
                    ) : (
                      <span className="bg-blue-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                        ${course.price}
                      </span>
                    )}
                  </div>

                  {/* Level Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                      {course.level}
                    </span>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-4 sm:p-6">
                  {/* Course Category Badge - NEW */}
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <Tag className="w-3 h-3 mr-1" />
                      {course.categories}
                    </span>
                  </div>

                  <div className="mb-3 sm:mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 mb-2 sm:mb-3">
                      {course.description}
                    </p>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center mb-3 sm:mb-4">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-2" />
                    <span className="text-xs sm:text-sm text-gray-600 truncate">{course.instructorName}</span>
                  </div>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span>{formatDuration(getTotalDuration(course.videos))}</span>
                    </div>
                    <div className="flex items-center">
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span>{course.videos?.length || 0} lessons</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border-t border-gray-200 mt-12">
        <DownNav />
      </div>
    </div>
  );
}

export default ELearning;