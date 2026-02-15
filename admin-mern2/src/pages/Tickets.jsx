import { useState } from 'react'
import { MessageSquare, Clock, CheckCircle, XCircle, Search, Send, AlertTriangle, User, Calendar, Tag, ArrowUp } from 'lucide-react'

const Tickets = () => {
  const [tickets, setTickets] = useState([
    {
      id: 'TKT001',
      subject: 'Product not delivered',
      customer: 'John Doe',
      email: 'john@example.com',
      status: 'Open',
      priority: 'High',
      createdAt: new Date('2026-02-05'),
      category: 'Delivery Issue',
      slaDeadline: new Date('2026-02-09'),
      messages: [
        { id: 1, sender: 'customer', text: 'I ordered a product 5 days ago but haven\'t received it yet.', timestamp: new Date('2026-02-05T10:00:00') }
      ]
    },
    {
      id: 'TKT002',
      subject: 'Wrong item received',
      customer: 'Jane Smith',
      email: 'jane@example.com',
      status: 'In Progress',
      priority: 'Medium',
      createdAt: new Date('2026-02-06'),
      category: 'Product Issue',
      slaDeadline: new Date('2026-02-10'),
      messages: [
        { id: 1, sender: 'customer', text: 'I received the wrong color. I ordered blue but got red.', timestamp: new Date('2026-02-06T14:00:00') },
        { id: 2, sender: 'admin', text: 'We apologize for the inconvenience. We\'ll arrange a replacement immediately.', timestamp: new Date('2026-02-06T15:30:00') }
      ]
    },
    {
      id: 'TKT003',
      subject: 'Refund request',
      customer: 'Bob Johnson',
      email: 'bob@example.com',
      status: 'Resolved',
      priority: 'Low',
      createdAt: new Date('2026-02-07'),
      category: 'Refund',
      slaDeadline: new Date('2026-02-12'),
      messages: [
        { id: 1, sender: 'customer', text: 'I want to return my order and get a refund.', timestamp: new Date('2026-02-07T09:00:00') },
        { id: 2, sender: 'admin', text: 'Your refund has been processed. It will reflect in 5-7 business days.', timestamp: new Date('2026-02-07T11:00:00') }
      ]
    }
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')

  const filteredTickets = tickets.filter(t =>
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.customer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-yellow-100 text-yellow-800'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800'
      case 'Resolved':
        return 'bg-green-100 text-green-800'
      case 'Closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800'
      case 'Medium':
        return 'bg-orange-100 text-orange-800'
      case 'Low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSLAStatus = (deadline) => {
    const now = new Date()
    const hoursLeft = (deadline - now) / (1000 * 60 * 60)
    
    if (hoursLeft < 0) return { text: 'Overdue', color: 'text-red-600', bgColor: 'bg-red-50' }
    if (hoursLeft < 24) return { text: `${Math.floor(hoursLeft)}h left`, color: 'text-orange-600', bgColor: 'bg-orange-50' }
    return { text: `${Math.floor(hoursLeft / 24)}d left`, color: 'text-green-600', bgColor: 'bg-green-50' }
  }

  const handleSendReply = () => {
    if (!replyText.trim()) return

    const newMessage = {
      id: selectedTicket.messages.length + 1,
      sender: 'admin',
      text: replyText,
      timestamp: new Date()
    }

    setTickets(tickets.map(t => 
      t.id === selectedTicket.id 
        ? { ...t, messages: [...t.messages, newMessage], status: 'In Progress' }
        : t
    ))

    setSelectedTicket({
      ...selectedTicket,
      messages: [...selectedTicket.messages, newMessage],
      status: 'In Progress'
    })

    setReplyText('')
  }

  const handleStatusChange = (ticketId, newStatus) => {
    setTickets(tickets.map(t => 
      t.id === ticketId ? { ...t, status: newStatus } : t
    ))
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus })
    }
  }

  const handleEscalate = (ticketId) => {
    if (!confirm('Escalate this ticket to senior support?')) return
    
    setTickets(tickets.map(t => 
      t.id === ticketId ? { ...t, priority: 'High' } : t
    ))
    alert('Ticket escalated successfully!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ticket Management</h1>
        <p className="text-gray-600 mt-1">Manage customer support tickets with SLA tracking</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Open</p>
              <p className="text-3xl font-bold">
                {tickets.filter(t => t.status === 'Open').length}
              </p>
            </div>
            <Clock size={40} className="opacity-80" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">In Progress</p>
              <p className="text-3xl font-bold">
                {tickets.filter(t => t.status === 'In Progress').length}
              </p>
            </div>
            <MessageSquare size={40} className="opacity-80" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Resolved</p>
              <p className="text-3xl font-bold">
                {tickets.filter(t => t.status === 'Resolved').length}
              </p>
            </div>
            <CheckCircle size={40} className="opacity-80" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-gray-500 to-gray-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Closed</p>
              <p className="text-3xl font-bold">
                {tickets.filter(t => t.status === 'Closed').length}
              </p>
            </div>
            <XCircle size={40} className="opacity-80" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Overdue</p>
              <p className="text-3xl font-bold">
                {tickets.filter(t => new Date(t.slaDeadline) < new Date()).length}
              </p>
            </div>
            <AlertTriangle size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search tickets by ID, subject, or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-11"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ticket ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Priority</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">SLA</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => {
                const slaStatus = getSLAStatus(ticket.slaDeadline)
                return (
                  <tr key={ticket.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{ticket.id}</td>
                    <td className="py-3 px-4">{ticket.subject}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{ticket.customer}</p>
                        <p className="text-sm text-gray-600">{ticket.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {ticket.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${slaStatus.color} ${slaStatus.bgColor}`}>
                        {slaStatus.text}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View & Reply"
                        >
                          <MessageSquare size={18} />
                        </button>
                        <button
                          onClick={() => handleEscalate(ticket.id)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Escalate"
                        >
                          <ArrowUp size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail & Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedTicket.subject}</h2>
                  <p className="text-gray-600 mt-1">Ticket ID: {selectedTicket.id}</p>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Ticket Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <User className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-600">Customer</p>
                    <p className="font-semibold text-sm">{selectedTicket.customer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-600">Category</p>
                    <p className="font-semibold text-sm">{selectedTicket.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-600">Created</p>
                    <p className="font-semibold text-sm">{selectedTicket.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-600">SLA Deadline</p>
                    <p className={`font-semibold text-sm ${getSLAStatus(selectedTicket.slaDeadline).color}`}>
                      {selectedTicket.slaDeadline.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status & Priority */}
              <div className="flex gap-3 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                    className="input-field"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
              </div>

              {/* Conversation */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Conversation</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                  {selectedTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          message.sender === 'admin'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <p className="text-sm mb-2">{message.text}</p>
                        <p className={`text-xs ${message.sender === 'admin' ? 'text-primary-100' : 'text-gray-500'}`}>
                          {message.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Box */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Send Reply</label>
                <div className="flex gap-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    className="input-field flex-1 min-h-[100px]"
                  />
                  <button
                    onClick={handleSendReply}
                    className="btn-primary px-6 flex items-center gap-2"
                  >
                    <Send size={18} />
                    Send
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleEscalate(selectedTicket.id)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ArrowUp size={18} />
                  Escalate
                </button>
                <button
                  onClick={() => handleStatusChange(selectedTicket.id, 'Resolved')}
                  className="btn-primary flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  Mark as Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tickets
