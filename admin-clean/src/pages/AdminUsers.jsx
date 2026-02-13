import { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, Shield, CheckCircle, XCircle, Key } from 'lucide-react'

const AdminUsers = () => {
  const [adminUsers, setAdminUsers] = useState([
    {
      _id: '1',
      name: 'Super Admin',
      email: 'admin@admin.com',
      role: 'Super Admin',
      permissions: ['all'],
      isActive: true,
      createdAt: new Date('2026-01-01'),
      lastLogin: new Date()
    }
  ])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Admin',
    permissions: []
  })

  const roles = [
    { name: 'Super Admin', description: 'Full system access', permissions: ['all'] },
    { name: 'Admin', description: 'Manage products, orders, users', permissions: ['products', 'orders', 'users'] },
    { name: 'Manager', description: 'View and manage orders', permissions: ['orders', 'shipments'] },
    { name: 'Support', description: 'Handle tickets and customer support', permissions: ['tickets', 'users'] },
    { name: 'Viewer', description: 'Read-only access', permissions: ['view'] }
  ]

  const allPermissions = [
    { id: 'products', name: 'Products', description: 'Manage products and inventory' },
    { id: 'orders', name: 'Orders', description: 'View and manage orders' },
    { id: 'users', name: 'Users', description: 'Manage customer accounts' },
    { id: 'tickets', name: 'Tickets', description: 'Handle support tickets' },
    { id: 'shipments', name: 'Shipments', description: 'Manage shipments and returns' },
    { id: 'reports', name: 'Reports', description: 'View analytics and reports' },
    { id: 'settings', name: 'Settings', description: 'System configuration' },
    { id: 'admin-users', name: 'Admin Users', description: 'Manage admin accounts' }
  ]

  useEffect(() => {
    const filtered = adminUsers.filter(u =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchQuery, adminUsers])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const selectedRole = roles.find(r => r.name === formData.role)
    const newUser = {
      _id: editingUser ? editingUser._id : Date.now().toString(),
      ...formData,
      permissions: selectedRole.permissions,
      isActive: true,
      createdAt: editingUser ? editingUser.createdAt : new Date(),
      lastLogin: editingUser ? editingUser.lastLogin : null
    }

    if (editingUser) {
      setAdminUsers(adminUsers.map(u => u._id === editingUser._id ? newUser : u))
      alert('Admin user updated successfully!')
    } else {
      setAdminUsers([...adminUsers, newUser])
      alert('Admin user created successfully!')
    }

    resetForm()
  }

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this admin user?')) {
      setAdminUsers(adminUsers.filter(u => u._id !== userId))
      alert('Admin user deleted successfully!')
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      permissions: user.permissions
    })
    setShowAddModal(true)
  }

  const toggleUserStatus = (userId) => {
    setAdminUsers(adminUsers.map(u =>
      u._id === userId ? { ...u, isActive: !u.isActive } : u
    ))
    alert('User status updated!')
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Admin',
      permissions: []
    })
    setEditingUser(null)
    setShowAddModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin User Management</h1>
          <p className="text-gray-600 mt-1">Manage admin accounts and permissions (RBAC)</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Admin User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90">Total Admins</p>
          <p className="text-3xl font-bold mt-1">{adminUsers.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90">Active</p>
          <p className="text-3xl font-bold mt-1">{adminUsers.filter(u => u.isActive).length}</p>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <p className="text-sm opacity-90">Inactive</p>
          <p className="text-3xl font-bold mt-1">{adminUsers.filter(u => !u.isActive).length}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90">Super Admins</p>
          <p className="text-3xl font-bold mt-1">{adminUsers.filter(u => u.role === 'Super Admin').length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search admin users by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-11"
          />
        </div>
      </div>

      {/* Roles Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Available Roles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map(role => (
            <div key={role.name} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="text-primary-600" size={20} />
                <h4 className="font-semibold">{role.name}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">{role.description}</p>
              <div className="flex flex-wrap gap-1">
                {role.permissions.map(perm => (
                  <span key={perm} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Permissions</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Login</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.slice(0, 3).map(perm => (
                        <span key={perm} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {perm}
                        </span>
                      ))}
                      {user.permissions.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{user.permissions.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleUserStatus(user._id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit size={18} />
                      </button>
                      {user.role !== 'Super Admin' && (
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
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

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingUser ? 'Edit Admin User' : 'Add New Admin User'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password {editingUser && '(leave blank to keep current)'}
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-field pl-11"
                      required={!editingUser}
                      placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field"
                    required
                  >
                    {roles.map(role => (
                      <option key={role.name} value={role.name}>
                        {role.name} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Permissions (Auto-assigned based on role)
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {roles.find(r => r.name === formData.role)?.permissions.map(perm => (
                        <span key={perm} className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full flex items-center gap-1">
                          <CheckCircle size={14} />
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingUser ? 'Update Admin User' : 'Create Admin User'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Reference */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Permissions Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allPermissions.map(perm => (
            <div key={perm.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="text-primary-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-semibold text-sm">{perm.name}</p>
                <p className="text-xs text-gray-600">{perm.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminUsers
