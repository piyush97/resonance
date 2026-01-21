'use client'

import { useState, useEffect } from 'react'

export default function DemoPage() {
  const [widgetConfig, setWidgetConfig] = useState({
    assistantId: 'demo-assistant',
    primaryColor: '#0ea5e9',
    title: 'Chat with us',
    subtitle: "We're here to help",
    welcomeMessage: 'Hi! How can I help you today?',
  })
  const [embedCode, setEmbedCode] = useState('')

  useEffect(() => {
    const code = `<!-- Resonance Chat Widget -->
<script 
  src="https://cdn.resonance.ai/widget.js"
  data-assistant-id="${widgetConfig.assistantId}"
  data-primary-color="${widgetConfig.primaryColor}"
  data-api-url="http://localhost:3001"
></script>`
    setEmbedCode(code)
  }, [widgetConfig])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Widget Demo</h1>
        <p className="text-slate-500">Test and customize your chat widget</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Widget Configuration</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Assistant ID
              </label>
              <input
                type="text"
                value={widgetConfig.assistantId}
                onChange={(e) => setWidgetConfig({ ...widgetConfig, assistantId: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={widgetConfig.primaryColor}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, primaryColor: e.target.value })}
                  className="w-16 h-12 rounded-lg cursor-pointer border-2 border-slate-200"
                />
                <input
                  type="text"
                  value={widgetConfig.primaryColor}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, primaryColor: e.target.value })}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Widget Title
              </label>
              <input
                type="text"
                value={widgetConfig.title}
                onChange={(e) => setWidgetConfig({ ...widgetConfig, title: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={widgetConfig.subtitle}
                onChange={(e) => setWidgetConfig({ ...widgetConfig, subtitle: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Welcome Message
              </label>
              <textarea
                value={widgetConfig.welcomeMessage}
                onChange={(e) => setWidgetConfig({ ...widgetConfig, welcomeMessage: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Embed Code */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Embed Code</h3>
              <button
                onClick={copyToClipboard}
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto">
              <code>{embedCode}</code>
            </pre>
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-slate-100 rounded-xl p-6 min-h-[700px] relative">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Live Preview</h2>
          
          {/* Mock Website */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[600px] relative">
            {/* Mock Browser Chrome */}
            <div className="bg-slate-200 px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-slate-500">
                yourwebsite.com
              </div>
            </div>

            {/* Mock Page Content */}
            <div className="p-8 h-full overflow-auto">
              <div className="max-w-md mx-auto text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">Your Website</h1>
                <p className="text-slate-600 mb-6">
                  This is a preview of how the Resonance chat widget will appear on your website.
                </p>
                <div className="bg-slate-50 rounded-lg p-6">
                  <p className="text-sm text-slate-500">
                    Click the chat button in the bottom right corner to test the widget →
                  </p>
                </div>
              </div>
            </div>

            {/* Widget Preview (Simulated) */}
            <div className="absolute bottom-4 right-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: widgetConfig.primaryColor }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Test Instructions */}
          <div className="mt-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <p className="text-sm text-cyan-800">
              <strong>💡 Tip:</strong> To test the live widget with your API, add the embed code to any HTML page
              or use the widget directly on your Next.js dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Integration Guide */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Integration Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-semibold shrink-0">
              1
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Copy the embed code</h3>
              <p className="text-sm text-slate-500">
                Copy the script tag above and paste it before the closing &lt;/body&gt; tag
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-semibold shrink-0">
              2
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Customize appearance</h3>
              <p className="text-sm text-slate-500">
                Adjust colors and messages to match your brand
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-semibold shrink-0">
              3
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Go live!</h3>
              <p className="text-sm text-slate-500">
                Deploy your site and start handling customer inquiries automatically
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
