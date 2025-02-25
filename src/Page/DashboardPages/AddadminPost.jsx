import React, { useState } from "react";
import toast from "react-hot-toast";
import usePublicAxios from "../../Hooks/usePublicAxios";
import imageCompression from "browser-image-compression";
import useCategories from "../../Hooks/useCategories";
const AddadminPost = () => {
  const IMG_BB_API_KEY = import.meta.env.VITE_IMAGE_HOSTING_KEY;
  const token = localStorage.getItem("token");
  const {categories, isLoading} = useCategories();
  const axiosPublic = usePublicAxios();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    message: "",
    image: null,
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const options = {
        maxSizeMB: 0.04, 
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      try {
        const compressedFile = await imageCompression(file, options);
        setFormData((prevState) => ({
          ...prevState,
          image: compressedFile,
        }));
      } catch (error) {
        console.error("Image compression failed:", error);
        toast.error("Failed to compress image!");
      }
    }
  };

  const uploadImageToImgBB = async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        return result.data.url;
      } else {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    e.preventDefault();
    if (formData.image) {
      const imageUrl = await uploadImageToImgBB(formData.image);
      if (imageUrl) {
        const postData = {
          title: formData.title,
          category: formData.category,
          message: formData.message,
          image: imageUrl,
          date: currentDate,
          time: currentTime,
          likes: 0,
        };

        try {
          await axiosPublic.post(
            "/admin/post",
            { postData },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success("Posted successfully!");
          setFormData({
            title: "",
            category: "",
            message: "",
            image: null,
          });
        } catch (error) {
          console.error("Post submission failed:", error);
          toast.error("Failed to submit the post!");
        }
      } else {
        console.error("Image upload failed, cannot proceed.");
        toast.error("Image upload failed!");
      }
    } else {
      console.error("No image selected.");
      toast.error("Please select an image!");
    }
  };
  if(isLoading){
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  }

  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <h1 className="text-xl lg:text-3xl font-semibold text-center mt-5">
        Add Post
      </h1>
      <section className="">
        <div className="mx-auto lg:min-w-[800px] px-4  sm:px-6 lg:px-8">
          <div className="">
            <div className="rounded-lg bg-gray-100p-8 shadow-lg lg:col-span-3 lg:p-12">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="lg:text-lg font-medium">Post Title</label>
                  <input
                    className="w-full border-2 rounded-lg border-gray-200 p-3 text-sm"
                    placeholder="Title"
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="lg:text-lg font-medium">
                    Select Post Category
                  </label>
                  <select
                    id="category"
                    className="select select-bordered w-full"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categories.map((category) => (
                      <option key={category._id} value={category.category}>
                        {category.category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block mb-2 text-sm mt-3 lg:text-lg font-medium text-gray-800"
                    htmlFor="file_input"
                  >
                    Select Image
                  </label>
                  <input
                    type="file"
                    className="w-full text-gray-500 font-medium text-sm border-2 bg-gray-100 file:cursor-pointer cursor-pointer file:border-0 file:py-2 file:px-4 file:mr-4 file:bg-gray-800 file:hover:bg-gray-700 file:text-white rounded"
                    onChange={handleFileChange}
                  />
                </div>
                <div>
                  <label className="lg:text-lg font-medium">Description</label>
                  <textarea
                    className="w-full border-2 rounded-lg border-gray-200 p-3 text-sm"
                    placeholder="Description"
                    rows="8"
                    id="message"
                    value={formData.message}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    className="inline-block w-full rounded-lg bg-gray-500 px-5 py-3 font-medium text-white sm:w-auto"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AddadminPost;
