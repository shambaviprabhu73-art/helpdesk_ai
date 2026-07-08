import { Link } from 'react-router-dom';
import {
  Headset, Bot, TicketCheck, BarChart3, ShieldCheck, Zap, Clock,
  ArrowRight, MessageSquare, FileText, Bell, CheckCircle2, Star,
  TrendingUp, Sparkles
} from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'AI-Powered Troubleshooting',
    description: 'Instant answers for Wi-Fi, printers, software, email, and more — available 24/7 with no wait time.',
    color: 'from-primary-500 to-primary-600',
  },
  {
    icon: TicketCheck,
    title: 'One-Click Escalation',
    description: 'When AI cannot resolve your issue, convert your chat into a support ticket with a single click.',
    color: 'from-accent-500 to-accent-600',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Tracking',
    description: 'Track ticket status from Open to Resolved. Get notified the moment there is an update.',
    color: 'from-success-500 to-success-600',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Private',
    description: 'Row-level security, encrypted sessions, and strict authorization keep your data protected.',
    color: 'from-warning-500 to-warning-600',
  },
];

const stats = [
  { value: '24/7', label: 'AI Availability', icon: Clock },
  { value: '<2s', label: 'Avg. AI Response', icon: Zap },
  { value: '85%', label: 'Issues Auto-Resolved', icon: TrendingUp },
  { value: '4.9/5', label: 'User Satisfaction', icon: Star },
];

const steps = [
  { icon: MessageSquare, title: 'Describe Your Issue', description: 'Chat naturally with the AI assistant — no forms to fill out.' },
  { icon: Sparkles, title: 'Get Instant Guidance', description: 'AI walks you through step-by-step troubleshooting tailored to your problem.' },
  { icon: FileText, title: 'Escalate If Needed', description: 'If AI cannot fix it, escalate to a human technician with full context attached.' },
  { icon: Bell, title: 'Stay Updated', description: 'Receive real-time notifications as your ticket progresses to resolution.' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Marketing Lead', content: 'The AI assistant solved my Wi-Fi issue in under a minute. I did not even need to wait for a human agent.', rating: 5 },
  { name: 'Marcus Johnson', role: 'Sales Rep', content: 'Submitted a ticket for a software install error and got a response from IT within the hour. The tracking is fantastic.', rating: 5 },
  { name: 'Priya Patel', role: 'HR Manager', content: 'Our whole team uses HelpDesk AI now. It has cut our IT wait times dramatically. Brilliant platform.', rating: 5 },
];

export function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="absolute top-20 -right-20 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 -left-20 w-96 h-96 bg-accent-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium mb-6 animate-fade-in-down">
              <Sparkles className="w-4 h-4" />
              AI-powered IT support, reimagined
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 animate-fade-in-up text-balance">
              IT support that actually <span className="gradient-text">solves problems</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 animate-fade-in-up animate-delay-100 text-balance">
              Get instant AI-powered troubleshooting for common IT issues. When you need a human, escalate to a real technician with one click — full context included.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up animate-delay-200">
              <Link to="/signup" className="btn-primary btn-lg">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/signin" className="btn-secondary btn-lg">
                <Headset className="w-4 h-4" />
                Sign In
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500 animate-fade-in animate-delay-500">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success-500" /> No credit card</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success-500" /> Free for teams</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success-500" /> 24/7 access</div>
            </div>
          </div>

          {/* Hero preview */}
          <div className="mt-16 max-w-4xl mx-auto animate-fade-in-up animate-delay-300">
            <div className="relative rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-error-400" />
                  <div className="w-3 h-3 rounded-full bg-warning-400" />
                  <div className="w-3 h-3 rounded-full bg-success-400" />
                </div>
                <div className="flex-1 text-center text-xs text-slate-500 font-medium">HelpDesk AI Assistant</div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-semibold text-slate-600">You</div>
                  <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-slate-700 max-w-md">
                    My printer is showing as offline and I cannot print anything.
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="bg-gradient-to-br from-primary-600 to-accent-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-lg">
                    Let me help with that. Here are the steps to get your printer back online:
                    <ol className="mt-2 space-y-1 list-decimal list-inside text-xs opacity-90">
                      <li>Check the printer is powered ON and connected to the network</li>
                      <li>Open Settings → Devices → Printers & scanners</li>
                      <li>Clear any stuck documents in the print queue</li>
                      <li>Restart the print spooler service</li>
                    </ol>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex-shrink-0 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <div className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-400">
                    Type your message...
                  </div>
                  <button className="px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium">
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-primary-600 mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Everything you need for IT support</h2>
            <p className="text-lg text-slate-600">A complete platform that combines AI efficiency with human expertise.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="card-hover p-6 group">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-lg text-slate-300">From problem to resolution in four simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-4 shadow-lg">
                      <Icon className="w-7 h-7 text-white" />
                      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white text-slate-900 text-sm font-bold flex items-center justify-center">
                        {i + 1}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-400">{step.description}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-slate-700 to-transparent -translate-x-1/2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Loved by teams everywhere</h2>
            <p className="text-lg text-slate-600">See what our users have to say about HelpDesk AI.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-warning-400 text-warning-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white font-semibold flex items-center justify-center">
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 p-10 sm:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to transform your IT support?</h2>
              <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">Join thousands of users who get instant IT help with HelpDesk AI. Free to start, no credit card required.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/signup" className="btn-lg bg-white text-primary-700 hover:bg-primary-50 px-8">
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/contact" className="btn-lg bg-primary-500/20 text-white border border-white/30 hover:bg-primary-500/30 px-8">
                  Talk to Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
