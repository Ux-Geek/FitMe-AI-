import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import Header from './components/Header';
import { ProductCard } from './components/ProductCard';
import TryOnModal from './components/TryOnModal';
import { PRODUCTS } from './constants';
import { Product } from './types';

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background selection:bg-highlight selection:text-white">
      <Header />

      <main className="pb-20">
        {/* Hero Section */}
        <section className="relative h-[80vh] w-full overflow-hidden bg-secondary">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-highlight">
                <Sparkles size={14} />
                AI-Powered Virtual Try-On
              </div>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif italic text-white leading-[0.9] tracking-tighter">
                See yourself in <br /> something new today.
              </h2>
              <p className="text-white/80 text-sm md:text-base max-w-md mx-auto font-medium tracking-wide">
                Identity simulation + confidence decision-making. <br className="hidden md:block" />
                Try on the latest collections instantly from home.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button className="bg-white text-accent px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-highlight hover:text-white transition-all duration-300">
                  Shop New Arrivals
                </button>
                <button className="glass text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-accent transition-all duration-300">
                  Explore Collections
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search Bar (Mobile First) */}
        <div className="px-6 -mt-8 relative z-10">
          <div className="max-w-xl mx-auto glass rounded-full flex items-center px-6 py-4 shadow-xl">
            <Search size={20} className="text-accent/30" />
            <input 
              type="text" 
              placeholder="Search for styles, brands, or outfits..." 
              className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-sm font-medium placeholder:text-accent/30"
            />
            <button className="bg-accent text-white p-2 rounded-full">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Trending Categories */}
        <section className="mt-20 px-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-serif italic">Trending Looks</h3>
            <button className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:opacity-50 transition-opacity">
              View All <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
            {PRODUCTS.map((product) => (
              <div key={product.id} className="min-w-[280px] lg:min-w-[320px]">
                <ProductCard 
                  product={product} 
                  onTryOn={(p) => setSelectedProduct(p)} 
                />
              </div>
            ))}
          </div>
        </section>

        {/* Featured Collection */}
        <section className="mt-24 bg-secondary py-24 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-highlight">Seasonal Drop</span>
              <h2 className="text-5xl md:text-6xl font-serif italic leading-[0.9]">The Modern <br /> Minimalist</h2>
              <p className="text-accent/60 text-sm md:text-base max-w-md leading-relaxed">
                A curated selection of essential pieces designed for the modern wardrobe. 
                Clean lines, premium fabrics, and a timeless aesthetic.
              </p>
              <button className="bg-accent text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity">
                Shop Collection
              </button>
            </div>
            <div className="relative grid grid-cols-2 gap-4">
              <motion.div 
                whileHover={{ y: -10 }}
                className="aspect-[3/4] rounded-sm overflow-hidden shadow-2xl"
              >
                <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </motion.div>
              <motion.div 
                whileHover={{ y: -10 }}
                className="aspect-[3/4] rounded-sm overflow-hidden shadow-2xl mt-12"
              >
                <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* All Products Grid */}
        <section className="mt-24 px-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-serif italic">New Arrivals</h3>
            <div className="flex gap-4">
              <button className="text-xs font-bold uppercase tracking-widest border-b-2 border-accent pb-1">All</button>
              <button className="text-xs font-bold uppercase tracking-widest text-accent/30 pb-1">Outerwear</button>
              <button className="text-xs font-bold uppercase tracking-widest text-accent/30 pb-1">Dresses</button>
              <button className="text-xs font-bold uppercase tracking-widest text-accent/30 pb-1">Bottoms</button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {PRODUCTS.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onTryOn={(p) => setSelectedProduct(p)} 
              />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-accent text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <h1 className="text-3xl font-serif italic">FitMe</h1>
            <p className="text-white/50 text-sm leading-relaxed">
              Redefining the digital shopping experience through AI-powered virtual try-on technology.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest">Shop</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><a href="#" className="hover:text-white transition-colors">New Arrivals</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Best Sellers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Collections</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sale</a></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest">Support</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest">Newsletter</h4>
            <div className="flex border-b border-white/20 pb-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-transparent border-none focus:ring-0 flex-1 text-sm"
              />
              <button className="text-xs font-bold uppercase tracking-widest">Join</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
          <span>© 2026 FitMe AI. All rights reserved.</span>
          <div className="flex gap-8">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>

      <TryOnModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </div>
  );
}
