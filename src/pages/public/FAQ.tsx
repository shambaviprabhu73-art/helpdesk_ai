import { useState } from 'react';
import { ChevronDown, HelpCircle, Mail, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      { q: 'How do I create an account?', a: 'Click "Get Started" on the homepage, enter your name, email, and a password, then click Sign Up. You will be signed in immediately and can start using the AI assistant right away.' },
      { q: 'Is HelpDesk AI free to use?', a: 'Yes! The Starter plan is free forever and includes unlimited AI chat sessions and up to 10 tickets per month. Paid plans are available for teams that need more capacity and features.' },
      { q: 'Do I need to install anything?', a: 'No. HelpDesk AI runs entirely in your web browser. Just sign in and you are ready to go. It works on desktop, tablet, and mobile.' },
    ],
  },
  {
    category: 'AI Assistant',
    questions: [
      { q: 'What issues can the AI assistant help with?', a: 'The AI can troubleshoot common IT issues including Wi-Fi connectivity, VPN, printer problems, software installation, email login, password resets, slow performance, BSOD, and malware concerns. New topics are added regularly.' },
      { q: 'How does the AI know the answer?', a: 'The AI uses a curated knowledge base of IT solutions built by experienced IT professionals. When you describe your problem, it matches your issue to the most relevant article and walks you through the solution step by step.' },
      { q: 'What if the AI cannot solve my problem?', a: 'If the AI cannot resolve your issue, you can escalate to a human support technician with one click. Your full chat history is attached to the ticket so the technician has complete context.' },
      { q: 'Is my chat data private?', a: 'Yes. Your chat sessions are tied to your account and protected by row-level security. Only you and authorized support staff can see your conversations.' },
    ],
  },
  {
    category: 'Tickets & Support',
    questions: [
      { q: 'How are ticket IDs generated?', a: 'Each ticket gets a unique, human-readable ID like "TKT-2026-00001" that is generated automatically when you submit. You can use this ID to track your ticket anytime.' },
      { q: 'What are the ticket statuses?', a: 'Tickets move through four statuses: Open (just submitted), In Progress (a technician is working on it), Resolved (the issue is fixed, awaiting your confirmation), and Closed (the ticket is complete).' },
      { q: 'How do I attach files to a ticket?', a: 'When submitting a ticket or replying to one, you can attach screenshots, error logs, or documents. Files are stored securely and visible to the assigned technician.' },
      { q: 'How will I know when my ticket is updated?', a: 'You will receive a notification in the in-app notification center whenever your ticket status changes or a technician replies. The bell icon in the dashboard shows your unread count.' },
    ],
  },
  {
    category: 'Account & Security',
    questions: [
      { q: 'What if I forget my password?', a: 'Click "Forgot Password" on the sign-in page and enter your email. You will receive a secure reset link valid for 60 minutes. Click it and choose a new password.' },
      { q: 'How is my password stored?', a: 'Passwords are never stored in plain text. We use industry-standard bcrypt hashing via Supabase Auth. Your password is one-way encrypted and cannot be recovered — only reset.' },
      { q: 'Can I change my email address?', a: 'Currently, your email is tied to your account and cannot be changed. If you need to use a different email, sign up for a new account and contact us to migrate your tickets.' },
      { q: 'How do I delete my account?', a: 'Contact support from the Contact page and request account deletion. We will permanently remove your data within 30 days, in compliance with GDPR.' },
    ],
  },
];

export function FAQPage() {
  const [openId, setOpenId] = useState<string | null>('Getting Started-0');

  return (
    <div className="min-h-screen pt-20">
      <section className="py-16 bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-medium mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            FAQ
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 text-balance">
            Frequently asked questions
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Everything you need to know about HelpDesk AI. Cannot find what you are looking for? <Link to="/contact" className="text-primary-600 font-medium hover:underline">Contact us</Link>.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {faqs.map((section) => (
              <div key={section.category}>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">{section.category}</h2>
                <div className="space-y-3">
                  {section.questions.map((item, i) => {
                    const id = `${section.category}-${i}`;
                    const isOpen = openId === id;
                    return (
                      <div key={id} className="card overflow-hidden">
                        <button
                          onClick={() => setOpenId(isOpen ? null : id)}
                          className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
                        >
                          <span className="font-medium text-slate-900">{item.q}</span>
                          <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed animate-fade-in-down">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 card p-8 bg-gradient-to-br from-primary-50 to-accent-50 border-primary-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Still have questions?</h3>
                <p className="text-sm text-slate-600">Our support team is here to help.</p>
              </div>
              <div className="flex gap-3">
                <Link to="/contact" className="btn-primary">
                  <Mail className="w-4 h-4" />
                  Contact Support
                </Link>
                <Link to="/signup" className="btn-secondary">
                  <MessageSquare className="w-4 h-4" />
                  Try AI Assistant
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
