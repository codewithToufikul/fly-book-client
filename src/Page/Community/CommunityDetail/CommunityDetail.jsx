import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../../Components/Navbar/Navbar";
import DownNav from "../../../Components/DownNav/DownNav";
import usePublicAxios from "../../../Hooks/usePublicAxios";
import { useParams } from "react-router";
import toast from "react-hot-toast";
import { Heart, Users, Calendar, Plus, Trash2, Video, FileText, GraduationCap, Lock, Globe, ChevronDown, X, Edit, BarChart3, Share2, Copy, Check } from "lucide-react";
import { uploadVideoToCloudinaryUnsigned } from "../../../utils/cloudinaryUpload";
import { uploadImageToImgBB } from "../../../utils/imgbbUpload";

const CommunityDetail = () => {
  const { communityId } = useParams();
  const axiosPublic = usePublicAxios();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  // Grading dashboard state
  const [attemptsByCourse, setAttemptsByCourse] = useState({}); // { courseId: attempts[] }
  const [loadingAttempts, setLoadingAttempts] = useState({}); // { courseId: boolean }
  const [gradingBusy, setGradingBusy] = useState({}); // { attemptId: boolean }
  const [isFollowing, setIsFollowing] = useState(false);
  const [adminEnrollUserId, setAdminEnrollUserId] = useState("");
  const [joinLoading, setJoinLoading] = useState(null);
  const [enrollLoading, setEnrollLoading] = useState(null);
  const [permissions, setPermissions] = useState({ isMainAdmin: false, isAdmin: false, isEditor: false });
  const [roleUserId, setRoleUserId] = useState("");
  const [roleType, setRoleType] = useState("editor");
  const [roleLoading, setRoleLoading] = useState(false);
  const [enrolledPosts, setEnrolledPosts] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editCommunityOpen, setEditCommunityOpen] = useState(false);
  const [communityForm, setCommunityForm] = useState({ name: "", description: "", logo: "", coverImage: "" });
  const [savingCommunity, setSavingCommunity] = useState(false);
  const [editPostId, setEditPostId] = useState(null);
  const [postForm, setPostForm] = useState({ title: "", description: "", visibility: "public", accessCode: "", content: "" });
  const [savingPost, setSavingPost] = useState(false);
  const [imgbbUploading, setImgbbUploading] = useState({ logo: false, coverImage: false });

  // Post form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("text");
  const [visibility, setVisibility] = useState("public");
  const [accessCode, setAccessCode] = useState("");
  const [content, setContent] = useState("");
  const [chapters, setChapters] = useState([
    {
      title: "Chapter 1",
      videos: [""],
      exam: { type: "quiz", questions: [], passingScore: 0 },
    },
  ]);
  const [uploadingVideo, setUploadingVideo] = useState({}); // Track uploading state per video
  const [copiedPostId, setCopiedPostId] = useState(null); // Track which post link was copied

  const headers = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  const fetchCourseIdByPost = async (postId) => {
    try {
      const res = await axiosPublic.get(`/posts/${postId}/course`);
      return res.data?.success ? res.data.courseId : null;
    } catch {
      return null;
    }
  };

  const openCommunityEdit = () => {
    if (!permissions.isMainAdmin) return toast.error("Only owner can edit community");
    setEditCommunityOpen(true);
  };

  const handleImgbbUpload = async (file, field) => {
    if (!file) return;
    try {
      setImgbbUploading((p) => ({ ...p, [field]: true }));
      const apiKey = import.meta.env.VITE_IMAGE_HOSTING_KEY;
      if (!apiKey) {
        toast.error("Missing VITE_IMGBB_API_KEY env. Add it to your .env and restart.");
        setImgbbUploading((p) => ({ ...p, [field]: false }));
        return;
      }
      const data = await uploadImageToImgBB(file, { apiKey, name: `${field}_${Date.now()}` });
      const url = data?.url || data?.display_url;
      if (!url) throw new Error("imgbb response missing url");
      setCommunityForm((prev) => ({ ...prev, [field]: url }));
      toast.success("Image uploaded");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Image upload failed");
    } finally {
      setImgbbUploading((p) => ({ ...p, [field]: false }));
    }
  };

  const saveCommunityEdit = async () => {
    if (!token) return toast.error("Please login first");
    try {
      setSavingCommunity(true);
      const payload = {
        name: communityForm.name,
        description: communityForm.description,
        logo: communityForm.logo,
        coverImage: communityForm.coverImage,
      };
      const res = await axiosPublic.patch(`/communities/${communityId}`, payload, { headers });
      if (res.data?.success) {
        toast.success("Community updated");
        setCommunity(res.data.data);
        setEditCommunityOpen(false);
      }
    } catch (e) {
      console.error(e);
      const msg = e.response?.data?.message || "Failed to update community";
      toast.error(msg);
    } finally {
      setSavingCommunity(false);
    }
  };

  const openPostEdit = (p) => {
    if (!(permissions.isMainAdmin || permissions.isAdmin || permissions.isEditor)) {
      return toast.error("Insufficient permissions");
    }
    const base = {
      title: p.title || "",
      description: p.description || "",
      visibility: p.visibility || "public",
      accessCode: p.accessCode || "",
    };
    const ext = p.type !== "course" ? { content: Array.isArray(p.content) ? p.content.join(", ") : (p.content || "") } : {};
    setPostForm({ ...base, ...ext });
    setEditPostId(p._id);
  };

  const savePostEdit = async () => {
    if (!token) return toast.error("Please login first");
    if (!editPostId) return;
    try {
      setSavingPost(true);
      const payload = {
        title: postForm.title,
        description: postForm.description,
        visibility: postForm.visibility,
        accessCode: postForm.accessCode || null,
      };
      // Only include content for non-course
      const post = posts.find((pp) => pp._id === editPostId);
      if (post && post.type !== "course") {
        const urls = (postForm.content || "").split(",").map((s) => s.trim()).filter(Boolean);
        payload.content = Array.isArray(post.content) ? urls : postForm.content;
      }
      const res = await axiosPublic.put(`/posts/${editPostId}`, payload, { headers });
      if (res.data?.success) {
        toast.success("Post updated");
        setPosts((prev) => prev.map((p) => (p._id === editPostId ? { ...p, ...res.data.data } : p)));
        setEditPostId(null);
      }
    } catch (e) {
      console.error(e);
      const msg = e.response?.data?.message || "Failed to update post";
      toast.error(msg);
    } finally {
      setSavingPost(false);
    }
  };

  const deletePost = async (postId) => {
    if (!(permissions.isMainAdmin || permissions.isAdmin || permissions.isEditor)) {
      return toast.error("Insufficient permissions");
    }
    if (!confirm("Delete this post? This action cannot be undone.")) return;
    try {
      await axiosPublic.delete(`/posts/${postId}`, { headers });
      toast.success("Post deleted");
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (e) {
      console.error(e);
      const msg = e.response?.data?.message || "Failed to delete post";
      toast.error(msg);
    }
  };

  const loadAttempts = async (postId) => {
    try {
      const courseId = await fetchCourseIdByPost(postId);
      if (!courseId) return;
      setLoadingAttempts((prev) => ({ ...prev, [courseId]: true }));
      const res = await axiosPublic.get(`/courses/${courseId}/attempts?graded=false`, { headers });
      if (res.data?.success) {
        setAttemptsByCourse((prev) => ({ ...prev, [courseId]: res.data.data || [] }));
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load attempts');
    } finally {
      // clear all loading flags to avoid stale keys if courseId missing
      setLoadingAttempts((prev) => ({ ...prev }));
    }
  };

  const gradeAttempt = async (attemptId, score, feedback) => {
    try {
      setGradingBusy((prev) => ({ ...prev, [attemptId]: true }));
      const res = await axiosPublic.post(`/exams/attempts/${attemptId}/grade`, { score, feedback }, { headers });
      if (res.data?.success) {
        toast.success('Graded');
        // remove attempt from any course list it belongs to
        setAttemptsByCourse((prev) => {
          const next = { ...prev };
          for (const cid of Object.keys(next)) {
            next[cid] = (next[cid] || []).filter((a) => a._id !== attemptId);
          }
          return next;
        });
      }
    } catch (e) {
      console.error(e);
      const msg = e.response?.data?.message || 'Failed to grade attempt';
      toast.error(msg);
    } finally {
      setGradingBusy((prev) => ({ ...prev, [attemptId]: false }));
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const requests = [
        axiosPublic.get(`/communities/${communityId}`),
        axiosPublic.get(`/communities/${communityId}/posts`),
      ];
      if (token) {
        requests.push(
          axiosPublic.get(`/communities/${communityId}/permissions`, { headers })
        );
        requests.push(
          axiosPublic.get(`/communities/${communityId}/follow-status`, { headers })
        );
      }
      const responses = await Promise.all(requests);
      const cRes = responses[0];
      const pRes = responses[1];
      const permRes = responses[2];
      const followRes = responses[3];
      if (cRes.data?.success) setCommunity(cRes.data.data);
      if (cRes.data?.success) {
        const c = cRes.data.data;
        setCommunityForm({
          name: c.name || "",
          description: c.description || "",
          logo: c.logo || "",
          coverImage: c.coverImage || "",
        });
      }
      const loadedPosts = pRes.data?.success ? (pRes.data.data || []) : [];
      setPosts(loadedPosts);
      if (permRes?.data?.success) setPermissions(permRes.data.data || permissions);
      if (followRes?.data?.success) setIsFollowing(!!followRes.data.followed);

      if (token && Array.isArray(loadedPosts) && loadedPosts.length) {
        const coursePosts = loadedPosts.filter((p) => p.type === "course");
        if (coursePosts.length) {
          try {
            const mappings = await Promise.allSettled(
              coursePosts.map((p) => axiosPublic.get(`/posts/${p._id}/course`))
            );
            const checks = await Promise.allSettled(
              mappings.map((m, idx) => {
                if (m.status === "fulfilled" && m.value?.data?.courseId) {
                  const cid = m.value.data.courseId;
                  return axiosPublic.get(`/courses/${cid}/enrolled`, { headers }).then((r) => ({ r, postId: coursePosts[idx]._id }));
                }
                return Promise.resolve(null);
              })
            );
            const enrolledMap = {};
            checks.forEach((c) => {
              if (c && c.status === "fulfilled") {
                const { r, postId } = c.value || {};
                if (r?.data?.success && r.data.enrolled) {
                  enrolledMap[postId] = true;
                }
              }
            });
            if (Object.keys(enrolledMap).length) {
              setEnrolledPosts((prev) => ({ ...prev, ...enrolledMap }));
            }
          } catch {}
        }
        try {
          const likeChecks = await Promise.allSettled(
            loadedPosts.map((p) => axiosPublic.get(`/posts/${p._id}/liked`, { headers }))
          );
          const likedMap = {};
          likeChecks.forEach((c, idx) => {
            if (c.status === "fulfilled" && c.value?.data?.success && c.value.data.liked) {
              likedMap[loadedPosts[idx]._id] = true;
            }
          });
          if (Object.keys(likedMap).length) {
            setLikedPosts((prev) => ({ ...prev, ...likedMap }));
          }
        } catch {}
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load community");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (action) => {
    if (!token) return toast.error("Please login first");
    if (!roleUserId) return toast.error("Enter userId");
    try {
      setRoleLoading(true);
      const url = action === "add"
        ? `/communities/${communityId}/roles/add`
        : `/communities/${communityId}/roles/remove`;
      await axiosPublic.post(url, { userId: roleUserId, role: roleType }, { headers });
      toast.success(action === "add" ? "Role added" : "Role removed");
      setRoleUserId("");
      if (token) {
        try {
          const permRes = await axiosPublic.get(`/communities/${communityId}/permissions`, { headers });
          if (permRes?.data?.success) setPermissions(permRes.data.data || permissions);
        } catch {}
      }
    } catch (e) {
      console.error(e);
      toast.error("Role update failed");
    } finally {
      setRoleLoading(false);
    }
  };

  const handleJoinCourse = async (postId) => {
    if (!token) return toast.error("Please login first");
    try {
      setJoinLoading(postId);
      const mapping = await axiosPublic.get(`/posts/${postId}/course`);
      const courseId = mapping.data?.courseId;
      if (!courseId) throw new Error("Course not found");
      await axiosPublic.post(`/courses/${courseId}/enroll`, {}, { headers });
      toast.success("Enrolled successfully");
      setEnrolledPosts((prev) => ({ ...prev, [postId]: true }));
    } catch (e) {
      console.error(e);
      toast.error("Enroll failed");
    } finally {
      setJoinLoading(null);
    }
  };

  const handleAdminEnrollUser = async (postId) => {
    if (!token) return toast.error("Please login first");
    if (!adminEnrollUserId) return toast.error("Enter userId");
    try {
      setEnrollLoading(postId);
      const mapping = await axiosPublic.get(`/posts/${postId}/course`);
      const courseId = mapping.data?.courseId;
      if (!courseId) throw new Error("Course not found");
      await axiosPublic.post(
        `/courses/${courseId}/enroll-user`,
        { userId: adminEnrollUserId },
        { headers }
      );
      toast.success("User enrolled");
      setAdminEnrollUserId("");
    } catch (e) {
      console.error(e);
      toast.error("Admin enroll failed");
    } finally {
      setEnrollLoading(null);
    }
  };

  useEffect(() => {
    if (communityId) load();
  }, [communityId]);

  const handleLikeToggle = async (postId) => {
    if (!token) return toast.error("Please login first");
    try {
      const res = await axiosPublic.post(`/posts/${postId}/like`, {}, { headers });
      if (res.data?.success) {
        setLikedPosts((prev) => ({ ...prev, [postId]: res.data.liked }));
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? { ...p, likesCount: (p.likesCount || 0) + (res.data.liked ? 1 : -1) }
              : p
          )
        );
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update like");
    }
  };

  const handleFollowToggle = async () => {
    try {
      if (!token) {
        toast.error("Please login first");
        return;
      }
      const res = await axiosPublic.post(`/communities/${communityId}/follow`, {}, { headers });
      if (res.data?.success) {
        setIsFollowing(res.data.followed);
        setCommunity((prev) =>
          prev
            ? {
                ...prev,
                membersCount: (prev.membersCount || 0) + (res.data.followed ? 1 : -1),
              }
            : prev
        );
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update follow");
    }
  };

  const handleCopyPostLink = async (postId, postType) => {
    try {
      let shareableUrl = `${window.location.origin}/community/${communityId}`;
      
      // If it's a course post, get the course ID and create a direct link to the course
      if (postType === "course") {
        const courseId = await fetchCourseIdByPost(postId);
        if (courseId) {
          shareableUrl = `${window.location.origin}/course/${courseId}`;
        }
      }
      // For other posts (text/video), share the community link where the post is visible
      
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedPostId(postId);
      toast.success("Link copied to clipboard! Share it with others.");
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedPostId(null);
      }, 2000);
    } catch (e) {
      console.error(e);
      toast.error("Failed to copy link");
    }
  };

  const addChapter = () => {
    setChapters((prev) => [
      ...prev,
      { title: `Chapter ${prev.length + 1}`, videos: [""], exam: { type: "quiz", questions: [], passingScore: 0 } },
    ]);
  };

  const removeChapter = (idx) => {
    setChapters((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateChapterField = (idx, field, value) => {
    setChapters((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const updateChapterVideo = (cIdx, vIdx, value) => {
    setChapters((prev) => {
      const copy = [...prev];
      const vids = [...(copy[cIdx].videos || [])];
      vids[vIdx] = value;
      copy[cIdx] = { ...copy[cIdx], videos: vids };
      return copy;
    });
  };

  const addChapterVideo = (cIdx) => {
    setChapters((prev) => {
      const copy = [...prev];
      const vids = [...(copy[cIdx].videos || [])];
      vids.push("");
      copy[cIdx] = { ...copy[cIdx], videos: vids };
      return copy;
    });
  };

  const removeChapterVideo = (cIdx, vIdx) => {
    setChapters((prev) => {
      const copy = [...prev];
      const vids = (copy[cIdx].videos || []).filter((_, i) => i !== vIdx);
      copy[cIdx] = { ...copy[cIdx], videos: vids };
      return copy;
    });
  };

  const handleVideoUpload = async (e, cIdx, vIdx) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    // Validate file size (200MB)
    if (file.size > 200 * 1024 * 1024) {
      toast.error("Video size must be less than 200MB");
      return;
    }

    const uploadKey = `${cIdx}-${vIdx}`;
    setUploadingVideo((prev) => ({ ...prev, [uploadKey]: true }));

    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      if (!cloudName || !uploadPreset) {
        throw new Error("Missing Cloudinary env vars: VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET");
      }
      const { secure_url } = await uploadVideoToCloudinaryUnsigned(file, {
        cloudName,
        uploadPreset,
        folder: "courseVideos",
      });
      updateChapterVideo(cIdx, vIdx, secure_url);
      toast.success("Video uploaded successfully!");
    } catch (error) {
      console.error("Video upload error:", error);
      toast.error("Failed to upload video");
    } finally {
      setUploadingVideo((prev) => ({ ...prev, [uploadKey]: false }));
    }
  };

  const addQuizQuestion = (cIdx) => {
    setChapters((prev) => {
      const copy = [...prev];
      const exam = copy[cIdx].exam || { type: "quiz", questions: [], passingScore: 0 };
      const qs = [...(exam.questions || [])];
      qs.push({ question: "", options: ["", "", "", ""], answer: "" });
      copy[cIdx] = { ...copy[cIdx], exam: { ...exam, questions: qs } };
      return copy;
    });
  };

  const removeQuizQuestion = (cIdx, qIdx) => {
    setChapters((prev) => {
      const copy = [...prev];
      const exam = { ...(copy[cIdx].exam || { type: "quiz", questions: [], passingScore: 0 }) };
      const qs = (exam.questions || []).filter((_, i) => i !== qIdx);
      exam.questions = qs;
      copy[cIdx] = { ...copy[cIdx], exam };
      return copy;
    });
  };

  const updateQuestionField = (cIdx, qIdx, field, value) => {
    setChapters((prev) => {
      const copy = [...prev];
      const exam = { ...(copy[cIdx].exam || { type: "quiz", questions: [], passingScore: 0 }) };
      const qs = [...(exam.questions || [])];
      qs[qIdx] = { ...qs[qIdx], [field]: value };
      exam.questions = qs;
      copy[cIdx] = { ...copy[cIdx], exam };
      return copy;
    });
  };

  const updateQuestionOption = (cIdx, qIdx, oIdx, value) => {
    setChapters((prev) => {
      const copy = [...prev];
      const exam = { ...(copy[cIdx].exam || { type: "quiz", questions: [], passingScore: 0 }) };
      const qs = [...(exam.questions || [])];
      const opts = [...(qs[qIdx].options || [])];
      opts[oIdx] = value;
      qs[qIdx] = { ...qs[qIdx], options: opts };
      exam.questions = qs;
      copy[cIdx] = { ...copy[cIdx], exam };
      return copy;
    });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Please login first");

    try {
      let payload = { title, description, type, visibility, accessCode: accessCode || null };
      if (type === "text") {
        payload.content = content;
      } else if (type === "video") {
        const urls = content
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        payload.content = urls;
      } else if (type === "course") {
        payload.chapters = chapters.map((c) => ({
          title: c.title,
          videos: (c.videos || []).filter(Boolean),
          exam: c.exam?.type ? c.exam : undefined,
        }));
      }
      const res = await axiosPublic.post(`/communities/${communityId}/posts`, payload, { headers });
      if (res.data?.success) {
        toast.success("Post created");
        setTitle("");
        setDescription("");
        setType("text");
        setVisibility("public");
        setAccessCode("");
        setContent("");
        setChapters([
          { title: "Chapter 1", videos: [""], exam: { type: "quiz", questions: [], passingScore: 0 } },
        ]);
        setShowCreatePost(false);
        load();
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to create post");
    }
  };

  const getTypeIcon = (postType) => {
    switch (postType) {
      case "video":
        return <Video size={16} className="text-purple-600" />;
      case "course":
        return <GraduationCap size={16} className="text-blue-600" />;
      default:
        return <FileText size={16} className="text-green-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 font-medium">Loading community...</p>
            </div>
          </div>
        ) : !community ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Users size={40} className="text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg font-medium">Community not found</p>
            </div>
          </div>
        ) : (
          <>
            {/* Community Header */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              {/* Cover Image */}
              <div className="relative h-48 sm:h-64 lg:h-80 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
                {community.coverImage && (
                  <img 
                    src={community.coverImage} 
                    alt={community.name} 
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
              
              {/* Community Info */}
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  {/* Logo */}
                  {community.logo && (
                    <div className="shrink-0 -mt-16 sm:-mt-20">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white">
                        <img 
                          src={community.logo} 
                          alt={community.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                      {community.name}
                    </h1>
                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4">
                      {community.description}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-indigo-600" />
                        <span className="font-medium text-gray-700">
                          {community.membersCount || 0} members
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Owner Actions and Follow Button */}
                  <div className="shrink-0 w-full sm:w-auto">
                    {permissions.isMainAdmin && (
                      <button
                        onClick={openCommunityEdit}
                        className="w-full sm:w-auto mb-3 sm:mb-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 shadow-md"
                      >
                        <span className="inline-flex items-center gap-2"><Edit size={18}/> Edit Community</span>
                      </button>
                    )}
                    <button 
                      onClick={handleFollowToggle} 
                      className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md ${
                        isFollowing 
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow Community"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Create Post Button/Section */}
            {(permissions.isMainAdmin || permissions.isAdmin || permissions.isEditor) && (
              <div className="mb-8">
                {!showCreatePost ? (
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="w-full bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus size={24} className="text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">Create a new post</h3>
                        <p className="text-gray-500 text-sm">Share content with your community</p>
                      </div>
                      <ChevronDown size={24} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </button>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Create Post</h2>
                      <button
                        onClick={() => setShowCreatePost(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X size={24} className="text-gray-500" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleCreatePost} className="space-y-6">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Post Title</label>
                        <input 
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none" 
                          value={title} 
                          onChange={(e) => setTitle(e.target.value)} 
                          placeholder="Enter a compelling title..."
                          required 
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea 
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none resize-none" 
                          rows={3} 
                          value={description} 
                          onChange={(e) => setDescription(e.target.value)} 
                          placeholder="Add a brief description (optional)"
                        />
                      </div>

                      {/* Type, Visibility, Access Code */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Content Type</label>
                          <select 
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-white" 
                            value={type} 
                            onChange={(e) => setType(e.target.value)}
                          >
                            <option value="text">📝 Text</option>
                            <option value="video">🎥 Video</option>
                            <option value="course">🎓 Course</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Visibility</label>
                          <select 
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-white" 
                            value={visibility} 
                            onChange={(e) => setVisibility(e.target.value)}
                          >
                            <option value="public">🌍 Public</option>
                            <option value="private">🔒 Private</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Access Code</label>
                          <input 
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none" 
                            value={accessCode} 
                            onChange={(e) => setAccessCode(e.target.value)} 
                            placeholder="Optional"
                          />
                        </div>
                      </div>

                      {/* Content based on type */}
                      {type !== "course" ? (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {type === "text" ? "Content" : "Video URLs (comma-separated)"}
                          </label>
                          <textarea 
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none resize-none" 
                            rows={type === "text" ? 6 : 4} 
                            value={content} 
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={type === "text" ? "Write your content here..." : "https://youtube.com/..., https://vimeo.com/..."}
                          />
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Course Chapters</h3>
                            <button 
                              type="button" 
                              onClick={addChapter} 
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium transition-colors"
                            >
                              <Plus size={18} />
                              Add Chapter
                            </button>
                          </div>
                          
                          {chapters.map((ch, cIdx) => (
                            <div key={cIdx} className="border-2 border-gray-200 rounded-2xl p-6 space-y-4 bg-gray-50">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-gray-900">Chapter {cIdx + 1}</h4>
                                {chapters.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeChapter(cIdx)}
                                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                )}
                              </div>
                              
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Chapter Title</label>
                                <input 
                                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-white" 
                                  value={ch.title} 
                                  onChange={(e) => updateChapterField(cIdx, "title", e.target.value)} 
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Videos</label>
                                <div className="space-y-2">
                                  {ch.videos?.map((v, vIdx) => {
                                    const uploadKey = `${cIdx}-${vIdx}`;
                                    const isUploading = uploadingVideo[uploadKey];
                                    
                                    return (
                                      <div key={vIdx} className="flex gap-2">
                                        <input 
                                          className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-white" 
                                          placeholder={`Video URL ${vIdx + 1} or upload file`} 
                                          value={v} 
                                          onChange={(e) => updateChapterVideo(cIdx, vIdx, e.target.value)} 
                                        />
                                        
                                        {/* Hidden file input */}
                                        <input
                                          type="file"
                                          accept="video/*"
                                          onChange={(e) => handleVideoUpload(e, cIdx, vIdx)}
                                          className="hidden"
                                          id={`video-upload-${cIdx}-${vIdx}`}
                                          disabled={isUploading}
                                        />
                                        
                                        {/* Upload button */}
                                        <label
                                          htmlFor={`video-upload-${cIdx}-${vIdx}`}
                                          className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-2 ${
                                            isUploading
                                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                              : "bg-indigo-500 text-white hover:bg-indigo-600"
                                          }`}
                                        >
                                          {isUploading ? (
                                            <>
                                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                              <span className="text-sm">Uploading...</span>
                                            </>
                                          ) : (
                                            <>
                                              <Video size={18} />
                                              <span className="text-sm">Upload</span>
                                            </>
                                          )}
                                        </label>
                                        
                                        {ch.videos.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => removeChapterVideo(cIdx, vIdx)}
                                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                          >
                                            <X size={20} />
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })}
                                  <button 
                                    type="button" 
                                    onClick={() => addChapterVideo(cIdx)} 
                                    className="w-full px-4 py-2 rounded-lg bg-white border-2 border-dashed border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 font-medium transition-colors"
                                  >
                                    + Add Video
                                  </button>
                                </div>
                              </div>
                              
                              <div className="border-t-2 border-gray-200 pt-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <label className="block text-sm font-semibold text-gray-700">Exam Type</label>
                                  <select 
                                    className="border-2 border-gray-200 rounded-lg px-3 py-1 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-white text-sm" 
                                    value={ch.exam?.type || "quiz"} 
                                    onChange={(e) => updateChapterField(cIdx, "exam", { ...(ch.exam || {}), type: e.target.value })}
                                  >
                                    <option value="quiz">Quiz</option>
                                    <option value="written">Written</option>
                                    <option value="speaking">Speaking</option>
                                  </select>
                                </div>
                                
                                {/* Common Passing Score for all exam types */}
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">Passing Score (%)</label>
                                  <input 
                                    type="number" 
                                    min={0}
                                    max={100}
                                    className="w-full sm:w-48 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-white" 
                                    value={ch.exam?.passingScore || 0} 
                                    onChange={(e) => updateChapterField(cIdx, "exam", { ...(ch.exam || {}), passingScore: Number(e.target.value || 0) })} 
                                  />
                                </div>

                                {ch.exam?.type === "quiz" && (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h5 className="font-semibold text-gray-900">Quiz Questions</h5>
                                      <button 
                                        type="button" 
                                        onClick={() => addQuizQuestion(cIdx)} 
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                                      >
                                        <Plus size={16} />
                                        Add Question
                                      </button>
                                    </div>
                                    
                                    {ch.exam?.questions?.map((q, qIdx) => (
                                      <div key={qIdx} className="rounded-xl border-2 border-gray-200 p-4 bg-white space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                          <span className="text-sm font-semibold text-gray-700">Question {qIdx + 1}</span>
                                          <button
                                            type="button"
                                            onClick={() => removeQuizQuestion(cIdx, qIdx)}
                                            className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                        <input 
                                          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm" 
                                          placeholder="Enter your question" 
                                          value={q.question} 
                                          onChange={(e) => updateQuestionField(cIdx, qIdx, "question", e.target.value)} 
                                        />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {q.options?.map((opt, oIdx) => (
                                            <input 
                                              key={oIdx} 
                                              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm" 
                                              placeholder={`Option ${oIdx + 1}`} 
                                              value={opt} 
                                              onChange={(e) => updateQuestionOption(cIdx, qIdx, oIdx, e.target.value)} 
                                            />
                                          ))}
                                        </div>
                                        <input 
                                          className="w-full border-2 border-green-200 bg-green-50 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none text-sm" 
                                          placeholder="Correct answer (must match an option exactly)" 
                                          value={q.answer} 
                                          onChange={(e) => updateQuestionField(cIdx, qIdx, "answer", e.target.value)} 
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Written Exam Questions */}
                                {ch.exam?.type === "written" && (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h5 className="font-semibold text-gray-900">Written Questions</h5>
                                      <button 
                                        type="button" 
                                        onClick={() => addQuizQuestion(cIdx)} 
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                                      >
                                        <Plus size={16} />
                                        Add Question
                                      </button>
                                    </div>
                                    
                                    {ch.exam?.questions?.map((q, qIdx) => (
                                      <div key={qIdx} className="rounded-xl border-2 border-gray-200 p-4 bg-white space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                          <span className="text-sm font-semibold text-gray-700">Question {qIdx + 1}</span>
                                          <button
                                            type="button"
                                            onClick={() => removeQuizQuestion(cIdx, qIdx)}
                                            className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                        <textarea 
                                          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm resize-none" 
                                          placeholder="Enter your question here..." 
                                          rows={3}
                                          value={q.question} 
                                          onChange={(e) => updateQuestionField(cIdx, qIdx, "question", e.target.value)} 
                                        />
                                        <p className="text-xs text-gray-500">Students will write their answers in a text box</p>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Speaking Exam Questions */}
                                {ch.exam?.type === "speaking" && (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h5 className="font-semibold text-gray-900">Speaking Questions</h5>
                                      <button 
                                        type="button" 
                                        onClick={() => addQuizQuestion(cIdx)} 
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                                      >
                                        <Plus size={16} />
                                        Add Question
                                      </button>
                                    </div>
                                    
                                    {ch.exam?.questions?.map((q, qIdx) => (
                                      <div key={qIdx} className="rounded-xl border-2 border-gray-200 p-4 bg-white space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                          <span className="text-sm font-semibold text-gray-700">Question {qIdx + 1}</span>
                                          <button
                                            type="button"
                                            onClick={() => removeQuizQuestion(cIdx, qIdx)}
                                            className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                        <textarea 
                                          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm resize-none" 
                                          placeholder="Enter your speaking prompt/question..." 
                                          rows={3}
                                          value={q.question} 
                                          onChange={(e) => updateQuestionField(cIdx, qIdx, "question", e.target.value)} 
                                        />
                                        <p className="text-xs text-gray-500">🎤 Students will record audio responses</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <button 
                          type="submit" 
                          className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95 shadow-md"
                        >
                          Create Post
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCreatePost(false)}
                          className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Posts Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Community Posts</h2>
                <span className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold">
                  {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
                </span>
              </div>
              
              {posts.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={40} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-500">Be the first to share something with this community!</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {posts.map((p) => (
                    <div 
                      key={p._id} 
                      className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="p-6 sm:p-8">
                        {/* Post Header */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-xl font-bold text-gray-900">{p.title}</h3>
                              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                                {getTypeIcon(p.type)}
                                <span className="text-xs font-semibold capitalize">{p.type}</span>
                              </div>
                              {p.visibility === "private" && (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 border border-amber-200">
                                  <Lock size={12} className="text-amber-600" />
                                  <span className="text-xs font-semibold text-amber-700">Private</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar size={14} />
                              <span>{new Date(p.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center gap-2">
                            {/* Share/Copy Link Button - Visible to all */}
                            <button
                              onClick={() => handleCopyPostLink(p._id, p.type)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
                              title="Copy shareable link"
                            >
                              {copiedPostId === p._id ? (
                                <>
                                  <Check size={16}/> Copied!
                                </>
                              ) : (
                                <>
                                  <Share2 size={16}/> Share
                                </>
                              )}
                            </button>
                            {(permissions.isMainAdmin || permissions.isAdmin || permissions.isEditor) && (
                              <>
                                <button
                                  onClick={() => openPostEdit(p)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                >
                                  <Edit size={16}/> Edit
                                </button>
                                <button
                                  onClick={() => deletePost(p._id)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                                >
                                  <Trash2 size={16}/> Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {p.description && (
                          <p className="text-gray-600 mb-4 leading-relaxed">{p.description}</p>
                        )}

                        {/* Content Display */}
                        {p.type === "text" && p.content && (
                          <div className="mt-4 p-5 bg-gray-50 rounded-xl border border-gray-200">
                            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{p.content}</p>
                          </div>
                        )}

                        {p.type === "video" && Array.isArray(p.content) && p.content.length > 0 && (
                          <div className="mt-4 space-y-4">
                            {p.content.map((url, i) => {
                              const isYoutube = /youtube\.com|youtu\.be/.test(url);
                              const isVimeo = /vimeo\.com/.test(url);
                              let embedUrl = url;
                              if (isYoutube) {
                                const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
                                if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
                              } else if (isVimeo) {
                                const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
                                if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}`;
                              }
                              return (
                                <div key={i} className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                                  {isYoutube || isVimeo ? (
                                    <iframe
                                      src={embedUrl}
                                      className="w-full aspect-video"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      title={`Video ${i + 1}`}
                                    />
                                  ) : (
                                    <video controls className="w-full aspect-video bg-black">
                                      <source src={url} />
                                      Your browser does not support the video tag.
                                    </video>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {p.type === "course" && (
                          <div className="mt-4 space-y-3">
                            <div className="flex flex-wrap gap-3">
                              {enrolledPosts[p._id] ? (
                                <button
                                  onClick={async () => {
                                    try {
                                      const mapping = await axiosPublic.get(`/posts/${p._id}/course`);
                                      const courseId = mapping.data?.courseId;
                                      if (courseId) {
                                        window.location.href = `/course/${courseId}`;
                                      } else {
                                        toast.error("Course not found");
                                      }
                                    } catch (e) {
                                      toast.error("Failed to open course");
                                    }
                                  }}
                                  className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center gap-2"
                                >
                                  <GraduationCap size={20} />
                                  Open Course
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleJoinCourse(p._id)}
                                  disabled={joinLoading === p._id}
                                  className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center gap-2"
                                >
                                  <GraduationCap size={20} />
                                  {joinLoading === p._id ? "Enrolling..." : "Enroll in Course"}
                                </button>
                              )}
                              
                              {/* Student Dashboard Button - Only for community owner (mainAdmin) */}
                              {permissions.isMainAdmin && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const mapping = await axiosPublic.get(`/posts/${p._id}/course`);
                                      const courseId = mapping.data?.courseId;
                                      if (courseId) {
                                        window.location.href = `/course/${courseId}/student-dashboard`;
                                      } else {
                                        toast.error("Course not found");
                                      }
                                    } catch (e) {
                                      toast.error("Failed to open student dashboard");
                                    }
                                  }}
                                  className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center gap-2"
                                >
                                  <BarChart3 size={20} />
                                  Student Dashboard
                                </button>
                              )}
                            </div>
                            

                            {(permissions.isMainAdmin || permissions.isAdmin) && p.type === 'course' && (
                              <div className="mt-4 border-2 border-blue-200 rounded-xl p-5 bg-gradient-to-br from-blue-50 to-indigo-50">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-bold text-blue-900">Owner/Admin: Grade Attempts</h4>
                                  <button
                                    type="button"
                                    onClick={() => loadAttempts(p._id)}
                                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                                  >
                                    Load Pending
                                  </button>
                                </div>

                                {/* Attempts list */}
                                {(() => {
                                  const courseId = (p.courseId || null); // may be absent in client; loadAttempts handles mapping
                                  const attempts = Object.values(attemptsByCourse)[0];
                                  const items = Array.isArray(attempts) ? attempts : [];
                                  if (!items.length) {
                                    return <p className="text-sm text-blue-800">No pending attempts loaded yet.</p>;
                                  }
                                  return (
                                    <div className="space-y-3">
                                      {items.map((att) => (
                                        <div key={att._id} className="bg-white border border-blue-200 rounded-lg p-4">
                                          <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div>
                                              <p className="text-sm font-semibold text-gray-900">{att.exam?.type?.toUpperCase()} attempt</p>
                                              <p className="text-xs text-gray-600">Student: {att.user?.name || att.user?.number}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                placeholder="Score %"
                                                className="w-24 border-2 border-gray-200 rounded-lg px-3 py-1 text-sm"
                                                onChange={(e) => (att.__score = e.target.value)}
                                              />
                                              <button
                                                onClick={() => gradeAttempt(att._id, Number(att.__score || 0), att.__feedback || '')}
                                                disabled={gradingBusy[att._id]}
                                                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60"
                                              >
                                                {gradingBusy[att._id] ? 'Grading...' : 'Submit Grade'}
                                              </button>
                                            </div>
                                          </div>
                                          {att.type === 'written' && Array.isArray(att.answers) && (
                                            <div className="mt-3 bg-gray-50 border border-gray-200 rounded p-3">
                                              <p className="text-xs font-semibold text-gray-700 mb-2">Answers</p>
                                              {att.answers.map((a, i) => (
                                                <div key={i} className="text-xs text-gray-700 mb-1">
                                                  <span className="font-semibold">Q{(a.questionIndex ?? i) + 1}:</span> {a.answer}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                          {att.type === 'speaking' && att.audioUrl && (
                                            <div className="mt-3 bg-gray-50 border border-gray-200 rounded p-3">
                                              <p className="text-xs font-semibold text-gray-700 mb-2">Audio Response</p>
                                              <audio controls src={att.audioUrl} className="w-full" />
                                            </div>
                                          )}
                                          <div className="mt-3">
                                            <textarea
                                              placeholder="Feedback (optional)"
                                              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm"
                                              rows={2}
                                              onChange={(e) => (att.__feedback = e.target.value)}
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Like Button */}
                        <div className="mt-6 pt-5 border-t border-gray-200">
                          <button
                            onClick={() => handleLikeToggle(p._id)}
                            className="group flex items-center gap-3 text-gray-600 hover:text-red-500 transition-all"
                          >
                            <div className="relative">
                              <Heart
                                size={24}
                                fill={likedPosts[p._id] ? "currentColor" : "none"}
                                className={`transition-all duration-200 ${
                                  likedPosts[p._id] 
                                    ? "text-red-500 scale-110" 
                                    : "group-hover:scale-110"
                                }`}
                              />
                              {likedPosts[p._id] && (
                                <div className="absolute inset-0 animate-ping">
                                  <Heart size={24} className="text-red-400 opacity-75" />
                                </div>
                              )}
                            </div>
                            <span className="font-semibold text-base">
                              {p.likesCount || 0} {(p.likesCount || 0) === 1 ? 'Like' : 'Likes'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {editCommunityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditCommunityOpen(false)} />
          <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl border border-gray-200">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Edit Community</h3>
                <button onClick={() => setEditCommunityOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                  <input
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    value={communityForm.name}
                    onChange={(e) => setCommunityForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Community name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                    value={communityForm.description}
                    onChange={(e) => setCommunityForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Short description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Logo</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                      {communityForm.logo ? (
                        <img src={communityForm.logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-gray-500">No image</span>
                      )}
                    </div>
                    <label className={`px-4 py-2.5 rounded-xl font-semibold text-sm cursor-pointer inline-flex items-center gap-2 ${imgbbUploading.logo ? 'bg-gray-200 text-gray-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                      {imgbbUploading.logo && <span className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />}
                      <span>{imgbbUploading.logo ? 'Uploading...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={imgbbUploading.logo}
                        onChange={(e) => handleImgbbUpload(e.target.files?.[0], 'logo')}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cover Image</label>
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                      {communityForm.coverImage ? (
                        <img src={communityForm.coverImage} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-gray-500">No image</span>
                      )}
                    </div>
                    <label className={`px-4 py-2.5 rounded-xl font-semibold text-sm cursor-pointer inline-flex items-center gap-2 ${imgbbUploading.coverImage ? 'bg-gray-200 text-gray-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                      {imgbbUploading.coverImage && <span className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />}
                      <span>{imgbbUploading.coverImage ? 'Uploading...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={imgbbUploading.coverImage}
                        onChange={(e) => handleImgbbUpload(e.target.files?.[0], 'coverImage')}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setEditCommunityOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCommunityEdit}
                  disabled={savingCommunity}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
                >
                  {savingCommunity ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditPostId(null)} />
          <div className="relative z-10 w-full max-w-xl mx-4 bg-white rounded-2xl shadow-2xl border border-gray-200">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Edit Post</h3>
                <button onClick={() => setEditPostId(null)} className="p-2 rounded-lg hover:bg-gray-100">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {(() => {
                const editingPost = posts.find((pp) => pp._id === editPostId);
                const isCourse = editingPost?.type === 'course';
                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                      <input
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                        value={postForm.title}
                        onChange={(e) => setPostForm((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Post title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                      <textarea
                        rows={3}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                        value={postForm.description}
                        onChange={(e) => setPostForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Short description"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Visibility</label>
                        <select
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white"
                          value={postForm.visibility}
                          onChange={(e) => setPostForm((prev) => ({ ...prev, visibility: e.target.value }))}
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Access Code</label>
                        <input
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                          value={postForm.accessCode}
                          onChange={(e) => setPostForm((prev) => ({ ...prev, accessCode: e.target.value }))}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    {!isCourse && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Content</label>
                        <textarea
                          rows={editingPost?.type === 'text' ? 6 : 4}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                          value={postForm.content}
                          onChange={(e) => setPostForm((prev) => ({ ...prev, content: e.target.value }))}
                          placeholder={editingPost?.type === 'video' ? 'Comma-separated video URLs' : 'Write your content'}
                        />
                        {editingPost?.type === 'video' && (
                          <p className="text-xs text-gray-500 mt-1">For multiple videos, separate URLs with commas.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setEditPostId(null)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={savePostEdit}
                  disabled={savingPost}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
                >
                  {savingPost ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DownNav />
    </div>
  );
}

export default CommunityDetail;