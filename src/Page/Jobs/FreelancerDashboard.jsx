import React from 'react'
import { Link, useNavigate } from 'react-router'
import Navbar from '../../Components/Navbar/Navbar'
import DownNav from '../../Components/DownNav/DownNav'
import usePublicAxios from '../../Hooks/usePublicAxios'

const FreelancerDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [proposals, setProposals] = React.useState([])
  const axiosPublic = usePublicAxios()

  React.useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    try {
      setLoading(true)
      const { data } = await axiosPublic.get('/freelancer/proposals')
      if (data?.success) {
        setProposals(data.data || [])
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Proposals</h1>
          <button
            onClick={() => navigate('/jobs/freelance')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm md:text-base"
          >
            Browse Projects
          </button>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-100 rounded-lg p-6 text-center">Loading...</div>
        ) : proposals.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-lg p-6 text-center text-gray-600">
            <p className="mb-4">You haven't submitted any proposals yet.</p>
            <Link
              to="/jobs/freelance"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Browse Available Projects
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal) => {
              const project = proposal.project
              if (!project) return null
              return (
                <div key={proposal._id} className="bg-white border border-gray-100 rounded-lg p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-900">{project.title}</h2>
                        <span className={`text-xs px-2 py-1 rounded ${
                          proposal.status === 'accepted' ? 'bg-green-50 text-green-600' :
                          proposal.status === 'rejected' ? 'bg-red-50 text-red-600' :
                          'bg-yellow-50 text-yellow-600'
                        }`}>
                          {proposal.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {project.category && <p>📁 {project.category}</p>}
                        {proposal.proposedPrice && <p>💰 Proposed: ৳{proposal.proposedPrice}</p>}
                        {proposal.hourlyRate && <p>💰 Hourly Rate: ৳{proposal.hourlyRate}/hr</p>}
                        {proposal.deliveryTime && <p>⏱️ Delivery: {proposal.deliveryTime}</p>}
                        <p>📅 Submitted: {new Date(proposal.createdAt).toLocaleDateString()}</p>
                      </div>
                      {proposal.coverLetter && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-1">Your Cover Letter:</p>
                          <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-3">{proposal.coverLetter}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link
                        to={`/jobs/freelance/${project._id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm text-center"
                      >
                        View Project
                      </Link>
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

export default FreelancerDashboard

