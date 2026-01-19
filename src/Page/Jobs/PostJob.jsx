import React from 'react'
import Navbar from '../../Components/Navbar/Navbar'
import DownNav from '../../Components/DownNav/DownNav'
import { useNavigate } from 'react-router'
import usePublicAxios from '../../Hooks/usePublicAxios'

const PostJob = () => {
  const navigate = useNavigate()
  const [form, setForm] = React.useState({
    title: '', description: '', category: '', location: '', jobType: 'Full-time', experienceLevel: 'Any', salaryMin: '', salaryMax: '', deadline: ''
  })
  const [message, setMessage] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const axiosPublic = usePublicAxios()

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async () => {
    try {
      setLoading(true)
      setMessage('')
      const { data } = await axiosPublic.post('/jobs', { ...form, salaryMin: Number(form.salaryMin)||null, salaryMax: Number(form.salaryMax)||null })
      if (data?.success) {
        setMessage('Job posted.')
        navigate(`/jobs/board/${data.data._id}`)
      } else {
        setMessage(data?.message || 'Failed to post job.')
      }
    } catch (e) {
      console.error(e)
      setMessage('Failed to post job.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <button onClick={() => navigate(-1)} className="px-3 py-2 text-sm rounded-md border mb-4">Back</button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Post a Job</h1>
        <div className="bg-white border border-gray-100 rounded-lg p-6 space-y-3">
          <input name="title" value={form.title} onChange={onChange} placeholder="Job Title" className="w-full px-3 py-2 border border-gray-200 rounded-md" />
          <textarea name="description" value={form.description} onChange={onChange} placeholder="Description" rows={6} className="w-full px-3 py-2 border border-gray-200 rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input name="category" value={form.category} onChange={onChange} placeholder="Category" className="w-full px-3 py-2 border border-gray-200 rounded-md" />
            <input name="location" value={form.location} onChange={onChange} placeholder="Location" className="w-full px-3 py-2 border border-gray-200 rounded-md" />
            <select name="jobType" value={form.jobType} onChange={onChange} className="w-full px-3 py-2 border border-gray-200 rounded-md">
              <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Remote</option>
            </select>
            <select name="experienceLevel" value={form.experienceLevel} onChange={onChange} className="w-full px-3 py-2 border border-gray-200 rounded-md">
              <option>Any</option><option>Entry</option><option>Mid</option><option>Senior</option><option>Lead</option>
            </select>
            <input name="salaryMin" value={form.salaryMin} onChange={onChange} placeholder="Min Salary" type="number" className="w-full px-3 py-2 border border-gray-200 rounded-md" />
            <input name="salaryMax" value={form.salaryMax} onChange={onChange} placeholder="Max Salary" type="number" className="w-full px-3 py-2 border border-gray-200 rounded-md" />
            <input name="deadline" value={form.deadline} onChange={onChange} placeholder="Deadline (YYYY-MM-DD)" className="w-full px-3 py-2 border border-gray-200 rounded-md" />
          </div>
          <button onClick={submit} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50">{loading ? 'Posting...' : 'Post Job'}</button>
          {message && <p className="text-sm text-gray-600">{message}</p>}
        </div>
      </div>
      <DownNav />
    </div>
  )
}

export default PostJob


