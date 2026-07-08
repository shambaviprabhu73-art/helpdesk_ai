import { Link } from 'react-router-dom';
import { Headset, Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Headset className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                HelpDesk<span className="text-primary-400">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI-powered IT support platform. Get instant troubleshooting and seamless human escalation when you need it.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-primary-600 flex items-center justify-center transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-primary-600 flex items-center justify-center transition-colors" aria-label="GitHub">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-primary-600 flex items-center justify-center transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-primary-400 transition-colors">Services</Link></li>
              <li><Link to="/faq" className="hover:text-primary-400 transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/signin" className="hover:text-primary-400 transition-colors">Sign In</Link></li>
              <li><Link to="/signup" className="hover:text-primary-400 transition-colors">Create Account</Link></li>
              <li><Link to="/forgot-password" className="hover:text-primary-400 transition-colors">Forgot Password</Link></li>
              <li><Link to="/admin/login" className="hover:text-primary-400 transition-colors">Admin Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
                <span>support@helpdeskai.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
                <span>+1 (800) 555-0199</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
                <span>100 Tech Plaza, Suite 400<br />San Francisco, CA 94105</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">© 2026 HelpDesk AI. All rights reserved. Built as a final-year IT engineering project.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary-400 transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
