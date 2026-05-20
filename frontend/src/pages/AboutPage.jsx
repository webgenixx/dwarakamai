import { ArrowRight, Camera, Scissors, BookOpen, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-gray-50 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1920&h=1080&fit=crop" 
            className="w-full h-full object-cover object-[center_20%] opacity-80" 
            alt="Studio Background" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent" />
        </div>
        
        <div className="container-custom relative h-full flex flex-col justify-center">
          <span className="bg-[#FCE4EC] text-[#9D4E8D] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-6 inline-block w-fit">
            Our Legacy
          </span>
          <h1 className="text-7xl md:text-8xl font-display font-bold text-gray-900 mb-8 leading-[1.1]">
            The Story<br />
            Behind Your<br />
            <span className="italic font-serif font-medium text-[var(--color-primary)]">Smiles</span>
          </h1>
          <p className="text-gray-600 font-body text-xl leading-relaxed max-w-xl mb-12">
            At Dwarakamai digital photo studio, we don't just capture moments; we curate memories that breathe life into your personal history through the lens of craftsmanship.
          </p>
          <div className="flex gap-4">
            <Link to="/contact" className="btn-primary px-10 py-4">Book a Shoot</Link>
            <button className="text-sm font-body font-bold text-gray-900 flex items-center gap-2 px-8 hover:gap-4 transition-all group">
              <span>Our Process</span>
              <ArrowRight className="w-4 h-4 text-[var(--color-primary)]" />
            </button>
          </div>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="py-4">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="relative flex-[0.4] max-w-md lg:mx-0 mx-auto">
              <div className="relative rounded-[30px] overflow-hidden aspect-[4/5] shadow-2xl">
                <img 
                  src="logo.png" 
                  className="w-full h-full object-cover" 
                  alt="Artisan at work" 
                />
              </div>
              {/* Floating Quote */}
              <div className="absolute -bottom-10 -right-10 bg-white p-10 rounded-2xl shadow-2xl max-w-xs border border-purple-50">
                <h4 className="text-3xl font-display font-bold text-[#9D4E8D] mb-2 italic">"Art is feeling."</h4>
                <p className="text-[10px] text-gray-400 font-body font-bold tracking-widest uppercase">— Dwarakamai Studio</p>
              </div>
            </div>

            <div className="flex-1 space-y-10">
              <div>
                <h2 className="text-5xl font-display font-bold text-gray-900 mb-8 leading-tight">
                  Elevating Every<br />Detail with<br />
                  <span className="italic font-serif font-medium text-[var(--color-primary)]">Sentiment</span>
                </h2>
                <p className="text-gray-500 font-body text-lg leading-relaxed mb-8">
                  Founded on the belief that every person has a masterpiece hidden in their everyday life, Dwarakamai digital photo studio emerged as a sanctuary for visual storytelling. We reject the clinical approach of mass-market studios.
                </p>
                <p className="text-gray-500 font-body text-lg leading-relaxed mb-8">
                  Our philosophy is rooted in **The Sentimental Curator**—an approach where we act as both artist and archivist. We blend modern high-end editorial techniques with the timeless warmth of personal connection.
                </p>
                <p className="text-gray-500 font-body text-lg leading-relaxed">
                  Whether it's the subtle glimmer in an eye during a portrait or the tactile texture of a custom-designed album, we ensure that the craftsmanship behind the lens matches the emotional depth of the subject.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offerings Section */}
      <div className="py-4 bg-gray-50/50">
        <div className="container-custom">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-display font-bold text-gray-900 mb-6">Studio Offerings</h2>
            <p className="text-gray-400 font-body text-lg">Crafted experiences for your most precious milestones.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Offering 1 */}
            <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-purple-100/20 group hover:-translate-y-2 transition-all duration-500 border border-transparent hover:border-purple-100">
              <div className="w-20 h-20 bg-gray-900 rounded-[30px] flex items-center justify-center mb-10 group-hover:bg-[#8E447E] transition-colors overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=200&h=200&fit=crop" className="w-full h-full object-cover opacity-50 absolute" />
                <Camera className="w-8 h-8 text-white relative z-10" />
              </div>
              <span className="text-[10px] font-body font-bold text-[#8E447E] uppercase tracking-widest mb-4 block">Capture</span>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-6">Professional Photoshoots</h3>
              <p className="text-gray-400 font-body text-sm leading-relaxed mb-10">
                From intimate family portraits to editorial fashion sessions, we provide a comfortable, high-end environment designed to let your personality shine.
              </p>
              <Link to="/contact" className="inline-flex items-center gap-2 text-[10px] font-body font-bold text-gray-900 uppercase tracking-widest hover:gap-4 transition-all">
                <span>Learn More</span>
                <ArrowRight className="w-3 h-3 text-[var(--color-primary)]" />
              </Link>
            </div>

            {/* Offering 2 */}
            <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-purple-100/20 group hover:-translate-y-2 transition-all duration-500 border border-transparent hover:border-purple-100">
              <div className="w-20 h-20 bg-gray-900 rounded-[30px] flex items-center justify-center mb-10 group-hover:bg-[#8E447E] transition-colors overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1493121590231-20e4fbc07b27?w=200&h=200&fit=crop" className="w-full h-full object-cover opacity-50 absolute" />
                <Scissors className="w-8 h-8 text-white relative z-10" />
              </div>
              <span className="text-[10px] font-body font-bold text-[#8E447E] uppercase tracking-widest mb-4 block">Perfect</span>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-6">Expert Photo Editing</h3>
              <p className="text-gray-400 font-body text-sm leading-relaxed mb-10">
                Our post-production suite focuses on natural enhancement. We meticulously refine colors and textures to create a signature timeless look.
              </p>
              <Link to="/contact" className="inline-flex items-center gap-2 text-[10px] font-body font-bold text-gray-900 uppercase tracking-widest hover:gap-4 transition-all">
                <span>Learn More</span>
                <ArrowRight className="w-3 h-3 text-[var(--color-primary)]" />
              </Link>
            </div>

            {/* Offering 3 */}
            <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-purple-100/20 group hover:-translate-y-2 transition-all duration-500 border border-transparent hover:border-purple-100">
              <div className="w-20 h-20 bg-gray-900 rounded-[30px] flex items-center justify-center mb-10 group-hover:bg-[#8E447E] transition-colors overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop" className="w-full h-full object-cover opacity-50 absolute" />
                <BookOpen className="w-8 h-8 text-white relative z-10" />
              </div>
              <span className="text-[10px] font-body font-bold text-[#8E447E] uppercase tracking-widest mb-4 block">Cherish</span>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-6">Premium Album Design</h3>
              <p className="text-gray-400 font-body text-sm leading-relaxed mb-10">
                Heirloom-quality albums crafted with fine linens and Italian papers. Every layout is uniquely designed to tell your specific story.
              </p>
              <Link to="/contact" className="inline-flex items-center gap-2 text-[10px] font-body font-bold text-gray-900 uppercase tracking-widest hover:gap-4 transition-all">
                <span>Learn More</span>
                <ArrowRight className="w-3 h-3 text-[var(--color-primary)]" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-4">
        <div className="container-custom">
          <div className="bg-[#A15891] rounded-[50px] p-16 md:p-24 flex flex-col md:flex-row items-center gap-20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-white rotate-12 translate-x-20" />
            <div className="relative z-10 flex-1">
              <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-8 leading-tight">
                Ready to<br />Capture Your<br />Next Chapter?
              </h2>
              <p className="text-white/80 font-body text-lg mb-12 max-w-md">
                Let's create something extraordinary together. Our booking sessions fill up fast—reserve your date with us today.
              </p>
              <Link to="/contact" className="bg-[#F7D060] text-gray-900 px-12 py-5 rounded-2xl font-body font-bold text-sm uppercase tracking-widest hover:bg-[#EAB308] transition-all shadow-2xl active:scale-95 inline-block">
                Book a Shoot
              </Link>
            </div>
            <div className="relative flex-1 w-full max-w-md aspect-square rounded-[40px] overflow-hidden shadow-2xl rotate-3 group">
              <img 
                src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=800&fit=crop" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                alt="Camera gear" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

