import React from 'react'
import usePublicAxios from '../../Hooks/usePublicAxios'

const AdminEmployerRequests = () => {
  const axiosPublic = usePublicAxios()
  const [loading, setLoading] = React.useState(true)
  const [items, setItems] = React.useState([])
  const [actionId, setActionId] = React.useState(null)
  const [error, setError] = React.useState('')

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await axiosPublic.get('/admin/employers/requests')
      if (data?.success) setItems(data.data || [])
    } catch (e) {
      setError('Failed to load employer requests')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const approve = async (id) => {
    try {
      setActionId(id)
      await axiosPublic.patch(`/admin/employers/${id}/approve`)
      await load()
    } catch (e) {
      console.error(e)
    } finally {
      setActionId(null)
    }
  }

  const reject = async (id) => {
    try {
      setActionId(id)
      await axiosPublic.patch(`/admin/employers/${id}/reject`, { reason: '' })
      await load()
    } catch (e) {
      console.error(e)
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Employer Requests</h2>
        <button onClick={load} className="px-3 py-2 text-sm border rounded">Refresh</button>
      </div>
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      {loading ? (
        <div className="bg-white border border-gray-100 rounded p-4">Loading...</div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded p-4">No pending requests.</div>
      ) : (
        <div className="space-y-3">
          {items.map((req) => (
            <div key={req._id} className="bg-white border border-gray-100 rounded p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-medium text-gray-900">{req.companyName}</div>
                  <div className="text-sm text-gray-600">
                    {req.companyWebsite || '—'} • {req.companyLocation || '—'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approve(req._id)}
                    disabled={actionId === req._id}
                    className="px-3 py-2 text-sm bg-emerald-600 text-white rounded disabled:opacity-50"
                  >
                    {actionId === req._id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => reject(req._id)}
                    disabled={actionId === req._id}
                    className="px-3 py-2 text-sm bg-red-600 text-white rounded disabled:opacity-50"
                  >
                    {actionId === req._id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
              {req.description && <p className="text-sm text-gray-700 mt-2">{req.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminEmployerRequests


