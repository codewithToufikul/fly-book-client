import React from 'react'
import { useParams, useNavigate } from 'react-router'
import Navbar from '../../Components/Navbar/Navbar'
import DownNav from '../../Components/DownNav/DownNav'
import usePublicAxios from '../../Hooks/usePublicAxios'

const JobDetails = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [coverLetter, setCoverLetter] = React.useState('')
  const [cvUrl, setCvUrl] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const [employerInfo, setEmployerInfo] = React.useState({ approved: false, status: 'none' })
  const axiosPublic = usePublicAxios()

  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosPublic.get(`/jobs/${jobId}`)
        if (data?.success) setJob(data.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [jobId])

  // Check if user is employer
  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosPublic.get('/employers/status')
        if (data?.success) {
          setEmployerInfo({ approved: !!data.approved, status: data.status || 'none' })
        }
      } catch {
        // unauthenticated users will just see employee UI
      }
    })()
  }, [])

  const apply = async () => {
    try {
      setSubmitting(true)
      setMessage('')
      const { data } = await axiosPublic.post(`/jobs/${jobId}/apply`, { coverLetter, cvUrl })
      if (data?.success) {
        setMessage('Applied successfully.')
      } else {
        setMessage(data?.message || 'Failed to apply.')
      }
    } catch (e) {
      console.error(e)
      setMessage('Failed to apply.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <button onClick={() => navigate(-1)} className="px-3 py-2 text-sm rounded-md border mb-4">Back</button>
        {loading ? (
          <div className="bg-white border border-gray-100 rounded-lg p-6">Loading...</div>
        ) : !job ? (
          <div className="bg-white border border-gray-100 rounded-lg p-6">Job not found</div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">{job.jobType}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {job.location && <span>{job.location}</span>} {job.experienceLevel && <span>• {job.experienceLevel}</span>}
              </div>
              <div className="prose prose-sm max-w-none mt-4 text-gray-800 whitespace-pre-line">
                {job.description}
              </div>
            </div>
            {employerInfo.approved ? (
              <div className="bg-white border border-gray-100 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-3">Employer View</h2>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    As an employer, you cannot apply to jobs. Manage your posted jobs and view applications from your dashboard.
                  </p>
                  <button
                    onClick={() => navigate('/jobs/employer/dashboard')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Go to My Jobs Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-3">Apply Now</h2>
                <div className="space-y-3">
                  <input value={cvUrl} onChange={(e) => setCvUrl(e.target.value)} placeholder="CV URL (Drive/Cloud link)" className="w-full px-3 py-2 border border-gray-200 rounded-md" />
                  <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Cover letter" rows={5} className="w-full px-3 py-2 border border-gray-200 rounded-md" />
                  <button onClick={apply} disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50">
                    {submitting ? 'Applying...' : 'Apply'}
                  </button>
                  {message && <p className="text-sm text-gray-600">{message}</p>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <DownNav />
    </div>
  )
}

export default JobDetails


