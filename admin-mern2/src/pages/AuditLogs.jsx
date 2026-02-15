import { useState } from 'react'
import { FileText, Search, Filter, Download, User, Package, ShoppingCart, Settings as SettingsIcon } from 'lucide-react'

const AuditLogs = () => {
  const [logs] = useState([
    {
      id: 1,
      action: 'Order Status Updated',
      module: 'Orders',
      user: 'admin@admin.com',
      details: 'Changed order #TRK123 status from Pending to Processing',
      ipAddress: '192.168.1.3',
      timestamp: new Date('2026-02-08T10:30:00'),
      severity: 'info'
    },
    {
      id: 2,
      action: 'Product Created',
      module: 'Products',
      user: 'admin@admin.com',
      details: 'Created new product: Nike Air Max',
      ipAddress: '192.168.1.3',
      timestamp: new Date('2026-02-08T09:15:00'),
      severity: 'info'
    },
    {
      id: 3,
      action: 'User Blocked',
      module: 'Users',
      user: 'admin@admin.com',
      details: 'Blocked user: john@example.com',
      ipAddress: '192.168.1.3',
      timestamp: new Date('2026-02-08T08:45:00'),
      severity: 'warning'
    },
    {
      id: 4,
      action: 'Settings Changed',
      module: 'Settings',
      user: 'admin@admin.com',
      details: 'Enabled maintenance mode',
      ipAddress: '192.168.1.3',
      timestamp: new Date('2026-02-07T16:20:00'),
      severity: 'critical'
    },
    {
      id: 5,
      action: 'Refund Processed',
      module: 'Returns',
      user: 'admin@admin.com',
      details: 'Processed refund of ₹8999 for return #RET001',
      ipAddress: '192.168.1.3',
      timestamp: new Date('2026-02-07T14:10:00'),
      severity: 'info'
    },
    {
      id: 6,
      action: 'Login Attempt Failed',
      module: 'Authentication',
      user: 'unknown@example.com',
      details: 'Failed login attempt - Invalid credentials',
      ipAddress: '192.168.1.100',
      timestamp: new Date('2026-02-07T12:05:00'),
      severity: 'warning'
    },
    {
      id: 7,
      action: 'Product Deleted',
      module: 'Products',
      user: 'admin@admin.com',
      details: 'Deleted product: Old Product Name',
      ipAddress: '192.168.1.3',
      timestamp: new Date('2026-02-06T18:30:00'),
      severity: 'warning'
    },
    {
      id: 8,
      action: 'Bulk Stock Update',
      module: 'Inventory',
      user: 'admin@admin.com',
      details: 'Updated stock for 25 products',
      ipAddress: '192.168.1.3',
      timestamp: new Date('2026-02-06T15:45:00'),
      severity: 'info'
    }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterModule, setFilterModule] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesModule = filterModule === 'all' || log.module === filterModule
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity

    return matchesSearch && matchesModule && matchesSeverity
  })

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getModuleIcon = (module) => {
    switch (module) {
      case 'Users':
        return <User size={20} className="text-purple-600" />
      case 'Products':
        return <Package size={20} className="text-blue-600" />
      case 'Orders':
        return <ShoppingCart size={20} className="text-green-600" />
      case 'Settings':
        return <SettingsIcon size={20} className="text-gray-600" />
      default:
        return <FileText size={20} className="text-gray-600" />
    }
  }

  const handleExport = () => {
    alert('Exporting audit logs to CSV...')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">Track all admin activities and system events</p>
        </div>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2">
          <Download size={20} />
          Export Logs
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-3xl font-bold text-gray-900">{logs.length}</p>
            </div>
            <FileText className="text-gray-600" size={40} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-3xl font-bold text-red-600">
                {logs.filter(l => l.severity === 'critical').length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 font-bold">!</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Warnings</p>
              <p className="text-3xl font-bold text-yellow-600">
                {logs.filter(l => l.severity === 'warning').length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-yellow-600 font-bold">⚠</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Info</p>
              <p className="text-3xl font-bold text-blue-600">
                {logs.filter(l => l.severity === 'info').length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold">i</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="input-field pl-11"
            >
              <option value="all">All Modules</option>
              <option value="Orders">Orders</option>
              <option value="Products">Products</option>
              <option value="Users">Users</option>
              <option value="Settings">Settings</option>
              <option value="Returns">Returns</option>
              <option value="Inventory">Inventory</option>
              <option value="Authentication">Authentication</option>
            </select>
          </div>
          <div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="input-field"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Timestamp</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Module</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Details</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">IP Address</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Severity</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {log.timestamp.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getModuleIcon(log.module)}
                      <span className="font-medium">{log.module}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{log.action}</td>
                  <td className="py-3 px-4 text-sm">{log.user}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 text-sm font-mono">{log.ipAddress}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(log.severity)}`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLogs.length === 0 && (
        <div className="card text-center py-12">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No logs found matching your filters</p>
        </div>
      )}
    </div>
  )
}

export default AuditLogs
