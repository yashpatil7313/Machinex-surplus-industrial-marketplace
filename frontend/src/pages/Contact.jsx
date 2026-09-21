import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Building } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const Contact = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Your message has been received! Our industrial team will respond within 24 hours.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Get in Touch</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">Connect with MachineX</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2">
          Have an enterprise liquidation, need API integration, or need help with a purchase order? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Card */}
        <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-8 space-y-8 shadow-elevated">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Corporate Headquarters</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Industrial Exchange Hub, Ground Floor, MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400069
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <Mail className="w-4 h-4 text-orange-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">Email Desk</span>
                <span className="font-semibold text-white">support@machinex-b2b.com</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <Phone className="w-4 h-4 text-orange-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">Direct Phone</span>
                <span className="font-semibold text-white">+91 (22) 4900-5800</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <Building className="w-4 h-4 text-orange-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">Operating Hours</span>
                <span className="font-semibold text-white">Mon - Sat: 9:00 AM - 6:30 PM IST</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-xs text-orange-300">
            <p className="font-semibold mb-1">College MDM Project Presentation</p>
            <p className="text-[11px] opacity-90">Demonstrated by the student development team with real-time MySQL database, REST APIs, and multi-role dashboards.</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-8 shadow-subtle">
          {submitted ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Message Received!</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Thank you for contacting MachineX. One of our industrial account managers will reach out to you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Send a Direct Message</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Company / Plant Name</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    placeholder="e.g. Apex Precision Tools"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    placeholder="+91 98000 00000"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Message / Inquiry Details</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Describe your machinery surplus, liquidation lot, or procurement requirement..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-6 py-3.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
