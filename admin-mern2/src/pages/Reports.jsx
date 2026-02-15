import { useState, useEffect } from 'react'
import { getStats } from '../services/api'
import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react'

const Reports = () => {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('month')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await getStats()
      setStats(response.data)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">View business insights and reports</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Download size={20} />
          Export Report
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div className="flex items-center gap-4">
          <Calendar className="text-gray-400" size={20} />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600">Total Revenue</h3>
            <TrendingUp className="text-green-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">₹{stats.totalRevenue?.toLocaleString() || 0}</p>
          <p className="text-sm text-green-600 mt-2">+15% from last month</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600">Total Orders</h3>
            <BarChart3 className="text-blue-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
          <p className="text-sm text-blue-600 mt-2">+8% from last month</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600">New Customers</h3>
            <TrendingUp className="text-purple-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
          <p className="text-sm text-purple-600 mt-2">+23% from last month</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600">Avg Order Value</h3>
            <BarChart3 className="text-orange-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{stats.totalRevenue && stats.totalOrders ? Math.round(stats.totalRevenue / stats.totalOrders) : 0}
          </p>
          <p className="text-sm text-orange-600 mt-2">+5% from last month</p>
        </div>
      </div>

      {/* Sales by Category */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sales by Category</h2>
        <div className="space-y-4">
          {['Fashion', 'Electronics', 'Beauty', 'Sports', 'Home & Kitchen'].map((category, index) => {
            const percentage = [35, 25, 20, 12, 8][index]
            return (
              <div key={category}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{category}</span>
                  <span className="text-gray-600">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Products */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Sales</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Nike Air Max', category: 'Fashion', sales: 145, revenue: 1305550 },
                { name: 'iPhone 15 Pro', category: 'Electronics', sales: 98, revenue: 9800000 },
                { name: 'Lipstick Set', category: 'Beauty', sales: 234, revenue: 234000 },
              ].map((product, index) => (
                <tr key={index} className="border-t border-gray-100">
                  <td className="py-3 px-4 font-medium">{product.name}</td>
                  <td className="py-3 px-4">{product.category}</td>
                  <td className="py-3 px-4">{product.sales}</td>
                  <td className="py-3 px-4 font-semibold">₹{product.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.ordersByStatus?.map((item) => (
            <div key={item._id} className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">{item._id}</p>
              <p className="text-2xl font-bold text-gray-900">{item.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Reports
