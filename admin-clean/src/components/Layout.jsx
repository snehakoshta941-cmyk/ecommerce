import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Warehouse, 
  FolderTree, 
  Ticket,
  Truck,
  MessageSquare,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  X,
  RotateCcw,
  FileText,
  Settings as SettingsIcon,
  UserCog,
  Mail,
  Receipt,
  ShieldCheck
} from 'lucide-react'
import { useState } from 'react'

const Layout = ({ setIsAuthenticated }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/inventory', icon: Warehouse, label: 'Inventory' },
    { path: '/categories', icon: FolderTree, label: 'Categories' },
    { path: '/subcategories', icon: FolderTree, label: 'Subcategories' },
    { path: '/coupons', icon: Ticket, label: 'Coupons' },
    { path: '/shipments', icon: Truck, label: 'Shipments' },
    { path: '/returns', icon: RotateCcw, label: 'Returns & Refunds' },
    { path: '/tickets', icon: MessageSquare, label: 'Tickets' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/audit-logs', icon: FileText, label: 'Audit Logs' },
    { path: '/admin-users', icon: UserCog, label: 'Admin Users' },
    { path: '/email-templates', icon: Mail, label: 'Email Templates' },
    { path: '/tax-reports', icon: Receipt, label: 'Tax Reports' },
    { path: '/gdpr-compliance', icon: ShieldCheck, label: 'GDPR Compliance' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setIsAuthenticated(false)
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 rounded-xl bg-white shadow-xl border-2 border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105"
        >
          {sidebarOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-72 bg-white border-r-2 border-gray-100 shadow-2xl transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b-2 border-gray-100 bg-gradient-to-r from-primary-50 to-purple-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <LayoutDashboard className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  Admin Panel
                </h1>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium ml-13">E-Commerce Dashboard</p>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white font-bold shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 font-medium hover:shadow-md hover:scale-102'
                  }`}
                >
                  <Icon size={20} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t-2 border-gray-100 bg-gradient-to-r from-red-50 to-pink-50">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-300 font-bold hover:shadow-lg hover:scale-105 group"
            >
              <LogOut size={20} className="group-hover:scale-110 transition-transform" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        {/* Top Header Bar */}
        <div className="bg-white border-b-2 border-gray-100 shadow-sm sticky top-0 z-30">
          <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold gradient-text">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-600 font-medium">Welcome back, Admin</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-xl hover:bg-gray-100 transition-all relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                A
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout
