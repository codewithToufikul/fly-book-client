import { useState } from "react";
import usePublicAxios from "../../Hooks/usePublicAxios";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { FaEdit, FaTrash } from "react-icons/fa";
import imageCompression from 'browser-image-compression';

const AiPosts = () => {
    const { isLoading, error, data, refetch } = useQuery({
        queryKey: ["aiPostData"],
        queryFn: () =>
            fetch("https://api.flybook.com.bd/admin/post-ai").then((res) => res.json()),
    });
    const axiosPublic = usePublicAxios();
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        message: "",
        image: null,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editingPost, setEditingPost] = useState(null);

    // Add this new state for tracking expanded messages
    const [expandedPosts, setExpandedPosts] = useState({});

    const [selectedImage, setSelectedImage] = useState(null);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [id]: value,
        }));
    };

    // Handle delete post
    const handleDelete = async (id) => {
        try {
            await axiosPublic.delete(`/admin/post-ai/${id}`);
            toast.success("Post deleted successfully!");
            refetch();
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete the post!");
        }
    };

    // Handle edit button click
    const handleEditClick = (post) => {
        setIsEditing(true);
        setEditingPost(post);
        setFormData({
            title: post.title,
            category: post.category,
            message: post.message,
        });
    };

    // Add this new function to toggle message expansion
    const toggleMessageExpansion = (postId) => {
        setExpandedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    // Add this function to truncate text
    const truncateText = (text, maxLength = 200) => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + "...";
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setSelectedImage(file);

        // Create a preview URL for the selected image
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setFormData(prev => ({
                ...prev,
                image: previewUrl // This is just for preview, not the final ImgBB URL
            }));
        }
    };

    const uploadImageToImgBB = async (imageFile) => {
        // Compression options
        const options = {
            maxSizeMB: 0.02,        // 20KB = 0.02MB
            maxWidthOrHeight: 1920,
            useWebWorker: true
        };

        try {
            // Compress the image
            const compressedFile = await imageCompression(imageFile, options);

            // Create form data with compressed image
            const formData = new FormData();
            formData.append('image', compressedFile);

            // Upload to ImgBB
            const response = await fetch(
                `https://api.imgbb.com/1/upload?key=8b86a561b76cd59e16d93c1098c5018a`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await response.json();
            return data.data.url;
        } catch (error) {
            console.error('Image upload failed:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();

        try {
            toast.loading('Processing...');

            // Upload image if one is selected
            let imageUrl = formData.image;
            if (selectedImage) {
                imageUrl = await uploadImageToImgBB(selectedImage);
            }

            const postData = {
                title: formData.title,
                category: formData.category,
                message: formData.message,
                image: imageUrl,
                date: currentDate,
                time: currentTime,
                likes: isEditing ? editingPost.likes : 0,
            };

            if (isEditing) {
                await axiosPublic.put(
                    `/admin/post-ai/${editingPost._id}`,
                    { postData }
                );
                toast.dismiss();
                toast.success("Post updated successfully!");
                setIsEditing(false);
                setEditingPost(null);
            } else {
                await axiosPublic.post(
                    "/admin/post-ai",
                    { postData }
                );
                toast.dismiss();
                toast.success("Posted successfully!");
            }

            setFormData({
                title: "",
                category: "",
                message: "",
                image: null
            });
            setSelectedImage(null);
            refetch();
        } catch (error) {
            console.error("Post submission failed:", error);
            toast.dismiss();
            toast.error(`Failed to ${isEditing ? 'update' : 'submit'} the post!`);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <h1 className="text-xl lg:text-3xl font-semibold text-center mt-5">
                {isEditing ? "Edit AI Article" : "Add AI Article"}
            </h1>

            <section className="mb-8">
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
                                        <option>AI News & Updates</option>
                                        <option>AI Tools & Software</option>
                                        <option>AI in Business</option>
                                        <option>Machine Learning & Data Science</option>
                                        <option>AI in Everyday Life</option>
                                        <option>Ethical AI & Governance</option>
                                        <option>AI for Developers</option>
                                        <option>AI in Specific Industries</option>
                                        <option>AI and Future Trends</option>
                                        <option>AI Tutorials & How-Tos</option>
                                        <option>AI Research & Innovations</option>
                                        <option>AI for Content Creation</option>
                                        <option>AI in Automation</option>
                                        <option>AI-Powered Gadgets & Devices</option>
                                        <option>AI in Marketing & Sales</option>
                                        <option>AI in Education</option>
                                        <option>AI in Healthcare</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="lg:text-lg font-medium">Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full border-2 rounded-lg border-gray-200 p-3 text-sm"
                                    />
                                    {formData.image && (
                                        <div className="mt-2">
                                            <img
                                                src={formData.image}
                                                alt="Preview"
                                                className="w-32 h-32 object-cover rounded"
                                            />
                                        </div>
                                    )}
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

                                <div className="mt-4 space-y-2">
                                    <button
                                        type="submit"
                                        className="inline-block w-full rounded-lg bg-gray-500 px-5 py-3 font-medium text-white sm:w-auto"
                                    >
                                        {isEditing ? "Update Post" : "Post"}
                                    </button>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditingPost(null);
                                                setFormData({ title: "", category: "", message: "" });
                                            }}
                                            className="inline-block ml-2 w-full rounded-lg bg-red-500 px-5 py-3 font-medium text-white sm:w-auto"
                                        >
                                            Cancel Edit
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full max-w-7xl mx-auto px-4">
                <h2 className="text-2xl font-semibold mb-4">All AI Posts</h2>
                {isLoading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>Error loading posts</p>
                ) : (
                    <div className="grid gap-4">
                        {data?.map((post) => (
                            <div key={post._id} className="border rounded-lg p-4 bg-white shadow">
                                <div className="flex justify-between items-start">
                                    <div className="w-full">
                                        {post.image && (
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="w-full max-w-md h-48 object-cover rounded-lg mb-4"
                                            />
                                        )}
                                        <h3 className="text-xl font-semibold">{post.title}</h3>
                                        <p className="text-gray-600 text-sm">{post.category}</p>
                                        <div className="mt-2">
                                            <p className="text-gray-800">
                                                {expandedPosts[post._id]
                                                    ? post.message
                                                    : truncateText(post.message)}
                                            </p>
                                            {post.message.length > 200 && (
                                                <button
                                                    onClick={() => toggleMessageExpansion(post._id)}
                                                    className="text-blue-500 hover:text-blue-700 mt-2 text-sm font-medium"
                                                >
                                                    {expandedPosts[post._id] ? 'Show Less' : 'Show More'}
                                                </button>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-2">
                                            <span>{post.date} - {post.time}</span>
                                            <span className="ml-2">Likes: {post.likes}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleEditClick(post)}
                                            className="p-2 text-blue-500 hover:text-blue-700"
                                        >
                                            <FaEdit size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            className="p-2 text-red-500 hover:text-red-700"
                                        >
                                            <FaTrash size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default AiPosts;
