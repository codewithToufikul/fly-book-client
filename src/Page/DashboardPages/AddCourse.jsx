import React, { useState } from "react";
import {
  Upload,
  Video,
  Youtube,
  X,
  Plus,
  Book,
  User,
  Mail,
  Tag,
  DollarSign,
  Clock,
  FileText,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

function AddCourse() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructorName: "",
    instructorEmail: "",
    categories: "",
    thumbnail: null,
    price: "",
    isFree: false,
    level: "Beginner",
    videos: [
      {
        videoTitle: "",
        videoType: "youtube",
        videoUrl: "",
        videoFile: null,
        videoDuration: "",
        videoDescription: "",
        uploadStatus: "idle", // idle, uploading, success, error
        uploadProgress: 0,
      },
    ],
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file" && name === "thumbnail") {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setThumbnailPreview(reader.result);
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleVideoChange = (index, e) => {
    const { name, value, type, checked, files } = e.target;
    const updatedVideos = [...formData.videos];
    if (type === "file") {
      updatedVideos[index][name] = files[0];
      updatedVideos[index].uploadStatus = "idle";
      updatedVideos[index].uploadProgress = 0;
    } else {
      updatedVideos[index][name] = type === "checkbox" ? checked : value;
    }
    setFormData({ ...formData, videos: updatedVideos });
  };

  const addVideoField = () => {
    setFormData({
      ...formData,
      videos: [
        ...formData.videos,
        {
          videoTitle: "",
          videoType: "youtube",
          videoUrl: "",
          videoFile: null,
          videoDuration: "",
          videoDescription: "",
          uploadStatus: "idle",
          uploadProgress: 0,
        },
      ],
    });
  };

  const removeVideoField = (index) => {
    const updatedVideos = formData.videos.filter((_, i) => i !== index);
    setFormData({ ...formData, videos: updatedVideos });
  };

  const uploadVideoWithProgress = async (video, index) => {
    if (video.videoType !== "cloudinary" || !video.videoFile) return video;

    const updatedVideos = [...formData.videos];
    updatedVideos[index].uploadStatus = "uploading";
    setFormData({ ...formData, videos: updatedVideos });

    try {
      const vData = new FormData();
      vData.append("file", video.videoFile);
      vData.append("upload_preset", "flybook");

      // Simulate progress for demonstration
      const progressInterval = setInterval(() => {
        const currentVideos = [...formData.videos];
        if (currentVideos[index].uploadProgress < 90) {
          currentVideos[index].uploadProgress += 10;
          setFormData((prev) => ({ ...prev, videos: currentVideos }));
        }
      }, 200);

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dljmobi4k/video/upload",
        {
          method: "POST",
          body: vData,
        }
      );

      clearInterval(progressInterval);
      const result = await res.json();

      const finalVideos = [...formData.videos];
      finalVideos[index].uploadStatus = "success";
      finalVideos[index].uploadProgress = 100;
      setFormData((prev) => ({ ...prev, videos: finalVideos }));

      return {
        ...video,
        videoUrl: result.secure_url,
        uploadStatus: "success",
      };
    } catch (error) {
      const errorVideos = [...formData.videos];
      errorVideos[index].uploadStatus = "error";
      setFormData((prev) => ({ ...prev, videos: errorVideos }));
      throw error;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const dataToSubmit = { ...formData };

    try {
      // Upload thumbnail
      if (formData.thumbnail) {
        const thumbData = new FormData();
        thumbData.append("file", formData.thumbnail);
        thumbData.append("upload_preset", "flybook");

        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dljmobi4k/image/upload",
          {
            method: "POST",
            body: thumbData,
          }
        );
        const result = await res.json();
        dataToSubmit.thumbnail = result.secure_url;
      }
      // Upload videos with progress
      const updatedVideos = await Promise.all(
        formData.videos.map((video, index) =>
          uploadVideoWithProgress(video, index)
        )
      );

      dataToSubmit.videos = updatedVideos;
      dataToSubmit.videos.forEach((v) => {
        delete v.videoFile;
        delete v.uploadStatus;
        delete v.uploadProgress;
      });

      const response = await fetch("https://api.flybook.com.bd/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) throw new Error("Failed to save course");
      const result = await response.json();
      toast.success("Course created successfully!");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong while saving the course");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUploadStatusIcon = (status) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
            <Book className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Create New Course
          </h1>
          <p className="text-gray-600 text-lg">
            Share your knowledge with the world
          </p>
        </div>

        <div className="space-y-8">
          {/* Course Information Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Book className="w-5 h-5" />
                Course Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Course Title */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-4" />
                  Course Title
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter an engaging course title..."
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Course Description */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FileText className="w-4 h-4" />
                  Course Description
                </label>
                <textarea
                  name="description"
                  placeholder="Describe what students will learn in this course..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                />
              </div>

              {/* Instructor Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="w-4 h-4" />
                    Instructor Name
                  </label>
                  <input
                    type="text"
                    name="instructorName"
                    placeholder="Your full name"
                    value={formData.instructorName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Mail className="w-4 h-4" />
                    Instructor Email
                  </label>
                  <input
                    type="email"
                    name="instructorEmail"
                    placeholder="your.email@example.com"
                    value={formData.instructorEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Tag className="w-4 h-4" />
                  Category
                </label>
                <select
                  name="categories"
                  value={formData.categories}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                >
                  <option value="">-- Select Category --</option>

                  <optgroup label="Free School">
                    <option value="Free School">Free School</option>
                    <option value="Class 1">Class 1</option>
                    <option value="Class 2">Class 2</option>
                    <option value="Class 3">Class 3</option>
                    <option value="Class 4">Class 4</option>
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </optgroup>

                  <optgroup label="University & Higher Education">
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Economics">Economics</option>
                    <option value="Education">Education</option>
                    <option value="Law">Law</option>
                    <option value="Health Studies">Health Studies</option>
                    <option value="Sciences">Sciences</option>
                    <option value="Financial Accounting">
                      Financial Accounting
                    </option>
                    <option value="Architecture">Architecture</option>
                    <option value="Social Science">Social Science</option>
                    <option value="Art">Art</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Design">Design</option>
                    <option value="Journalism">Journalism</option>
                    <option value="Medicine">Medicine</option>
                  </optgroup>

                  <optgroup label="Skill & Career">
                    <option value="Artificial Intelligence">
                      Artificial Intelligence
                    </option>
                    <option value="Technology">Technology</option>
                    <option value="Medical">Medical</option>
                    <option value="Career Development">
                      Career Development
                    </option>
                    <option value="Languages">Languages</option>
                    <option value="Soft Skills">Soft Skills</option>
                    <option value="Kitchen and Cooking">
                      Kitchen and Cooking
                    </option>
                  </optgroup>

                  <optgroup label="General & Others">
                    <option value="Quiz">Quiz</option>
                    <option value="Admission">Admission</option>
                    <option value="Religion">Religion</option>
                    <option value="Competition">Competition</option>
                    <option value="Upload Your Courses">
                      Upload Your Courses
                    </option>
                    <option value="Job">Job</option>
                  </optgroup>
                </select>
              </div>

              {/* Thumbnail Upload */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Camera className="w-4 h-4" />
                  Course Thumbnail
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      name="thumbnail"
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                  {thumbnailPreview && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Videos Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Video className="w-5 h-5" />
                Course Videos
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {formData.videos.map((video, index) => (
                <div
                  key={index}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-white hover:border-indigo-300 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                      <Video className="w-5 h-5 text-indigo-500" />
                      Video {index + 1}
                    </h3>
                    {formData.videos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVideoField(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Video Title */}
                    <input
                      type="text"
                      name="videoTitle"
                      placeholder="Video title..."
                      value={video.videoTitle}
                      onChange={(e) => handleVideoChange(index, e)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />

                    {/* Video Type and Upload */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Video Source
                        </label>
                        <select
                          name="videoType"
                          value={video.videoType}
                          onChange={(e) => handleVideoChange(index, e)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="cloudinary">Upload Video</option>
                          <option value="youtube">YouTube Link</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          {video.videoType === "cloudinary"
                            ? "Video File"
                            : "YouTube URL"}
                        </label>
                        {video.videoType === "cloudinary" ? (
                          <div className="relative">
                            <input
                              type="file"
                              name="videoFile"
                              accept="video/*"
                              onChange={(e) => handleVideoChange(index, e)}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            />
                            {video.uploadStatus !== "idle" && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                {getUploadStatusIcon(video.uploadStatus)}
                                {video.uploadStatus === "uploading" && (
                                  <span className="text-sm text-blue-600">
                                    {video.uploadProgress}%
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="relative">
                            <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                            <input
                              type="text"
                              name="videoUrl"
                              placeholder="https://youtube.com/embed/..."
                              value={video.videoUrl}
                              onChange={(e) => handleVideoChange(index, e)}
                              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Upload Progress Bar */}
                    {video.uploadStatus === "uploading" && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${video.uploadProgress}%` }}
                        ></div>
                      </div>
                    )}

                    {/* Duration and Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="videoDuration"
                          placeholder="Duration (e.g., 10:30)"
                          value={video.videoDuration}
                          onChange={(e) => handleVideoChange(index, e)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <textarea
                        name="videoDescription"
                        placeholder="Video description..."
                        value={video.videoDescription}
                        onChange={(e) => handleVideoChange(index, e)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                        rows={1}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addVideoField}
                className="w-full py-4 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Another Video
              </button>
            </div>
          </div>

          {/* Pricing and Settings */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing & Settings
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <DollarSign className="w-4 h-4" />
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                    disabled={formData.isFree}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Course Level
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="flex items-center justify-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFree"
                      checked={formData.isFree}
                      onChange={handleChange}
                      className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Free Course
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-300 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Course...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Create Course
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddCourse;
