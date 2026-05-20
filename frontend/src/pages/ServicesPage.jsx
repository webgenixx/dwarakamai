import { useState, useEffect } from 'react';
import { Calendar, MapPin, User, MessageSquare, CreditCard, ArrowRight, Camera, Scissors, BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import PhoneInput from '../components/PhoneInput';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    location: '',
    requirements: '',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services`);
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = (service) => {
    setSelectedService(service);
    setShowBookingForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = `New Service Booking!\n\nService: ${selectedService.name}\nName: ${formData.name}\nPhone: ${formData.phone}\nDate: ${formData.date}\nLocation: ${formData.location}\nRequirements: ${formData.requirements}`;
    const whatsappUrl = `https://wa.me/919492686421?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowBookingForm(false);
  };

  const getIcon = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes('photo')) return <Camera className="w-6 h-6" />;
    if (name.includes('edit')) return <Scissors className="w-6 h-6" />;
    if (name.includes('album') || name.includes('book')) return <BookOpen className="w-6 h-6" />;
    return <Camera className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="py-4 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl">
            <span className="bg-[#FCE4EC] text-[#9D4E8D] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
              Experiences
            </span>
            <h1 className="text-6xl font-display font-bold text-gray-900 mb-6 leading-tight">
              Studio <span className="italic font-serif font-medium text-[var(--color-primary)]">Offerings</span>
            </h1>
            <p className="text-gray-500 font-body text-lg leading-relaxed">
              From the technical precision of our post-production suite to the warm, inviting atmosphere of our studio sessions, we offer a range of services designed to capture and preserve your story.
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="py-4">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {services.map((service) => (
                <div key={service.id} className="group flex flex-col h-full bg-white rounded-[40px] p-10 border border-gray-50 shadow-xl shadow-purple-100/10 hover:-translate-y-2 transition-all duration-500">
                  <div className="relative aspect-video rounded-3xl overflow-hidden mb-10">
                    <img 
                      src={service.image_url || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=600&fit=crop"} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      alt={service.name} 
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg">
                      {getIcon(service.name)}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">{service.name}</h3>
                    <p className="text-gray-400 font-body text-sm leading-relaxed mb-8">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-4 mb-10 text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>Variable Duration</span>
                      </div>
                      <div className="w-1 h-1 bg-gray-200 rounded-full" />
                      <div className="text-[#8E447E]">{service.price_range || 'Custom Quote'}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBooking(service)}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-body font-bold text-xs uppercase tracking-widest hover:bg-[#8E447E] transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <span>Request Booking</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setShowBookingForm(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[40px] overflow-y-auto max-h-[90vh] shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <span className="text-[10px] font-body font-bold text-[#8E447E] uppercase tracking-widest mb-2 block">Service Inquiry</span>
                  <h2 className="text-4xl font-display font-bold text-gray-900">Book {selectedService?.name}</h2>
                </div>
                <button 
                  onClick={() => setShowBookingForm(false)}
                  className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-4">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 font-body text-sm text-gray-700 focus:ring-2 focus:ring-purple-100 transition-all"
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-4">Phone Number</label>
                    <PhoneInput
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-4">Event Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 font-body text-sm text-gray-700 focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-4">Location</label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 font-body text-sm text-gray-700 focus:ring-2 focus:ring-purple-100 transition-all"
                      placeholder="Venue or Studio"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-4">Requirements</label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 font-body text-sm text-gray-700 focus:ring-2 focus:ring-purple-100 h-32 resize-none transition-all"
                    placeholder="Tell us about your vision..."
                  />
                </div>

                <div className="flex items-center gap-3 bg-purple-50 p-6 rounded-2xl mb-8">
                  <CheckCircle2 className="w-5 h-5 text-[#8E447E] shrink-0" />
                  <p className="text-xs font-body text-[#8E447E] leading-relaxed">
                    Once submitted, our team will review your requirements and contact you via WhatsApp with a custom quote and availability.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-[#8E447E] text-white rounded-2xl font-body font-bold text-sm uppercase tracking-widest hover:bg-[#7A3B6D] transition-all shadow-xl active:scale-95"
                >
                  Send Booking Request
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;

