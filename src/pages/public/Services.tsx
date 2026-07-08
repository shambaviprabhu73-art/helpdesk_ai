import { Link } from 'react-router-dom';
import {
  Wifi, Printer, AppWindow, Mail, KeyRound, ShieldCheck,
  Laptop, Bot, TicketCheck, BarChart3, Bell, FileText, ArrowRight
} from 'lucide-react';

const services = [
  { icon: Wifi, title: 'Wi-Fi & Network Support', description: 'Connectivity issues, VPN setup, network diagnostics, and wireless troubleshooting.', color: 'from-primary-500 to-primary-600' },
  { icon: Printer, title: 'Printer & Peripherals', description: 'Printer setup, driver issues, offline printers, and hardware diagnostics.', color: 'from-accent-500 to-accent-600' },
  { icon: AppWindow, title: 'Software & Applications', description: 'Installation errors, licensing, Office activation, and application crashes.', color: 'from-success-500 to-success-600' },
  { icon: Mail, title: 'Email & Communication', description: 'Email login, Outlook sync, mailbox configuration, and calendar issues.', color: 'from-warning-500 to-warning-600' },
  { icon: KeyRound, title: 'Account & Password', description: 'Password resets, MFA setup, account lockouts, and access management.', color: 'from-primary-500 to-accent-500' },
  { icon: ShieldCheck, title: 'Security & Antivirus', description: 'Malware removal, antivirus setup, security policy, and threat response.', color: 'from-error-500 to-error-600' },
  { icon: Laptop, title: 'Hardware & Devices', description: 'Slow performance, BSOD, hardware failures, and device diagnostics.', color: 'from-slate-500 to-slate-600' },
  { icon: Bot, title: 'AI-Powered Chat', description: 'Instant AI troubleshooting available 24/7 for common IT issues.', color: 'from-primary-600 to-accent-600' },
];

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for individuals and small teams getting started.',
    features: ['Unlimited AI chat sessions', 'Up to 10 tickets per month', 'Email support', 'Basic analytics', '24/7 AI availability'],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$12',
    period: '/user/mo',
    description: 'For growing teams that need more power and support.',
    features: ['Everything in Starter', 'Unlimited tickets', 'Priority human support', 'Advanced analytics', 'Custom categories', 'SLA tracking', 'API access'],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations with custom requirements.',
    features: ['Everything in Professional', 'SSO & SAML', 'Custom AI training', 'Dedicated success manager', 'On-premise option', '24/7 phone support', 'Custom integrations'],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export function ServicesPage() {
  return (
    <div className="min-h-screen pt-20">
      <section className="py-16 bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-medium mb-4">
            Our Services
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 text-balance">
            Comprehensive IT support, <span className="gradient-text">powered by AI</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            From instant AI troubleshooting to human escalation, we cover the full spectrum of IT support needs.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="card-hover p-6 group">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} text-white mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-600">{s.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Platform Features</h2>
            <p className="text-slate-600">Everything you need to manage IT support end-to-end.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <TicketCheck className="w-8 h-8 text-primary-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Ticket Management</h3>
              <p className="text-sm text-slate-600">Create, track, and resolve support tickets with auto-generated IDs, priority levels, and status tracking.</p>
            </div>
            <div className="card p-6">
              <BarChart3 className="w-8 h-8 text-accent-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Analytics & Reports</h3>
              <p className="text-sm text-slate-600">Visualize ticket volume, resolution times, and common issues with interactive charts.</p>
            </div>
            <div className="card p-6">
              <Bell className="w-8 h-8 text-success-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Real-Time Notifications</h3>
              <p className="text-sm text-slate-600">Get instant updates when your ticket status changes or a technician responds.</p>
            </div>
            <div className="card p-6">
              <FileText className="w-8 h-8 text-warning-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">File Attachments</h3>
              <p className="text-sm text-slate-600">Upload screenshots and documents to give technicians full context of your issue.</p>
            </div>
            <div className="card p-6">
              <Bot className="w-8 h-8 text-primary-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">AI Knowledge Base</h3>
              <p className="text-sm text-slate-600">A growing library of IT solutions the AI uses to resolve your issues instantly.</p>
            </div>
            <div className="card p-6">
              <ShieldCheck className="w-8 h-8 text-error-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Secure by Design</h3>
              <p className="text-sm text-slate-600">Row-level security, encrypted sessions, and strict authorization keep your data safe.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-600">Choose the plan that fits your team. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`card p-8 relative ${plan.highlighted ? 'ring-2 ring-primary-500 shadow-lg' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary-600 text-white text-xs font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  {plan.period && <span className="text-slate-500">{plan.period}</span>}
                </div>
                <p className="text-sm text-slate-600 mb-6">{plan.description}</p>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-700">
                      <svg className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                  className={`btn w-full justify-center ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
