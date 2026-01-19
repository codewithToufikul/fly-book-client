import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Hash, Users, Clock, X, Camera, Loader2, AlertCircle, Search, Filter } from 'lucide-react'
import Navbar from '../../Components/Navbar/Navbar'
import DownNav from '../../Components/DownNav/DownNav'
import useUser from '../../Hooks/useUser'
import toast from 'react-hot-toast'
import { Link } from 'react-router'

function Channels() {
  const [channels, setChannels] = useState([])
  const [filteredChannels, setFilteredChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // all, active, quiet
  const [newChannel, setNewChannel] = useState({
    name: '',
    description: '',
    avatar: ''
  })
  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)

  const IMG_BB_API_KEY = import.meta.env.VITE_IMAGE_HOSTING_KEY
  const { user, loading: userLoading, refetch } = useUser()

  // Fetch channels with proper error handling
  const fetchChannels = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('https://fly-book-server-lzu4.onrender.com/api/channels')

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()

      // Ensure data is an array and has proper structure
      const channelsData = Array.isArray(data) ? data : data.channels || []

      setChannels(channelsData)
      setFilteredChannels(channelsData)
    } catch (error) {
      console.error('Error fetching channels:', error)
      setError(error.message)
      toast.error('Failed to load channels')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChannels()
  }, [fetchChannels])

  // Filter and search channels
  useEffect(() => {
    let filtered = [...channels]

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(channel =>
        channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        channel.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (filterType !== 'all') {
      filtered = filtered.filter(channel =>
        filterType === 'active' ? channel.isOnline : !channel.isOnline
      )
    }

    setFilteredChannels(filtered)
  }, [channels, searchTerm, filterType])

  // Format time helper
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  // ImgBB upload function with better error handling
  const uploadImageToImgBB = async (file) => {
    if (!IMG_BB_API_KEY) {
      toast.error('Image upload service not configured')
      return ''
    }

    // Validate file
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB')
      return ''
    }

    const formData = new FormData()
    formData.append('image', file)

    setUploading(true)
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Image uploaded successfully!')
        return data.data.url
      } else {
        throw new Error(data.error?.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error(`Upload failed: ${error.message}`)
      return ''
    } finally {
      setUploading(false)
    }
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = await uploadImageToImgBB(file)
      if (url) {
        setNewChannel(prev => ({ ...prev, avatar: url }))
      }
    }
  }

  const handleCreateChannel = async () => {
    if (!newChannel.name.trim()) {
      toast.error('Channel name is required')
      return
    }

    if (!user?.id) {
      toast.error('You must be logged in to create a channel')
      return
    }

    setCreating(true)
    const channel = {
      creator: user.id,
      name: newChannel.name.trim(),
      description: newChannel.description.trim(),
      lastMessage: "Channel created! Welcome everyone! 🎉",
      time: "Now",
      avatar: newChannel.avatar || "https://i.ibb.co/YDyHdGX/default-channel.jpg",
      createdAt: new Date().toISOString(),
      members: [user.id], // Add creator as first member
      status: "pending",
    }

    try {
      const res = await fetch('https://fly-book-server-lzu4.onrender.com/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(channel),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      toast.success("Channel created successfully!")

      // Reset form and close modal
      setNewChannel({ name: '', description: '', avatar: '' })
      setShowModal(false)

      // Refresh channels list
      await fetchChannels()
    } catch (err) {
      console.error("Error creating channel:", err)
      toast.error("Failed to create channel. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  const formatMemberCount = (count) => {
    if (count < 1000) return count.toString()
    if (count < 1000000) return (count / 1000).toFixed(1) + 'K'
    return (count / 1000000).toFixed(1) + 'M'
  }

  // Loading state
  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading channels...</p>
          </div>
        </div>
        <DownNav />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <div className="max-w-[700px] mx-auto px-4 mt-6">
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to load channels</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchChannels}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
        <DownNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      <div className='max-w-[700px] mx-auto px-4 mt-6 pb-20'>
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className='text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2'>
                <Hash className="w-6 h-6 text-blue-500" />
                Channels
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredChannels.length} of {channels.length} channels
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className='bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg'
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Create Channel</span>
              <span className="sm:hidden">Create</span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>

          </div>
        </div>

        {/* Channels List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {filteredChannels.length > 0 ? (
            filteredChannels.map((channel, index) => (
              <Link
                to={`/channel/${channel._id}`}
                key={channel.id}
                className={`flex items-center gap-4 p-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 cursor-pointer group ${index !== filteredChannels.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={channel.avatar}
                    alt={channel.name}
                    className='w-14 h-14 rounded-2xl object-cover ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all duration-300'
                    onError={(e) => {
                      e.target.src = 'https://i.ibb.co/YDyHdGX/default-channel.jpg'
                    }}
                  />

                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex justify-between items-start'>
                    <div className="flex-1 min-w-0">
                      <h3 className='font-semibold text-gray-800 text-lg group-hover:text-blue-600 transition-colors duration-300 truncate'>
                        {channel.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                      </div>
                    </div>
                  </div>
                  <p className='text-gray-600 truncate mt-2 group-hover:text-gray-700 transition-colors duration-300'>
                    {channel.lastMessage}
                  </p>
                  {channel.description && (
                    <p className='text-gray-500 text-sm truncate mt-1'>
                      {channel.description}
                    </p>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="p-12 text-center">
              <Hash className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm || filterType !== 'all' ? 'No matching channels' : 'No channels yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Be the first to create a channel and start the conversation!'}
              </p>
              {(!searchTerm && filterType === 'all') && (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Create First Channel
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Channel Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Create New Channel</h2>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={creating}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Channel Name *
                  </label>
                  <input
                    type="text"
                    value={newChannel.name}
                    onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                    placeholder="Enter channel name"
                    maxLength={50}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    disabled={creating}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {newChannel.name.length}/50 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newChannel.description}
                    onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
                    placeholder="What's this channel about?"
                    rows="3"
                    maxLength={200}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
                    disabled={creating}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {newChannel.description.length}/200 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Channel Avatar
                  </label>
                  <div className="space-y-3">
                    <div className="relative flex items-center gap-3">
                      <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        value={newChannel.avatar}
                        onChange={(e) => setNewChannel({ ...newChannel, avatar: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        disabled={creating}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 text-center text-gray-500 text-sm">OR</div>
                      <label
                        htmlFor="image-upload"
                        className={`cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors duration-200 ${uploading || creating ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        {uploading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </div>
                        ) : (
                          'Upload Image'
                        )}
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={uploading || creating}
                      />
                    </div>
                    {newChannel.avatar && (
                      <div className="flex justify-center">
                        <img
                          src={newChannel.avatar}
                          alt="Channel preview"
                          className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                          onError={(e) => {
                            e.target.src = 'https://i.ibb.co/YDyHdGX/default-channel.jpg'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={creating}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateChannel}
                  disabled={!newChannel.name.trim() || creating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                >
                  {creating ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    'Create Channel'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DownNav />
    </div>
  )
}

export default Channels