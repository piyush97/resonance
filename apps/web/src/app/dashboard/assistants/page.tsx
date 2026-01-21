'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Assistant {
  id: string
  name: string
  description: string
  status: 'active' | 'training' | 'paused'
  conversations: number
  resolutionRate: number
  lastActive: string
}

const mockAssistants: Assistant[] = [
  {
    id: '1',
    name: 'Support Bot',
    description: 'General customer support for product questions',
    status: 'active',
    conversations: 8432,
    resolutionRate: 78,
    lastActive: '2 min ago',
  },
  {
    id: '2',
    name: 'Sales Assistant',
    description: 'Pre-sales inquiries and pricing questions',
    status: 'active',
    conversations: 2156,
    resolutionRate: 65,
    lastActive: '5 min ago',
  },
  {
    id: '3',
    name: 'Technical Help',
    description: 'API documentation and integration support',
    status: 'training',
    conversations: 1203,
    resolutionRate: 82,
    lastActive: '1 hour ago',
  },
]

export default function AssistantsPage() {
  const [assistants] = useState<Assistant[]>(mockAssistants)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAssistants = assistants.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Assistants</h1>
          <p className="text-slate-500">Manage your AI support agents</p>
        </div>
        <Link
          href="/dashboard/assistants/new"
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Assistant
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search assistants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
          <option>All Status</option>
          <option>Active</option>
          <option>Training</option>
          <option>Paused</option>
        </select>
      </div>

      {/* Assistants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssistants.map((assistant) => (
          <div
            key={assistant.id}
            className="bg-white rounded-xl border border-slate-200 hover:border-cyan-300 hover:shadow-lg transition-all group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-cyan-500/25">
                  🤖
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    assistant.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : assistant.status === 'training'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {assistant.status}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mb-1">{assistant.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{assistant.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-400">Conversations</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {assistant.conversations.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Resolution Rate</p>
                  <p className="text-lg font-semibold text-emerald-600">{assistant.resolutionRate}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400">Last active: {assistant.lastActive}</p>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/dashboard/assistants/${assistant.id}`}
                    className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </Link>
                  <button
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Create New Card */}
        <Link
          href="/dashboard/assistants/new"
          className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 hover:border-cyan-400 hover:bg-cyan-50/50 transition-all flex items-center justify-center min-h-[280px] group"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-200 group-hover:bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
              <svg
                className="w-8 h-8 text-slate-400 group-hover:text-cyan-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-slate-600 group-hover:text-cyan-700 font-medium transition-colors">
              Create New Assistant
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
