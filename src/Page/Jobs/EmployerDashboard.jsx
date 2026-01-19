import React from 'react'
import { Link, useNavigate } from 'react-router'
import Navbar from '../../Components/Navbar/Navbar'
import DownNav from '../../Components/DownNav/DownNav'
import usePublicAxios from '../../Hooks/usePublicAxios'

const EmployerDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [jobs, setJobs] = React.useState([])
  const [applications, setApplications] = React.useState({}) // { jobId: [applications] }
  const [selectedJob, setSelectedJob] = React.useState(null)
  const axiosPublic = usePublicAxios()

  React.useEffect(() => {
    fetchMyJobs()
  }, [])

  const fetchMyJobs = async () => {
    try {
      setLoading(true)
      const { data } = await axiosPublic.get('/employer/jobs')
      if (data?.success) {
        setJobs(data.data || [])
        // Fetch application counts for each job
        for (const job of data.data || []) {
          fetchApplications(job._id)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async (jobId) => {
    try {
      const { data } = await axiosPublic.get(`/employer/jobs/${jobId}/applications`)
      if (data?.success) {
        setApplications(prev => ({ ...prev, [jobId]: data.data || [] }))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleViewApplications = (jobId) => {
    if (selectedJob === jobId) {
      setSelectedJob(null)
    } else {
      setSelectedJob(jobId)
      if (!applications[jobId]) {
        fetchApplications(jobId)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Jobs</h1>
          <Link
            to="/jobs/employer/post"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm md:text-base"
          >
            Post New Job
          </Link>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-100 rounded-lg p-6 text-center">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-lg p-6 text-center text-gray-600">
            <p className="mb-4">You haven't posted any jobs yet.</p>
            <Link
              to="/jobs/employer/post"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const appCount = applications[job._id]?.length || 0
              const isExpanded = selectedJob === job._id
              return (
                <div key={job._id} className="bg-white border border-gray-100 rounded-lg p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-900">{job.title}</h2>
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">{job.jobType}</span>
                        {job.status === 'active' ? (
                          <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">Active</span>
                        ) : (
                          <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">Inactive</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {job.location && <p>📍 {job.location}</p>}
                        {job.category && <p>📁 {job.category}</p>}
                        {job.salaryRange && <p>💰 {job.salaryRange}</p>}
                        <p>📅 Posted: {new Date(job.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2">
                      <button
                        onClick={() => handleViewApplications(job._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        {isExpanded ? 'Hide' : 'View'} Applications ({appCount})
                      </button>
                      <Link
                        to={`/jobs/board/${job._id}`}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm text-center"
                      >
                        View Job
                      </Link>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h3 className="text-md font-semibold text-gray-900 mb-3">
                        Applications ({appCount})
                      </h3>
                      {applications[job._id]?.length === 0 ? (
                        <p className="text-sm text-gray-600 text-center py-4">No applications yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {applications[job._id]?.map((app) => (
                            <div key={app._id} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {app.applicant?.name || app.applicantName || 'Anonymous'}
                                  </p>
                                  {app.applicant?.email && (
                                    <p className="text-xs text-gray-500">{app.applicant.email}</p>
                                  )}
                                  <p className="text-xs text-gray-600">
                                    Applied: {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  {app.cvUrl && (
                                    <a
                                      href={app.cvUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-xs hover:bg-blue-100"
                                    >
                                      View CV
                                    </a>
                                  )}
                                </div>
                              </div>
                              {app.coverLetter && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-gray-700 mb-1">Cover Letter:</p>
                                  <p className="text-sm text-gray-600 whitespace-pre-line">{app.coverLetter}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <DownNav />
    </div>
  )
}

export default EmployerDashboard

