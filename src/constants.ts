import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Oversized Cashmere Blend Coat',
    brand: "L'Estrange",
    price: 450,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop',
    category: 'Outerwear',
    colors: ['#111111', '#5A5A40', '#E6E6E6'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'A luxurious oversized coat crafted from a premium cashmere blend. Designed for a relaxed yet sophisticated silhouette.'
  },
  {
    id: '2',
    name: 'Silk Satin Slip Dress',
    brand: 'AESTHETE',
    price: 220,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop',
    category: 'Dresses',
    colors: ['#000000', '#F5F5F0', '#2563EB'],
    sizes: ['XS', 'S', 'M', 'L'],
    description: 'Elegant silk satin slip dress with a delicate drape and adjustable straps. Perfect for evening occasions.'
  },
  {
    id: '3',
    name: 'Tailored Wool Trousers',
    brand: 'MODERNIST',
    price: 180,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000&auto=format&fit=crop',
    category: 'Bottoms',
    colors: ['#111111', '#8E9299'],
    sizes: ['28', '30', '32', '34'],
    description: 'Expertly tailored wool trousers with a sharp crease and a slightly tapered leg.'
  },
  {
    id: '4',
    name: 'Structured Linen Blazer',
    brand: "L'Estrange",
    price: 320,
    image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?q=80&w=1000&auto=format&fit=crop',
    category: 'Outerwear',
    colors: ['#F5F5F0', '#111111'],
    sizes: ['S', 'M', 'L'],
    description: 'A breathable linen blazer with a structured shoulder and a modern, clean-lined fit.'
  },
  {
    id: '5',
    name: 'Minimalist Leather Sneakers',
    brand: 'STEP',
    price: 150,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop',
    category: 'Footwear',
    colors: ['#FFFFFF', '#111111'],
    sizes: ['7', '8', '9', '10', '11'],
    description: 'Premium leather sneakers with a clean, minimalist aesthetic and superior comfort.'
  }
];
