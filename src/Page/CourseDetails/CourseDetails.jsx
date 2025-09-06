import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import { useParams } from "react-router";

function CourseDetails() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'content'

  const { courseId } = useParams();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/courses/${courseId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch course");
        }
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleVideoSelect = (index) => {
    setCurrentVideoIndex(index);
    setIsPlaying(true);
    setShowPlaylist(false); // Close playlist on mobile after selection
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
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg"
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
          className="w-full rounded-lg"
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
      <div className="w-full h-48 sm:h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 text-sm">Video format not supported</p>
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
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mt-12">
        <DownNav />
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="mx-4 mt-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {course && (
        <div className="pb-4 max-w-[1220px] mx-auto">
          {/* Mobile Video Player - Full width */}
          <div className="bg-white shadow-sm">
            <div className="p-3 sm:p-4">
              {course.videos && course.videos.length > 0 ? (
                renderVideo(course.videos[currentVideoIndex])
              ) : (
                <div className="w-full h-48 sm:h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 text-sm">No videos available</p>
                </div>
              )}
            </div>
          </div>

          {/* Current Video Info */}
          {course.videos && course.videos[currentVideoIndex] && (
            <div className="bg-white px-4 py-3 border-b">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-tight">
                {course.videos[currentVideoIndex].videoTitle}
              </h1>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {course.videos[currentVideoIndex].videoDescription}
              </p>
              <div className="flex items-center justify-between">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  Duration: {formatDuration(course.videos[currentVideoIndex].videoDuration)}
                </span>
                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className="md:hidden bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm font-medium transition-colors"
                >
                  {showPlaylist ? 'Hide' : 'Show'} Playlist ({course.videos?.length || 0})
                </button>
              </div>
            </div>
          )}

          {/* Mobile Navigation Tabs */}
          <div className="bg-white border-b md:hidden">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'content'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                Content ({course.videos?.length || 0})
              </button>
            </div>
          </div>

          {/* Mobile Playlist Overlay */}
          {showPlaylist && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[70vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold">Course Content</h3>
                  <button
                    onClick={() => setShowPlaylist(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="overflow-y-auto">
                  {course.videos?.map((video, index) => (
                    <div
                      key={index}
                      className={`p-4 border-b cursor-pointer transition-colors active:bg-gray-100 ${currentVideoIndex === index ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                        }`}
                      onClick={() => handleVideoSelect(index)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentVideoIndex === index
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                            }`}>
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-medium ${currentVideoIndex === index ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                            {video.videoTitle}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {video.videoDescription}
                          </p>
                          <span className="text-xs text-gray-500 mt-1 block">
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

          {/* Content Area */}
          <div className="md:max-w-7xl md:mx-auto md:p-4 md:grid md:grid-cols-3 md:gap-8">
            {/* Mobile Content */}
            <div className="md:hidden mb-10">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Course Description */}
                  <div className="bg-white p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Course</h3>
                    <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                      {course.description}
                    </p>
                  </div>

                  {/* Instructor Info */}
                  <div className="bg-white p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Instructor</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-gray-900">{course.instructorName}</p>
                      <p className="text-sm text-gray-500">{course.instructorEmail}</p>
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="bg-white p-4 ">
                    <h4 className="font-semibold text-gray-900 mb-3">Course Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Category:</span>
                        <span className="text-gray-900 font-medium">{course.categories}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Level:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                          {course.level}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Videos:</span>
                        <span className="text-gray-900 font-medium">{course.videos?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="bg-white">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
                    <p className="text-sm text-gray-500">
                      {course.videos?.length || 0} videos
                    </p>
                  </div>
                  <div>
                    {course.videos?.map((video, index) => (
                      <div
                        key={index}
                        className={`p-4 border-b cursor-pointer transition-colors active:bg-gray-100 ${currentVideoIndex === index ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                          }`}
                        onClick={() => handleVideoSelect(index)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentVideoIndex === index
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                              }`}>
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-medium ${currentVideoIndex === index ? 'text-blue-900' : 'text-gray-900'
                              }`}>
                              {video.videoTitle}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {video.videoDescription}
                            </p>
                            <span className="text-xs text-gray-500 mt-1 block">
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
            <div className="hidden md:block md:col-span-2 ">
              {/* Course Description */}
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Course</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {course.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Instructor</h4>
                    <p className="text-gray-600">{course.instructorName}</p>
                    <p className="text-sm text-gray-500">{course.instructorEmail}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Course Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="text-gray-900">{course.categories}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Level:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                          {course.level}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Videos:</span>
                        <span className="text-gray-900">{course.videos?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:block md:col-span-1">
              {/* Video Playlist */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-4">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
                  <p className="text-sm text-gray-500">
                    {course.videos?.length || 0} videos
                  </p>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {course.videos?.map((video, index) => (
                    <div
                      key={index}
                      className={`p-4 border-b cursor-pointer transition-colors hover:bg-gray-50 ${currentVideoIndex === index ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                        }`}
                      onClick={() => handleVideoSelect(index)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentVideoIndex === index
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                            }`}>
                            {index + 1}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-medium line-clamp-2 ${currentVideoIndex === index ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                            {video.videoTitle}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {video.videoDescription}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className="text-xs text-gray-500">
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
      )}
    </div>
  );
}

export default CourseDetails;