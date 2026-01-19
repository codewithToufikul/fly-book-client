import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

// Mock Navbar and DownNav components for demonstration
const Navbar = () => (
  <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 h-16 flex items-center px-4">
    <div className="text-xl font-bold text-blue-600">LearnHub</div>
  </div>
);

const DownNav = () => (
  <div className="h-12 bg-gray-50"></div>
);

function CourseDetails() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEnrolled, setIsEnrolled] = useState(false);

  const { courseId } = useParams();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Mock data for demonstration
        const mockCourse = {
          title: "Complete Web Development Bootcamp",
          description: "Master modern web development with this comprehensive course covering HTML, CSS, JavaScript, React, Node.js, and more. Build real-world projects and launch your career as a full-stack developer.",
          instructorName: "Dr. Sarah Johnson",
          instructorEmail: "sarah.johnson@example.com",
          instructorBio: "10+ years of teaching experience with 50,000+ students worldwide",
          categories: "Web Development",
          level: "Intermediate",
          thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
          rating: 4.8,
          totalStudents: 15234,
          lastUpdated: "January 2025",
          videos: [
            {
              videoTitle: "Introduction to Web Development",
              videoDescription: "Get started with the fundamentals of web development and understand what you'll learn in this course.",
              videoDuration: "12:45",
              videoType: "youtube",
              videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
            },
            {
              videoTitle: "HTML Basics and Structure",
              videoDescription: "Learn the building blocks of the web with HTML5 and semantic markup.",
              videoDuration: "18:30",
              videoType: "youtube",
              videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
            },
            {
              videoTitle: "CSS Styling Fundamentals",
              videoDescription: "Master CSS to create beautiful and responsive designs.",
              videoDuration: "22:15",
              videoType: "youtube",
              videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
            }
          ]
        };
        
        setTimeout(() => {
          setCourse(mockCourse);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleVideoSelect = (index) => {
    setCurrentVideoIndex(index);
    setIsPlaying(true);
    setShowPlaylist(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const extractYouTubeId = (url) => {
    if (typeof url !== 'string') return null;
    const match = url.match(/embed\/([^?]+)/);
    return match ? match[1] : null;
  };

  const renderVideo = (video) => {
    if (!video) return null;

    if (video.videoType === 'youtube') {
      const videoId = extractYouTubeId(video.videoUrl);
      if (videoId) {
        return (
          <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}`}
              title={video.videoTitle}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
    } else if (video.videoType === 'cloudinary') {
      return (
        <video
          className="w-full rounded-lg shadow-xl"
          controls
          autoPlay={isPlaying}
          poster={course?.thumbnail}
        >
          <source src={video.videoUrl} type="video/webm" />
          <source src={video.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-sm">Video format not supported</p>
        </div>
      </div>
    );
  };

  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    return duration;
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'intermediate':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'advanced':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="mt-16"><DownNav /></div>
        <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="mt-16"><DownNav /></div>
        <div className="max-w-2xl mx-auto px-4 mt-12">
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-red-500">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to Load Course</h3>
                <p className="text-gray-600">{error}</p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      <Navbar />
      <div className="mt-16"><DownNav /></div>

      {course && (
        <div className="pb-8">
          {/* Hero Section with Video */}
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 lg:pt-8 lg:pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                {/* Video Player */}
                <div className="lg:col-span-2">
                  <div className="bg-black rounded-none lg:rounded-xl overflow-hidden shadow-2xl">
                    {course.videos && course.videos.length > 0 ? (
                      renderVideo(course.videos[currentVideoIndex])
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <p className="text-gray-400">No videos available</p>
                      </div>
                    )}
                  </div>

                  {/* Current Video Info - Mobile */}
                  {course.videos && course.videos[currentVideoIndex] && (
                    <div className="bg-white lg:bg-transparent px-4 py-4 lg:py-6 lg:px-0">
                      <div className="flex items-start justify-between mb-3">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 lg:text-white leading-tight flex-1">
                          {course.videos[currentVideoIndex].videoTitle}
                        </h1>
                        <button
                          onClick={() => setShowPlaylist(!showPlaylist)}
                          className="lg:hidden ml-3 flex-shrink-0 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                          <span>Playlist</span>
                        </button>
                      </div>
                      <p className="text-gray-600 lg:text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
                        {course.videos[currentVideoIndex].videoDescription}
                      </p>
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDuration(course.videos[currentVideoIndex].videoDuration)}
                        </span>
                        <span className="text-xs text-gray-500 lg:text-gray-400">
                          Video {currentVideoIndex + 1} of {course.videos?.length || 0}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop Sidebar Preview */}
                <div className="hidden lg:block">
                  <div className="bg-white rounded-xl shadow-xl overflow-hidden sticky top-24">
                    <div className="p-5 bg-gradient-to-r from-blue-600 to-blue-700">
                      <h3 className="text-lg font-bold text-white mb-1">Course Content</h3>
                      <p className="text-blue-100 text-sm">
                        {course.videos?.length || 0} video lessons
                      </p>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                      {course.videos?.slice(0, 3).map((video, index) => (
                        <div
                          key={index}
                          className={`p-4 border-b cursor-pointer transition-all duration-200 hover:bg-blue-50 ${
                            currentVideoIndex === index ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                          }`}
                          onClick={() => handleVideoSelect(index)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                                currentVideoIndex === index
                                  ? 'bg-blue-600 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {index + 1}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm font-semibold line-clamp-2 mb-1 ${
                                currentVideoIndex === index ? 'text-blue-900' : 'text-gray-900'
                              }`}>
                                {video.videoTitle}
                              </h4>
                              <span className="text-xs text-gray-500 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatDuration(video.videoDuration)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-gray-50 border-t">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg">
                        View All Lessons
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Tabs */}
          <div className="bg-white border-b sticky top-28 z-30 lg:hidden">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-4 px-4 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`flex-1 py-4 px-4 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === 'content'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>Content</span>
                  <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-bold">
                    {course.videos?.length || 0}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Playlist Overlay */}
          {showPlaylist && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden" onClick={() => setShowPlaylist(false)}>
              <div 
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[75vh] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-blue-600 to-blue-700">
                  <div>
                    <h3 className="text-lg font-bold text-white">Course Content</h3>
                    <p className="text-sm text-blue-100">{course.videos?.length || 0} video lessons</p>
                  </div>
                  <button
                    onClick={() => setShowPlaylist(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="overflow-y-auto max-h-[calc(75vh-80px)]">
                  {course.videos?.map((video, index) => (
                    <div
                      key={index}
                      className={`p-4 border-b cursor-pointer transition-all active:scale-[0.98] ${
                        currentVideoIndex === index ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleVideoSelect(index)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                            currentVideoIndex === index
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-semibold mb-1 ${
                            currentVideoIndex === index ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {video.videoTitle}
                          </h4>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                            {video.videoDescription}
                          </p>
                          <span className="inline-flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDuration(video.videoDuration)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
              {/* Mobile Content */}
              <div className="lg:hidden mb-8">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Course Description */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        About This Course
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-base">
                        {course.description}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {course.rating || '4.8'}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Rating</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {course.totalStudents?.toLocaleString() || '15K'}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Students</div>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 text-center border border-emerald-200">
                        <div className="text-2xl font-bold text-emerald-600 mb-1">
                          {course.videos?.length || 0}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Videos</div>
                      </div>
                    </div>

                    {/* Instructor Info */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Your Instructor
                      </h4>
                      <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {course.instructorName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{course.instructorName}</p>
                            <p className="text-sm text-gray-600">{course.instructorEmail}</p>
                          </div>
                        </div>
                        {course.instructorBio && (
                          <p className="text-sm text-gray-600 mt-2">{course.instructorBio}</p>
                        )}
                      </div>
                    </div>

                    {/* Course Details */}
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Course Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium text-sm">Category</span>
                          <span className="text-gray-900 font-semibold text-sm">{course.categories}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium text-sm">Level</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getLevelColor(course.level)}`}>
                            {course.level}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium text-sm">Total Videos</span>
                          <span className="text-gray-900 font-semibold text-sm">{course.videos?.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600 font-medium text-sm">Last Updated</span>
                          <span className="text-gray-900 font-semibold text-sm">{course.lastUpdated || 'Recently'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Enroll Button */}
                    <div className="sticky bottom-0 bg-white p-4 border-t shadow-lg rounded-t-xl -mx-4">
                      <button 
                        onClick={() => setIsEnrolled(!isEnrolled)}
                        className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                          isEnrolled 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                        }`}
                      >
                        {isEnrolled ? '✓ Enrolled - Continue Learning' : 'Enroll Now'}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'content' && (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    <div className="p-5 bg-gradient-to-r from-blue-600 to-blue-700">
                      <h3 className="text-xl font-bold text-white mb-1">Course Content</h3>
                      <p className="text-sm text-blue-100">
                        {course.videos?.length || 0} video lessons
                      </p>
                    </div>
                    <div>
                      {course.videos?.map((video, index) => (
                        <div
                          key={index}
                          className={`p-4 border-b cursor-pointer transition-all active:scale-[0.98] ${
                            currentVideoIndex === index 
                              ? 'bg-blue-50 border-l-4 border-l-blue-600' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleVideoSelect(index)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                                currentVideoIndex === index
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {index + 1}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm font-semibold mb-1 ${
                                currentVideoIndex === index ? 'text-blue-900' : 'text-gray-900'
                              }`}>
                                {video.videoTitle}
                              </h4>
                              <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                {video.videoDescription}
                              </p>
                              <span className="inline-flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatDuration(video.videoDuration)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:block lg:col-span-2">
                {/* Course Description */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-7 h-7 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    About This Course
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg mb-8">
                    {course.description}
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 text-center border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {course.rating || '4.8'}
                      </div>
                      <div className="text-sm text-gray-700 font-semibold">Course Rating</div>
                      <div className="flex justify-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 text-center border border-purple-200">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {course.totalStudents?.toLocaleString() || '15K'}
                      </div>
                      <div className="text-sm text-gray-700 font-semibold">Students Enrolled</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 text-center border border-emerald-200">
                      <div className="text-3xl font-bold text-emerald-600 mb-2">
                        {course.videos?.length || 0}
                      </div>
                      <div className="text-sm text-gray-700 font-semibold">Video Lessons</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Instructor */}
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Your Instructor
                      </h4>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {course.instructorName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{course.instructorName}</p>
                          <p className="text-sm text-gray-600">{course.instructorEmail}</p>
                        </div>
                      </div>
                      {course.instructorBio && (
                        <p className="text-sm text-gray-600 mt-3">{course.instructorBio}</p>
                      )}
                    </div>

                    {/* Course Details */}
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Course Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600 font-medium">Category</span>
                          <span className="text-gray-900 font-semibold">{course.categories}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600 font-medium">Level</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getLevelColor(course.level)}`}>
                            {course.level}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600 font-medium">Total Videos</span>
                          <span className="text-gray-900 font-semibold">{course.videos?.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600 font-medium">Last Updated</span>
                          <span className="text-gray-900 font-semibold">{course.lastUpdated || 'Recently'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enroll Button */}
                  <div className="mt-8">
                    <button 
                      onClick={() => setIsEnrolled(!isEnrolled)}
                      className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg ${
                        isEnrolled 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                      }`}
                    >
                      {isEnrolled ? '✓ Enrolled - Continue Learning' : 'Enroll in This Course'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop Sidebar - Full Playlist */}
              <div className="hidden lg:block lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-24 border border-gray-100">
                  <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700">
                    <h3 className="text-xl font-bold text-white mb-1">Course Content</h3>
                    <p className="text-sm text-blue-100">
                      {course.videos?.length || 0} video lessons
                    </p>
                  </div>

                  <div className="max-h-[600px] overflow-y-auto">
                    {course.videos?.map((video, index) => (
                      <div
                        key={index}
                        className={`p-4 border-b cursor-pointer transition-all hover:bg-gray-50 ${
                          currentVideoIndex === index ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                        }`}
                        onClick={() => handleVideoSelect(index)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all ${
                              currentVideoIndex === index
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}>
                              {index + 1}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-semibold line-clamp-2 mb-1 ${
                              currentVideoIndex === index ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {video.videoTitle}
                            </h4>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                              {video.videoDescription}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatDuration(video.videoDuration)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetails;