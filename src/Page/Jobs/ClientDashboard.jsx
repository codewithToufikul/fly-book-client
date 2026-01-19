import React from 'react'
import { Link, useNavigate } from 'react-router'
import Navbar from '../../Components/Navbar/Navbar'
import DownNav from '../../Components/DownNav/DownNav'
import usePublicAxios from '../../Hooks/usePublicAxios'

const ClientDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [projects, setProjects] = React.useState([])
  const axiosPublic = usePublicAxios()

  React.useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const { data } = await axiosPublic.get('/client/projects')
      if (data?.success) {
        setProjects(data.data || [])
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Projects</h1>
          <Link
            to="/jobs/freelance/post-project"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm md:text-base"
          >
            Post New Project
          </Link>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-100 rounded-lg p-6 text-center">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-lg p-6 text-center text-gray-600">
            <p className="mb-4">You haven't posted any projects yet.</p>
            <Link
              to="/jobs/freelance/post-project"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Post Your First Project
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project._id} className="bg-white border border-gray-100 rounded-lg p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-lg md:text-xl font-semibold text-gray-900">{project.title}</h2>
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">{project.budgetType === 'fixed' ? 'Fixed' : 'Hourly'}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        project.status === 'open' ? 'bg-green-50 text-green-600' :
                        project.status === 'in_progress' ? 'bg-yellow-50 text-yellow-600' :
                        project.status === 'completed' ? 'bg-blue-50 text-blue-600' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {project.category && <p>📁 {project.category}</p>}
                      {project.budgetType === 'fixed' && project.budget && <p>💰 ৳{project.budget}</p>}
                      {project.budgetType === 'hourly' && project.hourlyRate && <p>💰 ৳{project.hourlyRate}/hr</p>}
                      <p>📅 Posted: {new Date(project.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/jobs/freelance/${project._id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm text-center"
                    >
                      View Project
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <DownNav />
    </div>
  )
}

export default ClientDashboard

