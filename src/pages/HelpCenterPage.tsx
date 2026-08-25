import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Search,
  ChevronDown,
  Mail,
  Phone,
  Shield,
  ShoppingBag,
  Sparkles,
  DollarSign,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  Send,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  // Buying & Selling
  {
    category: 'Buying & Selling',
    question: 'How do I post a free ad on All In One?',
    answer: 'Click on the "+ Sell" button at the top of the website or mobile app. Select your category, fill in your product details, set a price, upload clear photos & product video, and submit. Your ad will be sent for quick moderation approval and then go live immediately!',
  },
  {
    category: 'Buying & Selling',
    question: 'How long does it take for my ad to be approved?',
    answer: 'Our moderation team reviews listings 24/7. Most ads are approved and live within 5 to 15 minutes. Make sure your ad follows our community guidelines to avoid delays.',
  },
  {
    category: 'Buying & Selling',
    question: 'How do I contact a seller or make an offer?',
    answer: 'Open any listing and click "Chat with Seller" or "Make an Offer". You can send direct messages, negotiable offers, and voice notes safely through our built-in SafeChat.',
  },
  {
    category: 'Buying & Selling',
    question: 'Can I edit or delete my ad after posting?',
    answer: 'Yes! Go to "My Ads" or "My Listings" from your account dashboard. You can edit the price, title, description, photos, or delete the ad anytime.',
  },

  // Account & Safety
  {
    category: 'Account & Safety',
    question: 'How can I get my account verified?',
    answer: 'Go to your Profile settings and complete your phone number verification. Verified profiles receive a blue "Verified Account" badge that boosts buyer trust by over 3x.',
  },
  {
    category: 'Account & Safety',
    question: 'What should I do if I suspect a scam or fake listing?',
    answer: 'Click the "Report Listing" button on the ad page, select the reason (e.g., Scam or Fraud, Misleading Price), and provide details. Our moderation team will investigate and take immediate action.',
  },
  {
    category: 'Account & Safety',
    question: 'How does SafeChat protect my privacy?',
    answer: 'SafeChat allows you to communicate, send voice notes, and negotiate prices without disclosing your personal phone number or email address to strangers.',
  },

  // Payments & Pricing
  {
    category: 'Payments & Pricing',
    question: 'Are there any fees for posting classified ads?',
    answer: 'No! Basic classified ad posting on All In One is 100% free forever for all categories including Mobiles, Vehicles, Properties, and Jobs.',
  },
  {
    category: 'Payments & Pricing',
    question: 'What are Featured / Promoted Ads?',
    answer: 'Featured ads appear at the top of category pages and the home screen carousel with high-visibility badges, generating up to 10x more leads. You can promote your ad using Safepay checkout.',
  },
  {
    category: 'Payments & Pricing',
    question: 'How should I pay the seller safely?',
    answer: 'Always inspect the product in person before making any payment. Never send advance deposits or wire transfers to unknown sellers without seeing the item first.',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: HelpCircle },
  { id: 'Buying & Selling', label: 'Buying & Selling', icon: ShoppingBag },
  { id: 'Account & Safety', label: 'Account & Safety', icon: Shield },
  { id: 'Payments & Pricing', label: 'Payments & Pricing', icon: DollarSign },
];

export const HelpCenterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const filteredFaqs = FAQS.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      toast.success('Your message has been sent to our support team!');
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      {/* ── 1. HERO HEADER ── */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-xs font-bold text-primary-700 dark:text-primary-300 mb-4">
          <HelpCircle size={14} /> 24/7 Help & Support Center
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-4">
          How can we help you today?
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal">
          Find answers to common questions, learn how to trade securely, or get in touch with our team.
        </p>

        {/* Search Input */}
        <div className="relative max-w-2xl mx-auto mt-8">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search keywords (e.g. posting ad, verification, safepay, safety)..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-lg shadow-slate-200/50 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* ── 2. QUICK HELP CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <Link
            to="/safety"
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Safety Tips</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              Essential guidelines to buy, sell, and meet safely across Pakistan.
            </p>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              Read Guide <ArrowRight size={13} />
            </span>
          </Link>

          <Link
            to="/listings"
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary-500/50 hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShoppingBag size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Posting Guidelines</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              Learn how to write high-converting ads with photos & videos.
            </p>
            <span className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1">
              Browse Listings <ArrowRight size={13} />
            </span>
          </Link>

          <div
            onClick={() => {
              const el = document.getElementById('contact-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mail size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Contact Support</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              Have a dispute or question? Our team responds within 24 hours.
            </p>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              Send Message <ArrowRight size={13} />
            </span>
          </div>
        </div>

        {/* ── 3. FAQ ACCORDION SECTION ── */}
        <section className="mb-16">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Frequently Asked Questions
            </h2>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <HelpCircle size={40} className="mx-auto text-slate-400 mb-3" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200">No matching questions found</h4>
                <p className="text-xs text-slate-500 mt-1">Try another search keyword or contact our support team below.</p>
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = expandedIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setExpandedIndex(isOpen ? null : idx)}
                      className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        size={18}
                        className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-600' : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ── 4. DIRECT CONTACT & SUPPORT FORM ── */}
        <section id="contact-section" className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3">
                <Mail size={13} /> Direct Support
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-3">
                Still have questions?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Our support team is available from 9 AM to 9 PM PKT every day to assist with account verification, disputes, and technical inquiries.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Helpline / WhatsApp</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">+92 3197784575</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Email Address</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">classifiedallinon@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleContactSubmit} className="space-y-4">
              {isSent ? (
                <div className="p-8 text-center bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 size={44} className="mx-auto text-emerald-500 mb-2" />
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-300">Message Received!</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                    Thank you for reaching out. A support agent will contact you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSent(false)}
                    className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                        placeholder="e.g. Ali Khan"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        placeholder="ali@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Subject</label>
                    <input
                      type="text"
                      value={contactSubject}
                      onChange={e => setContactSubject(e.target.value)}
                      placeholder="e.g. Issue with verification or ad"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">How can we help? *</label>
                    <textarea
                      required
                      rows={4}
                      value={contactMessage}
                      onChange={e => setContactMessage(e.target.value)}
                      placeholder="Describe your issue or feedback in detail..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    {isSending ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={16} /> Send Support Request
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpCenterPage;
