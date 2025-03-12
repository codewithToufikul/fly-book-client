import React, { useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import usePublicAxios from "../../Hooks/usePublicAxios";
import toast from "react-hot-toast";

const AddOrganization = () => {
    const publicAxios = usePublicAxios();
    const [formData, setFormData] = useState({
        orgName: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        description: '',
        profileImage: null
    });

    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setFormData({
            ...formData,
            profileImage: file
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Upload image to ImgBB first
            const imageData = new FormData();
            imageData.append('image', formData.profileImage);
            
            const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGE_HOSTING_KEY}`, {
                method: 'POST',
                body: imageData
            });
            
            const imgbbData = await imgbbResponse.json();
            
            if (imgbbData.success) {
                // Create final form data with image URL
                const finalFormData = {
                    ...formData,
                    profileImage: imgbbData.data.url
                };
                
                // Post the organization data to the database using publicAxios
                const response = await publicAxios.post('/add-organizations', finalFormData);
                if (response.status === 200) {
                    toast.success('Organization added successfully!');
                    // Reset form after successful submission
                    setFormData({
                        orgName: '',
                        email: '',
                        phone: '',
                        website: '',
                        address: '',
                        description: '',
                        profileImage: null
                    });
                } else {
                    toast.error('Failed to add organization. Please try again.');
                }   
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to upload image or save organization data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="text-3xl font-bold text-gray-700 text-center mb-8 underline">
                    Add Organization
                </div>
                
                <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-6">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Organization Name *
                        </label>
                        <input
                            type="text"
                            name="orgName"
                            value={formData.orgName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    {/* Profile Image */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Organization Profile Image *
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    {/* Website */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Website <span className="text-sm font-normal text-gray-500">(Optional)</span>
                        </label>
                        <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="https://example.com"
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Address *
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            rows="3"
                            required
                        ></textarea>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Organization Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            rows="4"
                            required
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-semibold disabled:bg-blue-400"
                            disabled={loading}
                        >
                            {loading ? 'Adding Organization...' : 'Add Organization'}
                        </button>
                    </div>
                </form>
            </div>
            <div className="mt-8">
                <DownNav />
            </div>
        </div>
    );
};

export default AddOrganization;     