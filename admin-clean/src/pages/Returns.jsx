import { useState, useEffect } from 'react'
import { RotateCcw, Search, Eye, CheckCircle, XCircle, DollarSign, Package, RefreshCw } from 'lucide-react'

const Returns = () => {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReturn, setSelectedReturn] = useState(null)
  const [showRefundModal, setShowRefundModal] = useState(null)
  const [refundData, setRefundData] = useState({
    amount: 0,
    method: 'original',
    notes: ''
  })

  useEffect(() => {
    fetchReturns()
  }, [])

  const fetchReturns = async () => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('adminToken')
      if (!token) {
        alert('Please login first')
        return
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.3:5000/api'
      const response = await fetch(`${API_URL}/admin/returns?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Returns fetched:', data)
      setReturns(data.returns || [])
    } catch (error) {
      console.error('Error fetching returns:', error)
      alert(`Failed to fetch returns: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const filteredReturns = returns.filter(r =>
    r.returnId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.orderId?.trackingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      case 'Refunded':
        return 'bg-blue-100 text-blue-800'
      case 'Picked Up':
        return 'bg-purple-100 text-purple-800'
      case 'Received':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleApprove = async (returnItem) => {
    setRefundData({
      amount: returnItem.refund?.amount || 0,
      method: 'original',
      notes: ''
    })
    setShowRefundModal(returnItem)
  }

  const handleReject = async (returnItem) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return
    
    try {
      const token = localStorage.getItem('adminToken')
      const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.3:5000/api'
      const response = await fetch(`${API_URL}/admin/returns/${returnItem._id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })

      if (!response.ok) throw new Error('Failed to reject return')

      alert('Return request rejected')
      fetchReturns()
    } catch (error) {
      console.error('Error rejecting return:', error)
      alert('Failed to reject return')
    }
  }

  const processRefundAction = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.3:5000/api'
      const response = await fetch(`${API_URL}/admin/returns/${showRefundModal._id}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(refundData)
      })

      if (!response.ok) throw new Error('Failed to process refund')

      alert(`Refund of ₹${refundData.amount} processed successfully!`)
      setShowRefundModal(null)
      fetchReturns()
    } catch (error) {
      console.error('Error processing refund:', error)
      alert('Failed to process refund')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Returns & Refunds</h1>
          <p className="text-gray-600 mt-1">Manage product returns and refund requests</p>
        </div>
        <button
          onClick={fetchReturns}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Returns</p>
              <p className="text-3xl font-bold text-yellow-600">
                {loading ? '...' : returns.filter(r => r.status === 'Pending').length}
              </p>
            </div>
            <RotateCcw className="text-yellow-600" size={40} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-green-600">
                {loading ? '...' : returns.filter(r => r.status === 'Approved').length}
              </p>
            </div>
            <CheckCircle className="text-green-600" size={40} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-3xl font-bold text-red-600">
                {loading ? '...' : returns.filter(r => r.status === 'Rejected').length}
              </p>
            </div>
            <XCircle className="text-red-600" size={40} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Refunded</p>
              <p className="text-3xl font-bold text-blue-600">
                ₹{loading ? '...' : returns.filter(r => r.status === 'Refunded').reduce((sum, r) => sum + (r.refund?.amount || 0), 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="text-blue-600" size={40} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by Return ID, Order ID, or Customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-11"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-2">Loading returns...</p>
            </div>
          ) : filteredReturns.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto text-gray-300" size={64} />
              <p className="text-gray-600 mt-4 text-lg font-medium">No returns found</p>
              <p className="text-gray-500 text-sm mt-1">
                {returns.length === 0 
                  ? 'No return requests have been submitted yet' 
                  : 'Try adjusting your search query'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Return ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReturns.map((returnItem) => (
                  <tr key={returnItem._id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{returnItem.returnId}</td>
                    <td className="py-3 px-4">{returnItem.orderId?.trackingId || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{returnItem.userId?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{returnItem.userId?.email || ''}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{returnItem.items?.length || 0} items</td>
                    <td className="py-3 px-4 font-semibold">₹{(returnItem.refund?.amount || 0).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(returnItem.status)}`}>
                        {returnItem.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(returnItem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedReturn(returnItem)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {returnItem.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(returnItem)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve & Refund"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleReject(returnItem)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Return Details Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Return Request Details</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Return ID</p>
                    <p className="font-semibold">{selectedReturn.returnId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-semibold">{selectedReturn.orderId?.trackingId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedReturn.status)}`}>
                      {selectedReturn.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Request Date</p>
                    <p className="font-semibold">{new Date(selectedReturn.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Customer Information</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{selectedReturn.userId?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">{selectedReturn.userId?.email || ''}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Items</p>
                  {selectedReturn.items?.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-center gap-3 mb-2">
                      <Package className="text-gray-400" size={24} />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity} • Amount: ₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Return Reason</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold">{selectedReturn.reason}</p>
                    {selectedReturn.description && (
                      <p className="text-sm text-gray-600 mt-2">{selectedReturn.description}</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Refund Details</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-lg">₹{(selectedReturn.refund?.amount || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Method: {selectedReturn.refund?.method === 'original' ? 'Original Payment' : selectedReturn.refund?.method}</p>
                    <p className="text-sm text-gray-600">Status: {selectedReturn.refund?.status || 'pending'}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedReturn(null)}
                className="btn-secondary w-full mt-6"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Processing Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Process Refund</h2>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Return ID</p>
                  <p className="font-semibold text-lg">{showRefundModal.returnId}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Refund Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={refundData.amount}
                    onChange={(e) => setRefundData({ ...refundData, amount: parseFloat(e.target.value) })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Refund Method
                  </label>
                  <select
                    value={refundData.method}
                    onChange={(e) => setRefundData({ ...refundData, method: e.target.value })}
                    className="input-field"
                  >
                    <option value="original">Original Payment Method</option>
                    <option value="store_credit">Store Credit</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={refundData.notes}
                    onChange={(e) => setRefundData({ ...refundData, notes: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="Add any notes about this refund..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={processRefundAction}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <DollarSign size={20} />
                    Process Refund
                  </button>
                  <button
                    onClick={() => setShowRefundModal(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Returns
