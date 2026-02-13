import { useState } from 'react'
import { Download, Calendar, TrendingUp, FileText, DollarSign } from 'lucide-react'

const TaxReports = () => {
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  const taxData = {
    totalSales: 500000,
    taxableAmount: 450000,
    cgst: 40500,
    sgst: 40500,
    igst: 0,
    totalTax: 81000,
    netAmount: 419000
  }

  const monthlyData = [
    { month: 'January 2026', sales: 50000, tax: 9000, orders: 120 },
    { month: 'February 2026', sales: 45000, tax: 8100, orders: 110 },
    { month: 'March 2026', sales: 60000, tax: 10800, orders: 150 },
    { month: 'April 2026', sales: 55000, tax: 9900, orders: 135 },
    { month: 'May 2026', sales: 70000, tax: 12600, orders: 180 },
    { month: 'June 2026', sales: 65000, tax: 11700, orders: 160 }
  ]

  const categoryWiseTax = [
    { category: 'Electronics', sales: 200000, tax: 36000, rate: '18%' },
    { category: 'Clothing', sales: 150000, tax: 18000, rate: '12%' },
    { category: 'Beauty', sales: 100000, tax: 18000, rate: '18%' },
    { category: 'Home & Kitchen', sales: 50000, tax: 9000, rate: '18%' }
  ]

  const handleExport = (type) => {
    const data = type === 'monthly' ? monthlyData : categoryWiseTax
    const headers = type === 'monthly' 
      ? ['Month', 'Sales', 'Tax', 'Orders']
      : ['Category', 'Sales', 'Tax', 'Rate']
    
    const rows = data.map(item => 
      type === 'monthly'
        ? [item.month, item.sales, item.tax, item.orders]
        : [item.category, item.sales, item.tax, item.rate]
    )

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tax_report_${type}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleGenerateGSTR = () => {
    alert('GSTR-1 report generated! (This would generate official GST return format)')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tax Reports</h1>
          <p className="text-gray-600 mt-1">GST and tax calculation reports</p>
        </div>
        <button onClick={handleGenerateGSTR} className="btn-primary flex items-center gap-2">
          <FileText size={20} />
          Generate GSTR-1
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Period</label>
            <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="input-field">
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button className="btn-secondary w-full">Apply Filter</button>
          </div>
        </div>
      </div>

      {/* Tax Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Sales</p>
              <p className="text-3xl font-bold mt-1">₹{taxData.totalSales.toLocaleString()}</p>
            </div>
            <DollarSign size={40} className="opacity-80" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Tax</p>
              <p className="text-3xl font-bold mt-1">₹{taxData.totalTax.toLocaleString()}</p>
            </div>
            <TrendingUp size={40} className="opacity-80" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">CGST</p>
              <p className="text-3xl font-bold mt-1">₹{taxData.cgst.toLocaleString()}</p>
            </div>
            <FileText size={40} className="opacity-80" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">SGST</p>
              <p className="text-3xl font-bold mt-1">₹{taxData.sgst.toLocaleString()}</p>
            </div>
            <FileText size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Monthly Tax Report */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Monthly Tax Report</h3>
          <button onClick={() => handleExport('monthly')} className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Month</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Sales</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Tax Collected</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Orders</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Avg Tax/Order</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((item, index) => (
                <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{item.month}</td>
                  <td className="py-3 px-4 text-right">₹{item.sales.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-semibold text-green-600">₹{item.tax.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">{item.orders}</td>
                  <td className="py-3 px-4 text-right">₹{Math.round(item.tax / item.orders)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                <td className="py-3 px-4">Total</td>
                <td className="py-3 px-4 text-right">₹{monthlyData.reduce((sum, item) => sum + item.sales, 0).toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-green-600">₹{monthlyData.reduce((sum, item) => sum + item.tax, 0).toLocaleString()}</td>
                <td className="py-3 px-4 text-right">{monthlyData.reduce((sum, item) => sum + item.orders, 0)}</td>
                <td className="py-3 px-4 text-right">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Category-wise Tax */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Category-wise Tax Breakdown</h3>
          <button onClick={() => handleExport('category')} className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Sales</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Tax Rate</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Tax Amount</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">% of Total Tax</th>
              </tr>
            </thead>
            <tbody>
              {categoryWiseTax.map((item, index) => (
                <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{item.category}</td>
                  <td className="py-3 px-4 text-right">₹{item.sales.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">{item.rate}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-green-600">₹{item.tax.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    {((item.tax / taxData.totalTax) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GST Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">GST Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">CGST (Central GST)</p>
            <p className="text-2xl font-bold text-gray-900">₹{taxData.cgst.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">9% on taxable amount</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">SGST (State GST)</p>
            <p className="text-2xl font-bold text-gray-900">₹{taxData.sgst.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">9% on taxable amount</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">IGST (Integrated GST)</p>
            <p className="text-2xl font-bold text-gray-900">₹{taxData.igst.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">18% on interstate sales</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaxReports
