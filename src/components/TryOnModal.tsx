import React, { useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Camera, Upload, Sparkles, Check, Share2, ShoppingBag, 
  ArrowLeftRight, ImagePlus, ChevronRight, RotateCcw, 
  Download, Heart, AlertCircle, User
} from 'lucide-react';
import { Product, UploadedImage, FlowState } from '../types';
import { generateTryOn, saveLook, fileToBase64 } from '../services/TryOnService';

interface TryOnModalProps {
  product: Product | null;
  onClose: () => void;
}

const STEP_LABELS: Record<string, string> = {
  upload: 'Upload Photos',
  outfit: 'Select Options',
  review: 'Review',
  processing: 'Generating',
  result: 'Your Look',
};

export default function TryOnModal({ product, onClose }: TryOnModalProps) {
  const [step, setStep] = useState<'upload' | 'outfit' | 'review' | 'processing' | 'result'>('upload');
  const [frontImage, setFrontImage] = useState<UploadedImage | null>(null);
  const [sideImage, setSideImage] = useState<UploadedImage | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [sidePreview, setSidePreview] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [showBefore, setShowBefore] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [progressMsg, setProgressMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);

  const canGenerate = useMemo(() => {
    return !!frontImage && step !== 'processing';
  }, [frontImage, step]);

  if (!product) return null;

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'front' | 'side'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const uploaded: UploadedImage = {
        uri: preview,
        file,
        width: img.naturalWidth,
        height: img.naturalHeight,
        type: file.type,
      };
      if (type === 'front') {
        setFrontImage(uploaded);
        setFrontPreview(preview);
      } else {
        setSideImage(uploaded);
        setSidePreview(preview);
      }
    };
    img.src = preview;
    
    // Reset input value so same file can be re-selected
    e.target.value = '';
  };

  const handleGenerate = async () => {
    if (!frontImage || !product) return;

    setStep('processing');
    setError(null);
    setProgress(0);
    setProgressMsg('Starting...');

    const result = await generateTryOn(
      frontImage,
      product.image,
      product.name,
      sideImage,
      (status, prog) => {
        setProgressMsg(status);
        setProgress(prog);
      }
    );

    if (result.status === 'completed' && result.outputUrl) {
      setResultImage(result.outputUrl);
      setStep('result');
    } else {
      setError(result.error || 'Failed to generate preview. Please try again.');
      setStep('upload');
    }
  };

  const handleSaveLook = () => {
    if (!resultImage || !frontPreview || !product) return;
    saveLook(product.id, frontPreview, resultImage);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = `fitme-tryon-${product.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
  };

  const handleReset = () => {
    setStep('upload');
    setFrontImage(null);
    setSideImage(null);
    setFrontPreview(null);
    setSidePreview(null);
    setResultImage(null);
    setShowBefore(false);
    setSelectedSize(null);
    setSelectedColor(null);
    setProgressMsg('');
    setProgress(0);
    setError(null);
    setSaved(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Step progress indicator
  const steps = ['upload', 'outfit', 'review', 'processing', 'result'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center"
      >
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={handleClose} />
        
        <motion.div 
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full lg:max-w-5xl h-[95vh] lg:h-auto lg:max-h-[90vh] bg-white rounded-t-3xl lg:rounded-2xl overflow-hidden flex flex-col lg:flex-row"
        >
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 glass rounded-full hover:bg-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Mobile Step Indicator */}
          <div className="lg:hidden px-6 pt-5 pb-3">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="flex items-center gap-2 mb-2">
              {steps.filter(s => s !== 'processing').map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`h-1 rounded-full flex-1 transition-colors duration-300 ${
                    currentStepIndex >= steps.indexOf(s) ? 'bg-accent' : 'bg-gray-100'
                  }`} />
                </div>
              ))}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent/50">
              {STEP_LABELS[step] || step}
            </p>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* LEFT SIDE: Preview / Upload / Result Area   */}
          {/* ═══════════════════════════════════════════ */}
          <div className="flex-1 bg-secondary relative overflow-hidden flex items-center justify-center min-h-[300px] lg:min-h-[600px]">
            
            <AnimatePresence mode="wait">
              {/* ── STEP: Upload ── */}
              {step === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center gap-6 p-8 text-center w-full max-w-md"
                >
                  {!frontPreview ? (
                    <>
                      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <User size={36} className="text-accent/20" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-2xl font-serif italic">Upload your photo</h2>
                        <p className="text-sm text-accent/50 max-w-xs">
                          Use a clear, full-body photo. Stand straight with arms relaxed for best results.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="w-full grid grid-cols-2 gap-3">
                      {/* Front Image */}
                      <div className="relative group">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm">
                          <img src={frontPreview} className="w-full h-full object-cover" />
                        </div>
                        <button 
                          onClick={() => frontInputRef.current?.click()}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center"
                        >
                          <RotateCcw size={20} className="text-white" />
                        </button>
                        <span className="absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-widest bg-white/90 text-accent px-2 py-1 rounded-full">
                          Front
                        </span>
                      </div>

                      {/* Side Image */}
                      <div className="relative group">
                        {sidePreview ? (
                          <>
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm">
                              <img src={sidePreview} className="w-full h-full object-cover" />
                            </div>
                            <button 
                              onClick={() => sideInputRef.current?.click()}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center"
                            >
                              <RotateCcw size={20} className="text-white" />
                            </button>
                            <span className="absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-widest bg-white/90 text-accent px-2 py-1 rounded-full">
                              Side
                            </span>
                          </>
                        ) : (
                          <button
                            onClick={() => sideInputRef.current?.click()}
                            className="aspect-[3/4] rounded-2xl border-2 border-dashed border-accent/10 flex flex-col items-center justify-center gap-2 hover:border-accent/30 transition-colors"
                          >
                            <ImagePlus size={24} className="text-accent/20" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-accent/30">
                              Side photo
                            </span>
                            <span className="text-[9px] text-accent/20">Optional</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Upload Buttons */}
                  <div className="flex flex-col gap-3 w-full">
                    <button 
                      onClick={() => frontInputRef.current?.click()}
                      className="w-full bg-accent text-white py-4 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
                    >
                      <Upload size={16} />
                      {frontImage ? 'Change Front Photo' : 'Upload Front Photo'}
                    </button>
                    <input 
                      type="file" 
                      ref={frontInputRef} 
                      className="hidden" 
                      accept="image/jpeg,image/png,image/webp" 
                      onChange={(e) => handleFileUpload(e, 'front')}
                    />
                    <input 
                      type="file" 
                      ref={sideInputRef} 
                      className="hidden" 
                      accept="image/jpeg,image/png,image/webp" 
                      onChange={(e) => handleFileUpload(e, 'side')}
                    />
                  </div>

                  {/* Error Display */}
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl w-full"
                    >
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {/* Next Button */}
                  {frontImage && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setStep('outfit')}
                      className="w-full glass py-4 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-accent hover:text-white transition-all active:scale-[0.98]"
                    >
                      Continue
                      <ChevronRight size={14} />
                    </motion.button>
                  )}
                </motion.div>
              )}

              {/* ── STEP: Outfit Selection / Customization ── */}
              {step === 'outfit' && (
                <motion.div
                  key="outfit"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center gap-6 p-8 w-full max-w-md overflow-y-auto max-h-full"
                >
                  {/* Preview outfit */}
                  <div className="w-full aspect-[3/4] max-h-[240px] rounded-2xl overflow-hidden bg-white shadow-sm">
                    <img 
                      src={product.image} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="w-full space-y-1">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-accent/50 font-semibold">{product.brand}</span>
                    <h3 className="text-lg font-serif italic leading-tight">{product.name}</h3>
                    <p className="text-base font-medium">${product.price}</p>
                  </div>

                  {/* Size Selection */}
                  <div className="w-full space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Select Size</span>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map(size => (
                        <button 
                          key={size}
                          onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                          className={`min-w-[44px] h-11 px-3 rounded-full flex items-center justify-center text-xs font-semibold transition-all active:scale-95 ${
                            selectedSize === size
                              ? 'bg-accent text-white'
                              : 'bg-white border border-gray-200 hover:border-accent'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div className="w-full space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Select Color</span>
                    <div className="flex gap-3">
                      {product.colors.map(color => (
                        <button 
                          key={color}
                          onClick={() => setSelectedColor(color === selectedColor ? null : color)}
                          className={`w-9 h-9 rounded-full p-1 transition-all ${
                            selectedColor === color 
                              ? 'ring-2 ring-accent ring-offset-2'
                              : 'border border-gray-200 hover:scale-110'
                          }`}
                        >
                          <div className="w-full h-full rounded-full" style={{ backgroundColor: color }} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-3 w-full pt-2">
                    <button
                      onClick={() => setStep('upload')}
                      className="flex-1 glass py-4 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep('review')}
                      className="flex-1 bg-accent text-white py-4 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
                    >
                      Review
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP: Review ── */}
              {step === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center gap-6 p-8 w-full max-w-md"
                >
                  <h2 className="text-xl font-serif italic">Review your inputs</h2>
                  
                  <div className="w-full grid grid-cols-2 gap-4">
                    {/* User photo */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-accent/40">Your Photo</span>
                      <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm">
                        {frontPreview && <img src={frontPreview} className="w-full h-full object-cover" />}
                      </div>
                    </div>
                    {/* Outfit */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-accent/40">Outfit</span>
                      <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm">
                        <img src={product.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-blue-50 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-highlight" />
                      <span className="text-xs font-bold text-highlight">AI Virtual Try-On</span>
                    </div>
                    <p className="text-xs text-accent/60 leading-relaxed">
                      Our AI will render you wearing the {product.name} while preserving your identity, pose, and body proportions.
                    </p>
                  </div>

                  {(selectedSize || selectedColor) && (
                    <div className="w-full flex gap-4 text-xs">
                      {selectedSize && (
                        <span className="bg-gray-100 px-3 py-2 rounded-full font-semibold">Size: {selectedSize}</span>
                      )}
                      {selectedColor && (
                        <span className="bg-gray-100 px-3 py-2 rounded-full font-semibold flex items-center gap-2">
                          Color: <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: selectedColor }} />
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 w-full pt-2">
                    <button
                      onClick={() => setStep('outfit')}
                      className="flex-1 glass py-4 rounded-full font-bold uppercase tracking-widest text-xs active:scale-[0.98]"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={!canGenerate}
                      className={`flex-1 py-4 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                        canGenerate 
                          ? 'bg-accent text-white hover:opacity-90' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles size={14} />
                      Generate
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP: Processing ── */}
              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-8 p-10"
                >
                  {/* Scanning animation */}
                  <div className="relative w-48 h-64 bg-white/50 rounded-2xl overflow-hidden shadow-sm">
                    {frontPreview && (
                      <img src={frontPreview} className="w-full h-full object-cover opacity-40 grayscale" />
                    )}
                    {/* Scanning beam */}
                    <motion.div 
                      animate={{ y: [0, 256, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                      className="absolute top-0 left-0 w-full h-1 bg-highlight shadow-[0_0_20px_rgba(37,99,235,0.8),0_0_40px_rgba(37,99,235,0.4)]"
                    />
                    {/* Overlay grid */}
                    <div className="absolute inset-0 tryon-grid opacity-10" />
                  </div>

                  {/* Progress Info */}
                  <div className="text-center space-y-4 w-full max-w-xs">
                    <div className="flex items-center justify-center gap-2 text-highlight">
                      <Sparkles size={18} className="animate-pulse" />
                      <span className="font-bold uppercase tracking-widest text-xs">AI Fitting Engine</span>
                    </div>
                    <p className="text-sm font-serif italic text-accent/70">{progressMsg}</p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        className="h-full bg-highlight rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-[10px] text-accent/30 uppercase tracking-widest">
                      {progress}% complete
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── STEP: Result ── */}
              {step === 'result' && resultImage && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full h-full"
                >
                  <img 
                    src={showBefore ? frontPreview! : resultImage} 
                    className="w-full h-full object-cover transition-opacity duration-500"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Before/After badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${
                      showBefore ? 'bg-white/90 text-accent' : 'bg-highlight text-white'
                    }`}>
                      {showBefore ? 'Before' : 'After'}
                    </span>
                  </div>

                  {/* Compare control */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                    <button 
                      onMouseDown={() => setShowBefore(true)}
                      onMouseUp={() => setShowBefore(false)}
                      onMouseLeave={() => setShowBefore(false)}
                      onTouchStart={() => setShowBefore(true)}
                      onTouchEnd={() => setShowBefore(false)}
                      className="glass px-6 py-3 rounded-full flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors active:scale-95 select-none"
                    >
                      <ArrowLeftRight size={14} />
                      Hold to Compare
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* RIGHT SIDE: Product Info / Actions          */}
          {/* ═══════════════════════════════════════════ */}
          <div className="w-full lg:w-[380px] p-6 lg:p-8 flex flex-col gap-6 bg-white border-t lg:border-t-0 lg:border-l border-gray-100 overflow-y-auto">
            {/* Desktop Step Indicator */}
            <div className="hidden lg:flex items-center gap-1 mb-2">
              {steps.filter(s => s !== 'processing').map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentStepIndex >= steps.indexOf(s) ? 'bg-accent scale-100' : 'bg-gray-200'
                  }`} />
                  {i < 3 && <div className={`flex-1 h-px transition-colors duration-300 ${
                    currentStepIndex > steps.indexOf(s) ? 'bg-accent' : 'bg-gray-200'
                  }`} />}
                </React.Fragment>
              ))}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-highlight">
                <Sparkles size={14} />
                Virtual Try-On
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-accent/50 font-semibold">{product.brand}</span>
                <h3 className="text-2xl font-serif italic leading-tight">{product.name}</h3>
                <p className="text-xl font-medium mt-2">${product.price}</p>
              </div>
              <p className="text-xs text-accent/40 leading-relaxed">{product.description}</p>
            </div>

            {/* Quick Info */}
            {step === 'upload' && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent/50">How it works</h4>
                {[
                  { num: '1', text: 'Upload a clear, full-body front photo' },
                  { num: '2', text: 'Optionally add a side photo for better fit' },
                  { num: '3', text: 'Choose your size and color preference' },
                  { num: '4', text: 'AI renders you wearing the outfit' },
                ].map(item => (
                  <div key={item.num} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {item.num}
                    </span>
                    <span className="text-xs text-accent/60">{item.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Result Actions */}
            {step === 'result' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-auto space-y-3"
              >
                <button className="w-full bg-accent text-white py-4 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]">
                  <ShoppingBag size={16} />
                  Add to Bag — ${product.price}
                </button>
                <div className="flex gap-3">
                  <button 
                    onClick={handleSaveLook}
                    className={`flex-1 py-4 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                      saved 
                        ? 'bg-green-50 text-green-600' 
                        : 'glass hover:bg-gray-100'
                    }`}
                  >
                    {saved ? <Check size={16} /> : <Heart size={16} />}
                    {saved ? 'Saved!' : 'Save Look'}
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="p-4 glass rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors active:scale-[0.98]"
                  >
                    <Download size={16} />
                  </button>
                  <button className="p-4 glass rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors active:scale-[0.98]">
                    <Share2 size={16} />
                  </button>
                </div>
                <button
                  onClick={handleReset}
                  className="w-full text-center text-xs text-accent/40 font-bold uppercase tracking-widest py-3 hover:text-accent transition-colors"
                >
                  <span className="flex items-center justify-center gap-2">
                    <RotateCcw size={12} />
                    Try Another Look
                  </span>
                </button>
              </motion.div>
            )}

            {/* Processing State Actions */}
            {step === 'processing' && (
              <div className="mt-auto text-center">
                <p className="text-[10px] text-accent/30 uppercase tracking-widest">
                  This usually takes 5–15 seconds
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
