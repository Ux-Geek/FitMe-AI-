import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Upload, Sparkles, Check, Share2, ShoppingBag, ArrowLeftRight } from 'lucide-react';
import { Product } from '../types';
import { generateTryOn } from '../services/TryOnService';

interface TryOnModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function TryOnModal({ product, onClose }: TryOnModalProps) {
  const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [showBefore, setShowBefore] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!product) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
        startProcessing(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startProcessing = async (image: string) => {
    setStep('processing');
    const result = await generateTryOn(image, product.image, product.name);
    if (result) {
      setResultImage(result);
      setStep('result');
    } else {
      // Fallback or error handling
      setStep('upload');
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10"
      >
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-5xl h-full max-h-[90vh] bg-white rounded-2xl overflow-hidden flex flex-col lg:flex-row"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 glass rounded-full hover:bg-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Left Side: Preview/Result */}
          <div className="flex-1 bg-secondary relative overflow-hidden flex items-center justify-center">
            {step === 'upload' && (
              <div className="flex flex-col items-center gap-6 p-10 text-center">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Camera size={32} className="text-accent/30" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-serif italic">Upload your photo</h2>
                  <p className="text-sm text-accent/50 max-w-xs">For best results, use a clear, full-body photo with a simple background.</p>
                </div>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-accent text-white py-4 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <Upload size={16} />
                    Choose from Gallery
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                  />
                  <button className="w-full glass py-4 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                    <Camera size={16} />
                    Take a Photo
                  </button>
                </div>
              </div>
            )}

            {step === 'processing' && (
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-48 h-64 bg-white/50 rounded-lg overflow-hidden">
                  {userImage && <img src={userImage} className="w-full h-full object-cover opacity-50 grayscale" />}
                  <motion.div 
                    animate={{ y: [0, 256, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 w-full h-1 bg-highlight shadow-[0_0_15px_rgba(37,99,235,0.8)]"
                  />
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-highlight">
                    <Sparkles size={20} className="animate-pulse" />
                    <span className="font-bold uppercase tracking-widest text-xs">AI Fitting Engine</span>
                  </div>
                  <p className="text-sm font-serif italic">Tailoring the {product.name} to your body...</p>
                </div>
              </div>
            )}

            {step === 'result' && resultImage && (
              <div className="relative w-full h-full">
                <img 
                  src={showBefore ? userImage! : resultImage} 
                  className="w-full h-full object-cover transition-opacity duration-500"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full flex items-center gap-4">
                  <button 
                    onMouseDown={() => setShowBefore(true)}
                    onMouseUp={() => setShowBefore(false)}
                    onTouchStart={() => setShowBefore(true)}
                    onTouchEnd={() => setShowBefore(false)}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                  >
                    <ArrowLeftRight size={14} />
                    Hold to Compare
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Product Info / Actions */}
          <div className="w-full lg:w-[380px] p-8 flex flex-col gap-8 bg-white border-l border-secondary">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-highlight">
                <Check size={14} />
                Virtual Try-On Active
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-accent/50 font-semibold">{product.brand}</span>
                <h3 className="text-2xl font-serif italic leading-tight">{product.name}</h3>
                <p className="text-xl font-medium mt-2">${product.price}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest">Select Size</span>
                <div className="flex gap-2">
                  {product.sizes.map(size => (
                    <button key={size} className="w-10 h-10 rounded-full border border-secondary flex items-center justify-center text-xs font-medium hover:border-accent transition-colors">
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest">Select Color</span>
                <div className="flex gap-3">
                  {product.colors.map(color => (
                    <button key={color} className="w-6 h-6 rounded-full border border-secondary p-0.5">
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: color }} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-3">
              <button className="w-full bg-accent text-white py-4 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <ShoppingBag size={16} />
                Add to Bag
              </button>
              <div className="flex gap-3">
                <button className="flex-1 glass py-4 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                  Save Look
                </button>
                <button className="p-4 glass rounded-full flex items-center justify-center">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
