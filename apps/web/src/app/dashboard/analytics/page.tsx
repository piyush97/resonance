'use client'

import { useState } from 'react'

const timeRanges = ['7 days', '30 days', '90 days', 'All time']

const metrics = {
  conversations: { value: 12847, change: 12, label: 'Total Conversations' },
  resolved: { value: 9392, change: 15, label: 'Resolved by AI' },
  escalated: { value: 2156, change: -8, label: 'Escalated to Human' },
  avgTime: { value: '1.2s', change: -25, label: 'Avg Response Time' },
  satisfaction: { value: 4.6, change: 5, label: 'Customer Satisfaction' },
  costSaved: { value: 47200, change: 22, label: 'Cost Savings ($)' },
}

const dailyData = [
  { day: 'Mon', conversations: 1823, resolved: 1456, escalated: 234 },
  { day: 'Tue', conversations: 2156, resolved: 1789, escalated: 267 },
  { day: 'Wed', conversations: 1987, resolved: 1654, escalated: 213 },
  { day: 'Thu', conversations: 2341, resolved: 1923, escalated: 289 },
  { day: 'Fri', conversations: 2567, resolved: 2134, escalated: 312 },
  { day: 'Sat', conversations: 987, resolved: 823, escalated: 98 },
  { day: 'Sun', conversations: 876, resolved: 734, escalated: 87 },
]

const topQueries = [
  { query: 'How do I reset my password?', count: 1234, resolved: 98 },
  { query: 'What are your pricing plans?', count: 987, resolved: 92 },
  { query: 'How to integrate the API?', count: 756, resolved: 85 },
  { query: 'Billing and invoice questions', count: 654, resolved: 78 },
  { query: 'Account cancellation', count: 432, resolved: 45 },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30 days')

  const maxConversations = Math.max(...dailyData.map((d) => d.conversations))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500">Track your AI assistant performance</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(metrics).map(([key, metric]) => (
          <div
            key={key}
            className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition-shadow"
          >
            <p className="text-xs text-slate-500 mb-1">{metric.label}</p>
            <p className="text-2xl font-bold text-slate-900">
              {typeof metric.value === 'number' && key === 'costSaved'
                ? `$${metric.value.toLocaleString()}`
                : typeof metric.value === 'number'
                ? metric.value.toLocaleString()
                : metric.value}
              {key === 'satisfaction' && <span className="text-lg">/5</span>}
            </p>
            <p
              className={`text-xs font-medium ${
                metric.change > 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {metric.change > 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Conversation Volume</h3>
          <div className="space-y-4">
            {dailyData.map((day) => (
              <div key={day.day} className="flex items-center gap-4">
                <span className="w-8 text-sm text-slate-500">{day.day}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(day.conversations / maxConversations) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        {day.conversations}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Resolution Breakdown</h3>
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* Donut Chart */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="#e2e8f0"
                  strokeWidth="24"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="url(#gradient)"
                  strokeWidth="24"
                  fill="none"
                  strokeDasharray={`${73 * 5.02} ${100 * 5.02}`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-4xl font-bold text-slate-900">73%</span>
                <span className="text-sm text-slate-500">Resolved</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-8 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" />
              <span className="text-sm text-slate-600">AI Resolved (73%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-200" />
              <span className="text-sm text-slate-600">Escalated (27%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Queries */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Top Customer Queries</h3>
          <p className="text-sm text-slate-500">Most frequently asked questions</p>
        </div>
        <div className="divide-y divide-slate-100">
          {topQueries.map((query, index) => (
            <div key={index} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
              <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-medium text-slate-600">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-slate-900">{query.query}</p>
                <p className="text-sm text-slate-500">{query.count} conversations</p>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-medium ${
                    query.resolved >= 80
                      ? 'text-emerald-600'
                      : query.resolved >= 60
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}
                >
                  {query.resolved}% resolved
                </p>
                <div className="w-24 h-2 bg-slate-100 rounded-full mt-1">
                  <div
                    className={`h-full rounded-full ${
                      query.resolved >= 80
                        ? 'bg-emerald-500'
                        : query.resolved >= 60
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${query.resolved}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROI Calculator */}
      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-8 text-white">
        <div className="max-w-2xl">
          <h3 className="text-2xl font-bold mb-2">Your ROI This Month</h3>
          <p className="text-cyan-100 mb-6">
            Based on average support agent cost of $25/hour
          </p>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-4xl font-bold">$47,200</p>
              <p className="text-cyan-100 text-sm">Cost Savings</p>
            </div>
            <div>
              <p className="text-4xl font-bold">1,888</p>
              <p className="text-cyan-100 text-sm">Agent Hours Saved</p>
            </div>
            <div>
              <p className="text-4xl font-bold">47x</p>
              <p className="text-cyan-100 text-sm">ROI on Resonance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
