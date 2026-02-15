import { useState } from 'react'
import { Mail, Plus, Edit, Trash2, Eye, Send, Copy } from 'lucide-react'

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([
    {
      id: '1',
      name: 'Order Confirmation',
      subject: 'Your Order #{orderId} has been confirmed',
      category: 'Orders',
      body: '<h1>Order Confirmed!</h1><p>Thank you for your order #{orderId}.</p><p>Total: ₹{total}</p>',
      variables: ['orderId', 'total', 'customerName', 'items'],
      isActive: true
    },
    {
      id: '2',
      name: 'Order Shipped',
      subject: 'Your Order #{orderId} has been shipped',
      category: 'Orders',
      body: '<h1>Order Shipped!</h1><p>Your order is on the way. Tracking: {trackingId}</p>',
      variables: ['orderId', 'trackingId', 'courierName'],
      isActive: true
    },
    {
      id: '3',
      name: 'Welcome Email',
      subject: 'Welcome to our store, {customerName}!',
      category: 'Users',
      body: '<h1>Welcome {customerName}!</h1><p>Thank you for joining us.</p>',
      variables: ['customerName', 'email'],
      isActive: true
    },
    {
      id: '4',
      name: 'Password Reset',
      subject: 'Reset your password',
      category: 'Users',
      body: '<h1>Password Reset</h1><p>Click here to reset: {resetLink}</p><p>Code: {resetCode}</p>',
      variables: ['resetLink', 'resetCode', 'customerName'],
      isActive: true
    },
    {
      id: '5',
      name: 'Refund Processed',
      subject: 'Refund processed for Order #{orderId}',
      category: 'Returns',
      body: '<h1>Refund Processed</h1><p>Amount: ₹{refundAmount}</p><p>Will reflect in 5-7 days.</p>',
      variables: ['orderId', 'refundAmount', 'refundMethod'],
      isActive: true
    }
  ])
  const [showModal, setShowModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    category: 'Orders',
    body: '',
    variables: []
  })

  const categories = ['Orders', 'Users', 'Returns', 'Tickets', 'Marketing']

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...formData, id: t.id, isActive: t.isActive } : t))
      alert('Template updated!')
    } else {
      setTemplates([...templates, { ...formData, id: Date.now().toString(), isActive: true }])
      alert('Template created!')
    }
    resetForm()
  }

  const handleDelete = (id) => {
    if (confirm('Delete this template?')) {
      setTemplates(templates.filter(t => t.id !== id))
      alert('Template deleted!')
    }
  }

  const handleEdit = (template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      subject: template.subject,
      category: template.category,
      body: template.body,
      variables: template.variables
    })
    setShowModal(true)
  }

  const toggleActive = (id) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t))
  }

  const handlePreview = (template) => {
    setPreviewTemplate(template)
    setShowPreview(true)
  }

  const handleTestEmail = (template) => {
    alert(`Test email sent using template: ${template.name}`)
  }

  const resetForm = () => {
    setFormData({ name: '', subject: '', category: 'Orders', body: '', variables: [] })
    setEditingTemplate(null)
    setShowModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600 mt-1">Manage email templates for automated communications</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90">Total Templates</p>
          <p className="text-3xl font-bold mt-1">{templates.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90">Active</p>
          <p className="text-3xl font-bold mt-1">{templates.filter(t => t.isActive).length}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90">Categories</p>
          <p className="text-3xl font-bold mt-1">{categories.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <p className="text-sm opacity-90">Variables</p>
          <p className="text-3xl font-bold mt-1">{[...new Set(templates.flatMap(t => t.variables))].length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <div key={template.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{template.name}</h3>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{template.category}</span>
              </div>
              <button
                onClick={() => toggleActive(template.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {template.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">{template.subject}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {template.variables.slice(0, 3).map(v => (
                <span key={v} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                  {`{${v}}`}
                </span>
              ))}
              {template.variables.length > 3 && (
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                  +{template.variables.length - 3}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handlePreview(template)} className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1">
                <Eye size={14} />
                Preview
              </button>
              <button onClick={() => handleEdit(template)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                <Edit size={18} />
              </button>
              <button onClick={() => handleTestEmail(template)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                <Send size={18} />
              </button>
              <button onClick={() => handleDelete(template.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Template Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject Line</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input-field"
                    placeholder="Use {variableName} for dynamic content"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Body (HTML)</label>
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    className="input-field font-mono text-sm"
                    rows="10"
                    placeholder="<h1>Hello {customerName}</h1><p>Your content here...</p>"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Variables (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.variables.join(', ')}
                    onChange={(e) => setFormData({ ...formData, variables: e.target.value.split(',').map(v => v.trim()).filter(Boolean) })}
                    className="input-field"
                    placeholder="orderId, customerName, total"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showPreview && previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Preview: {previewTemplate.name}</h2>
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700">Subject:</p>
                <p className="text-gray-900">{previewTemplate.subject}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div dangerouslySetInnerHTML={{ __html: previewTemplate.body }} />
              </div>
              <button onClick={() => setShowPreview(false)} className="btn-secondary w-full mt-4">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailTemplates
