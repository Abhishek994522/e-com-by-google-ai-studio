
import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Luminary Aura X-1',
    description: 'A revolutionary smart watch with neural interface and 7-day battery life.',
    price: 599.99,
    category: 'Electronics',
    image: 'https://picsum.photos/seed/watch/600/600',
    rating: 4.8,
    tags: ['Smartwatch', 'Premium', 'Aura']
  },
  {
    id: '2',
    name: 'Void-Canvas Backpack',
    description: 'Sustainably crafted urban backpack with modular attachments and weatherproofing.',
    price: 189.00,
    category: 'Accessories',
    image: 'https://picsum.photos/seed/bag/600/600',
    rating: 4.5,
    tags: ['Travel', 'Sustainable', 'Tech']
  },
  {
    id: '3',
    name: 'Echo-Flow Headphones',
    description: 'Active noise cancellation with biological sound profiles tailored to your hearing.',
    price: 349.99,
    category: 'Audio',
    image: 'https://picsum.photos/seed/audio/600/600',
    rating: 4.9,
    tags: ['Audio', 'Hi-Fi', 'Wireless']
  },
  {
    id: '4',
    name: 'Prism-Core Sunglasses',
    description: 'Augmented reality lenses that adapt to sunlight and display notifications.',
    price: 299.00,
    category: 'Wearables',
    image: 'https://picsum.photos/seed/glass/600/600',
    rating: 4.2,
    tags: ['AR', 'Lifestyle', 'Visual']
  }
];
