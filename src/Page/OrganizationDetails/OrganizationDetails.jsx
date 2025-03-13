import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe } from "react-icons/fa";

const OrganizationDetails = () => {
    const { orgId } = useParams();
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    const toggleSection = (index) => {
        setExpandedSections(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    useEffect(() => {
        const fetchOrganization = async () => { 
            try {
                const response = await fetch(`https://api.flybook.com.bd/api/v1/organizations/${orgId}`);
                const result = await response.json();
                setOrganization(result.data);
            } catch (err) {
                setError("Failed to fetch organization");
            } finally {
                setLoading(false);
            }
        };
        fetchOrganization();
    }, [orgId]);    

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                    Error: {error}
                </div>
            </div>
        );
    }

    const renderMedia = (media) => {
        if (media.type === 'image') {
            return (
                <div className="relative group cursor-pointer overflow-hidden rounded-xl h-[250px] md:h-[300px]">
                    <img 
                        src={media.url} 
                        alt={media.caption || 'Organization media'} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {media.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <p className="text-sm md:text-base">{media.caption}</p>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
            );
        } else if (media.type === 'video') {
            return (
                <div className="relative rounded-xl overflow-hidden group h-[250px] md:h-[300px]">
                    <video 
                        controls 
                        className="w-full h-full object-cover"
                        poster={media.thumbnail}
                    >
                        <source src={media.url} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    {media.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <p className="text-sm md:text-base">{media.caption}</p>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} alt="Enlarged view" className="max-w-full max-h-[90vh] object-contain" />
                    <button 
                        className="absolute top-4 right-4 text-white text-xl hover:text-gray-300"
                        onClick={() => setSelectedImage(null)}
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="container mx-auto px-1 py-8">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:shadow-2xl transition-all duration-300">
                    {/* Header Section with Hero Design */}
                    <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
                        <div className="absolute inset-0 bg-black opacity-10"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
                                <img 
                                    src={organization.profileImage || 'https://via.placeholder.com/128'} 
                                    alt={`${organization.orgName} profile`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/128';
                                    }}
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in">
                                    {organization.orgName}
                                </h1>
                                <p className="text-base lg:text-lg text-gray-100 max-w-3xl animate-fade-in-delayed">
                                    {organization.description.slice(0,200)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className=" md:p-8">
                        {/* Sections */}
                        {organization.sections && organization.sections.map((section, index) => (
                            <div key={index} className="mt-8 bg-white rounded-xl shadow-md p-3 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 flex items-center gap-2">
                                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 w-1 h-6 rounded-full"></span>
                                    {section.title}
                                </h2>
                                
                                <div className="flex flex-col lg:flex-row">
                                {section.details && (
                                    <div className="prose max-w-full lg:max-w-[50%] mb-8 text-gray-700 leading-relaxed hover:text-gray-900 transition-colors duration-300">
                                        <p className="text-base lg:text-lg">
                                            {expandedSections[index] 
                                                ? section.details
                                                : section.details.length > 300
                                                    ? `${section.details.substring(0, 300)}...`
                                                    : section.details
                                            }
                                        </p>
                                        {section.details.length > 300 && (
                                            <button
                                                onClick={() => toggleSection(index)}
                                                className="mt-2 text-blue-600 hover:text-blue-800 font-medium focus:outline-none transition-colors duration-200"
                                            >
                                                {expandedSections[index] ? 'See Less' : 'See More'}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {section.image && (
                                    <div className="mb-8 overflow-hidden rounded-xl shadow-lg">
                                        {renderMedia({
                                            type: 'image',
                                            url: section.image,
                                            caption: ''
                                        })}
                                    </div>
                                )}

                                {section.video && (
                                    <div className="mb-8 overflow-hidden rounded-xl shadow-lg">
                                        {renderMedia({
                                            type: 'video',
                                            url: section.video,
                                            caption: ''
                                        })}
                                    </div>
                                )}
                                {section.media && section.media.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                                        {section.media.map((media, mediaIndex) => (
                                            <div key={mediaIndex} className="h-full">
                                                {renderMedia(media)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                </div>
                            </div>
                        ))}

<div>
                            {/* Contact Information Card */}
                            <div className="bg-white rounded-xl mt-5 shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span className="bg-blue-100 p-2 rounded-lg">
                                        <FaEnvelope className="text-blue-600 text-xl" />
                                    </span>
                                    Contact Information
                                </h2>
                                
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                                        <div className="bg-blue-50 p-3 rounded-full">
                                            <FaEnvelope className="text-blue-600 text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <span className="text-gray-800 font-medium">{organization.email}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                                        <div className="bg-green-50 p-3 rounded-full">
                                            <FaPhone className="text-green-600 text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <span className="text-gray-800 font-medium">{organization.phone}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                                        <div className="bg-purple-50 p-3 rounded-full">
                                            <FaGlobe className="text-purple-600 text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Website</p>
                                            <a 
                                                href={organization.website} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                {organization.website}
                                            </a>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                                        <div className="bg-red-50 p-3 rounded-full">
                                            <FaMapMarkerAlt className="text-red-600 text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Address</p>
                                            <span className="text-gray-800 font-medium">{organization.address}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.6s ease-out forwards;
                }
                .animate-fade-in-delayed {
                    animation: fadeIn 0.6s ease-out 0.2s forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
};

export default OrganizationDetails;