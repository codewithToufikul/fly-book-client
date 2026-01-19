import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import usePublicAxios from "../../Hooks/usePublicAxios";
import Navbar from "../../Components/Navbar/Navbar";
import DownNav from "../../Components/DownNav/DownNav";
import toast from "react-hot-toast";
import { PlayCircle, CheckCircle, Lock, Award, ChevronRight, BookOpen, Clock, Trophy } from "lucide-react";
import * as faceapi from "face-api.js";

const CoursePlayer = () => {
  const { courseId } = useParams();
  const axiosPublic = usePublicAxios();
  const token = localStorage.getItem("token");
  const headers = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  const [loading, setLoading] = useState(true);
  const [outline, setOutline] = useState(null);
  const [progress, setProgress] = useState({ completedLessons: [], attempts: [] });
  const [activeExam, setActiveExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  // Listening exam recording state
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioUrl, setAudioUrl] = useState("");
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [active, setActive] = useState({ chapterIdx: 0, lessonIdx: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Proctoring state
  const [proctorEnabled, setProctorEnabled] = useState(false);
  const [faceModelReady, setFaceModelReady] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [violationCount, setViolationCount] = useState(0);
  const [violations, setViolations] = useState([]);
  const maxViolations = 3;
  const [proctorStartedAt, setProctorStartedAt] = useState(null);
  const [proctorEndedAt, setProctorEndedAt] = useState(null);

  // Media refs
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const detectIntervalRef = useRef(null);
  const audioIntervalRef = useRef(null);
  const noFaceSinceRef = useRef(null);
  const multiFaceSinceRef = useRef(null);
  const loudSinceRef = useRef(null);

  const loadData = async () => {
    if (!token) {
      toast.error("Please login first");
      return;
    }
    setLoading(true);
    try {
      const [oRes, pRes] = await Promise.all([
        axiosPublic.get(`/courses/${courseId}/outline`, { headers }),
        axiosPublic.get(`/courses/${courseId}/progress`, { headers }),
      ]);
      if (oRes.data?.success) setOutline(oRes.data.data);
      if (pRes.data?.success) setProgress(pRes.data.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) loadData();
    // Preload face model
    (async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        setFaceModelReady(true);
      } catch (err) {
        console.warn('Face model load failed:', err);
      }
    })();
  }, [courseId]);

  useEffect(() => {
    if (!outline) return;
    const compl = new Set((progress.completedLessons || []).map((x) => x.toString()));
    let found = null;
    outline.outline?.forEach((ch, ci) => {
      ch.lessons.forEach((l, li) => {
        if (!found && !compl.has(l.lessonId.toString())) found = { chapterIdx: ci, lessonIdx: li };
      });
    });
    if (found) setActive(found);
    else setActive({ chapterIdx: 0, lessonIdx: 0 });
  }, [outline, progress]);

  const isLessonCompleted = (lessonId) => {
    const ids = (progress.completedLessons || []).map((x) => x.toString());
    return ids.includes(lessonId.toString());
  };

  const handleCompleteLesson = async (lessonId) => {
    try {
      await axiosPublic.post(`/courses/${courseId}/lessons/${lessonId}/complete`, {}, { headers });
      toast.success("Marked complete");
      await loadData(); // Wait for data to reload
    } catch (e) {
      console.error(e);
      toast.error("Failed to mark complete");
    }
  };

  const goNext = () => {
    if (!outline) return;
    const chapters = outline.outline || [];
    const { chapterIdx, lessonIdx } = active;
    const ch = chapters[chapterIdx];
    if (!ch) return;
    const currentLesson = ch.lessons[lessonIdx];
    if (!isLessonCompleted(currentLesson.lessonId)) {
      toast.error("Mark this lesson complete first");
      return;
    }
    if (lessonIdx + 1 < ch.lessons.length) {
      setActive({ chapterIdx, lessonIdx: lessonIdx + 1 });
      return;
    }
    const allLessonsDone = ch.lessons.every((l) => isLessonCompleted(l.lessonId));
    if (ch.exam && allLessonsDone) {
      openExam(ch.exam.examId);
      return;
    }
    if (chapterIdx + 1 < chapters.length) {
      setActive({ chapterIdx: chapterIdx + 1, lessonIdx: 0 });
      return;
    }
    toast.success("Course content completed!");
  };

  const getLatestAttemptPassed = (examId) => {
    const attempts = progress.attempts || [];
    const relevant = attempts.filter((a) => {
      const attemptExamId = a.examId?.toString() || a.exam?.toString();
      return attemptExamId === examId.toString();
    });
    if (relevant.length === 0) return false;
    relevant.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const latestAttempt = relevant[0];
    
    // Check if graded (for written/listening exams)
    if (latestAttempt.graded === false) {
      return false;
    }
    
    return !!latestAttempt?.passed;
  };

  const allLessonsCompletedCourse = () => {
    if (!outline) return false;
    const compl = new Set((progress.completedLessons || []).map((x) => x.toString()));
    return (outline.outline || []).every((ch) => ch.lessons.every((l) => compl.has(l.lessonId.toString())));
  };

  const allExamsPassedCourse = () => {
    if (!outline) return false;
    return (outline.outline || []).every((ch) => {
      if (!ch.exam) return true;
      return getLatestAttemptPassed(ch.exam.examId);
    });
  };

  const openExam = async (examId) => {
    try {
      const res = await axiosPublic.get(`/exams/${examId}`, { headers });
      if (res.data?.success) {
        setActiveExam(res.data.data);
        setAnswers({});
        // Start proctoring when exam opens
        await startProctoring();
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load exam");
    }
  };

  const addViolation = (type, detail = {}) => {
    setViolations((prev) => [...prev, { type, at: Date.now(), detail }]);
    setViolationCount((c) => c + 1);
    toast.error(`Proctoring violation: ${type}`);
  };

  const startProctoring = async () => {
    try {
      // Require camera + mic
      const cam = await navigator.mediaDevices.getUserMedia({ video: true });
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      cameraStreamRef.current = cam;
      micStreamRef.current = mic;
      setProctorEnabled(true);
      setProctorStartedAt(Date.now());
      if (videoRef.current) {
        videoRef.current.srcObject = cam;
        await videoRef.current.play().catch(() => {});
      }

      // Face detection loop
      if (faceModelReady) {
        detectIntervalRef.current = setInterval(async () => {
          try {
            if (!videoRef.current) return;
            const detections = await faceapi.detectAllFaces(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 })
            );
            const count = detections?.length || 0;
            setFaceCount(count);
            const now = Date.now();
            // No face rule (>3s)
            if (count === 0) {
              if (!noFaceSinceRef.current) noFaceSinceRef.current = now;
              if (now - noFaceSinceRef.current > 3000) {
                addViolation('no_face');
                noFaceSinceRef.current = null;
              }
            } else {
              noFaceSinceRef.current = null;
            }
            // Multi-face rule (>=2 for >1s)
            if (count >= 2) {
              if (!multiFaceSinceRef.current) multiFaceSinceRef.current = now;
              if (now - multiFaceSinceRef.current > 1000) {
                addViolation('multi_face', { count });
                multiFaceSinceRef.current = null;
              }
            } else {
              multiFaceSinceRef.current = null;
            }
          } catch {}
        }, 400);
      }

      // Audio level monitor (RMS)
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const src = audioCtxRef.current.createMediaStreamSource(mic);
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      src.connect(analyserRef.current);
      const data = new Uint8Array(analyserRef.current.fftSize);
      audioIntervalRef.current = setInterval(() => {
        try {
          analyserRef.current.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128; // -1..1
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length); // 0..~0.7
          setAudioLevel(rms);
          const now = Date.now();
          const threshold = 0.1; // tune as needed
          if (rms > threshold) {
            if (!loudSinceRef.current) loudSinceRef.current = now;
            if (now - loudSinceRef.current > 5000) {
              addViolation('speech_detected', { rms });
              loudSinceRef.current = null;
            }
          } else {
            loudSinceRef.current = null;
          }
        } catch {}
      }, 250);

      // Visibility/blur monitoring
      const onHidden = () => {
        const t = setTimeout(() => addViolation('tab_hidden_or_blur'), 3000);
        (onHidden)._t = t;
      };
      const onVisible = () => {
        if ((onHidden)._t) clearTimeout((onHidden)._t);
      };
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') onHidden();
        else onVisible();
      });
      window.addEventListener('blur', onHidden);
      window.addEventListener('focus', onVisible);
    } catch (err) {
      console.error(err);
      toast.error('Camera & Microphone are required for the exam');
      setProctorEnabled(false);
    }
  };

  const stopProctoring = () => {
    setProctorEndedAt(Date.now());
    // Stop intervals
    if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    detectIntervalRef.current = null;
    audioIntervalRef.current = null;
    // Stop media
    try { cameraStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    try { micStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    cameraStreamRef.current = null;
    micStreamRef.current = null;
    // Audio ctx
    try { audioCtxRef.current?.close(); } catch {}
    audioCtxRef.current = null;
    analyserRef.current = null;
    setProctorEnabled(false);
    // reset timers
    noFaceSinceRef.current = null;
    multiFaceSinceRef.current = null;
    loudSinceRef.current = null;
  };

  const submitExam = async () => {
    if (!activeExam) return;
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([idx, ans]) => ({ questionIndex: Number(idx), answer: ans })),
      };
      if (activeExam.type === "listening" && audioUrl) {
        payload.audioUrl = audioUrl;
      }
      // Attach proctoring summary
      payload.proctoring = {
        startedAt: proctorStartedAt,
        endedAt: Date.now(),
        violations,
        totals: {
          noFace: violations.filter(v => v.type === 'no_face').length,
          multiFace: violations.filter(v => v.type === 'multi_face').length,
          speech: violations.filter(v => v.type === 'speech_detected').length,
          tab: violations.filter(v => v.type === 'tab_hidden_or_blur').length,
        },
        blockedSubmission: violationCount >= maxViolations,
      };
      if (violationCount >= maxViolations) {
        toast.error('Submission blocked due to proctoring violations');
        setSubmitting(false);
        return;
      }
      
      const res = await axiosPublic.post(`/exams/${activeExam.examId}/attempt`, payload, { headers });
      if (res.data?.success) {
        // Quiz type: show score immediately
        if (activeExam.type === "quiz") {
          const { score, passed } = res.data;
          toast.success(`Score: ${score}% | ${passed ? "Passed ✓" : "Failed ✗"}`);
        } 
        // Written/Listening: pending grading
        else {
          toast.success("Submitted successfully! Your exam will be graded soon.");
        }
        
        setActiveExam(null);
        setAnswers({});
        setAudioUrl("");
        stopProctoring();
        // reset proctor state
        setFaceCount(0); setAudioLevel(0); setViolationCount(0); setViolations([]);
        await loadData(); // Wait for data to reload
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to submit exam");
    } finally {
      setSubmitting(false);
    }
  };

  // Listening: Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        setAudioChunks(chunks);
        // Build blob
        const blob = new Blob(chunks, { type: 'audio/webm' });
        // Upload immediately
        try {
          setUploadingAudio(true);
          const form = new FormData();
          form.append('audio', blob, 'listening-response.webm');
          const res = await axiosPublic.post('/upload/audio', form, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (res.data?.success) {
            setAudioUrl(res.data.audioUrl);
            toast.success('Audio uploaded');
          } else {
            toast.error('Audio upload failed');
          }
        } catch (err) {
          console.error(err);
          toast.error('Audio upload error');
        } finally {
          setUploadingAudio(false);
        }
      };
      mediaRecorder.start();
      setRecorder(mediaRecorder);
      setRecording(true);
      setAudioUrl("");
      setAudioChunks([]);
      toast('Recording started 🎙️');
    } catch (err) {
      console.error(err);
      toast.error('Microphone permission denied');
    }
  };

  const stopRecording = () => {
    if (!recorder) return;
    recorder.stop();
    recorder.stream.getTracks().forEach((t) => t.stop());
    setRecorder(null);
    setRecording(false);
    toast('Recording stopped');
  };

  // Clean up proctoring when exam modal closes without submit
  useEffect(() => {
    if (!activeExam) {
      stopProctoring();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeExam]);

  const requestCertificate = async () => {
    try {
      const res = await axiosPublic.post(`/courses/${courseId}/certificate`, {}, { headers });
      if (res.data?.success) {
        const url = res.data?.certificateUrl;
        const certNumber = res.data?.certificateNumber;
        
        toast.success(
          `🎉 Certificate issued successfully!\nCertificate ID: ${certNumber || 'N/A'}`,
          { duration: 5000 }
        );
        
        if (url) {
          // Open certificate in new tab
          window.open(url, "_blank");
        } else {
          toast("Download link coming soon", { icon: "⏳" });
        }
      }
    } catch (e) {
      console.error(e);
      const errorMsg = e.response?.data?.message || "Certificate request failed";
      toast.error(errorMsg);
    }
  };

  const calculateProgress = () => {
    if (!outline) return 0;
    const compl = new Set((progress.completedLessons || []).map((x) => x.toString()));
    let total = 0;
    let completed = 0;
    (outline.outline || []).forEach((ch) => {
      ch.lessons.forEach((l) => {
        total++;
        if (compl.has(l.lessonId.toString())) completed++;
      });
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading course...</p>
          </div>
        </div>
        <DownNav />
      </div>
    );
  }

  if (!outline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Course not found</p>
          </div>
        </div>
        <DownNav />
      </div>
    );
  }

  const remainingLessons = (() => {
    if (!outline) return 0;
    const compl = new Set((progress.completedLessons || []).map((x) => x.toString()));
    let total = 0;
    (outline.outline || []).forEach((ch) => ch.lessons.forEach((l) => { if (!compl.has(l.lessonId.toString())) total++; }));
    return total;
  })();

  const remainingQuizzes = (() => {
    if (!outline) return 0;
    let total = 0;
    (outline.outline || []).forEach((ch) => {
      if (ch.exam && !getLatestAttemptPassed(ch.exam.examId)) total++;
    });
    return total;
  })();

  const progressPercent = calculateProgress();
  const allLessonsCompleted = allLessonsCompletedCourse();
  const allExamsPassed = allExamsPassedCourse();
  const canGetCertificate = allLessonsCompleted && allExamsPassed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">{outline.title || "Course"}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{outline.outline?.length || 0} Chapters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{outline.outline?.reduce((acc, ch) => acc + ch.lessons.length, 0) || 0} Lessons</span>
                </div>
              </div>
            </div>
            <button
              onClick={requestCertificate}
              disabled={!canGetCertificate}
              title={!canGetCertificate ? "Complete all lessons and pass all quizzes" : "Download certificate"}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                canGetCertificate
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Award className="w-5 h-5" />
              <span className="hidden sm:inline">Get Certificate</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Course Progress</span>
              <span className="text-sm font-bold text-blue-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Checklist Banner */}
        {(remainingLessons > 0 || remainingQuizzes > 0) && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <Trophy className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">To unlock your certificate:</h3>
                <div className="space-y-1 text-sm text-amber-800">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
                    <span>Complete <strong>{remainingLessons}</strong> remaining {remainingLessons === 1 ? 'lesson' : 'lessons'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
                    <span>Pass <strong>{remainingQuizzes}</strong> remaining {remainingQuizzes === 1 ? 'quiz' : 'quizzes'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Video Player Section */}
          <div className="flex-1 order-2 lg:order-1">
            {outline?.outline?.[active.chapterIdx] && !activeExam && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {(() => {
                  const ch = outline.outline[active.chapterIdx];
                  const l = ch.lessons[active.lessonIdx];
                  if (!l) return null;
                  const url = l.videoUrl || "";
                  const isYoutube = /youtube\.com|youtu\.be/.test(url);
                  const isVimeo = /vimeo\.com/.test(url);
                  return (
                    <>
                      <div className="aspect-video w-full bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
                        {isYoutube ? (
                          <iframe
                            title="YouTube Player"
                            src={`https://www.youtube.com/embed/${url.split("v=")[1] || url.split("/").pop()}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : isVimeo ? (
                          <iframe
                            title="Vimeo Player"
                            src={url.replace("vimeo.com/", "player.vimeo.com/video/")}
                            className="w-full h-full"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video className="w-full h-full" src={url} controls />
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-sm text-slate-500 mb-1">Chapter {ch.order} • Lesson {l.order}</div>
                            <h2 className="text-xl font-semibold text-slate-900">{ch.title}</h2>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => handleCompleteLesson(l.lessonId)}
                            disabled={isLessonCompleted(l.lessonId)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                              isLessonCompleted(l.lessonId)
                                ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                                : "bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg"
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            {isLessonCompleted(l.lessonId) ? "Completed" : "Mark Complete"}
                          </button>
                          <button 
                            onClick={goNext} 
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all"
                          >
                            Next Lesson
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Exam Modal */}
            {activeExam && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {activeExam.type === "quiz" && "Chapter Quiz"}
                      {activeExam.type === "written" && "Written Exam"}
                      {activeExam.type === "listening" && "Listening Exam"}
                    </h2>
                    <p className="text-sm text-slate-600">Passing Score: {activeExam.passingScore}%</p>
                  </div>
                </div>
                
                {/* Quiz Type */}
                {activeExam.type === "quiz" && (
                  <div className="space-y-6">
                    {activeExam.questions?.map((q, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-xl p-5 bg-slate-50">
                        <div className="font-semibold text-slate-900 mb-4">
                          <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold mr-2">
                            Q{idx + 1}
                          </span>
                          {q.question}
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {q.options?.map((opt, oIdx) => (
                            <label 
                              key={oIdx} 
                              className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                answers[idx] === opt
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q-${idx}`}
                                value={opt}
                                checked={answers[idx] === opt}
                                onChange={() => setAnswers((prev) => ({ ...prev, [idx]: opt }))}
                                className="w-5 h-5 text-blue-600"
                              />
                              <span className="text-slate-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Written Type */}
                {activeExam.type === "written" && (
                  <div className="space-y-6">
                    {activeExam.questions?.map((q, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-xl p-5 bg-slate-50">
                        <div className="font-semibold text-slate-900 mb-4">
                          <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold mr-2">
                            Q{idx + 1}
                          </span>
                          {q.question}
                        </div>
                        <textarea
                          value={answers[idx] || ""}
                          onChange={(e) => setAnswers((prev) => ({ ...prev, [idx]: e.target.value }))}
                          placeholder="Write your answer here..."
                          rows={6}
                          className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                        />
                      </div>
                    ))}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-sm text-amber-800">
                        📝 Your answers will be reviewed manually. You'll be notified once graded.
                      </p>
                    </div>
                  </div>
                )}

                {/* Listening Type */}
                {activeExam.type === "listening" && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                      <p className="text-sm text-blue-800 mb-3">🎤 Record your audio response for this exam.</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={startRecording}
                          disabled={recording || uploadingAudio}
                          className={`px-4 py-2 rounded-lg text-white transition-all ${recording || uploadingAudio ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                        >
                          {recording ? 'Recording...' : 'Start Recording'}
                        </button>
                        <button
                          type="button"
                          onClick={stopRecording}
                          disabled={!recording}
                          className={`px-4 py-2 rounded-lg transition-all ${!recording ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                        >
                          Stop Recording
                        </button>
                        {uploadingAudio && <span className="text-sm text-blue-700">Uploading audio...</span>}
                        {audioUrl && (
                          <audio controls src={audioUrl} className="w-full sm:w-auto mt-2" />
                        )}
                      </div>
                    </div>
                    {activeExam.questions?.map((q, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-xl p-5 bg-slate-50">
                        <div className="font-semibold text-slate-900 mb-4">
                          <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold mr-2">
                            Q{idx + 1}
                          </span>
                          {q.question}
                        </div>
                        <textarea
                          value={answers[idx] || ""}
                          onChange={(e) => setAnswers((prev) => ({ ...prev, [idx]: e.target.value }))}
                          placeholder="Optional: Write notes or transcript..."
                          rows={4}
                          className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                        />
                      </div>
                    ))}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-sm text-amber-800">
                        🎧 Your audio will be reviewed manually. You'll be notified once graded.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex flex-wrap gap-3">
                  <button 
                    disabled={submitting} 
                    onClick={submitExam} 
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : `Submit ${activeExam.type === "quiz" ? "Quiz" : "Exam"}`}
                  </button>
                  <button 
                    onClick={() => setActiveExam(null)} 
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Course Outline */}
          <div className="w-full lg:w-96 order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
              <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Course Content
                </h3>
              </div>
              
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="p-4 space-y-4">
                  {outline.outline?.map((ch, ci) => (
                    <div key={ch.chapterId} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 p-4 border-b border-slate-200">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-semibold text-slate-900 text-sm flex-1">
                            <span className="text-blue-600">{ch.order}.</span> {ch.title}
                          </h4>
                          {ch.exam && ch.lessons.every((l) => isLessonCompleted(l.lessonId)) && (
                            <button 
                              onClick={() => openExam(ch.exam.examId)} 
                              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-all flex-shrink-0"
                            >
                              Take Quiz
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="divide-y divide-slate-100">
                        {ch.lessons.map((l, li) => {
                          const isActive = active.chapterIdx === ci && active.lessonIdx === li;
                          const completed = isLessonCompleted(l.lessonId);
                          
                          return (
                            <div
                              key={l.lessonId}
                              className={`p-3 transition-all cursor-pointer ${
                                isActive ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-slate-50"
                              }`}
                              onClick={() => setActive({ chapterIdx: ci, lessonIdx: li })}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                  completed ? "bg-emerald-100" : "bg-slate-100"
                                }`}>
                                  {completed ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                  ) : (
                                    <PlayCircle className="w-5 h-5 text-slate-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-slate-900">Lesson {l.order}</div>
                                  <div className={`text-xs ${completed ? "text-emerald-600" : "text-slate-500"}`}>
                                    {completed ? "Completed" : "Not started"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <DownNav />
    </div>
  );
};

export default CoursePlayer;