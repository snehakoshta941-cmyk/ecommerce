import { useState, useEffect } from 'react'
import { getInventory, updateStock } from '../services/api'
import { Warehouse, Search, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

const Inventory = () => {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadInventory()
  }, [])

  useEffect(() => {
    const filtered = inventory.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredInventory(filtered)
  }, [searchQuery, inventory])

  const loadInventory = async () => {
    try {
      const response = await getInventory()
      setInventory(response.data.products || [])
      setFilteredInventory(response.data.products || [])
      setStats(response.data.stats || {})
    } catch (error) {
      console.error('Error loading inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStock = async (productId, currentStock) => {
    const newStock = prompt(`Update stock (Current: ${currentStock}):`, currentStock)
    if (newStock === null) return

    try {
      await updateStock(productId, { action: 'set', stock: parseInt(newStock) })
      loadInventory()
      alert('Stock updated successfully!')
    } catch (error) {
      alert('Error updating stock')
    }
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: XCircle }
    if (stock <= 10) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle }
    return { label: 'In Stock', color: 'bg-green-100 text-green-800', icon: CheckCircle }
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage stock levels</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.lowStock || 0}</p>
            </div>
            <AlertTriangle className="text-yellow-600" size={40} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600">{stats.outOfStock || 0}</p>
            </div>
            <XCircle className="text-red-600" size={40} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Stock</p>
              <p className="text-3xl font-bold text-green-600">{stats.inStock || 0}</p>
            </div>
            <CheckCircle className="text-green-600" size={40} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-11"
          />
        </div>
      </div>

      {/* Inventory Table - Desktop */}
      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Image</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((product) => {
                const stock = product.stock || 0
                const status = getStockStatus(stock)
                const StatusIcon = status.icon
                return (
                  <tr key={product._id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <img
                        src={product.image || product.images?.[0] || 'https://via.placeholder.com/50'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/50?text=No+Image'
                        }}
                      />
                    </td>
                    <td className="py-3 px-4 font-medium">{product.name}</td>
                    <td className="py-3 px-4">{product.category}</td>
                    <td className="py-3 px-4">₹{product.price}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                        {stock}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <StatusIcon size={16} className={status.color.includes('red') ? 'text-red-600' : status.color.includes('yellow') ? 'text-yellow-600' : 'text-green-600'} />
                        <span className={`text-xs font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleUpdateStock(product._id, stock)}
                        className="btn-primary text-sm py-1 px-3"
                      >
                        Update Stock
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Cards - Mobile */}
      <div className="block md:hidden space-y-4">
        {filteredInventory.map((product) => {
          const stock = product.stock || 0
          const status = getStockStatus(stock)
          const StatusIcon = status.icon
          return (
            <div key={product._id} className="card">
              {/* Product Image and Name */}
              <div className="flex gap-3 mb-3 pb-3 border-b border-gray-200">
                <img
                  src={product.image || product.images?.[0] || 'https://via.placeholder.com/80'}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80?text=No+Image'
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{product.category}</p>
                  <p className="text-lg font-bold text-primary-600">₹{product.price}</p>
                </div>
              </div>

              {/* Stock Info */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Stock Level</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon size={16} className={status.color.includes('red') ? 'text-red-600' : status.color.includes('yellow') ? 'text-yellow-600' : 'text-green-600'} />
                    <span className={`text-xs font-semibold ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <span className={`text-2xl font-bold ${status.color}`}>
                    {stock}
                  </span>
                  <span className="text-xs text-gray-600 ml-2">units</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Inventory
