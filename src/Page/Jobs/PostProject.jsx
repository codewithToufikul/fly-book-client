import React from 'react'
import { useNavigate } from 'react-router'
import Navbar from '../../Components/Navbar/Navbar'
import DownNav from '../../Components/DownNav/DownNav'
import usePublicAxios from '../../Hooks/usePublicAxios'

const PostProject = () => {
  const navigate = useNavigate()
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [category, setCategory] = React.useState('')
  const [budgetType, setBudgetType] = React.useState('fixed')
  const [budget, setBudget] = React.useState('')
  const [skills, setSkills] = React.useState('')
  const [deadline, setDeadline] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const axiosPublic = usePublicAxios()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setMessage('')
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s)
      const { data } = await axiosPublic.post('/projects', {
        title,
        description,
        category,
        budgetType,
        budget,
        skills: skillsArray,
        deadline: deadline || null,
      })
      if (data?.success) {
        setMessage('Project posted successfully!')
        setTimeout(() => {
          navigate(`/jobs/freelance/${data.data._id}`)
        }, 1500)
      } else {
        setMessage(data?.message || 'Failed to post project.')
      }
    } catch (e) {
      console.error(e)
      setMessage(e.response?.data?.message || 'Failed to post project.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Post a Project</h1>
          <button onClick={() => navigate('/jobs/freelance')} className="px-3 py-2 text-sm rounded-md border">Back</button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Need a website developer"
              className="w-full px-3 py-2 border border-gray-200 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              placeholder="Describe your project in detail..."
              className="w-full px-3 py-2 border border-gray-200 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              placeholder="e.g., Web Development, Design, Writing"
              className="w-full px-3 py-2 border border-gray-200 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Type *</label>
            <select
              value={budgetType}
              onChange={(e) => setBudgetType(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-md"
            >
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly Rate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {budgetType === 'fixed' ? 'Budget (৳)' : 'Hourly Rate (৳)'} *
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
              placeholder={budgetType === 'fixed' ? 'e.g., 5000' : 'e.g., 500'}
              className="w-full px-3 py-2 border border-gray-200 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g., React, Node.js, Design"
              className="w-full px-3 py-2 border border-gray-200 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (optional)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Project'}
          </button>
          {message && <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
        </form>
      </div>
      <DownNav />
    </div>
  )
}

export default PostProject

