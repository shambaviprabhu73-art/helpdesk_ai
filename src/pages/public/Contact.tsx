import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Headset } from 'lucide-react';
import { Input, Textarea, Button, Alert } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
    toast('success', 'Message sent!', 'We will get back to you within 24 hours.');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen pt-20">
      <section className="py-16 bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-medium mb-4">
            <Mail className="w-3.5 h-3.5" />
            Contact Us
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 text-balance">
            We would love to hear from you
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Questions, feedback, or need a demo? Reach out and our team will respond within 24 hours.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="card p-6">
                <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Email Us</h3>
                <p className="text-sm text-slate-600 mb-2">For general inquiries and support.</p>
                <a href="mailto:support@helpdeskai.com" className="text-sm text-primary-600 font-medium hover:underline">support@helpdeskai.com</a>
              </div>

              <div className="card p-6">
                <div className="w-12 h-12 rounded-xl bg-accent-100 text-accent-600 flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Call Us</h3>
                <p className="text-sm text-slate-600 mb-2">Mon-Fri, 9am to 6pm PST.</p>
                <a href="tel:+18005550199" className="text-sm text-primary-600 font-medium hover:underline">+1 (800) 555-0199</a>
              </div>

              <div className="card p-6">
                <div className="w-12 h-12 rounded-xl bg-success-100 text-success-600 flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Visit Us</h3>
                <p className="text-sm text-slate-600 mb-2">Headquarters.</p>
                <p className="text-sm text-slate-700">100 Tech Plaza, Suite 400<br />San Francisco, CA 94105</p>
              </div>

              <div className="card p-6">
                <div className="w-12 h-12 rounded-xl bg-warning-100 text-warning-600 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Business Hours</h3>
                <p className="text-sm text-slate-600 mb-2">Support team availability.</p>
                <div className="text-sm text-slate-700 space-y-0.5">
                  <div className="flex justify-between"><span>Mon - Fri</span><span>9am - 6pm</span></div>
                  <div className="flex justify-between"><span>Saturday</span><span>10am - 4pm</span></div>
                  <div className="flex justify-between"><span>Sunday</span><span>Closed</span></div>
                  <div className="flex justify-between pt-1 border-t border-slate-100 mt-1"><span className="font-medium text-primary-600">AI Assistant</span><span className="font-medium text-primary-600">24/7</span></div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
                    <Headset className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Send us a message</h2>
                    <p className="text-sm text-slate-500">We typically respond within 24 hours.</p>
                  </div>
                </div>

                {submitted && (
                  <Alert variant="success" title="Message sent successfully!" className="mb-6">
                    Thank you for reaching out. We will get back to you shortly.
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Doe"
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jane@company.com"
                    />
                  </div>
                  <Input
                    label="Subject"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="How can we help?"
                  />
                  <Textarea
                    label="Message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us more about your inquiry..."
                  />
                  <Button type="submit" loading={loading} className="w-full sm:w-auto">
                    <Send className="w-4 h-4" />
                    Send Message
                  </Button>
                </form>
              </div>

              <div className="mt-6 card p-6 bg-gradient-to-br from-primary-50 to-accent-50 border-primary-100">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Need instant help?</h3>
                    <p className="text-sm text-slate-600 mb-3">Try our AI assistant — it can resolve most common IT issues in seconds, 24/7.</p>
                    <a href="/signup" className="btn-primary btn-sm">Try AI Assistant</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
