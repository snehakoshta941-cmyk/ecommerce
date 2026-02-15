import { useState } from 'react'
import { Bell, Send, Users, Mail, MessageSquare } from 'lucide-react'

const Notifications = () => {
  const [notificationType, setNotificationType] = useState('all')
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    target: 'all'
  })

  const handleSendNotification = (e) => {
    e.preventDefault()
    alert('Notification sent successfully!')
    setFormData({
      title: '',
      message: '',
      type: 'general',
      target: 'all'
    })
  }

  const recentNotifications = [
    {
      id: 1,
      title: 'Order Shipped',
      message: 'Your order #TRK123 has been shipped',
      type: 'order',
      sentTo: 'john@example.com',
      sentAt: new Date('2026-02-08T10:30:00'),
      status: 'Delivered'
    },
    {
      id: 2,
      title: 'Flash Sale Alert',
      message: '50% off on all electronics!',
      type: 'sale',
      sentTo: 'All Users',
      sentAt: new Date('2026-02-08T09:00:00'),
      status: 'Delivered'
    },
    {
      id: 3,
      title: 'Payment Received',
      message: 'Payment of ₹5000 received',
      type: 'payment',
      sentTo: 'jane@example.com',
      sentAt: new Date('2026-02-07T15:45:00'),
      status: 'Delivered'
    }
  ]

  const getTypeColor = (type) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-800'
      case 'sale':
        return 'bg-green-100 text-green-800'
      case 'payment':
        return 'bg-purple-100 text-purple-800'
      case 'review':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notification Management</h1>
        <p className="text-gray-600 mt-1">Send and manage customer notifications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sent</p>
              <p className="text-3xl font-bold text-gray-900">1,234</p>
            </div>
            <Send className="text-blue-600" size={40} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-3xl font-bold text-green-600">1,198</p>
            </div>
            <Bell className="text-green-600" size={40} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Opened</p>
              <p className="text-3xl font-bold text-purple-600">856</p>
            </div>
            <Mail className="text-purple-600" size={40} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-3xl font-bold text-red-600">36</p>
            </div>
            <MessageSquare className="text-red-600" size={40} />
          </div>
        </div>
      </div>

      {/* Send Notification Form */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Send New Notification</h2>
        <form onSubmit={handleSendNotification} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notification Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input-field"
              >
                <option value="general">General</option>
                <option value="order">Order Update</option>
                <option value="sale">Sale/Promotion</option>
                <option value="payment">Payment</option>
                <option value="review">Review Request</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Target Audience
              </label>
              <select
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                className="input-field"
              >
                <option value="all">All Users</option>
                <option value="active">Active Users</option>
                <option value="inactive">Inactive Users</option>
                <option value="premium">Premium Users</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              placeholder="Enter notification title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="input-field"
              rows="4"
              placeholder="Enter notification message"
              required
            />
          </div>

          <button type="submit" className="btn-primary flex items-center gap-2">
            <Send size={20} />
            Send Notification
          </button>
        </form>
      </div>

      {/* Recent Notifications */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Notifications</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setNotificationType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                notificationType === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setNotificationType('order')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                notificationType === 'order'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setNotificationType('sale')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                notificationType === 'sale'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Sales
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {recentNotifications.map((notification) => (
            <div key={notification.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(notification.type)}`}>
                      {notification.type}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{notification.message}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {notification.sentTo}
                    </span>
                    <span>{notification.sentAt.toLocaleString()}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  {notification.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Notifications
