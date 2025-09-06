import React, { useEffect, useState } from 'react';
import {
  Play,
  Plus,
  Trash2,
  Video,
  Upload,
  Youtube,
  Clock,
  User,
  BookOpen,
  DollarSign,
  Edit3,
  ArrowLeft,
  Eye,
  Settings
} from 'lucide-react';

function ManageCourse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [videoForm, setVideoForm] = useState({
    videoTitle: '',
    videoType: 'youtube',
    videoUrl: '',
    videoDuration: '',
    videoDescription: ''
  });
  const [uploadingFile, setUploadingFile] = useState(false);

  // Fetch courses from backend API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/courses');
        const data = await res.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleRemoveCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to remove this course?')) {
      try {
        const res = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setCourses(courses.filter(course => course._id !== courseId));
        } else {
          alert('Failed to remove course');
        }
      } catch (error) {
        console.error('Error removing course:', error);
        alert('Error removing course');
      }
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/api/courses/${selectedCourse._id}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoForm),
      });

      if (res.ok) {
        const updatedCourse = await res.json();
        setCourses(courses.map(course =>
          course._id === selectedCourse._id ? updatedCourse : course
        ));
        setSelectedCourse(updatedCourse);
        setVideoForm({
          videoTitle: '',
          videoType: 'youtube',
          videoUrl: '',
          videoDuration: '',
          videoDescription: ''
        });
        setShowVideoForm(false);
      } else {
        alert('Failed to add video');
      }
    } catch (error) {
      console.error('Error adding video:', error);
      alert('Error adding video');
    }
  };

  const handleRemoveVideo = async (videoIndex) => {
    if (window.confirm('Are you sure you want to remove this video?')) {
      try {
        const res = await fetch(`http://localhost:3000/api/courses/${selectedCourse._id}/videos/${videoIndex}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          const updatedCourse = await res.json();
          setCourses(courses.map(course =>
            course._id === selectedCourse._id ? updatedCourse : course
          ));
          setSelectedCourse(updatedCourse);
        } else {
          alert('Failed to remove video');
        }
      } catch (error) {
        console.error('Error removing video:', error);
        alert('Error removing video');
      }
    }
  };

  const handleFileUpload = async (file) => {
    setUploadingFile(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'flybook'); // this must match the unsigned preset name in Cloudinary

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dljmobi4k/video/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setVideoForm(prev => ({
          ...prev,
          videoUrl: data.secure_url,
          videoType: 'cloudinary',
        }));
      } else {
        const error = await res.json();
        console.error('Cloudinary error:', error);
        alert('Failed to upload video: ' + error.error.message);
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Error uploading video');
    } finally {
      setUploadingFile(false);
    }
  };



  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Video Management View
  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Courses
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{selectedCourse.title}</h1>
                  <p className="text-gray-600">{selectedCourse.videos?.length || 0} videos</p>
                </div>
              </div>
              <button
                onClick={() => setShowVideoForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Video</span>
              </button>
            </div>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedCourse.videos?.map((video, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Video Preview */}
                <div className="relative h-48 bg-gray-900">
                  {video.videoType === 'youtube' && getYouTubeVideoId(video.videoUrl) ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(video.videoUrl)}`}
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  ) : video.videoType === 'upload' ? (
                    <video
                      src={video.videoUrl}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Video className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {/* Video Type Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${video.videoType === 'youtube'
                      ? 'bg-red-500 text-white'
                      : 'bg-green-500 text-white'
                      }`}>
                      {video.videoType === 'youtube' ? (
                        <Youtube className="w-3 h-3 inline mr-1" />
                      ) : (
                        <Upload className="w-3 h-3 inline mr-1" />
                      )}
                      {video.videoType}
                    </span>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                    {video.videoTitle}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {video.videoDescription}
                  </p>

                  {video.videoDuration && (
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <Clock className="w-3 h-3 mr-1" />
                      {video.videoDuration}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => window.open(video.videoUrl, '_blank')}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleRemoveVideo(index)}
                      className="text-red-600 hover:text-red-800 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {(!selectedCourse.videos || selectedCourse.videos.length === 0) && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                <Video className="w-16 h-16 mb-4" />
                <h3 className="text-lg font-medium mb-2">No videos yet</h3>
                <p className="text-center mb-4">Start building your course by adding your first video</p>
                <button
                  onClick={() => setShowVideoForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Video</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Add Video Modal */}
        {showVideoForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Add New Video</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video Title
                  </label>
                  <input
                    type="text"
                    value={videoForm.videoTitle}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, videoTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="youtube"
                        checked={videoForm.videoType === 'youtube'}
                        onChange={(e) => setVideoForm(prev => ({ ...prev, videoType: e.target.value }))}
                        className="mr-2"
                      />
                      <Youtube className="w-4 h-4 mr-1 text-red-500" />
                      YouTube
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="upload"
                        checked={videoForm.videoType === 'upload'}
                        onChange={(e) => setVideoForm(prev => ({ ...prev, videoType: e.target.value }))}
                        className="mr-2"
                      />
                      <Upload className="w-4 h-4 mr-1 text-green-500" />
                      Upload
                    </label>
                  </div>
                </div>

                {videoForm.videoType === 'youtube' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      YouTube URL
                    </label>
                    <input
                      type="url"
                      value={videoForm.videoUrl}
                      onChange={(e) => setVideoForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Video File
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleFileUpload(file);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={uploadingFile}
                    />
                    {uploadingFile && (
                      <p className="text-sm text-blue-600 mt-1">Uploading to Cloudinary...</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (optional)
                  </label>
                  <input
                    type="text"
                    value={videoForm.videoDuration}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, videoDuration: e.target.value }))}
                    placeholder="e.g., 10:30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={videoForm.videoDescription}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, videoDescription: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVideoForm(false);
                      setVideoForm({
                        videoTitle: '',
                        videoType: 'youtube',
                        videoUrl: '',
                        videoDuration: '',
                        videoDescription: ''
                      });
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddVideo}
                    disabled={uploadingFile || !videoForm.videoTitle || !videoForm.videoUrl}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Video
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Course List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Courses</h1>
          <p className="text-gray-600">Manage your courses and their video content</p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No courses found</h3>
            <p className="text-gray-500">Create your first course to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Course Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">{course.title}</h3>
                      <div className="flex items-center space-x-4 text-sm opacity-90">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${course.isFree ? 'bg-green-500' : 'bg-yellow-500'
                          }`}>
                          {course.isFree ? 'Free' : `$${course.price}`}
                        </span>
                        <span className="capitalize">{course.level}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm opacity-90">
                        <Video className="w-4 h-4 mr-1" />
                        {course.videos?.length || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      {course.instructorName}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="w-4 h-4 mr-2" />
                      {course.categories}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Manage Videos</span>
                    </button>
                    <button
                      onClick={() => handleRemoveCourse(course._id)}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Course Stats Footer */}
                <div className="bg-gray-50 px-6 py-3 border-t">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Videos: {course.videos?.length || 0}</span>
                    <span>Updated recently</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageCourse;