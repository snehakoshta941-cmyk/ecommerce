import { useState, useEffect } from 'react'
import { getUsers, getUserDetails } from '../services/api'
import { Users as UsersIcon, Search, Eye, Mail, Phone, Calendar, Ban, CheckCircle, Download, Activity, Shield } from 'lucide-react'

const Users = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetails, setUserDetails] = useState(null)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [activityLogs, setActivityLogs] = useState([])

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter(u =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchQuery, users])

  const loadUsers = async () => {
    try {
      const response = await getUsers()
      const usersData = response.data.users || []
      // Add blocked status if not present
      const usersWithStatus = usersData.map(user => ({
        ...user,
        isBlocked: user.isBlocked || false
      }))
      setUsers(usersWithStatus)
      setFilteredUsers(usersWithStatus)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (userId) => {
    try {
      const response = await getUserDetails(userId)
      setUserDetails(response.data)
      setSelectedUser(userId)
    } catch (error) {
      alert('Error loading user details')
    }
  }

  const handleBlockUnblock = async (userId, currentStatus) => {
    const action = currentStatus ? 'unblock' : 'block'
    if (!confirm(`Are you sure you want to ${action} this user?`)) return

    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isBlocked: !currentStatus } : user
      ))
      setFilteredUsers(filteredUsers.map(user => 
        user._id === userId ? { ...user, isBlocked: !currentStatus } : user
      ))
      
      alert(`User ${action}ed successfully!`)
    } catch (error) {
      alert(`Failed to ${action} user`)
    }
  }

  const handleViewActivity = (userId) => {
    // Simulate activity logs - replace with actual API
    const mockActivity = [
      { id: 1, action: 'Login', timestamp: new Date(), ip: '192.168.1.100', device: 'Chrome on Windows' },
      { id: 2, action: 'Order Placed', timestamp: new Date(Date.now() - 3600000), ip: '192.168.1.100', device: 'Chrome on Windows' },
      { id: 3, action: 'Profile Updated', timestamp: new Date(Date.now() - 7200000), ip: '192.168.1.100', device: 'Chrome on Windows' },
      { id: 4, action: 'Login', timestamp: new Date(Date.now() - 86400000), ip: '192.168.1.101', device: 'Safari on iPhone' },
      { id: 5, action: 'Password Changed', timestamp: new Date(Date.now() - 172800000), ip: '192.168.1.100', device: 'Chrome on Windows' },
    ]
    setActivityLogs(mockActivity)
    setShowActivityModal(true)
  }

  const handleExportUsers = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Joined Date']
    const rows = filteredUsers.map(user => [
      user.name,
      user.email,
      user.phone || 'N/A',
      user.isBlocked ? 'Blocked' : 'Active',
      new Date(user.createdAt).toLocaleDateString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage registered customers</p>
        </div>
        <button
          onClick={handleExportUsers}
          className="btn-secondary flex items-center gap-2"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90">Total Users</p>
          <p className="text-3xl font-bold mt-1">{users.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90">Active Users</p>
          <p className="text-3xl font-bold mt-1">{users.filter(u => !u.isBlocked).length}</p>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <p className="text-sm opacity-90">Blocked Users</p>
          <p className="text-3xl font-bold mt-1">{users.filter(u => u.isBlocked).length}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90">New This Month</p>
          <p className="text-3xl font-bold mt-1">
            {users.filter(u => new Date(u.createdAt).getMonth() === new Date().getMonth()).length}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-11"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">{user.phone || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.isBlocked 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(user._id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleViewActivity(user._id)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="View Activity"
                      >
                        <Activity size={18} />
                      </button>
                      <button
                        onClick={() => handleBlockUnblock(user._id, user.isBlocked)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.isBlocked
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={user.isBlocked ? 'Unblock User' : 'Block User'}
                      >
                        {user.isBlocked ? <CheckCircle size={18} /> : <Ban size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {userDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">User Details</h2>
                <div className="flex items-center gap-2">
                  <Shield className="text-primary-600" size={20} />
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    userDetails.user.isBlocked 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {userDetails.user.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <UsersIcon className="text-primary-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold">{userDetails.user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="text-primary-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{userDetails.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="text-primary-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold">{userDetails.user.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="text-primary-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Joined</p>
                      <p className="font-semibold">
                        {new Date(userDetails.user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-600">{userDetails.totalOrders}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-green-600">₹{userDetails.totalSpent}</p>
                  </div>
                </div>

                {userDetails.orders && userDetails.orders.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Recent Orders</p>
                    <div className="space-y-2">
                      {userDetails.orders.slice(0, 5).map((order) => (
                        <div key={order._id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <div>
                            <p className="font-medium">{order.trackingId || order._id}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₹{order.total}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleBlockUnblock(userDetails.user._id, userDetails.user.isBlocked)}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                    userDetails.user.isBlocked
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {userDetails.user.isBlocked ? 'Unblock User' : 'Block User'}
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(null)
                    setUserDetails(null)
                  }}
                  className="flex-1 btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="text-primary-600" size={24} />
                <h2 className="text-2xl font-bold">User Activity History</h2>
              </div>
              
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{log.action}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {log.device}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">IP: {log.ip}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowActivityModal(false)}
                className="btn-secondary w-full mt-6"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
