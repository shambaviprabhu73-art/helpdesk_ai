import { Target, Eye, Heart, Users, Award, Lightbulb, HandHeart } from 'lucide-react';

const values = [
  { icon: Heart, title: 'User-First Design', description: 'Every feature starts with a simple question: how does this help the user solve their problem faster?' },
  { icon: Lightbulb, title: 'Innovation', description: 'We combine AI with human expertise to deliver support that is both instant and intelligent.' },
  { icon: HandHeart, title: 'Accessibility', description: 'IT help should be available to everyone, 24/7, regardless of technical background.' },
  { icon: Award, title: 'Excellence', description: 'We hold ourselves to the highest standards in security, performance, and reliability.' },
];

const milestones = [
  { year: '2024', title: 'Project Conception', description: 'Identified the gap between self-service IT and human support.' },
  { year: '2025', title: 'AI Engine Development', description: 'Built and trained the knowledge base on common IT issues.' },
  { year: '2026', title: 'Platform Launch', description: 'Released HelpDesk AI to users with full ticketing and admin tools.' },
];

export function AboutPage() {
  return (
    <div className="min-h-screen pt-20">
      <section className="py-16 bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-medium mb-4">
              About Us
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 text-balance">
              We are redefining how teams get IT support
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              HelpDesk AI was built to bridge the gap between instant self-service and human expertise. Most IT issues are common and repeatable — perfect for AI. But when you need a human, you need one fast, with full context. We built a platform that delivers both.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-8">
              <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Our Mission</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                To make IT support instant, accessible, and intelligent — so teams can focus on their work instead of waiting on hold.
              </p>
            </div>
            <div className="card p-8">
              <div className="w-12 h-12 rounded-xl bg-accent-100 text-accent-600 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Our Vision</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                A world where every IT problem has an immediate, helpful answer — powered by AI that knows when to hand off to a human.
              </p>
            </div>
            <div className="card p-8">
              <div className="w-12 h-12 rounded-xl bg-success-100 text-success-600 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Our Team</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                A small team of IT engineers, designers, and developers passionate about building tools that make work life better.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Values</h2>
            <p className="text-slate-600">The principles that guide every decision we make.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="card p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-600">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Journey</h2>
            <p className="text-slate-600">From idea to platform — the milestones that shaped HelpDesk AI.</p>
          </div>
          <div className="relative">
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-slate-200 sm:-translate-x-1/2" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={i} className={`relative flex items-center gap-6 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                  <div className="absolute left-4 sm:left-1/2 w-3 h-3 rounded-full bg-primary-600 ring-4 ring-primary-100 sm:-translate-x-1/2 z-10" />
                  <div className="flex-1 sm:px-8 pl-12 sm:pl-8">
                    <div className="card p-6">
                      <div className="text-sm font-semibold text-primary-600 mb-1">{m.year}</div>
                      <h3 className="font-semibold text-slate-900 mb-1">{m.title}</h3>
                      <p className="text-sm text-slate-600">{m.description}</p>
                    </div>
                  </div>
                  <div className="flex-1 hidden sm:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
