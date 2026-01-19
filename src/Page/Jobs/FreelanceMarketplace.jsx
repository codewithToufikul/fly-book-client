import React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import Navbar from '../../Components/Navbar/Navbar'
import DownNav from '../../Components/DownNav/DownNav'
import usePublicAxios from '../../Hooks/usePublicAxios'

const FreelanceMarketplace = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = React.useState(true)
  const [projects, setProjects] = React.useState([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(Number(searchParams.get('page') || 1))
  const [q, setQ] = React.useState(searchParams.get('q') || '')
  const [category, setCategory] = React.useState(searchParams.get('category') || '')
  const [budgetType, setBudgetType] = React.useState(searchParams.get('budgetType') || '')
  const [budgetMin, setBudgetMin] = React.useState(searchParams.get('budgetMin') || '')
  const [budgetMax, setBudgetMax] = React.useState(searchParams.get('budgetMax') || '')
  const limit = 10
  const axiosPublic = usePublicAxios()

  const fetchProjects = React.useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (category) params.set('category', category)
      if (budgetType) params.set('budgetType', budgetType)
      if (budgetMin) params.set('budgetMin', budgetMin)
      if (budgetMax) params.set('budgetMax', budgetMax)
      params.set('page', String(page))
      params.set('limit', String(limit))
      const { data } = await axiosPublic.get(`/projects?${params.toString()}`)
      if (data?.success) {
        setProjects(data.data || [])
        setTotal(data.pagination?.total || 0)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [q, category, budgetType, budgetMin, budgetMax, page])

  React.useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const applyFilters = () => {
    const next = new URLSearchParams()
    if (q) next.set('q', q)
    if (category) next.set('category', category)
    if (budgetType) next.set('budgetType', budgetType)
    if (budgetMin) next.set('budgetMin', budgetMin)
    if (budgetMax) next.set('budgetMax', budgetMax)
    next.set('page', '1')
    setSearchParams(next)
    setPage(1)
    fetchProjects()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Freelance Marketplace</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate('/jobs')} className="px-3 py-2 text-sm rounded-md border">Back</button>
            <Link to="/jobs/freelance/post-project" className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white">Post Project</Link>
            <Link to="/jobs/freelance/my-proposals" className="px-3 py-2 text-sm rounded-md bg-green-600 text-white">My Proposals</Link>
            <Link to="/jobs/freelance/my-projects" className="px-3 py-2 text-sm rounded-md bg-purple-600 text-white">My Projects</Link>
          </div>
        </div>
        <p className="text-sm md:text-base text-gray-600 mb-6">PeoplePerHour style — browse projects and submit proposals.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <aside className="md:col-span-1 space-y-3 bg-white p-4 rounded-lg border border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Filters</p>
            <div className="space-y-2 text-sm">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects" className="w-full px-3 py-2 border border-gray-200 rounded-md" />
              <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category/Skill" className="w-full px-3 py-2 border border-gray-200 rounded-md" />
              <select value={budgetType} onChange={(e) => setBudgetType(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md">
                <option value="">Budget Type</option>
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
              </select>
              {budgetType && (
                <>
                  <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="Min Budget" className="w-full px-3 py-2 border border-gray-200 rounded-md" />
                  <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="Max Budget" className="w-full px-3 py-2 border border-gray-200 rounded-md" />
                </>
              )}
              <button onClick={applyFilters} className="w-full px-3 py-2 bg-blue-600 text-white rounded-md">Search</button>
            </div>
          </aside>
          <main className="md:col-span-2">
            {loading ? (
              <div className="bg-white border border-gray-100 rounded-lg p-6 text-gray-500 text-sm">Loading...</div>
            ) : projects.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-lg p-6 text-gray-500 text-sm">No projects found.</div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <Link key={project._id} to={`/jobs/freelance/${project._id}`} className="block bg-white border border-gray-100 rounded-lg p-4 hover:border-blue-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">{project.budgetType === 'fixed' ? 'Fixed' : 'Hourly'}</span>
                          <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">{project.status}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                        <div className="text-xs text-gray-500 mt-2 flex gap-3 flex-wrap">
                          {project.category && <span>📁 {project.category}</span>}
                          {project.budgetType === 'fixed' && project.budget && <span>💰 ৳{project.budget}</span>}
                          {project.budgetType === 'hourly' && project.hourlyRate && <span>💰 ৳{project.hourlyRate}/hr</span>}
                          {project.postedByUser && <span>👤 {project.postedByUser.name}</span>}
                          {project.deadline && <span>📅 {new Date(project.deadline).toLocaleDateString()}</span>}
                        </div>
                        {project.skills && project.skills.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {project.skills.map((skill, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{skill}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="flex items-center justify-between pt-2">
                  <button disabled={page <= 1} onClick={() => { setPage(page - 1); setSearchParams({ ...Object.fromEntries(searchParams), page: String(page - 1) }); fetchProjects(); }} className="px-3 py-2 border rounded disabled:opacity-50">Previous</button>
                  <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
                  <button disabled={page >= totalPages} onClick={() => { setPage(page + 1); setSearchParams({ ...Object.fromEntries(searchParams), page: String(page + 1) }); fetchProjects(); }} className="px-3 py-2 border rounded disabled:opacity-50">Next</button>
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

export default FreelanceMarketplace

