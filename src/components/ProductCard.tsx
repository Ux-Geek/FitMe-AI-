import React from 'react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onTryOn: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onTryOn }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col gap-3"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary rounded-sm">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <button 
          onClick={() => onTryOn(product)}
          className="absolute bottom-4 left-4 right-4 glass py-3 rounded-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 active:scale-95"
        >
          <Sparkles size={14} className="text-highlight" />
          Virtual Try-On
        </button>
      </div>

      <div className="flex flex-col gap-1 px-1">
        <span className="text-[10px] uppercase tracking-[0.2em] text-accent/50 font-semibold">{product.brand}</span>
        <h3 className="text-sm font-medium leading-tight">{product.name}</h3>
        <span className="text-sm font-serif italic mt-1">${product.price}</span>
      </div>
    </motion.div>
  );
}
