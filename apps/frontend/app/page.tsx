export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
        <div className="container-max">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Transform Career Assessments with AI
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Save 40% on admin time. Automate Qualiopi compliance.
              Deliver AI-powered career recommendations in seconds.
            </p>
            <div className="flex justify-center gap-4">
              <a href="/register" className="btn-primary text-lg">
                Start Free Trial
              </a>
              <a href="#how-it-works" className="btn-secondary text-lg">
                Watch Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white">
        <div className="container-max">
          <h2 className="section-title text-center">The Problem</h2>
          <p className="section-subtitle text-center">
            Career assessment professionals face significant challenges
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                  ✗
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Manual Admin Work
                </h3>
                <p className="text-gray-600">
                  40% of your time spent on paperwork, spreadsheets, and document management
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                  ✗
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Qualiopi Compliance
                </h3>
                <p className="text-gray-600">
                  Complex compliance requirements with scattered tools and manual tracking
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                  ✗
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Limited Insights
                </h3>
                <p className="text-gray-600">
                  Difficult to match clients with real job opportunities and career paths
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                  ✗
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Slow Reporting
                </h3>
                <p className="text-gray-600">
                  Generating assessment reports and recommendations takes hours of work
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container-max">
          <h2 className="section-title text-center">The Solution</h2>
          <p className="section-subtitle text-center">
            BilanCompetence.AI handles the hard work
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white font-bold">
                  ✓
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Automated Admin
                </h3>
                <p className="text-gray-600">
                  Save 40% time with automated workflows and document management
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white font-bold">
                  ✓
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Compliance Ready
                </h3>
                <p className="text-gray-600">
                  Built-in Qualiopi compliance with audit-ready documentation
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white font-bold">
                  ✓
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  AI-Powered Insights
                </h3>
                <p className="text-gray-600">
                  Real France Travail job matching and AI-powered recommendations
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white font-bold">
                  ✓
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  30-Second Reports
                </h3>
                <p className="text-gray-600">
                  Generate professional assessment reports in seconds, not hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container-max">
          <h2 className="section-title text-center">How It Works</h2>
          <p className="section-subtitle text-center">
            Simple, powerful, and designed for professionals
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: 'Self-Assessment',
                description: 'Clients complete a guided skills assessment in 30 minutes',
              },
              {
                step: 2,
                title: 'AI Analysis',
                description: 'Our AI extracts insights and matches with real job opportunities',
              },
              {
                step: 3,
                title: 'Professional Report',
                description: 'Generate polished report and action plan in seconds',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 text-white text-2xl font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-max">
          <h2 className="section-title text-center">Simple Pricing</h2>
          <p className="section-subtitle text-center">
            Choose the plan that fits your needs
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '49',
                features: [
                  'Up to 10 active assessments',
                  'Basic document generation',
                  'Email support',
                  '3 months data retention',
                ],
              },
              {
                name: 'Professional',
                price: '149',
                highlighted: true,
                features: [
                  'Up to 50 active assessments',
                  'AI analysis & recommendations',
                  'France Travail job matching',
                  'Priority support',
                  '1 year data retention',
                ],
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                features: [
                  'Unlimited assessments',
                  'Full feature set',
                  'Dedicated account manager',
                  'API access',
                  'Custom SLA',
                ],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`border rounded-lg p-8 ${
                  plan.highlighted
                    ? 'border-blue-600 bg-white ring-2 ring-blue-600'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-4xl font-bold text-blue-600 mb-6">
                  €{plan.price}
                  <span className="text-lg text-gray-600">/month</span>
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={plan.highlighted ? 'btn-primary w-full' : 'btn-secondary w-full'}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container-max text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to transform your practice?
          </h2>
          <p className="text-lg mb-8 text-blue-100">
            Join career assessment professionals who are saving time and improving outcomes
          </p>
          <a href="/register" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block">
            Start Free Trial
          </a>
        </div>
      </section>
    </>
  );
}
