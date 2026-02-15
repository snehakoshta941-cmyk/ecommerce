import { useState } from 'react'
import { Shield, Download, Trash2, Eye, CheckCircle, AlertTriangle, FileText } from 'lucide-react'

const GDPRCompliance = () => {
  const [requests, setRequests] = useState([
    {
      id: '1',
      userId: 'user123',
      userName: 'John Doe',
      email: 'john@example.com',
      type: 'Data Export',
      status: 'Pending',
      requestDate: new Date('2026-02-01'),
      completedDate: null
    },
    {
      id: '2',
      userId: 'user456',
      userName: 'Jane Smith',
      email: 'jane@example.com',
      type: 'Data Deletion',
      status: 'Completed',
      requestDate: new Date('2026-01-28'),
      completedDate: new Date('2026-02-05')
    },
    {
      id: '3',
      userId: 'user789',
      userName: 'Bob Johnson',
      email: 'bob@example.com',
      type: 'Data Access',
      status: 'In Progress',
      requestDate: new Date('2026-02-03'),
      completedDate: null
    }
  ])

  const [showModal, setShowModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)

  const handleExportUserData = (request) => {
    const userData = {
      personalInfo: {
        name: request.userName,
        email: request.email,
        phone: '+91 9876543210',
        address: '123 Main St, City, State'
      },
      orders: [
        { id: 'ORD001', date: '2026-01-15', total: 2500 },
        { id: 'ORD002', date: '2026-01-20', total: 1800 }
      ],
      wishlist: ['Product A', 'Product B'],
      reviews: ['Great product!', 'Excellent service']
    }

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `user_data_${request.userId}_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)

    setRequests(requests.map(r => 
      r.id === request.id ? { ...r, status: 'Completed', completedDate: new Date() } : r
    ))
    alert('User data exported successfully!')
  }

  const handleDeleteUserData = (request) => {
    if (confirm(`Are you sure you want to permanently delete all data for ${request.userName}? This action cannot be undone.`)) {
      setRequests(requests.map(r => 
        r.id === request.id ? { ...r, status: 'Completed', completedDate: new Date() } : r
      ))
      alert('User data deletion completed!')
    }
  }

  const handleViewRequest = (request) => {
    setSelectedRequest(request)
    setShowModal(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Data Export':
        return <Download className="text-blue-600" size={20} />
      case 'Data Deletion':
        return <Trash2 className="text-red-600" size={20} />
      case 'Data Access':
        return <Eye className="text-purple-600" size={20} />
      default:
        return <FileText className="text-gray-600" size={20} />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">GDPR Compliance</h1>
        <p className="text-gray-600 mt-1">Manage user data requests and privacy compliance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90">Total Requests</p>
          <p className="text-3xl font-bold mt-1">{requests.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <p className="text-sm opacity-90">Pending</p>
          <p className="text-3xl font-bold mt-1">{requests.filter(r => r.status === 'Pending').length}</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-400 to-blue-500 text-white">
          <p className="text-sm opacity-90">In Progress</p>
          <p className="text-3xl font-bold mt-1">{requests.filter(r => r.status === 'In Progress').length}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90">Completed</p>
          <p className="text-3xl font-bold mt-1">{requests.filter(r => r.status === 'Completed').length}</p>
        </div>
      </div>

      {/* Compliance Info */}
      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <Shield className="text-blue-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">GDPR Compliance Requirements</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Respond to data access requests within 30 days</li>
              <li>• Provide data in a machine-readable format</li>
              <li>• Delete user data upon request (Right to be Forgotten)</li>
              <li>• Maintain audit trail of all data operations</li>
              <li>• Ensure data portability and transparency</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Request ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Request Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Completed Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{request.id}</td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{request.userName}</p>
                      <p className="text-sm text-gray-600">{request.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(request.type)}
                      <span>{request.type}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {request.requestDate.toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {request.completedDate ? request.completedDate.toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewRequest(request)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {request.type === 'Data Export' && request.status !== 'Completed' && (
                        <button
                          onClick={() => handleExportUserData(request)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Export Data"
                        >
                          <Download size={18} />
                        </button>
                      )}
                      {request.type === 'Data Deletion' && request.status !== 'Completed' && (
                        <button
                          onClick={() => handleDeleteUserData(request)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Data"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Checklist */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Compliance Checklist</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-sm">Data encryption at rest and in transit</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-sm">User consent management system</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-sm">Privacy policy and terms of service</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-sm">Data breach notification procedures</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="text-yellow-600" size={20} />
            <span className="text-sm">Regular data protection impact assessments (Due in 30 days)</span>
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Request Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Request ID</p>
                    <p className="font-semibold">{selectedRequest.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-semibold">{selectedRequest.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">User Name</p>
                    <p className="font-semibold">{selectedRequest.userName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Request Date</p>
                    <p className="font-semibold">{selectedRequest.requestDate.toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Data Scope</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Personal information (name, email, phone)</li>
                    <li>• Order history and transactions</li>
                    <li>• Wishlist and saved items</li>
                    <li>• Reviews and ratings</li>
                    <li>• Communication history</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  {selectedRequest.type === 'Data Export' && selectedRequest.status !== 'Completed' && (
                    <button
                      onClick={() => {
                        handleExportUserData(selectedRequest)
                        setShowModal(false)
                      }}
                      className="btn-primary flex-1"
                    >
                      Export User Data
                    </button>
                  )}
                  {selectedRequest.type === 'Data Deletion' && selectedRequest.status !== 'Completed' && (
                    <button
                      onClick={() => {
                        handleDeleteUserData(selectedRequest)
                        setShowModal(false)
                      }}
                      className="btn-primary bg-red-600 hover:bg-red-700 flex-1"
                    >
                      Delete User Data
                    </button>
                  )}
                  <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                    Close
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

export default GDPRCompliance
