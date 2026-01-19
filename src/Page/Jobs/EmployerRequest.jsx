import React from 'react'
import Navbar from '../../Components/Navbar/Navbar'
import DownNav from '../../Components/DownNav/DownNav'
import { useNavigate } from 'react-router'
import usePublicAxios from '../../Hooks/usePublicAxios'

const EmployerRequest = () => {
  const navigate = useNavigate()
  const [companyName, setCompanyName] = React.useState('')
  const [companyWebsite, setCompanyWebsite] = React.useState('')
  const [companyLocation, setCompanyLocation] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [status, setStatus] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const axiosPublic = usePublicAxios()

  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosPublic.get('/employers/status')
        if (data?.success) setStatus(data)
      } catch (e) {}
    })()
  }, [])

  const submit = async () => {
    try {
      setLoading(true)
      const { data } = await axiosPublic.post('/employers/apply', { companyName, companyWebsite, companyLocation, description })
      if (data?.success) {
        setStatus({ approved: false, status: 'pending', employer: data.data })
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
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <button onClick={() => navigate(-1)} className="px-3 py-2 text-sm rounded-md border mb-4">Back</button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Become an Employer</h1>
        {status?.status === 'pending' ? (
          <div className="bg-white border border-gray-100 rounded-lg p-6">Your request is pending approval.</div>
        ) : status?.approved ? (
          <div className="bg-white border border-gray-100 rounded-lg p-6">You are approved to post jobs.</div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-lg p-6 space-y-3">
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company Name" className="w-full px-3 py-2 border border-gray-200 rounded-md" />
            <input value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} placeholder="Company Website (optional)" className="w-full px-3 py-2 border border-gray-200 rounded-md" />
            <input value={companyLocation} onChange={(e) => setCompanyLocation(e.target.value)} placeholder="Company Location" className="w-full px-3 py-2 border border-gray-200 rounded-md" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Company Description" rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-md" />
            <button onClick={submit} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50">{loading ? 'Submitting...' : 'Submit Request'}</button>
          </div>
        )}
      </div>
      <DownNav />
    </div>
  )
}

export default EmployerRequest


