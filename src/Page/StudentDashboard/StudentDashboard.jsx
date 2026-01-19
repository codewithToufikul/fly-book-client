import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  Users, 
  TrendingUp, 
  Award, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  BarChart3,
  User,
  GraduationCap,
  Target,
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Navbar from '../../Components/Navbar/Navbar';
import DownNav from '../../Components/DownNav/DownNav';
import usePublicAxios from '../../Hooks/usePublicAxios';
import toast from 'react-hot-toast';

function StudentDashboard() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const axiosPublic = usePublicAxios();
  const token = localStorage.getItem('token');
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, passed, failed, pending
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [expandedExamId, setExpandedExamId] = useState(null);

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    loadDashboard();
  }, [courseId]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await axiosPublic.get(`/courses/${courseId}/student-dashboard`, { headers });
      if (res.data?.success) {
        setDashboardData(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load student dashboard');
      if (error.response?.status === 403) {
        navigate(-1);
      }
    } finally {
      setLoading(false);
    }
  };

  const getFilteredStudents = () => {
    if (!dashboardData?.students) return [];
    
    let filtered = dashboardData.students;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student.number.includes(searchTerm)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => {
        if (filterStatus === 'passed') {
          return s.statistics.passedAttempts > 0;
        } else if (filterStatus === 'failed') {
          return s.statistics.failedAttempts > 0;
        } else if (filterStatus === 'pending') {
          return s.statistics.pendingGrading > 0;
        }
        return true;
      });
    }

    return filtered;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-gray-200"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-8 border-b-8 border-blue-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <p className="text-xl text-gray-600">Failed to load dashboard data</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { courseTitle, overallStats, students } = dashboardData;
  const filteredStudents = getFilteredStudents();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Course</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
              <p className="text-xl text-gray-600">{courseTitle}</p>
            </div>
            <GraduationCap size={48} className="text-blue-600" />
          </div>
        </div>

        {/* Overall Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{overallStats.totalStudents}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pass Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{overallStats.passRate}%</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Exams</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{overallStats.totalExams}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FileText size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Certificates Issued</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{overallStats.certificatesIssued}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Award size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3">
              <BarChart3 size={20} className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Attempts</p>
                <p className="text-xl font-bold text-gray-900">{overallStats.totalAttempts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Graded Attempts</p>
                <p className="text-xl font-bold text-gray-900">{overallStats.gradedAttempts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Grading</p>
                <p className="text-xl font-bold text-gray-900">{overallStats.pendingGrading}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Students</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending Grading</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Student Performance ({filteredStudents.length} students)
            </h2>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No students found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredStudents.map((studentData) => (
                <div
                  key={studentData.student.id}
                  className="p-6 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => setSelectedStudent(selectedStudent?.student.id === studentData.student.id ? null : studentData)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                        {studentData.student.profileImage ? (
                          <img 
                            src={studentData.student.profileImage} 
                            alt={studentData.student.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User size={28} />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{studentData.student.name}</h3>
                        <p className="text-sm text-gray-600">{studentData.student.number}</p>
                        {studentData.lastActivity && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last activity: {formatDate(studentData.lastActivity)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 ml-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{studentData.statistics.totalAttempts}</p>
                        <p className="text-xs text-gray-600">Attempts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{studentData.statistics.passedAttempts}</p>
                        <p className="text-xs text-gray-600">Passed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{studentData.statistics.failedAttempts}</p>
                        <p className="text-xs text-gray-600">Failed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {studentData.statistics.averageScore !== null ? `${studentData.statistics.averageScore}%` : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-600">Avg Score</p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Student Details */}
                  {selectedStudent?.student.id === studentData.student.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="mb-4 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Target size={16} className="text-blue-600" />
                          <span className="text-sm text-gray-700">
                            Completed Lessons: <strong>{studentData.statistics.completedLessons}</strong>
                          </span>
                        </div>
                        {studentData.statistics.hasCertificate && (
                          <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                            <Award size={16} className="text-green-600" />
                            <span className="text-sm text-green-700 font-semibold">Certificate Issued</span>
                          </div>
                        )}
                      </div>

                      <h4 className="font-bold text-gray-900 mb-3">Exam Results by Chapter:</h4>
                      <div className="space-y-3">
                        {studentData.examResults
                          .sort((a, b) => a.chapterOrder - b.chapterOrder)
                          .map((examResult, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <FileText size={16} className="text-gray-600" />
                                <span className="font-semibold text-gray-900">
                                  {examResult.chapterTitle}
                                </span>
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                  {examResult.examType}
                                </span>
                              </div>
                              <span className="text-sm text-gray-600">
                                {examResult.attemptCount} attempt(s)
                              </span>
                            </div>

                            {examResult.latestAttempt ? (
                              <div className="mt-2 space-y-3">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    {examResult.latestAttempt.passed ? (
                                      <CheckCircle size={18} className="text-green-600" />
                                    ) : examResult.latestAttempt.graded ? (
                                      <XCircle size={18} className="text-red-600" />
                                    ) : (
                                      <Clock size={18} className="text-orange-600" />
                                    )}
                                    <span className={`text-sm font-semibold ${
                                      examResult.latestAttempt.passed 
                                        ? 'text-green-600' 
                                        : examResult.latestAttempt.graded 
                                          ? 'text-red-600' 
                                          : 'text-orange-600'
                                    }`}>
                                      {examResult.latestAttempt.graded 
                                        ? (examResult.latestAttempt.passed ? 'Passed' : 'Failed')
                                        : 'Pending Grading'
                                      }
                                    </span>
                                  </div>

                                  {examResult.latestAttempt.score !== null && (
                                    <span className="text-sm text-gray-700">
                                      Score: <strong>{examResult.latestAttempt.score}%</strong>
                                    </span>
                                  )}

                                  {examResult.latestAttempt.correctAnswers !== undefined && (
                                    <span className="text-sm text-gray-700">
                                      ({examResult.latestAttempt.correctAnswers}/{examResult.latestAttempt.totalQuestions} correct)
                                    </span>
                                  )}

                                  <span className="text-xs text-gray-500 ml-auto">
                                    {formatDate(examResult.latestAttempt.createdAt)}
                                  </span>
                                </div>

                                {/* View Exam Details Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const examIdStr = examResult.examId?.toString() || String(examResult.examId);
                                    setExpandedExamId(expandedExamId === examIdStr ? null : examIdStr);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                >
                                  {expandedExamId === (examResult.examId?.toString() || String(examResult.examId)) ? (
                                    <>
                                      <ChevronUp size={16} />
                                      Hide Exam Details
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown size={16} />
                                      View Full Exam Details
                                    </>
                                  )}
                                </button>

                                {/* Expanded Exam Details */}
                                {expandedExamId === (examResult.examId?.toString() || String(examResult.examId)) && (
                                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-gray-200 space-y-4">
                                    <h5 className="font-bold text-gray-900 text-lg mb-4">Complete Exam Details</h5>
                                    
                                    {/* Quiz Exam Details */}
                                    {examResult.examType === 'quiz' && examResult.examQuestions && examResult.examQuestions.length > 0 && (
                                      <div className="space-y-4">
                                        {examResult.examQuestions.map((question, qIdx) => {
                                          const studentAnswer = examResult.latestAttempt?.answers?.find(
                                            a => a.questionIndex === qIdx
                                          )?.answer || 'Not answered';
                                          const correctAnswer = question.answer;
                                          const isCorrect = studentAnswer === correctAnswer;

                                          return (
                                            <div key={qIdx} className={`p-4 rounded-lg border-2 ${
                                              isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                            }`}>
                                              <div className="flex items-start justify-between mb-3">
                                                <h6 className="font-semibold text-gray-900">
                                                  Question {qIdx + 1}: {question.question}
                                                </h6>
                                                {isCorrect ? (
                                                  <CheckCircle size={20} className="text-green-600 flex-shrink-0 ml-2" />
                                                ) : (
                                                  <XCircle size={20} className="text-red-600 flex-shrink-0 ml-2" />
                                                )}
                                              </div>
                                              
                                              <div className="space-y-2 mb-3">
                                                <p className="text-sm font-medium text-gray-700">Options:</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                  {question.options?.map((option, oIdx) => (
                                                    <div
                                                      key={oIdx}
                                                      className={`p-2 rounded ${
                                                        option === correctAnswer
                                                          ? 'bg-green-100 border-2 border-green-500'
                                                          : option === studentAnswer && !isCorrect
                                                            ? 'bg-red-100 border-2 border-red-500'
                                                            : 'bg-gray-50 border border-gray-200'
                                                      }`}
                                                    >
                                                      <span className="text-sm">
                                                        {option}
                                                        {option === correctAnswer && (
                                                          <span className="ml-2 text-green-700 font-semibold">✓ Correct</span>
                                                        )}
                                                        {option === studentAnswer && !isCorrect && (
                                                          <span className="ml-2 text-red-700 font-semibold">✗ Your Answer</span>
                                                        )}
                                                      </span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>

                                              <div className="mt-3 pt-3 border-t border-gray-200">
                                                <p className="text-sm">
                                                  <span className="font-semibold">Student Answer:</span>{' '}
                                                  <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                                                    {studentAnswer}
                                                  </span>
                                                </p>
                                                <p className="text-sm mt-1">
                                                  <span className="font-semibold">Correct Answer:</span>{' '}
                                                  <span className="text-green-700">{correctAnswer}</span>
                                                </p>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* Written Exam Details */}
                                    {examResult.examType === 'written' && examResult.examQuestions && examResult.examQuestions.length > 0 && (
                                      <div className="space-y-4">
                                        {examResult.examQuestions.map((question, qIdx) => {
                                          const studentAnswer = examResult.latestAttempt?.answers?.find(
                                            a => a.questionIndex === qIdx
                                          )?.answer || 'No answer provided';

                                          return (
                                            <div key={qIdx} className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
                                              <h6 className="font-semibold text-gray-900 mb-3">
                                                Question {qIdx + 1}: {question.question}
                                              </h6>
                                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Student's Answer:</p>
                                                <p className="text-gray-900 whitespace-pre-wrap">{studentAnswer}</p>
                                              </div>
                                              {examResult.latestAttempt?.feedback && (
                                                <div className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                                  <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                                                  <p className="text-sm text-gray-900">{examResult.latestAttempt.feedback}</p>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* Speaking/Listening Exam Details */}
                                    {(examResult.examType === 'speaking' || examResult.examType === 'listening') && (
                                      <div className="space-y-4">
                                        {examResult.examQuestions && examResult.examQuestions.map((question, qIdx) => (
                                          <div key={qIdx} className="p-4 rounded-lg border-2 border-purple-200 bg-purple-50">
                                            <h6 className="font-semibold text-gray-900 mb-3">
                                              Question {qIdx + 1}: {question.question}
                                            </h6>
                                            {examResult.latestAttempt?.audioUrl && (
                                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Student's Audio Response:</p>
                                                <audio controls className="w-full">
                                                  <source src={examResult.latestAttempt.audioUrl} type="audio/mpeg" />
                                                  <source src={examResult.latestAttempt.audioUrl} type="audio/wav" />
                                                  Your browser does not support the audio element.
                                                </audio>
                                              </div>
                                            )}
                                            {examResult.latestAttempt?.answers?.find(a => a.questionIndex === qIdx)?.answer && (
                                              <div className="mt-3 bg-white p-4 rounded-lg border border-gray-200">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Additional Text Answer:</p>
                                                <p className="text-gray-900">
                                                  {examResult.latestAttempt.answers.find(a => a.questionIndex === qIdx)?.answer}
                                                </p>
                                              </div>
                                            )}
                                            {examResult.latestAttempt?.feedback && (
                                              <div className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                                <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                                                <p className="text-sm text-gray-900">{examResult.latestAttempt.feedback}</p>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Exam Summary */}
                                    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                                      <p className="text-sm text-gray-700">
                                        <span className="font-semibold">Passing Score:</span> {examResult.passingScore}%
                                      </p>
                                      {examResult.latestAttempt?.score !== null && (
                                        <p className="text-sm text-gray-700 mt-1">
                                          <span className="font-semibold">Student Score:</span> {examResult.latestAttempt.score}%
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 mt-2">No attempts yet</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DownNav />
    </div>
  );
}

export default StudentDashboard;

