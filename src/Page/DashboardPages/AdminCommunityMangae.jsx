import React, { useEffect, useState } from 'react';
import usePublicAxios from '../../Hooks/usePublicAxios';
import toast from 'react-hot-toast';
import {
  Users, BookOpen, GraduationCap, Search, Eye, Trash2, CheckCircle,
  XCircle, Calendar, Heart, FileText, Video, Award, Shield, AlertCircle,
  ChevronLeft, UserCheck, Mail, Phone, TrendingUp
} from 'lucide-react';

const AdminCommunityMangae = () => {
  const axiosPublic = usePublicAxios();
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [communityDetails, setCommunityDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const loadStats = async () => {
    try {
      const res = await axiosPublic.get('/admin/communities/stats', { headers });
      if (res.data?.success) setStats(res.data.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      if (error.response?.status === 403) toast.error('Admin access required');
    }
  };

  const loadCommunities = async () => {
    try {
      setLoading(true);
      const res = await axiosPublic.get('/admin/communities', { headers });
      if (res.data?.success) setCommunities(res.data.data || []);
    } catch (error) {
      console.error('Failed to load communities:', error);
      toast.error('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const loadCommunityDetails = async (communityId) => {
    try {
      setDetailsLoading(true);
      const res = await axiosPublic.get(`/admin/communities/${communityId}/details`, { headers });
      if (res.data?.success) setCommunityDetails(res.data.data);
    } catch (error) {
      console.error('Failed to load community details:', error);
      toast.error('Failed to load community details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const deleteCommunity = async (communityId) => {
    if (!confirm('Delete this community? All posts, courses, and data will be permanently deleted.')) return;
    try {
      setActionLoading((prev) => ({ ...prev, [`delete-${communityId}`]: true }));
      const res = await axiosPublic.delete(`/admin/communities/${communityId}`, { headers });
      if (res.data?.success) {
        toast.success('Community deleted successfully');
        setCommunities((prev) => prev.filter((c) => c._id !== communityId));
        if (selectedCommunity === communityId) {
          setSelectedCommunity(null);
          setCommunityDetails(null);
        }
        loadStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete community');
    } finally {
      setActionLoading((prev) => ({ ...prev, [`delete-${communityId}`]: false }));
    }
  };

  const toggleVerification = async (communityId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [`verify-${communityId}`]: true }));
      const res = await axiosPublic.patch(`/admin/communities/${communityId}/verify`, {}, { headers });
      if (res.data?.success) {
        toast.success(res.data.isVerified ? 'Community verified' : 'Verification removed');
        setCommunities((prev) => prev.map((c) => (c._id === communityId ? { ...c, isVerified: res.data.isVerified } : c)));
        if (communityDetails?.community._id === communityId) {
          setCommunityDetails((prev) => ({ ...prev, community: { ...prev.community, isVerified: res.data.isVerified } }));
        }
        loadStats();
      }
    } catch (error) {
      toast.error('Failed to update verification status');
    } finally {
      setActionLoading((prev) => ({ ...prev, [`verify-${communityId}`]: false }));
    }
  };

  const deletePost = async (postId) => {
    if (!confirm('Delete this post? This action cannot be undone.')) return;
    try {
      setActionLoading((prev) => ({ ...prev, [`post-${postId}`]: true }));
      const res = await axiosPublic.delete(`/admin/posts/${postId}`, { headers });
      if (res.data?.success) {
        toast.success('Post deleted successfully');
        setCommunityDetails((prev) => ({ ...prev, posts: prev.posts.filter((p) => p._id !== postId) }));
        loadStats();
      }
    } catch (error) {
      toast.error('Failed to delete post');
    } finally {
      setActionLoading((prev) => ({ ...prev, [`post-${postId}`]: false }));
    }
  };

  const viewCommunityDetails = (communityId) => {
    setSelectedCommunity(communityId);
    loadCommunityDetails(communityId);
  };

  const backToList = () => {
    setSelectedCommunity(null);
    setCommunityDetails(null);
  };

  useEffect(() => {
    loadStats();
    loadCommunities();
  }, []);

  const filteredCommunities = communities.filter((comm) => {
    const matchesSearch = comm.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'verified' && comm.isVerified) ||
      (filterStatus === 'unverified' && !comm.isVerified);
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video size={16} className="text-purple-600" />;
      case 'course': return <GraduationCap size={16} className="text-blue-600" />;
      default: return <FileText size={16} className="text-green-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={32} className="text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Community Management</h1>
        </div>
        <p className="text-gray-600">Manage all communities, posts, and courses from the admin dashboard</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard icon={Users} color="indigo" label="Total Communities" value={stats.totalCommunities} />
          <StatCard icon={CheckCircle} color="green" label="Verified" value={stats.verifiedCommunities} />
          <StatCard icon={FileText} color="purple" label="Total Posts" value={stats.totalPosts} />
          <StatCard icon={GraduationCap} color="blue" label="Total Courses" value={stats.totalCourses} />
          <StatCard icon={BookOpen} color="orange" label="Enrollments" value={stats.totalEnrollments} />
          <StatCard icon={Heart} color="pink" label="Total Follows" value={stats.totalFollows} />
        </div>
      )}

      {!selectedCommunity ? (
        <CommunitiesList
          loading={loading}
          filteredCommunities={filteredCommunities}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          viewCommunityDetails={viewCommunityDetails}
          toggleVerification={toggleVerification}
          deleteCommunity={deleteCommunity}
          actionLoading={actionLoading}
        />
      ) : (
        <CommunityDetailsView
          detailsLoading={detailsLoading}
          communityDetails={communityDetails}
          backToList={backToList}
          deletePost={deletePost}
          actionLoading={actionLoading}
          getTypeIcon={getTypeIcon}
        />
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, color, label, value }) => {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    pink: 'bg-pink-100 text-pink-600',
  };
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
      <div className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center mb-2`}>
        <Icon size={24} />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
};

const CommunitiesList = ({ loading, filteredCommunities, searchQuery, setSearchQuery, filterStatus, setFilterStatus, viewCommunityDetails, toggleVerification, deleteCommunity, actionLoading }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
    <div className="p-6 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search communities..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none" />
        </div>
        <div className="flex gap-2">
          {['all', 'verified', 'unverified'].map((status) => (
            <button key={status} onClick={() => setFilterStatus(status)}
              className={`px-4 py-3 rounded-xl font-medium transition-all capitalize ${filterStatus === status ? 
                (status === 'all' ? 'bg-indigo-600' : status === 'verified' ? 'bg-green-600' : 'bg-orange-600') + ' text-white shadow-md' : 
                'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {status}
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="overflow-x-auto">
      {loading ? (
        <LoadingState message="Loading communities..." />
      ) : filteredCommunities.length === 0 ? (
        <EmptyState message="No communities found" />
      ) : (
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Community', 'Owner', 'Stats', 'Status', 'Actions'].map((header) => (
                <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCommunities.map((comm) => (
              <CommunityRow key={comm._id} comm={comm} viewCommunityDetails={viewCommunityDetails}
                toggleVerification={toggleVerification} deleteCommunity={deleteCommunity} actionLoading={actionLoading} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);

const CommunityRow = ({ comm, viewCommunityDetails, toggleVerification, deleteCommunity, actionLoading }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4">
      <div className="flex items-center gap-4">
        {comm.logo && <img src={comm.logo} alt={comm.name} className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-gray-900 truncate">{comm.name}</div>
            {comm.isVerified && <Award size={16} className="text-blue-500 flex-shrink-0" />}
          </div>
          <div className="text-sm text-gray-600 line-clamp-1">{comm.description}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="text-sm">
        <div className="font-medium text-gray-900">{comm.owner?.name || 'Unknown'}</div>
        <div className="text-gray-600">{comm.owner?.email || comm.owner?.number}</div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center justify-center gap-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-gray-900">{comm.membersCount || 0}</div>
          <div className="text-xs text-gray-600">Members</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">{comm.postsCount || 0}</div>
          <div className="text-xs text-gray-600">Posts</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">{comm.coursesCount || 0}</div>
          <div className="text-xs text-gray-600">Courses</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 text-center">
      {comm.isVerified ? (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
          <CheckCircle size={14} />Verified
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
          <AlertCircle size={14} />Unverified
        </span>
      )}
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center justify-center gap-2">
        <ActionButton onClick={() => viewCommunityDetails(comm._id)} color="blue" icon={Eye} title="View Details" />
        <ActionButton onClick={() => toggleVerification(comm._id)} color={comm.isVerified ? 'orange' : 'green'}
          icon={comm.isVerified ? XCircle : CheckCircle} loading={actionLoading[`verify-${comm._id}`]}
          title={comm.isVerified ? 'Remove Verification' : 'Verify Community'} />
        <ActionButton onClick={() => deleteCommunity(comm._id)} color="red" icon={Trash2}
          loading={actionLoading[`delete-${comm._id}`]} title="Delete Community" />
      </div>
    </td>
  </tr>
);

const CommunityDetailsView = ({ detailsLoading, communityDetails, backToList, deletePost, actionLoading, getTypeIcon }) => (
  <div className="space-y-6">
    <button onClick={backToList}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium">
      <ChevronLeft size={20} />Back to Communities
    </button>

    {detailsLoading ? (
      <LoadingState message="Loading details..." />
    ) : communityDetails ? (
      <>
        <CommunityHeader community={communityDetails.community} members={communityDetails.members} posts={communityDetails.posts} />
        <MembersSection members={communityDetails.members} />
        <PostsSection posts={communityDetails.posts} deletePost={deletePost} actionLoading={actionLoading} getTypeIcon={getTypeIcon} />
      </>
    ) : null}
  </div>
);

const CommunityHeader = ({ community, members, posts }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
    {community.coverImage && (
      <div className="h-48 overflow-hidden">
        <img src={community.coverImage} alt={community.name} className="w-full h-full object-cover" />
      </div>
    )}
    <div className="p-8">
      <div className="flex items-start gap-6">
        {community.logo && (
          <img src={community.logo} alt={community.name}
            className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg -mt-16" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-gray-900">{community.name}</h2>
            {community.isVerified && <Award size={24} className="text-blue-500" />}
          </div>
          <p className="text-gray-600 mb-4">{community.description}</p>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-indigo-600" />
              <span>{members.length} Members</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-purple-600" />
              <span>{posts.length} Posts</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gray-500" />
              <span>Created {new Date(community.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MembersSection = ({ members }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
      <UserCheck size={24} className="text-indigo-600" />Members ({members.length})
    </h3>
    {members.length === 0 ? (
      <p className="text-gray-600 text-center py-8">No members yet</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {members.map((member) => (
          <div key={member._id}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
            {member.image ? (
              <img src={member.image} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {member.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900 truncate">{member.name || 'Unknown'}</div>
              <div className="text-xs text-gray-600 truncate flex items-center gap-1">
                {member.email ? <><Mail size={12} />{member.email}</> : <><Phone size={12} />{member.number}</>}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const PostsSection = ({ posts, deletePost, actionLoading, getTypeIcon }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
      <FileText size={24} className="text-purple-600" />Posts & Courses ({posts.length})
    </h3>
    {posts.length === 0 ? (
      <p className="text-gray-600 text-center py-8">No posts yet</p>
    ) : (
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post._id} className="border-2 border-gray-100 rounded-xl p-6 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-bold text-gray-900">{post.title}</h4>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                    {getTypeIcon(post.type)}
                    <span className="text-xs font-semibold capitalize">{post.type}</span>
                  </div>
                </div>
                {post.description && <p className="text-gray-600 mb-3">{post.description}</p>}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Heart size={16} className="text-red-500" />
                    <span>{post.likesCount || 0} likes</span>
                  </div>
                  {post.author && (
                    <div className="flex items-center gap-2">
                      {post.author.image && <img src={post.author.image} alt={post.author.name} className="w-6 h-6 rounded-full" />}
                      <span>By {post.author.name || post.author.number}</span>
                    </div>
                  )}
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                {post.courseInfo && (
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                      {post.courseInfo.enrollmentsCount} enrolled
                    </span>
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                      {post.courseInfo.chaptersCount} chapters
                    </span>
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                      {post.courseInfo.lessonsCount} lessons
                    </span>
                  </div>
                )}
              </div>
              <button onClick={() => deletePost(post._id)} disabled={actionLoading[`post-${post._id}`]}
                className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
                title="Delete Post">
                {actionLoading[`post-${post._id}`] ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Trash2 size={20} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const ActionButton = ({ onClick, color, icon: Icon, loading, title }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    green: 'bg-green-100 text-green-700 hover:bg-green-200',
    orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    red: 'bg-red-100 text-red-700 hover:bg-red-200',
  };
  return (
    <button onClick={onClick} disabled={loading} className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${colors[color]}`} title={title}>
      {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Icon size={18} />}
    </button>
  );
};

const LoadingState = ({ message }) => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center space-y-4">
      <AlertCircle size={48} className="text-gray-400 mx-auto" />
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  </div>
);

export default AdminCommunityMangae;