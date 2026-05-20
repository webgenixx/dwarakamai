import { useState } from 'react';
import { MapPin, Phone, Mail, Send, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = `New Inquiry from Contact Form!\n\nName: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\nMessage: ${formData.message}`;
    const whatsappUrl = `https://wa.me/919492686421?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="py-4">
        <div className="container-custom">
          <span className="text-[10px] font-body font-bold text-[var(--color-primary)] uppercase tracking-widest mb-4 block">Contact Us</span>
          <h1 className="text-6xl md:text-7xl font-display font-bold text-gray-900 mb-6 leading-tight">
            Let's start a <span className="italic font-serif font-medium text-[var(--color-primary)]">conversation.</span>
          </h1>
          <p className="text-gray-500 font-body text-lg leading-relaxed max-w-2xl">
            Whether you're looking for a bespoke digital gift or a professional studio session, our team is here to curate your memories with care.
          </p>
        </div>
      </div>

      <div className="container-custom pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Contact Form */}
          <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-purple-100/50 border border-purple-50/50">
            <h3 className="text-2xl font-display font-bold text-gray-900 mb-10">Send a message</h3>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-4">Your Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 font-body text-sm text-gray-700 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 font-body text-sm text-gray-700 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-4">Subject</label>
                <input
                  type="text"
                  placeholder="Inquiry about collections"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 font-body text-sm text-gray-700 focus:ring-2 focus:ring-purple-100 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-4">Your Message</label>
                <textarea
                  placeholder="How can we help you today?"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 font-body text-sm text-gray-700 focus:ring-2 focus:ring-purple-100 h-40 resize-none transition-all"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-3 py-4 px-10 bg-[#8E447E] text-white rounded-2xl font-body font-bold text-sm hover:bg-[#7A3B6D] transition-all shadow-lg active:scale-95"
              >
                <span>Send Inquiry</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Details & Map Card */}
          <div className="space-y-12">
            <div className="bg-gray-50 rounded-[40px] p-8 md:p-12">
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-10">Studio Details</h3>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest mb-1">Our Location</h5>
                    <p className="text-sm font-body text-gray-700 leading-relaxed">
                      Police Bomma Road, Bhimavaram,<br />Andhra Pradesh 534204
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                    <Phone className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest mb-1">Phone Number</h5>
                    <p className="text-sm font-body text-gray-700 leading-relaxed">+91 94926 86421</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                    <Mail className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest mb-1">Email</h5>
                    <p className="text-sm font-body text-gray-700">hello@dwarakamai.digital</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-12 border-t border-gray-100">
                <h5 className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest mb-6">Connect with us</h5>
                <div className="flex gap-4">
                  <a href="#" className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-all">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-all">
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Studio Image & Map Row */}
      <div className="container-custom pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Studio Image Card */}
          <div className="relative rounded-[40px] overflow-hidden group h-[400px] lg:h-[500px]">
            <img 
              src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=600&fit=crop" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              alt="Studio" 
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-8 text-center">
              <h3 className="text-3xl font-display font-bold text-white mb-4">Visit Our Studio</h3>
              <p className="text-white/80 font-body text-sm mb-8 max-w-xs">Experience our artisanal craftsmanship in person and browse our exclusive physical collections.</p>
              <a
                href="https://share.google/IgsN3lVSHExKkHJzF"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-gray-900 px-8 py-3 rounded-xl font-body font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-xl"
              >
                Get Directions
              </a>
            </div>
          </div>

          {/* Map Section */}
          <div className="relative rounded-[40px] overflow-hidden shadow-2xl h-[400px] lg:h-[500px] border border-gray-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d952.4117781428866!2d81.52284926957388!3d16.544234814703773!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a37d30a6f6646ab%3A0x349161fbbf6c561d!2sDwarakamai%20digital%20world!5e0!3m2!1sen!2sin!4v1747568400000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/20">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-body font-bold text-gray-900 leading-none mb-1">Dwarakamai digital photo studio</p>
                <p className="text-[9px] text-gray-500 leading-none">Studio Open Today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
