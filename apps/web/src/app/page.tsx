import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Deploy an AI Support Agent in 24 Hours
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Handle 70% of customer inquiries automatically. Save 60%+ on support costs.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Start Free Trial
            </Link>
            <Link
              href="/demo"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">24-Hour Setup</h3>
            <p className="text-gray-600">
              Upload your docs, customize your bot, go live. No engineering required.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">60% Cost Reduction</h3>
            <p className="text-gray-600">
              Average customer saves $50K-200K/year on support costs.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">70% Resolution Rate</h3>
            <p className="text-gray-600">
              AI handles most inquiries. Your team focuses on complex issues.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-2">Starter</h3>
              <div className="text-3xl font-bold mb-4">$299<span className="text-lg text-gray-600">/mo</span></div>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li>5,000 conversations/mo</li>
                <li>1 AI assistant</li>
                <li>Basic analytics</li>
                <li>Community support</li>
              </ul>
              <Link
                href="/signup?plan=starter"
                className="block text-center bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Get Started
              </Link>
            </div>
            <div className="bg-white p-8 rounded-lg border-2 border-primary-600 relative">
              <div className="absolute top-0 right-0 bg-primary-600 text-white px-3 py-1 text-sm rounded-bl-lg">
                Popular
              </div>
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <div className="text-3xl font-bold mb-4">$999<span className="text-lg text-gray-600">/mo</span></div>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li>50,000 conversations/mo</li>
                <li>5 AI assistants</li>
                <li>Advanced analytics</li>
                <li>Priority support</li>
                <li>Custom integrations</li>
              </ul>
              <Link
                href="/signup?plan=pro"
                className="block text-center bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Get Started
              </Link>
            </div>
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <div className="text-3xl font-bold mb-4">Custom</div>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li>Unlimited conversations</li>
                <li>Unlimited assistants</li>
                <li>Dedicated account manager</li>
                <li>SLA guarantees</li>
                <li>Custom model training</li>
              </ul>
              <Link
                href="/contact"
                className="block text-center border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
