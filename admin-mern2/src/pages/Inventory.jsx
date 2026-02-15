import { useState, useEffect } from 'react'
import { getInventory, updateStock } from '../services/api'
import { Warehouse, Search, AlertTriangle, CheckCircle, XCircle, Plus, Minus, Save, X, Edit2 } from 'lucide-react'

const Inventory = () => {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingStock, setEditingStock] = useState({})
  const [updatingStock, setUpdatingStock] = useState({})

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

  const startEditingStock = (productId, currentStock) => {
    setEditingStock({ ...editingStock, [productId]: currentStock })
  }

  const cancelEditingStock = (productId) => {
    const newEditing = { ...editingStock }
    delete newEditing[productId]
    setEditingStock(newEditing)
  }

  const handleStockChange = (productId, value) => {
    const numValue = parseInt(value) || 0
    setEditingStock({ ...editingStock, [productId]: numValue })
  }

  const quickAdjustStock = (productId, currentStock, adjustment) => {
    const newStock = Math.max(0, currentStock + adjustment)
    setEditingStock({ ...editingStock, [productId]: newStock })
  }

  const saveStockUpdate = async (productId) => {
    const newStock = editingStock[productId]
    if (newStock === undefined) return

    setUpdatingStock({ ...updatingStock, [productId]: true })
    
    try {
      await updateStock(productId, { action: 'set', stock: newStock })
      
      // Update local state immediately for real-time feel
      setInventory(prev => prev.map(p => 
        p._id === productId ? { ...p, stock: newStock } : p
      ))
      setFilteredInventory(prev => prev.map(p => 
        p._id === productId ? { ...p, stock: newStock } : p
      ))
      
      // Update stats
      const updatedInventory = inventory.map(p => 
        p._id === productId ? { ...p, stock: newStock } : p
      )
      updateStats(updatedInventory)
      
      cancelEditingStock(productId)
      
      // Show success notification
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in'
      notification.textContent = '✓ Stock updated successfully!'
      document.body.appendChild(notification)
      setTimeout(() => notification.remove(), 2000)
      
    } catch (error) {
      alert('Error updating stock')
    } finally {
      setUpdatingStock({ ...updatingStock, [productId]: false })
    }
  }

  const updateStats = (products) => {
    const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length
    const outOfStock = products.filter(p => (p.stock || 0) === 0).length
    const inStock = products.filter(p => (p.stock || 0) > 10).length
    setStats({ lowStock, outOfStock, inStock })
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
                      {editingStock[product._id] !== undefined ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => quickAdjustStock(product._id, editingStock[product._id], -10)}
                            className="p-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                            title="Decrease by 10"
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            value={editingStock[product._id]}
                            onChange={(e) => handleStockChange(product._id, e.target.value)}
                            className="w-20 px-2 py-1 border border-primary-500 rounded text-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                            min="0"
                            autoFocus
                          />
                          <button
                            onClick={() => quickAdjustStock(product._id, editingStock[product._id], 10)}
                            className="p-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                            title="Increase by 10"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                          {stock}
                        </span>
                      )}
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
                      {editingStock[product._id] !== undefined ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveStockUpdate(product._id)}
                            disabled={updatingStock[product._id]}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            title="Save"
                          >
                            {updatingStock[product._id] ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            ) : (
                              <Save size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => cancelEditingStock(product._id)}
                            disabled={updatingStock[product._id]}
                            className="p-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition-colors disabled:opacity-50"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditingStock(product._id, stock)}
                          className="btn-primary text-sm py-1 px-3 flex items-center gap-2"
                        >
                          <Edit2 size={14} />
                          Edit Stock
                        </button>
                      )}
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
                
                {editingStock[product._id] !== undefined ? (
                  <div className="flex items-center gap-2 justify-center p-2 bg-gray-50 rounded-lg">
                    <button
                      onClick={() => quickAdjustStock(product._id, editingStock[product._id], -10)}
                      className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                      title="Decrease by 10"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      value={editingStock[product._id]}
                      onChange={(e) => handleStockChange(product._id, e.target.value)}
                      className="w-24 px-3 py-2 border-2 border-primary-500 rounded-lg text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="0"
                      autoFocus
                    />
                    <button
                      onClick={() => quickAdjustStock(product._id, editingStock[product._id], 10)}
                      className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                      title="Increase by 10"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <span className={`text-2xl font-bold ${status.color}`}>
                      {stock}
                    </span>
                    <span className="text-xs text-gray-600 ml-2">units</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {editingStock[product._id] !== undefined ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => saveStockUpdate(product._id)}
                    disabled={updatingStock[product._id]}
                    className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                  >
                    {updatingStock[product._id] ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => cancelEditingStock(product._id)}
                    disabled={updatingStock[product._id]}
                    className="py-2 px-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition-colors disabled:opacity-50"
                    title="Cancel"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEditingStock(product._id, stock)}
                  className="w-full py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Edit2 size={16} />
                  Edit Stock
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Inventory
