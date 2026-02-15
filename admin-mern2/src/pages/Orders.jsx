import { useState, useEffect } from 'react'
import { getOrders, updateOrderStatus } from '../services/api'
import { Search, Eye, Package, Truck, CheckCircle, XCircle, Download, FileText, Clock, MapPin, Calendar, User, CreditCard, Filter, ChevronDown, ChevronUp } from 'lucide-react'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showTimeline, setShowTimeline] = useState(false)
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' })
  const [expandedOrders, setExpandedOrders] = useState([])

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    let filtered = orders.filter(o =>
      (o.trackingId && o.trackingId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      o.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.user?.name && o.user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    if (statusFilter !== 'All') {
      filtered = filtered.filter(o => o.status === statusFilter)
    }

    if (dateFilter.from) {
      filtered = filtered.filter(o => new Date(o.createdAt) >= new Date(dateFilter.from))
    }

    if (dateFilter.to) {
      filtered = filtered.filter(o => new Date(o.createdAt) <= new Date(dateFilter.to))
    }

    setFilteredOrders(filtered)
  }, [searchQuery, orders, statusFilter, dateFilter])

  const loadOrders = async () => {
    try {
      const response = await getOrders()
      const ordersWithTimeline = (response.data.orders || []).map(order => ({
        ...order,
        timeline: order.timeline || generateTimeline(order)
      }))
      setOrders(ordersWithTimeline)
      setFilteredOrders(ordersWithTimeline)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateTimeline = (order) => {
    const timeline = [
      {
        status: 'Pending',
        timestamp: order.createdAt,
        description: 'Order placed successfully',
        completed: true
      }
    ]

    if (order.status === 'Processing' || order.status === 'Shipped' || order.status === 'Delivered') {
      timeline.push({
        status: 'Processing',
        timestamp: order.processingAt || new Date(new Date(order.createdAt).getTime() + 3600000),
        description: 'Order is being processed',
        completed: true
      })
    }

    if (order.status === 'Shipped' || order.status === 'Delivered') {
      timeline.push({
        status: 'Shipped',
        timestamp: order.shippedAt || new Date(new Date(order.createdAt).getTime() + 86400000),
        description: 'Order has been shipped',
        completed: true
      })
    }

    if (order.status === 'Delivered') {
      timeline.push({
        status: 'Delivered',
        timestamp: order.deliveredAt || new Date(new Date(order.createdAt).getTime() + 259200000),
        description: 'Order delivered successfully',
        completed: true
      })
    }

    if (order.status === 'Cancelled') {
      timeline.push({
        status: 'Cancelled',
        timestamp: order.cancelledAt || new Date(),
        description: 'Order was cancelled',
        completed: true
      })
    }

    return timeline
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await updateOrderStatus(orderId, newStatus)
      
      // Get the updated order from response
      const updatedOrder = response.data.order
      
      // Update orders list with the new data
      setOrders(orders.map(o => o._id === orderId ? {
        ...updatedOrder,
        timeline: generateTimeline(updatedOrder)
      } : o))
      
      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({
          ...updatedOrder,
          timeline: generateTimeline(updatedOrder)
        })
      }
      
      // Show success message with tracking info if generated
      if (newStatus === 'Shipped' && updatedOrder.shipment?.trackingNumber) {
        alert(`Order status updated to Shipped!\n\nTracking Number: ${updatedOrder.shipment.trackingNumber}\nCarrier: ${updatedOrder.shipment.carrier}`)
      } else {
        alert('Order status updated successfully!')
      }
      
      // Reload all orders to ensure sync
      await loadOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Error updating order status')
    }
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    
    try {
      await updateOrderStatus(orderId, 'Cancelled')
      loadOrders()
      alert('Order cancelled successfully!')
    } catch (error) {
      alert('Error cancelling order')
    }
  }

  const generateInvoice = (order) => {
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order.trackingId || order._id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #333; }
          .invoice-details { margin-bottom: 30px; }
          .invoice-details p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f4f4f4; font-weight: bold; }
          .total-row { background-color: #f9f9f9; font-weight: bold; }
          .total { font-size: 20px; font-weight: bold; text-align: right; margin-top: 20px; padding: 15px; background-color: #f4f4f4; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <p style="margin: 10px 0 0 0;">E-Commerce Store</p>
          <p style="margin: 5px 0 0 0;">contact@ecommerce.com | +91 1234567890</p>
        </div>
        <div class="invoice-details">
          <p><strong>Invoice Number:</strong> INV-${order.trackingId || order._id}</p>
          <p><strong>Order ID:</strong> ${order.trackingId || order._id}</p>
          <p><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <hr style="margin: 15px 0;">
          <p><strong>Bill To:</strong></p>
          <p>${order.user?.name || 'N/A'}</p>
          <p>${order.user?.email || 'N/A'}</p>
          <p>${order.user?.phone || 'N/A'}</p>
          <hr style="margin: 15px 0;">
          <p><strong>Payment Method:</strong> ${order.paymentMethod || 'N/A'}</p>
          <p><strong>Order Status:</strong> ${order.status}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Quantity</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items?.map(item => `
              <tr>
                <td>${item.product?.name || item.name || 'Product'}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">₹${item.price}</td>
                <td style="text-align: right;">₹${item.quantity * item.price}</td>
              </tr>
            `).join('') || '<tr><td colspan="4" style="text-align: center;">No items</td></tr>'}
            <tr class="total-row">
              <td colspan="3" style="text-align: right;">TOTAL</td>
              <td style="text-align: right;">₹${order.total}</td>
            </tr>
          </tbody>
        </table>
        <div class="total">
          Total Amount: ₹${order.total}
        </div>
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This is a computer-generated invoice and does not require a signature.</p>
        </div>
      </body>
      </html>
    `

    const blob = new Blob([invoiceHTML], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice_${order.trackingId || order._id}.html`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExport = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Total', 'Status', 'Payment', 'Date']
    const rows = filteredOrders.map(o => [
      o.trackingId || o._id,
      o.user?.name || 'N/A',
      o.user?.email || 'N/A',
      o.total,
      o.status,
      o.paymentMethod || 'N/A',
      new Date(o.createdAt).toLocaleDateString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800'
      case 'Shipped':
        return 'bg-blue-100 text-blue-800'
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'Pending':
        return 'bg-orange-100 text-orange-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="text-green-600" size={20} />
      case 'Shipped':
        return <Truck className="text-blue-600" size={20} />
      case 'Processing':
        return <Package className="text-yellow-600" size={20} />
      case 'Pending':
        return <Clock className="text-orange-600" size={20} />
      case 'Cancelled':
        return <XCircle className="text-red-600" size={20} />
      default:
        return <Package className="text-gray-600" size={20} />
    }
  }

  const getTimelineIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle size={24} />
      case 'Shipped':
        return <Truck size={24} />
      case 'Processing':
        return <Package size={24} />
      case 'Pending':
        return <Clock size={24} />
      case 'Cancelled':
        return <XCircle size={24} />
      default:
        return <Package size={24} />
    }
  }

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
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
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track customer orders with timeline</p>
        </div>
        <button
          onClick={handleExport}
          className="btn-secondary flex items-center gap-2"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90">Total Orders</p>
          <p className="text-3xl font-bold mt-1">{orders.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <p className="text-sm opacity-90">Pending</p>
          <p className="text-3xl font-bold mt-1">{orders.filter(o => o.status === 'Pending').length}</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <p className="text-sm opacity-90">Processing</p>
          <p className="text-3xl font-bold mt-1">{orders.filter(o => o.status === 'Processing').length}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90">Delivered</p>
          <p className="text-3xl font-bold mt-1">{orders.filter(o => o.status === 'Delivered').length}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90">Revenue</p>
          <p className="text-3xl font-bold mt-1">₹{orders.reduce((sum, o) => sum + (o.total || 0), 0)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-11"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <input
            type="date"
            placeholder="From Date"
            value={dateFilter.from}
            onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
            className="input-field"
          />
          <input
            type="date"
            placeholder="To Date"
            value={dateFilter.to}
            onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
            className="input-field"
          />
        </div>
      </div>

      {/* Orders Table - Desktop */}
      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 w-12"></th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tracking</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <>
                  <tr key={order._id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleOrderExpand(order._id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="View Products"
                      >
                        {expandedOrders.includes(order._id) ? (
                          <ChevronUp size={18} className="text-gray-600" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-600" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-medium">{order.trackingId || order._id.slice(-8)}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{order.user?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{order.user?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{order.items?.length || 0} items</td>
                    <td className="py-3 px-4 font-semibold">₹{order.total}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {order.paymentMethod || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {order.shipment?.trackingNumber ? (
                        <div>
                          <p className="font-mono text-xs font-semibold text-blue-600">
                            {order.shipment.trackingNumber}
                          </p>
                          <p className="text-xs text-gray-500">{order.shipment.carrier}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Not shipped</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowTimeline(true)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details & Timeline"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => generateInvoice(order)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download Invoice"
                        >
                          <FileText size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Product Details Row */}
                  {expandedOrders.includes(order._id) && (
                    <tr key={`${order._id}-details`} className="bg-gray-50 border-t border-gray-200">
                      <td colSpan="10" className="py-4 px-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Package size={18} className="text-primary-600" />
                            Order Products ({order.items?.length || 0})
                          </h4>
                          <div className="space-y-3">
                            {order.items?.map((item, index) => (
                              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <img
                                  src={item.product?.image || item.product?.images?.[0] || item.image || 'https://via.placeholder.com/80'}
                                  alt={item.product?.name || item.name || 'Product'}
                                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/80?text=No+Image'
                                  }}
                                />
                                <div className="flex-1">
                                  <h5 className="font-semibold text-gray-900">{item.product?.name || item.name || 'Product'}</h5>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Category: <span className="font-medium">{item.product?.category || item.category || 'N/A'}</span>
                                  </p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <span className="text-sm text-gray-600">
                                      Qty: <span className="font-semibold text-gray-900">{item.quantity}</span>
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      Price: <span className="font-semibold text-gray-900">₹{item.price}</span>
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      Subtotal: <span className="font-semibold text-primary-600">₹{item.quantity * item.price}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="text-xl font-bold text-primary-600">₹{order.total}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders Cards - Mobile */}
      <div className="block md:hidden space-y-4">
        {filteredOrders.map((order) => (
          <div key={order._id} className="card">
            {/* Card Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Order ID</p>
                <p className="font-bold text-sm">{order.trackingId || order._id.slice(-8)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            {/* Customer Info */}
            <div className="mb-3 pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <User size={16} className="text-gray-400" />
                <p className="font-medium text-sm">{order.user?.name || 'N/A'}</p>
              </div>
              <p className="text-xs text-gray-600 ml-6">{order.user?.email || 'N/A'}</p>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                <p className="font-bold text-primary-600">₹{order.total}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Items</p>
                <p className="font-semibold">{order.items?.length || 0} items</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Payment</p>
                <p className="text-sm font-medium">{order.paymentMethod || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Date</p>
                <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Tracking Info */}
            {order.shipment?.trackingNumber && (
              <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 mb-1">Tracking Number</p>
                <p className="font-mono text-xs font-bold text-blue-900">{order.shipment.trackingNumber}</p>
                <p className="text-xs text-blue-600 mt-1">{order.shipment.carrier}</p>
              </div>
            )}

            {/* Toggle Products Button */}
            <button
              onClick={() => toggleOrderExpand(order._id)}
              className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2 mb-3"
            >
              <Package size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {expandedOrders.includes(order._id) ? 'Hide Products' : 'View Products'}
              </span>
              {expandedOrders.includes(order._id) ? (
                <ChevronUp size={16} className="text-gray-600" />
              ) : (
                <ChevronDown size={16} className="text-gray-600" />
              )}
            </button>

            {/* Expanded Products */}
            {expandedOrders.includes(order._id) && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex gap-3 p-2 bg-white rounded-lg border border-gray-200">
                    <img
                      src={item.product?.image || item.product?.images?.[0] || item.image || 'https://via.placeholder.com/60'}
                      alt={item.product?.name || item.name || 'Product'}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/60?text=No+Image'
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-sm text-gray-900 truncate">{item.product?.name || item.name || 'Product'}</h5>
                      <p className="text-xs text-gray-600 mt-1">{item.product?.category || item.category || 'N/A'}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="text-gray-600">Qty: <span className="font-semibold">{item.quantity}</span></span>
                        <span className="text-gray-600">₹{item.price}</span>
                        <span className="text-primary-600 font-semibold">₹{item.quantity * item.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="text-lg font-bold text-primary-600">₹{order.total}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedOrder(order)
                  setShowTimeline(true)
                }}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Eye size={16} />
                View Details
              </button>
              <button
                onClick={() => generateInvoice(order)}
                className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center"
                title="Download Invoice"
              >
                <FileText size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Details & Timeline Modal */}
      {showTimeline && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Order Details</h2>
                  <p className="text-gray-600 mt-1">Order ID: {selectedOrder.trackingId || selectedOrder._id}</p>
                </div>
                <button
                  onClick={() => {
                    setShowTimeline(false)
                    setSelectedOrder(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Order Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <User className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-600">Customer</p>
                    <p className="font-semibold text-sm">{selectedOrder.user?.name || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-600">Order Date</p>
                    <p className="font-semibold text-sm">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-600">Payment</p>
                    <p className="font-semibold text-sm">{selectedOrder.paymentMethod || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-600">Total Amount</p>
                    <p className="font-semibold text-sm">₹{selectedOrder.total}</p>
                  </div>
                </div>
              </div>

              {/* Shipment Tracking Info */}
              {selectedOrder.shipment?.trackingNumber && (
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-900">
                    <Truck size={20} />
                    Shipment Tracking
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-blue-700 mb-1">Tracking Number</p>
                      <p className="font-mono font-bold text-blue-900">{selectedOrder.shipment.trackingNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 mb-1">Carrier</p>
                      <p className="font-semibold text-blue-900">{selectedOrder.shipment.carrier}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 mb-1">Current Location</p>
                      <p className="font-semibold text-blue-900">{selectedOrder.shipment.currentLocation || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 mb-1">Est. Delivery</p>
                      <p className="font-semibold text-blue-900">
                        {selectedOrder.shipment.estimatedDelivery 
                          ? new Date(selectedOrder.shipment.estimatedDelivery).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Timeline */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock size={20} />
                  Order Timeline
                </h3>
                <div className="relative">
                  {selectedOrder.timeline?.map((event, index) => (
                    <div key={index} className="flex gap-4 mb-6 last:mb-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          event.completed ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {getTimelineIcon(event.status)}
                        </div>
                        {index < selectedOrder.timeline.length - 1 && (
                          <div className={`w-0.5 h-12 ${event.completed ? 'bg-primary-300' : 'bg-gray-200'}`}></div>
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">{event.status}</p>
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Quantity</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Price</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index} className="border-t border-gray-100">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.product?.image || item.product?.images?.[0] || item.image || 'https://via.placeholder.com/50'}
                                alt={item.product?.name || item.name || 'Product'}
                                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/50?text=No+Image'
                                }}
                              />
                              <span className="font-medium">{item.product?.name || item.name || 'Product'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">{item.quantity}</td>
                          <td className="py-3 px-4 text-right">₹{item.price}</td>
                          <td className="py-3 px-4 text-right font-semibold">₹{item.quantity * item.price}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-gray-300 bg-gray-50">
                        <td colSpan="3" className="py-3 px-4 text-right font-bold">Total Amount:</td>
                        <td className="py-3 px-4 text-right font-bold text-lg">₹{selectedOrder.total}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MapPin size={20} />
                    Shipping Address
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900">{selectedOrder.shippingAddress}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Update Status</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                    className="input-field"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex items-end gap-3">
                  <button
                    onClick={() => generateInvoice(selectedOrder)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FileText size={18} />
                    Download Invoice
                  </button>
                  {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Delivered' && (
                    <button
                      onClick={() => handleCancelOrder(selectedOrder._id)}
                      className="btn-secondary bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                    >
                      <XCircle size={18} />
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
