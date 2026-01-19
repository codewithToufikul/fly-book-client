import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useUser from '../../Hooks/useUser';

function FullMessageView() {
    const { channelId, messageId } = useParams();
    const navigate = useNavigate();
    const { user, loading: userLoading } = useUser();
    const [message, setMessage] = useState(null);
    const [channelData, setChannelData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch message and channel data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch channel data
                const channelResponse = await fetch(`https://fly-book-server-lzu4.onrender.com/api/channels/${channelId}`);
                if (!channelResponse.ok) throw new Error('Failed to fetch channel data');
                const channelData = await channelResponse.json();
                console.log(channelData)
                setChannelData(channelData);

                // Fetch specific message
                const messageResponse = await fetch(`https://fly-book-server-lzu4.onrender.com/api/channels/${channelId}/messages/${messageId}`);
                if (!messageResponse.ok) throw new Error('Message not found');
                const messageData = await messageResponse.json();
                console.log(messageData)
                setMessage(messageData.message);
                
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (channelId && messageId) {
            fetchData();
        }
    }, [channelId, messageId]);

    // Format timestamp
    const formatFullTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle back navigation
    const handleBack = () => {
        navigate(`/channels/${channelId}`);
    };

    // Handle file download
    const handleDownload = async (fileUrl, fileName) => {
        try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Failed to download file. Please try again.');
        }
    };

    if (loading || userLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <div className="text-lg text-gray-600">Loading message...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Message Not Found</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={handleBack}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Back to Channel
                    </button>
                </div>
            </div>
        );
    }

    if (!message) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg text-gray-600">No message data available</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center">
                        <button
                            onClick={handleBack}
                            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                {channelData?.avatar ? (
                                    <img className="w-full rounded-full object-cover" src={channelData.avatar} alt="" />
                                ) : (
                                    channelData?.name?.charAt(0).toUpperCase() || 'C'
                                )}
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">
                                    {channelData?.name || 'Channel'}
                                </h1>
                                <p className="text-sm text-gray-500">Full Message View</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Message Header */}
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">
                                    Message from {message.senderName || 'Unknown User'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {formatFullTimestamp(message.timestamp)}
                                    {message.edited && <span className="ml-2 text-gray-400">(edited)</span>}
                                </p>
                            </div>
                            
                            {message.senderId === user?.id && (
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    Your Message
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Message Text */}
                    {message.text && (
                        <div className="px-6 py-6">
                            <div className="prose max-w-none">
                                <div className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap break-words">
                                    {message.text}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* File Attachments */}
                    {message.fileUrl && (
                        <div className="px-6 pb-6">
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-sm font-medium text-gray-900 mb-4">Attachment</h3>
                                
                                {message.fileType === 'image' && (
                                    <div className="space-y-4">
                                        <div className="rounded-lg overflow-hidden border border-gray-200">
                                            <img
                                                src={message.fileUrl}
                                                alt="Shared image"
                                                className="w-full h-auto max-h-[70vh] object-contain bg-gray-50"
                                            />
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => window.open(message.fileUrl, '_blank')}
                                                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                Open in New Tab
                                            </button>
                                            <button
                                                onClick={() => handleDownload(message.fileUrl, message.fileName || 'image')}
                                                className="inline-flex items-center px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {message.fileType === 'video' && (
                                    <div className="space-y-4">
                                        <div className="rounded-lg overflow-hidden border border-gray-200 bg-black">
                                            <video
                                                src={message.fileUrl}
                                                controls
                                                className="w-full h-auto max-h-[70vh]"
                                                preload="metadata"
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => window.open(message.fileUrl, '_blank')}
                                                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                Open in New Tab
                                            </button>
                                            <button
                                                onClick={() => handleDownload(message.fileUrl, message.fileName || 'video')}
                                                className="inline-flex items-center px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {message.fileType === 'pdf' && (
                                    <div className="space-y-4">
                                        <div className="border border-gray-200 rounded-lg p-6 bg-red-50">
                                            <div className="flex items-center">
                                                <svg className="w-12 h-12 text-red-500 mr-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                </svg>
                                                <div>
                                                    <h4 className="text-lg font-medium text-gray-900">
                                                        {message.fileName || 'PDF Document'}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">PDF File</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => window.open(message.fileUrl, '_blank')}
                                                className="inline-flex items-center px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                Open PDF
                                            </button>
                                            <button
                                                onClick={() => handleDownload(message.fileUrl, message.fileName || 'document.pdf')}
                                                className="inline-flex items-center px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download PDF
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FullMessageView;