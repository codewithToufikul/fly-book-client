import React from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import Navbar from '../../Components/Navbar/Navbar'
import DownNav from '../../Components/DownNav/DownNav'
import usePublicAxios from '../../Hooks/usePublicAxios'

const ProjectDetails = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [coverLetter, setCoverLetter] = React.useState('')
  const [proposedPrice, setProposedPrice] = React.useState('')
  const [hourlyRate, setHourlyRate] = React.useState('')
  const [deliveryTime, setDeliveryTime] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const [isClient, setIsClient] = React.useState(false)
  const [isFreelancer, setIsFreelancer] = React.useState(false)
  const [currentUserId, setCurrentUserId] = React.useState(null)
  const [proposals, setProposals] = React.useState([])
  const [showProposals, setShowProposals] = React.useState(false)
  const axiosPublic = usePublicAxios()

  React.useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const { data } = await axiosPublic.get(`/projects/${projectId}`)
      if (data?.success) {
        setProject(data.data)
        // Check if current user is the client by trying to fetch proposals
        try {
          await axiosPublic.get(`/projects/${projectId}/proposals`)
          setIsClient(true)
          fetchProposals()
        } catch {
          // Not the client, check if freelancer
          try {
            const proposalsData = await axiosPublic.get('/freelancer/proposals')
            if (proposalsData?.data?.success) {
              const myProposals = proposalsData.data.data || []
              const myProposal = myProposals.find(p => {
                const pId = p.projectId?._id?.toString() || p.projectId?.toString()
                return pId === projectId && p.status === 'accepted'
              })
              if (myProposal) {
                setIsFreelancer(true)
                if (myProposal.freelancerId) {
                  setCurrentUserId(myProposal.freelancerId.toString())
                }
              }
            }
          } catch {
            // Not authenticated or not freelancer
          }
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchProposals = async () => {
    try {
      const { data } = await axiosPublic.get(`/projects/${projectId}/proposals`)
      if (data?.success) {
        setProposals(data.data || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const submitProposal = async () => {
    try {
      setSubmitting(true)
      setMessage('')
      const payload = {
        coverLetter,
        deliveryTime,
      }
      if (project.budgetType === 'fixed') {
        payload.proposedPrice = proposedPrice
      } else {
        payload.hourlyRate = hourlyRate
      }
      const { data } = await axiosPublic.post(`/projects/${projectId}/proposals`, payload)
      if (data?.success) {
        setMessage('Proposal submitted successfully!')
        setCoverLetter('')
        setProposedPrice('')
        setHourlyRate('')
        setDeliveryTime('')
      } else {
        setMessage(data?.message || 'Failed to submit proposal.')
      }
    } catch (e) {
      console.error(e)
      setMessage(e.response?.data?.message || 'Failed to submit proposal.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleProposalStatus = async (proposalId, status) => {
    try {
      const { data } = await axiosPublic.patch(`/proposals/${proposalId}/status`, { status })
      if (data?.success) {
        fetchProposals()
        fetchProject()
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <button onClick={() => navigate(-1)} className="px-3 py-2 text-sm rounded-md border mb-4">Back</button>
        {loading ? (
          <div className="bg-white border border-gray-100 rounded-lg p-6">Loading...</div>
        ) : !project ? (
          <div className="bg-white border border-gray-100 rounded-lg p-6">Project not found</div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                <div className="flex gap-2">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">{project.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}</span>
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">{project.status}</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1 mt-2">
                {project.category && <p>📁 Category: {project.category}</p>}
                {project.budgetType === 'fixed' && project.budget && <p>💰 Budget: ৳{project.budget}</p>}
                {project.budgetType === 'hourly' && project.hourlyRate && <p>💰 Hourly Rate: ৳{project.hourlyRate}/hr</p>}
                {project.postedByUser && <p>👤 Posted by: {project.postedByUser.name}</p>}
                {project.deadline && <p>📅 Deadline: {new Date(project.deadline).toLocaleDateString()}</p>}
              </div>
              {project.skills && project.skills.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {project.skills.map((skill, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{skill}</span>
                  ))}
                </div>
              )}
              <div className="prose prose-sm max-w-none mt-4 text-gray-800 whitespace-pre-line">
                {project.description}
              </div>
            </div>

            {/* Chat button when proposal is accepted */}
            {project.status === 'in_progress' && project.selectedFreelancer && (
              <div className="bg-white border border-gray-100 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Project in Progress</h3>
                    <p className="text-sm text-gray-600">You can now chat with {isClient ? 'the freelancer' : 'the client'} about this project.</p>
                  </div>
                  {isClient && project.selectedFreelancer ? (
                    <Link
                      to={`/chats/${project.selectedFreelancer}`}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      💬 Chat with Freelancer
                    </Link>
                  ) : isFreelancer && project.postedBy ? (
                    <Link
                      to={`/chats/${project.postedBy}`}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      💬 Chat with Client
                    </Link>
                  ) : null}
                </div>
              </div>
            )}

            {isClient ? (
              <div className="bg-white border border-gray-100 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Proposals ({proposals.length})</h2>
                  <button
                    onClick={() => {
                      setShowProposals(!showProposals)
                      if (!showProposals) fetchProposals()
                    }}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md"
                  >
                    {showProposals ? 'Hide' : 'View'} Proposals
                  </button>
                </div>
                {showProposals && (
                  <div className="space-y-3 mt-4">
                    {proposals.length === 0 ? (
                      <p className="text-sm text-gray-600 text-center py-4">No proposals yet.</p>
                    ) : (
                      proposals.map((proposal) => (
                        <div key={proposal._id} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-gray-900">{proposal.freelancer?.name || 'Freelancer'}</p>
                              <p className="text-xs text-gray-600">
                                Proposed: {new Date(proposal.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {proposal.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleProposalStatus(proposal._id, 'accepted')}
                                    className="px-3 py-1 text-xs bg-green-600 text-white rounded-md"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleProposalStatus(proposal._id, 'rejected')}
                                    className="px-3 py-1 text-xs bg-red-600 text-white rounded-md"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {proposal.status === 'accepted' && (
                                <div className="flex gap-2 items-center">
                                  <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md">Accepted</span>
                                  {project.status === 'in_progress' && (
                                    <Link
                                      to={`/chats/${proposal.freelancerId}`}
                                      className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                      💬 Chat
                                    </Link>
                                  )}
                                </div>
                              )}
                              {proposal.status === 'rejected' && (
                                <span className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md">Rejected</span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            {proposal.proposedPrice && <p>💰 Proposed Price: ৳{proposal.proposedPrice}</p>}
                            {proposal.hourlyRate && <p>💰 Hourly Rate: ৳{proposal.hourlyRate}/hr</p>}
                            {proposal.deliveryTime && <p>⏱️ Delivery Time: {proposal.deliveryTime}</p>}
                          </div>
                          {proposal.coverLetter && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs font-medium text-gray-700 mb-1">Cover Letter:</p>
                              <p className="text-sm text-gray-600 whitespace-pre-line">{proposal.coverLetter}</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : project.status === 'open' ? (
              <div className="bg-white border border-gray-100 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-3">Submit Proposal</h2>
                <div className="space-y-3">
                  {project.budgetType === 'fixed' ? (
                    <input
                      type="number"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(e.target.value)}
                      placeholder="Your proposed price (৳)"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    />
                  ) : (
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="Your hourly rate (৳)"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    />
                  )}
                  <input
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    placeholder="Delivery time (e.g., 3 days, 1 week)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  />
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Cover letter - explain why you're the best fit"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  />
                  <button
                    onClick={submitProposal}
                    disabled={submitting || !coverLetter || (!proposedPrice && !hourlyRate)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Proposal'}
                  </button>
                  {message && <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-lg p-6">
                <p className="text-sm text-gray-600">This project is {project.status} and not accepting new proposals.</p>
              </div>
            )}
          </div>
        )}
      </div>
      <DownNav />
    </div>
  )
}

export default ProjectDetails

