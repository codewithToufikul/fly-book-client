import React, { useState } from "react";
import usePublicAxios from "../../Hooks/usePublicAxios";
import toast from "react-hot-toast";

const ThesisPost = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const postData = {
      title: formData.title,
      category: formData.category,
      message: formData.message,
      date: currentDate,
      time: currentTime,
      likes: 0,
    };
    try {
      await axiosPublic.post(
        "/admin/thesis",
        { postData }
      );
      toast.success("Posted successfully!");
      setFormData({
        title: "",
        category: "",
        message: "",
      });
    } catch (error) {
      console.error("Post submission failed:", error);
      toast.error("Failed to submit the post!");
    }
  };
  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <h1 className="text-xl lg:text-3xl font-semibold text-center mt-5">
        Add Research Articles
      </h1>
      <section className="">
        <div className="mx-auto lg:min-w-[800px] px-4  sm:px-6 lg:px-8">
          <div className="">
            <div className="rounded-lg bg-gray-100p-8 shadow-lg lg:col-span-3 lg:p-12">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="lg:text-lg font-medium">Title</label>
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
                    Select Category
                  </label>
                  <select
                    id="category"
                    className="select select-bordered w-full"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option disabled value="">
                      Select One
                    </option>
                    <option>Science and Technology</option>
                    <option>Social Sciences</option>
                    <option>Humanities</option>
                    <option>Business and Management</option>
                    <option>Engineering</option>
                    <option>Environmental Studies</option>
                    <option>Education</option>
                  </select>
                </div>
                <div>
                  <label className="lg:text-lg font-medium">Content</label>
                  <textarea
                    className="w-full border-2 rounded-lg border-gray-200 p-3 text-sm"
                    placeholder="Content"
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

export default ThesisPost;
