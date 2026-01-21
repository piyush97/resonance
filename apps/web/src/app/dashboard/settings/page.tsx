'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    companyName: 'Acme Inc',
    supportEmail: 'support@acme.com',
    timezone: 'America/New_York',
    language: 'en',
    escalationEmail: 'team@acme.com',
    escalationThreshold: 3,
    autoEscalate: true,
    businessHours: true,
    businessStart: '09:00',
    businessEnd: '17:00',
  })

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'billing', label: 'Billing', icon: '💳' },
    { id: 'team', label: 'Team', icon: '👥' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your account and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-8">
          {activeTab === 'general' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Company Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Escalation Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Auto-escalate to human</p>
                      <p className="text-sm text-slate-500">
                        Automatically escalate when AI cannot resolve
                      </p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, autoEscalate: !settings.autoEscalate })}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        settings.autoEscalate ? 'bg-cyan-500' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                          settings.autoEscalate ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Escalation Email
                    </label>
                    <input
                      type="email"
                      value={settings.escalationEmail}
                      onChange={(e) => setSettings({ ...settings, escalationEmail: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-200">
                <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">Integrations</h3>
              <p className="text-slate-500">Connect Resonance with your existing tools</p>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Slack', icon: '💬', status: 'connected', description: 'Get notifications in Slack' },
                  { name: 'Zendesk', icon: '🎫', status: 'available', description: 'Sync with Zendesk tickets' },
                  { name: 'Intercom', icon: '💭', status: 'available', description: 'Import Intercom history' },
                  { name: 'Salesforce', icon: '☁️', status: 'available', description: 'Sync with Salesforce CRM' },
                  { name: 'HubSpot', icon: '🔶', status: 'available', description: 'Connect HubSpot contacts' },
                  { name: 'Zapier', icon: '⚡', status: 'available', description: 'Connect 5000+ apps' },
                ].map((integration) => (
                  <div
                    key={integration.name}
                    className="border border-slate-200 rounded-xl p-4 hover:border-cyan-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <p className="font-medium text-slate-900">{integration.name}</p>
                          <p className="text-sm text-slate-500">{integration.description}</p>
                        </div>
                      </div>
                      <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          integration.status === 'connected'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600 hover:bg-cyan-50 hover:text-cyan-700'
                        }`}
                      >
                        {integration.status === 'connected' ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">Billing</h3>
              
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-sm">Current Plan</p>
                    <p className="text-2xl font-bold">Pro Trial</p>
                    <p className="text-cyan-100 text-sm mt-1">14 days remaining</p>
                  </div>
                  <button className="bg-white text-cyan-600 px-6 py-2 rounded-lg font-semibold hover:bg-cyan-50 transition-colors">
                    Upgrade Plan
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-6">
                <h4 className="font-semibold text-slate-900 mb-4">Usage This Month</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Conversations</span>
                      <span className="font-medium">12,847 / 50,000</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: '26%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">AI Assistants</span>
                      <span className="font-medium">3 / 5</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Team Members</h3>
                  <p className="text-slate-500">Manage who has access to your account</p>
                </div>
                <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                  Invite Member
                </button>
              </div>

              <div className="divide-y divide-slate-200">
                {[
                  { name: 'Piyush Mehta', email: 'piyush@acme.com', role: 'Admin', avatar: 'P' },
                  { name: 'Sarah Chen', email: 'sarah@acme.com', role: 'Editor', avatar: 'S' },
                  { name: 'Mike Johnson', email: 'mike@acme.com', role: 'Viewer', avatar: 'M' },
                ].map((member) => (
                  <div key={member.email} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{member.name}</p>
                        <p className="text-sm text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm">
                      <option selected={member.role === 'Admin'}>Admin</option>
                      <option selected={member.role === 'Editor'}>Editor</option>
                      <option selected={member.role === 'Viewer'}>Viewer</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">Notification Preferences</h3>
              
              <div className="space-y-4">
                {[
                  { label: 'Email notifications for escalations', enabled: true },
                  { label: 'Daily summary report', enabled: true },
                  { label: 'Weekly analytics digest', enabled: false },
                  { label: 'New conversation alerts', enabled: false },
                  { label: 'Low satisfaction alerts', enabled: true },
                ].map((notification, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-slate-100">
                    <span className="text-slate-700">{notification.label}</span>
                    <button
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        notification.enabled ? 'bg-cyan-500' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                          notification.enabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
