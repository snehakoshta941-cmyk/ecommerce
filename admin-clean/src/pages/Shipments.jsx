import { useState, useEffect } from 'react'
import { getOrders, updateOrderStatus, cancelOrder } from '../services/api'
import { Truck, Package, MapPin, Calendar, Search, Filter, Download, RefreshCw, Clock, CheckCircle, AlertCircle, Trash2, Eye } from 'lucide-react'

const Shipments = () => {
  const [shipments, setShipments] = useState([])
  const [filteredShipments, setFilteredShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [carrierFilter, setCarrierFilter] = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingShipment, setEditingShipment] = useState(null)
  const [shipmentForm, setShipmentForm] = useState({
    trackingNumber: '',
    carrier: '',
    currentLocation: '',
    estimatedDelivery: ''
  })

  useEffect(() => {
    loadShipments()
  }, [])

  useEffect(() => {
    let filtered = shipments.filter(s =>
      (s.trackingId && s.trackingId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.shipment?.trackingNumber && s.shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.address?.name && s.address.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(s => s.status === statusFilter)
    }

    // Carrier filter
    if (carrierFilter !== 'All') {
      filtered = filtered.filter(s => s.shipment?.carrier === carrierFilter)
    }

    setFilteredShipments(filtered)
  }, [searchQuery, shipments, statusFilter, carrierFilter])

  const loadShipments = async () => {
    try {
      const response = await getOrders()
      // Filter orders with Shipped, Processing, or Delivered status
      const orders = (response.data.orders || []).filter(order => 
        ['Shipped', 'Processing', 'Delivered'].includes(order.status)
      )
      setShipments(orders)
      setFilteredShipments(orders)
    } catch (error) {
      console.error('Error loading shipments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800'
      case 'Shipped':
        return 'bg-blue-100 text-blue-800'
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle size={16} className="text-green-600" />
      case 'Shipped':
        return <Truck size={16} className="text-blue-600" />
      case 'Processing':
        return <Clock size={16} className="text-yellow-600" />
      default:
        return <AlertCircle size={16} className="text-gray-600" />
    }
  }

  const carriers = [...new Set(shipments.map(s => s.shipment?.carrier).filter(Boolean))]

  const handleEditShipment = (shipment) => {
    setEditingShipment(shipment)
    setShipmentForm({
      trackingNumber: shipment.shipment?.trackingNumber || '',
      carrier: shipment.shipment?.carrier || '',
      currentLocation: shipment.shipment?.currentLocation || '',
      estimatedDelivery: shipment.shipment?.estimatedDelivery 
        ? new Date(shipment.shipment.estimatedDelivery).toISOString().split('T')[0]
        : ''
    })
    setShowEditModal(true)
  }

  const handleUpdateShipment = async () => {
    if (!editingShipment) return

    try {
      const updatedOrder = {
        ...editingShipment,
        shipment: {
          ...editingShipment.shipment,
          ...shipmentForm,
          estimatedDelivery: shipmentForm.estimatedDelivery 
            ? new Date(shipmentForm.estimatedDelivery)
            : null
        }
      }

      await updateOrderStatus(editingShipment._id, updatedOrder.status, updatedOrder)
      
      setShipments(shipments.map(s => 
        s._id === editingShipment._id ? updatedOrder : s
      ))
      
      setShowEditModal(false)
      setEditingShipment(null)
      alert('Shipment updated successfully!')
    } catch (error) {
      console.error('Error updating shipment:', error)
      alert('Error updating shipment')
    }
  }

  const handleQuickStatusUpdate = async (shipmentId, newStatus) => {
    try {
      await updateOrderStatus(shipmentId, newStatus)
      setShipments(shipments.map(s => 
        s._id === shipmentId ? { ...s, status: newStatus } : s
      ))
      alert(`Status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status')
    }
  }

  const handleDeleteShipment = async (shipmentId, trackingNumber) => {
    if (!window.confirm(`Are you sure you want to delete this shipment?\n\nTracking: ${trackingNumber || 'N/A'}\n\nThis will cancel the order and remove it from shipments.`)) {
      return
    }

    try {
      await cancelOrder(shipmentId)
      
      // Remove from shipments list
      setShipments(shipments.filter(s => s._id !== shipmentId))
      setFilteredShipments(filteredShipments.filter(s => s._id !== shipmentId))
      
      // Close modal if this shipment was selected
      if (selectedShipment && selectedShipment._id === shipmentId) {
        setSelectedShipment(null)
      }
      
      alert('Shipment deleted successfully!')
    } catch (error) {
      console.error('Error deleting shipment:', error)
      alert('Error deleting shipment. Please try again.')
    }
  }

  const handleExport = () => {
    const headers = ['Tracking Number', 'Order ID', 'Status', 'Carrier', 'Location', 'Customer', 'Phone', 'Date', 'Estimated Delivery']
    const rows = filteredShipments.map(s => [
      s.shipment?.trackingNumber || 'N/A',
      s.trackingId || s._id,
      s.status,
      s.shipment?.carrier || 'N/A',
      s.shipment?.currentLocation || 'N/A',
      s.address?.name || 'N/A',
      s.address?.phone || 'N/A',
      new Date(s.createdAt).toLocaleDateString(),
      s.shipment?.estimatedDelivery ? new Date(s.shipment.estimatedDelivery).toLocaleDateString() : 'N/A'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shipments_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getDaysUntilDelivery = (estimatedDelivery) => {
    if (!estimatedDelivery) return null
    const days = Math.ceil((new Date(estimatedDelivery) - new Date()) / (1000 * 60 * 60 * 24))
    return days
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
        <h1 className="text-3xl font-bold text-gray-900">Shipment Management</h1>
        <p className="text-gray-600 mt-1">Track and manage order shipments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Transit</p>
              <p className="text-3xl font-bold text-blue-600">
                {shipments.filter(s => s.status === 'Shipped').length}
              </p>
            </div>
            <Truck className="text-blue-600" size={40} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-3xl font-bold text-green-600">
                {shipments.filter(s => s.status === 'Delivered').length}
              </p>
            </div>
            <Package className="text-green-600" size={40} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-3xl font-bold text-yellow-600">
                {shipments.filter(s => s.status === 'Processing').length}
              </p>
            </div>
            <Package className="text-yellow-600" size={40} />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by tracking ID, customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2"
          >
            <Filter size={18} />
            Filters
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={18} />
            Export
          </button>
          <button
            onClick={loadShipments}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="All">All Status</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Carrier
              </label>
              <select
                value={carrierFilter}
                onChange={(e) => setCarrierFilter(e.target.value)}
                className="input-field"
              >
                <option value="All">All Carriers</option>
                {carriers.map(carrier => (
                  <option key={carrier} value={carrier}>{carrier}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {filteredShipments.length === 0 ? (
          <div className="card text-center py-8">
            <Package className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600">No shipments found</p>
          </div>
        ) : (
          filteredShipments.map((shipment) => (
            <div key={shipment._id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck size={16} className="text-blue-600" />
                    <span className="font-semibold text-gray-900">
                      {shipment.shipment?.trackingNumber || 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Order: {shipment.trackingId || shipment._id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(shipment.status)}`}>
                  {shipment.status}
                </span>
              </div>

              {/* Product Images */}
              {shipment.items && shipment.items.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">Products ({shipment.items.length})</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {shipment.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={item.product?.image || 'https://via.placeholder.com/60'}
                          alt={item.product?.name || 'Product'}
                          className="w-14 h-14 object-cover rounded-lg border-2 border-gray-200"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/60'
                          }}
                        />
                        {item.quantity > 1 && (
                          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {item.quantity}
                          </span>
                        )}
                      </div>
                    ))}
                    {shipment.items.length > 3 && (
                      <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-semibold text-gray-600">
                        +{shipment.items.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Carrier</p>
                  <p className="font-medium">{shipment.shipment?.carrier || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Date</p>
                  <p className="font-medium">{new Date(shipment.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="text-gray-700">{shipment.shipment?.currentLocation || 'N/A'}</span>
                </div>
              </div>

              {shipment.shipment?.estimatedDelivery && (
                <div className="bg-blue-50 p-2 rounded-lg mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-blue-600" />
                    <span className="text-blue-700">
                      ETA: {new Date(shipment.shipment.estimatedDelivery).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedShipment(shipment)}
                  className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  View Details
                </button>
                <button
                  onClick={() => handleDeleteShipment(shipment._id, shipment.shipment?.trackingNumber)}
                  className="btn-secondary bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tracking ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Products</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Carrier</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">ETA</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.map((shipment) => (
                <tr key={shipment._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">
                    {shipment.shipment?.trackingNumber || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {shipment.items && shipment.items.length > 0 ? (
                        <>
                          {shipment.items.slice(0, 3).map((item, idx) => (
                            <img
                              key={idx}
                              src={item.product?.image || 'https://via.placeholder.com/80'}
                              alt={item.product?.name || 'Product'}
                              className="w-10 h-10 object-cover rounded border-2 border-gray-200 shadow-sm"
                              title={item.product?.name || 'Product'}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/80'
                              }}
                            />
                          ))}
                          {shipment.items.length > 3 && (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs font-semibold text-gray-600">
                              +{shipment.items.length - 3}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400 text-sm">No items</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">{shipment.trackingId || shipment._id}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{shipment.shipment?.carrier || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{shipment.shipment?.currentLocation || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(shipment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedShipment(shipment)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteShipment(shipment._id, shipment.shipment?.trackingNumber)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Shipment"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipment Details Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Shipment Tracking</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-semibold">{selectedShipment.shipment?.trackingNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Carrier</p>
                    <p className="font-semibold">{selectedShipment.shipment?.carrier || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Location</p>
                    <p className="font-semibold">{selectedShipment.shipment?.currentLocation || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedShipment.status)}`}>
                      {selectedShipment.status}
                    </span>
                  </div>
                </div>

                {selectedShipment.shipment?.estimatedDelivery && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-blue-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-600">Estimated Delivery</p>
                        <p className="font-semibold text-blue-600">
                          {new Date(selectedShipment.shipment.estimatedDelivery).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedShipment.address && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Delivery Address</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">{selectedShipment.address.address || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedShipment(null)}
                  className="btn-secondary flex-1"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDeleteShipment(selectedShipment._id, selectedShipment.shipment?.trackingNumber)}
                  className="btn-secondary bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete Shipment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Shipments
