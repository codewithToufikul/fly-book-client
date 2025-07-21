import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import DownNav from '../../Components/DownNav/DownNav';
import { useParams } from 'react-router';
import useUser from '../../Hooks/useUser';

function ChannelBox() {
    const { channelId } = useParams();
    const { user, loading: userLoading, refetch } = useUser();
    const [channelData, setChannelData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [sending, setSending] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);
    const [editText, setEditText] = useState('');
    const [showDropdown, setShowDropdown] = useState(null);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const dropdownRef = useRef(null);

    const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch channel data
    useEffect(() => {
        const fetchChannelData = async () => {
            try {
                const response = await fetch(`https://api.flybook.com.bd/api/channels/${channelId}`);
                const data = await response.json();
                setChannelData(data);
            } catch (error) {
                console.error('Error fetching channel data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (channelId) {
            fetchChannelData();
        }
    }, [channelId]);

    // Fetch messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(`https://api.flybook.com.bd/api/channels/${channelId}/messages`);
                const data = await response.json();
                setMessages(data.messages || []);
            } catch (error) {
                console.error('Error fetching messages:', error);
                setMessages([]);
            } finally {
                setMessagesLoading(false);
            }
        };

        if (channelId && channelData) {
            fetchMessages();
        }
    }, [channelId, channelData]);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Upload file to Cloudinary
    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const resourceType = file.type.startsWith('image/') ? 'image' :
            file.type.startsWith('video/') ? 'video' : 'raw';

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );
            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw error;
        }
    };

    // Send message
    const sendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() && !selectedFile) return;

        setSending(true);

        try {
            let fileUrl = null;
            let fileType = null;
            let fileName = null;

            // Upload file if selected
            if (selectedFile) {
                setUploading(true);
                fileUrl = await uploadToCloudinary(selectedFile);
                fileType = selectedFile.type.startsWith('image/') ? 'image' :
                    selectedFile.type.startsWith('video/') ? 'video' :
                        selectedFile.type === 'application/pdf' ? 'pdf' : 'file';
                fileName = selectedFile.name;
                setUploading(false);
            }

            const messageData = {
                text: newMessage.trim(),
                fileUrl,
                fileType,
                fileName,
                senderId: user.id,
                channelId,
                senderName: user.name || user.username,
                timestamp: new Date().toISOString()
            };

            const response = await fetch(`https://api.flybook.com.bd/api/channels/${channelId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(messageData)
            });

            if (response.ok) {
                const savedMessage = await response.json();
                setMessages(prev => [...prev, savedMessage.message]);
                setNewMessage('');
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
            setUploading(false);
        }
    };

    // Edit message
    const editMessage = async (messageId) => {
        if (!editText.trim()) return;

        try {
            const response = await fetch(`https://api.flybook.com.bd/api/channels/${channelId}/messages/${messageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ text: editText.trim() })
            });

            if (response.ok) {
                const updatedMessage = await response.json();
                setMessages(prev => prev.map(msg =>
                    msg._id === messageId ? { ...msg, text: editText.trim(), edited: true } : msg
                ));
                setEditingMessage(null);
                setEditText('');
            } else {
                throw new Error('Failed to edit message');
            }
        } catch (error) {
            console.error('Error editing message:', error);
            alert('Failed to edit message. Please try again.');
        }
    };

    // Delete message
    const deleteMessage = async (messageId) => {
        if (!confirm('Are you sure you want to delete this message?')) return;

        try {
            const response = await fetch(`https://api.flybook.com.bd/api/channels/${channelId}/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setMessages(prev => prev.filter(msg => msg._id !== messageId));
            } else {
                throw new Error('Failed to delete message');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Failed to delete message. Please try again.');
        }
        setShowDropdown(null);
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (limit to 50MB for videos, 10MB for others)
            const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
            if (file.size > maxSize) {
                alert(`File size should be less than ${file.type.startsWith('video/') ? '50MB' : '10MB'}`);
                return;
            }

            // Check file type
            const allowedTypes = [
                'image/jpeg', 'image/png', 'image/gif', 'image/webp',
                'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov',
                'application/pdf'
            ];
            if (!allowedTypes.includes(file.type)) {
                alert('Only images, videos (MP4, WebM, OGG, AVI, MOV) and PDF files are allowed');
                return;
            }

            setSelectedFile(file);
        }
    };

    // Format timestamp
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Start editing
    const startEditing = (message) => {
        setEditingMessage(message._id);
        setEditText(message.text);
        setShowDropdown(null);
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingMessage(null);
        setEditText('');
    };

    // Render message content
    const renderMessageContent = (message) => {
        const isEditing = editingMessage === message._id;
        const isOwner = message.senderId === user?.id;

        return (
            <div className="group relative">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 max-w-2xl">
                    {/* Message header with timestamp and options */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">
                            {formatTimestamp(message.timestamp)}
                            {message.edited && <span className="ml-1 text-gray-400">(edited)</span>}
                        </span>

                        {isOwner && (
                            <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setShowDropdown(showDropdown === message._id ? null : message._id)}
                                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                    </svg>
                                </button>

                                {showDropdown === message._id && (
                                    <div
                                        ref={dropdownRef}
                                        className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-32"
                                    >
                                        {message.text && (
                                            <button
                                                onClick={() => startEditing(message)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteMessage(message._id)}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Message text */}
                    {isEditing ? (
                        <div className="space-y-3">
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[60px]"
                                autoFocus
                            />
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => editMessage(message._id)}
                                    className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    className="px-4 py-1.5 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {message.text && (
                                <div className="text-gray-800 mb-3 whitespace-pre-wrap break-words leading-relaxed">
                                    {message.text}
                                </div>
                            )}

                            {/* File attachments */}
                            {message.fileUrl && (
                                <div className="mt-3">
                                    {message.fileType === 'image' && (
                                        <div className="rounded-lg overflow-hidden">
                                            <img
                                                src={message.fileUrl}
                                                alt="Shared image"
                                                className="max-w-full max-h-80 object-contain cursor-pointer hover:opacity-90 transition-opacity rounded-lg"
                                                onClick={() => window.open(message.fileUrl, '_blank')}
                                            />
                                        </div>
                                    )}

                                    {message.fileType === 'video' && (
                                        <div className="rounded-lg overflow-hidden">
                                            <video
                                                src={message.fileUrl}
                                                controls
                                                className="max-w-full max-h-80 rounded-lg"
                                                preload="metadata"
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    )}

                                    {message.fileType === 'pdf' && (
                                        <a
                                            href={message.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                                        >
                                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                            </svg>
                                            <div>
                                                <div className="font-medium">{message.fileName || 'PDF Document'}</div>
                                                <div className="text-sm text-red-600">Click to open</div>
                                            </div>
                                        </a>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    };

    if (loading || userLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    const isCreator = channelData?.creator == user?.id;

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Channel Header */}
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 shadow-sm">
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-md">
                        <img className=' w-full  rounded-full object-fit ' src={channelData?.avatar} alt="" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            {channelData?.name || 'Channel'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {isCreator ? 'You are the creator' : 'Channel member'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
                {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="animate-pulse text-gray-500 mb-2">Loading messages...</div>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500 max-w-md">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-lg font-medium mb-2">No messages yet</p>
                            {isCreator && <p className="text-sm">Send the first message to start the conversation!</p>}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {messages.map((message, index) => (
                            <div key={message._id || index}>
                                {renderMessageContent(message)}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Message Input (Only for creators) */}
            {isCreator && (
                <div className="bg-white border-t border-gray-200 p-4 sm:p-6">
                    <div className="max-w-4xl mx-auto">
                        <form onSubmit={sendMessage} className="space-y-4">
                            {/* File preview */}
                            {selectedFile && (
                                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-200">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                            {selectedFile.type.startsWith('image/') ? (
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            ) : selectedFile.type.startsWith('video/') ? (
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-700 block truncate max-w-xs">
                                                {selectedFile.name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = '';
                                            }
                                        }}
                                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-white transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            <div className="flex items-end space-x-3">
                                {/* File input */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*,video/*,.pdf"
                                    className="hidden"
                                />

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading || sending}
                                    className="flex-shrink-0 p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50 border border-gray-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                </button>

                                {/* Text input */}
                                <div className="flex-1">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="w-full p-4 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[56px] max-h-32"
                                        disabled={uploading || sending}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage(e);
                                            }
                                        }}
                                    />
                                </div>

                                {/* Send button */}
                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && !selectedFile) || uploading || sending}
                                    className="flex-shrink-0 bg-blue-500 text-white p-3 rounded-2xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? (
                                        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : sending ? (
                                        <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="mt-10 lg:mt-0">
                <DownNav />
            </div>
        </div>
    );
}

export default ChannelBox;