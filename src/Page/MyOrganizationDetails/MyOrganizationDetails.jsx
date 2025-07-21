import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { FaPlus, FaImage, FaVideo, FaTimes } from "react-icons/fa";
import usePublicAxios from "../../Hooks/usePublicAxios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const MyOrganizationDetails = () => {
  const { orgId } = useParams();
  const publicAxios = usePublicAxios();
  const [organization, setOrganization] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingSectionOpen, setIsAddingSectionOpen] = useState(false);
  const [isEditingSectionOpen, setIsEditingSectionOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [newSection, setNewSection] = useState({
    title: "",
    details: "",
    image: null,
    video: null,
  });

  useEffect(() => {
    const fetchOrganizationDetails = async () => {
      try {
        const response = await publicAxios.get(
          `/api/v1/organizations/${orgId}`
        );
        setOrganization(response.data.data);
        setSections(response.data.data.sections || []);
      } catch (error) {
        toast.error("Failed to fetch organization details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationDetails();
  }, [orgId]);

  const handleMediaUpload = async (file, type) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "flybook");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/${type}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      toast.error(`Failed to upload ${type}`);
      return null;
    }
  };

  const handleDeleteSection = async (sectionIndex) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this section!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await publicAxios.delete(
          `/organizations/${orgId}/sections/${sectionIndex}`
        );
        const newSections = sections.filter(
          (_, index) => index !== sectionIndex
        );
        setSections(newSections);
        Swal.fire("Deleted!", "Section has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete section.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditSection = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = editingSection.image;
      let videoUrl = editingSection.video;

      if (editingSection.newImage) {
        imageUrl = await handleMediaUpload(editingSection.newImage, "image");
      }

      if (editingSection.newVideo) {
        videoUrl = await handleMediaUpload(editingSection.newVideo, "video");
      }

      const sectionData = {
        title: editingSection.title,
        details: editingSection.details,
        image: imageUrl,
        video: videoUrl,
      };

      await publicAxios.put(
        `/organizations/${orgId}/sections/${editingSection.index}`,
        sectionData
      );

      const newSections = [...sections];
      newSections[editingSection.index] = sectionData;
      setSections(newSections);
      setEditingSection(null);
      setIsEditingSectionOpen(false);
      toast.success("Section updated successfully");
    } catch (error) {
      toast.error("Failed to update section");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;
      let videoUrl = null;

      if (newSection.image) {
        imageUrl = await handleMediaUpload(newSection.image, "image");
      }

      if (newSection.video) {
        videoUrl = await handleMediaUpload(newSection.video, "video");
      }

      const sectionData = {
        title: newSection.title,
        details: newSection.details,
        image: imageUrl,
        video: videoUrl,
      };

      await publicAxios.post(`/organizations/${orgId}/sections`, sectionData);

      setSections([...sections, sectionData]);
      setNewSection({ title: "", details: "", image: null, video: null });
      setIsAddingSectionOpen(false);
      toast.success("Section added successfully");
    } catch (error) {
      toast.error("Failed to add section");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-6">
        {/* Organization Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex justify-end mb-4">
            <Link
                to={`/my-organization/add-organization-activies/${orgId}`}
              className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <FaPlus />Add Activies
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6 space-y-4 sm:space-y-0">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-100">
                {organization?.profileImage ? (
                  <img
                    src={organization.profileImage}
                    alt={organization.orgName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FaImage className="text-4xl" />
                  </div>
                )}

                {/* Edit Section Modal */}
                {isEditingSectionOpen && editingSection && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl mx-4 my-8 sm:my-0">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Edit Section</h2>
                        <button
                          onClick={() => {
                            setIsEditingSectionOpen(false);
                            setEditingSection(null);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <FaTimes className="text-xl" />
                        </button>
                      </div>

                      <form onSubmit={handleEditSection} className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            value={editingSection.title}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                title: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Details
                          </label>
                          <textarea
                            value={editingSection.details}
                            onChange={(e) =>
                              setEditingSection({
                                ...editingSection,
                                details: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px]"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Image (Optional)
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  setEditingSection({
                                    ...editingSection,
                                    newImage: e.target.files[0],
                                  })
                                }
                                className="hidden"
                                id="edit-image-upload"
                              />
                              <label
                                htmlFor="edit-image-upload"
                                className="flex items-center space-x-2 cursor-pointer bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
                              >
                                <FaImage />
                                <span>Choose Image</span>
                              </label>
                              {editingSection.newImage && (
                                <span className="text-sm text-gray-600">
                                  {editingSection.newImage.name}
                                </span>
                              )}
                            </div>
                            {editingSection.image &&
                              !editingSection.newImage && (
                                <div className="mt-2">
                                  <img
                                    src={editingSection.image}
                                    alt="Current image"
                                    className="h-20 w-20 object-cover rounded"
                                  />
                                </div>
                              )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Video (Optional)
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) =>
                                  setEditingSection({
                                    ...editingSection,
                                    newVideo: e.target.files[0],
                                  })
                                }
                                className="hidden"
                                id="edit-video-upload"
                              />
                              <label
                                htmlFor="edit-video-upload"
                                className="flex items-center space-x-2 cursor-pointer bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
                              >
                                <FaVideo />
                                <span>Choose Video</span>
                              </label>
                              {editingSection.newVideo && (
                                <span className="text-sm text-gray-600">
                                  {editingSection.newVideo.name}
                                </span>
                              )}
                            </div>
                            {editingSection.video &&
                              !editingSection.newVideo && (
                                <div className="mt-2">
                                  <video
                                    src={editingSection.video}
                                    className="h-20 w-40 object-cover rounded"
                                    controls
                                  />
                                </div>
                              )}
                          </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingSectionOpen(false);
                              setEditingSection(null);
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            disabled={loading}
                          >
                            {loading ? "Updating..." : "Update Section"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
              <label
                htmlFor="profile-picture-upload"
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              >
                <FaImage className="text-2xl" />
              </label>
              <input
                type="file"
                id="profile-picture-upload"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setLoading(true);
                    try {
                      const imageUrl = await handleMediaUpload(file, "image");
                      if (imageUrl) {
                        await publicAxios.patch(`/organizations/${orgId}`, {
                          profilePicture: imageUrl,
                        });
                        setOrganization((prev) => ({
                          ...prev,
                          profilePicture: imageUrl,
                        }));
                        toast.success("Profile picture updated successfully");
                      }
                    } catch (error) {
                      toast.error("Failed to update profile picture");
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
                className="hidden"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {organization?.orgName}
              </h1>
              <p className="text-gray-600">{organization?.description}</p>
            </div>
          </div>
        </div>
                <div>
                  <Link to={`/my-organization/${orgId}/activities`}>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      View Your Activities
                    </button>
                  </Link>

                </div>
        {/* Sections */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 space-y-4 relative"
            >
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => {
                    setEditingSection({ ...section, index });
                    setIsEditingSectionOpen(true);
                  }}
                  className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteSection(index)}
                  className="p-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {section.title}
              </h2>
              <p className="text-gray-600 whitespace-pre-wrap">
                {section.details}
              </p>

              {section.image && (
                <div className="mt-4">
                  <img
                    src={section.image}
                    alt={section.title}
                    className="rounded-lg max-h-96 w-full object-cover"
                  />
                </div>
              )}

              {/* Edit Section Modal */}
              {isEditingSectionOpen && editingSection && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                  <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl mx-4 my-8 sm:my-0">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Edit Section</h2>
                      <button
                        onClick={() => {
                          setIsEditingSectionOpen(false);
                          setEditingSection(null);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FaTimes className="text-xl" />
                      </button>
                    </div>

                    <form onSubmit={handleEditSection} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editingSection.title}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              title: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Details
                        </label>
                        <textarea
                          value={editingSection.details}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              details: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px]"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image (Optional)
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setEditingSection({
                                  ...editingSection,
                                  newImage: e.target.files[0],
                                })
                              }
                              className="hidden"
                              id="edit-image-upload"
                            />
                            <label
                              htmlFor="edit-image-upload"
                              className="flex items-center space-x-2 cursor-pointer bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
                            >
                              <FaImage />
                              <span>Choose Image</span>
                            </label>
                            {editingSection.newImage && (
                              <span className="text-sm text-gray-600">
                                {editingSection.newImage.name}
                              </span>
                            )}
                          </div>
                          {editingSection.image && !editingSection.newImage && (
                            <div className="mt-2">
                              <img
                                src={editingSection.image}
                                alt="Current image"
                                className="h-20 w-20 object-cover rounded"
                              />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Video (Optional)
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) =>
                                setEditingSection({
                                  ...editingSection,
                                  newVideo: e.target.files[0],
                                })
                              }
                              className="hidden"
                              id="edit-video-upload"
                            />
                            <label
                              htmlFor="edit-video-upload"
                              className="flex items-center space-x-2 cursor-pointer bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
                            >
                              <FaVideo />
                              <span>Choose Video</span>
                            </label>
                            {editingSection.newVideo && (
                              <span className="text-sm text-gray-600">
                                {editingSection.newVideo.name}
                              </span>
                            )}
                          </div>
                          {editingSection.video && !editingSection.newVideo && (
                            <div className="mt-2">
                              <video
                                src={editingSection.video}
                                className="h-20 w-40 object-cover rounded"
                                controls
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingSectionOpen(false);
                            setEditingSection(null);
                          }}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          disabled={loading}
                        >
                          {loading ? "Updating..." : "Update Section"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {section.video && (
                <div className="mt-4">
                  <video controls className="rounded-lg w-full">
                    <source src={section.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {/* Edit Section Modal */}
              {isEditingSectionOpen && editingSection && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                  <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl mx-4 my-8 sm:my-0">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Edit Section</h2>
                      <button
                        onClick={() => {
                          setIsEditingSectionOpen(false);
                          setEditingSection(null);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FaTimes className="text-xl" />
                      </button>
                    </div>

                    <form onSubmit={handleEditSection} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editingSection.title}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              title: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Details
                        </label>
                        <textarea
                          value={editingSection.details}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              details: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px]"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image (Optional)
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setEditingSection({
                                  ...editingSection,
                                  newImage: e.target.files[0],
                                })
                              }
                              className="hidden"
                              id="edit-image-upload"
                            />
                            <label
                              htmlFor="edit-image-upload"
                              className="flex items-center space-x-2 cursor-pointer bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
                            >
                              <FaImage />
                              <span>Choose Image</span>
                            </label>
                            {editingSection.newImage && (
                              <span className="text-sm text-gray-600">
                                {editingSection.newImage.name}
                              </span>
                            )}
                          </div>
                          {editingSection.image && !editingSection.newImage && (
                            <div className="mt-2">
                              <img
                                src={editingSection.image}
                                alt="Current image"
                                className="h-20 w-20 object-cover rounded"
                              />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Video (Optional)
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) =>
                                setEditingSection({
                                  ...editingSection,
                                  newVideo: e.target.files[0],
                                })
                              }
                              className="hidden"
                              id="edit-video-upload"
                            />
                            <label
                              htmlFor="edit-video-upload"
                              className="flex items-center space-x-2 cursor-pointer bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
                            >
                              <FaVideo />
                              <span>Choose Video</span>
                            </label>
                            {editingSection.newVideo && (
                              <span className="text-sm text-gray-600">
                                {editingSection.newVideo.name}
                              </span>
                            )}
                          </div>
                          {editingSection.video && !editingSection.newVideo && (
                            <div className="mt-2">
                              <video
                                src={editingSection.video}
                                className="h-20 w-40 object-cover rounded"
                                controls
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingSectionOpen(false);
                            setEditingSection(null);
                          }}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          disabled={loading}
                        >
                          {loading ? "Updating..." : "Update Section"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Section Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsAddingSectionOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            <span>Add New Section</span>
          </button>
        </div>

        {/* Add Section Modal */}
        {isAddingSectionOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl mx-4 my-8 sm:my-0">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add New Section</h2>
                <button
                  onClick={() => setIsAddingSectionOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleAddSection} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newSection.title}
                    onChange={(e) =>
                      setNewSection({ ...newSection, title: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Details
                  </label>
                  <textarea
                    value={newSection.details}
                    onChange={(e) =>
                      setNewSection({ ...newSection, details: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image (Optional)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setNewSection({
                            ...newSection,
                            image: e.target.files[0],
                          })
                        }
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center space-x-2 cursor-pointer bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
                      >
                        <FaImage />
                        <span>Choose Image</span>
                      </label>
                      {newSection.image && (
                        <span className="text-sm text-gray-600">
                          {newSection.image.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video (Optional)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          setNewSection({
                            ...newSection,
                            video: e.target.files[0],
                          })
                        }
                        className="hidden"
                        id="video-upload"
                      />
                      <label
                        htmlFor="video-upload"
                        className="flex items-center space-x-2 cursor-pointer bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
                      >
                        <FaVideo />
                        <span>Choose Video</span>
                      </label>
                      {newSection.video && (
                        <span className="text-sm text-gray-600">
                          {newSection.video.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingSectionOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Section"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrganizationDetails;
