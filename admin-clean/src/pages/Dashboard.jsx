import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStats } from '../services/api'
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

const Dashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: []
  })
  const [loading, setLoading] = useState(true)

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

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-purple-500',
      trend: '+23%',
      trendUp: true
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'bg-orange-500',
      trend: '+15%',
      trendUp: true
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card-gradient">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text">Dashboard Overview</h1>
            <p className="text-gray-600 mt-2 font-medium">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-sm text-gray-600 font-medium">Last Updated</p>
              <p className="text-lg font-bold text-gray-900">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown
          return (
            <div key={index} className="card-gradient hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">{stat.title}</p>
                  <p className="text-4xl font-bold text-gray-900 mt-3 mb-3">{stat.value}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${stat.trendUp ? 'bg-green-100' : 'bg-red-100'}`}>
                      <TrendIcon size={14} className={stat.trendUp ? 'text-green-600' : 'text-red-600'} />
                      <span className={`text-xs font-bold ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.trend}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">vs last month</span>
                  </div>
                </div>
                <div className={`${stat.color} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="text-white" size={28} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div className="card-gradient">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">Recent Orders</h2>
          <button 
            onClick={() => navigate('/orders')}
            className="btn-secondary text-sm hover:scale-105 transition-transform"
          >
            View All
          </button>
        </div>
        {stats.recentOrders && stats.recentOrders.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-xl border-2 border-gray-100">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-xs tracking-wide">Order ID</th>
                    <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-xs tracking-wide">Products</th>
                    <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-xs tracking-wide">Total</th>
                    <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-xs tracking-wide">Status</th>
                    <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-xs tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {stats.recentOrders.map((order, idx) => (
                    <tr key={order._id} className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="py-4 px-6 font-bold text-primary-600">{order.trackingId || order._id}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          {order.items && order.items.slice(0, 3).map((item, itemIdx) => (
                            <img
                              key={itemIdx}
                              src={item.product?.image || item.image || 'https://via.placeholder.com/40'}
                              alt={item.product?.name || item.name || 'Product'}
                              className="w-10 h-10 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                              title={item.product?.name || item.name || 'Product'}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/40'
                              }}
                            />
                          ))}
                          {order.items && order.items.length > 3 && (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm border-2 border-primary-300">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900">₹{order.total}</td>
                      <td className="py-4 px-6">
                        <span className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-700 border-2 border-green-200' :
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-200' :
                          'bg-blue-100 text-blue-700 border-2 border-blue-200'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 font-medium">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-xl border-2 border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Order ID</p>
                      <p className="text-sm font-bold text-primary-600">{order.trackingId || order._id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Product Images */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 font-medium mb-2">Products</p>
                    <div className="flex items-center gap-2">
                      {order.items && order.items.slice(0, 3).map((item, itemIdx) => (
                        <img
                          key={itemIdx}
                          src={item.product?.image || item.image || 'https://via.placeholder.com/60'}
                          alt={item.product?.name || item.name || 'Product'}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/60'
                          }}
                        />
                      ))}
                      {order.items && order.items.length > 3 && (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Total Amount</p>
                      <p className="text-lg font-bold text-gray-900">₹{order.total}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Order Date</p>
                      <p className="text-sm font-medium text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
            <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 font-bold text-lg">No recent orders</p>
            <p className="text-gray-400 text-sm mt-2">Orders will appear here once customers start purchasing</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
