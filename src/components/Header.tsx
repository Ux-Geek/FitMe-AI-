import { Search, User, ShoppingBag, Menu } from 'lucide-react';
import { motion } from 'motion/react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glass px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button className="p-1 lg:hidden">
          <Menu size={24} />
        </button>
        <h1 className="text-2xl font-serif tracking-tight italic">FitMe</h1>
      </div>

      <div className="hidden lg:flex items-center gap-8 text-sm font-medium uppercase tracking-widest">
        <a href="#" className="hover:opacity-50 transition-opacity">New Arrivals</a>
        <a href="#" className="hover:opacity-50 transition-opacity">Collections</a>
        <a href="#" className="hover:opacity-50 transition-opacity">About</a>
      </div>

      <div className="flex items-center gap-5">
        <button className="p-1 hover:opacity-50 transition-opacity">
          <Search size={20} />
        </button>
        <button className="p-1 hover:opacity-50 transition-opacity">
          <User size={20} />
        </button>
        <button className="p-1 hover:opacity-50 transition-opacity relative">
          <ShoppingBag size={20} />
          <span className="absolute -top-1 -right-1 bg-highlight text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
        </button>
      </div>
    </header>
  );
}
