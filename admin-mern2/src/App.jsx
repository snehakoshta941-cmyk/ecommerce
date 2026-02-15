import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Users from './pages/Users'
import Inventory from './pages/Inventory'
import Categories from './pages/Categories'
import Subcategories from './pages/Subcategories'
import Coupons from './pages/Coupons'
import Shipments from './pages/Shipments'
import Tickets from './pages/Tickets'
import Reports from './pages/Reports'
import Notifications from './pages/Notifications'
import Returns from './pages/Returns'
import AuditLogs from './pages/AuditLogs'
import Settings from './pages/Settings'
import AdminUsers from './pages/AdminUsers'
import EmailTemplates from './pages/EmailTemplates'
import TaxReports from './pages/TaxReports'
import GDPRCompliance from './pages/GDPRCompliance'
import Layout from './components/Layout'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    setIsAuthenticated(!!token)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" /> : <Login setIsAuthenticated={setIsAuthenticated} />
          } 
        />
        
        <Route
          path="/"
          element={
            isAuthenticated ? <Layout setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="categories" element={<Categories />} />
          <Route path="subcategories" element={<Subcategories />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="shipments" element={<Shipments />} />
          <Route path="returns" element={<Returns />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="admin-users" element={<AdminUsers />} />
          <Route path="email-templates" element={<EmailTemplates />} />
          <Route path="tax-reports" element={<TaxReports />} />
          <Route path="gdpr-compliance" element={<GDPRCompliance />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
