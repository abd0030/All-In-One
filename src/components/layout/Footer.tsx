import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Globe, Share2, Send, Video, Mail, Phone, MapPin, Download, Smartphone } from 'lucide-react';
import { CATEGORIES } from '../../utils/constants';

const Footer: React.FC = () => {
  const topCategories = CATEGORIES.slice(0, 7);

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 mt-auto border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/50 p-0.5 shadow-md flex items-center justify-center">
                <img src="/logo.png" alt="All in one" className="w-full h-full object-cover rounded-lg" />
              </div>
              <span className="text-xl font-bold text-white">All in one</span>
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Pakistan's largest online marketplace. Buy and sell anything from mobile & tech products to vehicles, property to fashion.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-slate-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                <Globe size={14} />
              </a>
              <a href="#" className="w-8 h-8 bg-slate-800 hover:bg-sky-500 rounded-lg flex items-center justify-center transition-colors">
                <Send size={14} />
              </a>
              <a href="#" className="w-8 h-8 bg-slate-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors">
                <Share2 size={14} />
              </a>
              <a href="#" className="w-8 h-8 bg-slate-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors">
                <Video size={14} />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              {topCategories.map(cat => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/listings" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                  View all →
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: 'Post Free Ad', to: '/dashboard/listings/new' },
                { label: 'My Account', to: '/profile' },
                { label: 'My Ads', to: '/dashboard' },
                { label: 'Saved Ads', to: '/dashboard/bookmarks' },
                { label: 'Messages', to: '/chat' },
                { label: 'Help Center', to: '/help' },
                { label: 'Safety Tips', to: '/safety' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Download App */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-slate-400">
                <MapPin size={14} className="mt-0.5 shrink-0 text-primary-400" />
                <span>123 Commerce Street, Karachi, Pakistan</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Phone size={14} className="shrink-0 text-primary-400" />
                <a href="tel:+923197784575" className="hover:text-white transition-colors">+92 3197784575</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Mail size={14} className="shrink-0 text-primary-400" />
                <a href="mailto:classifiedallinon@gmail.com" className="hover:text-white transition-colors">classifiedallinon@gmail.com</a>
              </li>
            </ul>

            {/* Download Mobile App Box */}
            <div className="mt-5 p-3.5 bg-slate-800/90 border border-slate-700/70 rounded-2xl shadow-lg">
              <div className="flex items-center gap-2 mb-1.5">
                <Smartphone size={15} className="text-primary-400" />
                <p className="text-xs font-bold text-white">Get Mobile App</p>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">Install on Android or iOS devices.</p>
              <div className="flex flex-col gap-2">
                <a
                  href="/all-in-one-marketplace.apk"
                  download="All-In-One-Classified.apk"
                  className="w-full py-2 px-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-center"
                >
                  <Download size={14} />
                  Download Android APK
                </a>
                <div className="flex gap-2">
                  <a
                    href="/all-in-one-marketplace.apk"
                    download="All-In-One-Classified.apk"
                    className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-[11px] font-semibold text-slate-200 text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <Download size={11} /> Play Store
                  </a>
                  <a
                    href="/all-in-one-marketplace.apk"
                    download="All-In-One-Classified.apk"
                    className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-[11px] font-semibold text-slate-200 text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <Download size={11} /> App Store
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} All in one Marketplace. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-slate-500">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Use</a>
            <a href="/cookies" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
