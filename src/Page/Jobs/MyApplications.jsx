import React from 'react'
import { Link, useNavigate } from 'react-router'
import Navbar from '../../Components/Navbar/Navbar'
import DownNav from '../../Components/DownNav/DownNav'
import usePublicAxios from '../../Hooks/usePublicAxios'

const MyApplications = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [applications, setApplications] = React.useState([])
  const axiosPublic = usePublicAxios()

  React.useEffect(() => {
    fetchMyApplications()
  }, [])

  const fetchMyApplications = async () => {
    try {
      setLoading(true)
      const { data } = await axiosPublic.get('/my-applications')
      if (data?.success) {
        setApplications(data.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Applications</h1>
          <button
            onClick={() => navigate('/jobs/board')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm md:text-base"
          >
            Browse Jobs
          </button>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-100 rounded-lg p-6 text-center">Loading...</div>
        ) : applications.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-lg p-6 text-center text-gray-600">
            <p className="mb-4">You haven't applied to any jobs yet.</p>
            <Link
              to="/jobs/board"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Browse Available Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const job = app.job
              if (!job) return null
              return (
                <div key={app._id} className="bg-white border border-gray-100 rounded-lg p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-900">{job.title}</h2>
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">{job.jobType}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {job.location && <p>📍 {job.location}</p>}
                        {job.category && <p>📁 {job.category}</p>}
                        {job.salaryMin != null && job.salaryMax != null && (
                          <p>💰 ৳{job.salaryMin}-{job.salaryMax}</p>
                        )}
                        <p>📅 Applied: {new Date(app.createdAt || app.appliedAt).toLocaleDateString()}</p>
                      </div>
                      {app.coverLetter && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-1">Your Cover Letter:</p>
                          <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-3">{app.coverLetter}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link
                        to={`/jobs/board/${job._id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm text-center"
                      >
                        View Job
                      </Link>
                      {app.cvUrl && (
                        <a
                          href={app.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm text-center"
                        >
                          View My CV
                        </a>
                      )}
                    </div>
                  </div>
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

export default MyApplications

