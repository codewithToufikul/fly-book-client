import React from 'react'
import Navbar from '../../Components/Navbar/Navbar'
import DownNav from '../../Components/DownNav/DownNav'
import { Link, useNavigate, useSearchParams } from 'react-router'
import usePublicAxios from '../../Hooks/usePublicAxios'

const JobBoard = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = React.useState(true)
  const [jobs, setJobs] = React.useState([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(Number(searchParams.get('page') || 1))
  const [q, setQ] = React.useState(searchParams.get('q') || '')
  const [category, setCategory] = React.useState(searchParams.get('category') || '')
  const [location, setLocation] = React.useState(searchParams.get('location') || '')
  const [jobType, setJobType] = React.useState(searchParams.get('jobType') || '')
  const [experienceLevel, setExperienceLevel] = React.useState(searchParams.get('experienceLevel') || '')
  const limit = 10
  const axiosPublic = usePublicAxios()
  const [employerInfo, setEmployerInfo] = React.useState({ approved: false, status: 'none' })

  const fetchJobs = React.useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (category) params.set('category', category)
      if (location) params.set('location', location)
      if (jobType) params.set('jobType', jobType)
      if (experienceLevel) params.set('experienceLevel', experienceLevel)
      params.set('page', String(page))
      params.set('limit', String(limit))
      const { data } = await axiosPublic.get(`/jobs?${params.toString()}`)
      if (data?.success) {
        setJobs(data.data || [])
        setTotal(data.pagination?.total || 0)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [q, category, location, jobType, experienceLevel, page])

  React.useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const applyFilters = () => {
    const next = new URLSearchParams()
    if (q) next.set('q', q)
    if (category) next.set('category', category)
    if (location) next.set('location', location)
    if (jobType) next.set('jobType', jobType)
    if (experienceLevel) next.set('experienceLevel', experienceLevel)
    next.set('page', '1')
    setSearchParams(next)
    setPage(1)
    fetchJobs()
  }

  // Load employer status to decide UI
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

  return (
    <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Flybook Job Board</h1>
              <div className="flex gap-2">
                <button onClick={() => navigate('/jobs')} className="px-3 py-2 text-sm rounded-md border">Back</button>
                {employerInfo.approved ? (
                  <>
                    <Link to="/jobs/employer/dashboard" className="px-3 py-2 text-sm rounded-md bg-green-600 text-white">Manage Jobs</Link>
                    <Link to="/jobs/employer/post" className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white">Post a Job</Link>
                  </>
                ) : employerInfo.status === 'pending' ? (
                  <>
                    <Link to="/jobs/my-applications" className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white">My Applications</Link>
                    <span className="px-3 py-2 text-xs rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200">Employer approval pending</span>
                  </>
                ) : (
                  <>
                    <Link to="/jobs/my-applications" className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white">My Applications</Link>
                    <Link to="/jobs/employer/request" className="px-3 py-2 text-sm rounded-md border">Become Employer</Link>
                  </>
                )}
              </div>
            </div>
            <p className="text-sm md:text-base text-gray-600 mb-6">BD Jobs style portal — browse and apply to jobs.</p>
            {!employerInfo.approved && employerInfo.status !== 'pending' && (
              <div className="mb-4 bg-white border border-gray-100 rounded-lg p-4">
                <div className="text-sm text-gray-700">
                  You're viewing the employee portal. Browse jobs and apply. Want to post jobs?
                  <button onClick={() => navigate('/jobs/employer/request')} className="ml-2 text-blue-600 underline">Apply to become an employer</button>
                </div>
              </div>
            )}
            {employerInfo.approved && (
              <div className="mb-4 bg-white border border-gray-100 rounded-lg p-4">
                <div className="text-sm text-gray-700">
                  You're approved as an employer. You can post jobs and manage applications. 
                  <Link to="/jobs/employer/dashboard" className="ml-2 text-blue-600 underline">Go to Dashboard</Link>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <aside className="md:col-span-1 space-y-3 bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">Filters</p>
                    <div className="space-y-2 text-sm">
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or keyword" className="w-full px-3 py-2 border border-gray-200 rounded-md" />
                        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="w-full px-3 py-2 border border-gray-200 rounded-md" />
                        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="w-full px-3 py-2 border border-gray-200 rounded-md" />
                        <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md">
                            <option value="">Job Type</option>
                            <option>Full-time</option>
                            <option>Part-time</option>
                            <option>Contract</option>
                            <option>Internship</option>
                            <option>Remote</option>
                        </select>
                        <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md">
                            <option value="">Experience Level</option>
                            <option>Any</option>
                            <option>Entry</option>
                            <option>Mid</option>
                            <option>Senior</option>
                            <option>Lead</option>
                        </select>
                        <button onClick={applyFilters} className="w-full px-3 py-2 bg-blue-600 text-white rounded-md">Search</button>
                    </div>
                </aside>
                <main className="md:col-span-2">
                    {loading ? (
                      <div className="bg-white border border-gray-100 rounded-lg p-6 text-gray-500 text-sm">Loading...</div>
                    ) : jobs.length === 0 ? (
                      <div className="bg-white border border-gray-100 rounded-lg p-6 text-gray-500 text-sm">No jobs found.</div>
                    ) : (
                      <div className="space-y-3">
                        {jobs.map((job) => (
                          <Link key={job._id} to={`/jobs/board/${job._id}`} className="block bg-white border border-gray-100 rounded-lg p-4 hover:border-blue-200">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">{job.jobType}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{job.description}</p>
                            <div className="text-xs text-gray-500 mt-2 flex gap-3">
                              {job.location && <span>{job.location}</span>}
                              {job.experienceLevel && <span>• {job.experienceLevel}</span>}
                              {job.salaryMin != null && job.salaryMax != null && <span>• ৳{job.salaryMin}-{job.salaryMax}</span>}
                            </div>
                          </Link>
                        ))}
                        <div className="flex items-center justify-between pt-2">
                          <button disabled={page<=1} onClick={() => { setPage(page-1); setSearchParams({ ...Object.fromEntries(searchParams), page: String(page-1) }); fetchJobs(); }} className="px-3 py-2 border rounded disabled:opacity-50">Previous</button>
                          <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
                          <button disabled={page>=totalPages} onClick={() => { setPage(page+1); setSearchParams({ ...Object.fromEntries(searchParams), page: String(page+1) }); fetchJobs(); }} className="px-3 py-2 border rounded disabled:opacity-50">Next</button>
                        </div>
                      </div>
                    )}
                </main>
            </div>
        </div>
        <DownNav />
    </div>
  )
}

export default JobBoard


