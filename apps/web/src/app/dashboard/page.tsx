import Link from 'next/link'

const stats = [
  { label: 'Total Conversations', value: '12,847', change: '+12%', trend: 'up' },
  { label: 'Resolution Rate', value: '73%', change: '+5%', trend: 'up' },
  { label: 'Avg Response Time', value: '1.2s', change: '-0.3s', trend: 'up' },
  { label: 'Cost Savings', value: '$47,200', change: '+$8,400', trend: 'up' },
]

const recentConversations = [
  { id: 1, customer: 'john@acme.com', query: 'How do I reset my password?', status: 'resolved', time: '2 min ago' },
  { id: 2, customer: 'sarah@startup.io', query: 'Billing question about enterprise plan', status: 'escalated', time: '5 min ago' },
  { id: 3, customer: 'mike@corp.com', query: 'API integration help needed', status: 'resolved', time: '12 min ago' },
  { id: 4, customer: 'lisa@tech.co', query: 'Feature request for dashboard', status: 'pending', time: '18 min ago' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <span className={`text-sm font-medium ${
                stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/assistants/new"
          className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Create Assistant</h3>
              <p className="text-cyan-100 text-sm">Deploy a new AI agent</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/assistants"
          className="bg-white rounded-xl p-6 border border-slate-200 hover:border-cyan-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-cyan-50 transition-colors">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900">Upload Docs</h3>
              <p className="text-slate-500 text-sm">Train your knowledge base</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/analytics"
          className="bg-white rounded-xl p-6 border border-slate-200 hover:border-cyan-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-cyan-50 transition-colors">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900">View Analytics</h3>
              <p className="text-slate-500 text-sm">Track performance metrics</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Conversations */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Conversations</h2>
            <Link href="/dashboard/conversations" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
              View all →
            </Link>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {recentConversations.map((conv) => (
            <div key={conv.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-slate-900">{conv.customer}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      conv.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                      conv.status === 'escalated' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {conv.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{conv.query}</p>
                </div>
                <p className="text-xs text-slate-400">{conv.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Widget Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Widget Preview</h2>
        <div className="bg-slate-100 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/25">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-slate-600 mb-4">Your chat widget will appear here</p>
            <button className="bg-cyan-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-cyan-700 transition-colors">
              Test Widget
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
