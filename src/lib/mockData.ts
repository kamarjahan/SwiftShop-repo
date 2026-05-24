export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  isFeatured?: boolean;
  isTrending?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
}

export const mockCategories: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics', imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80' },
  { id: '2', name: 'Fashion', slug: 'fashion', imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80' },
  { id: '3', name: 'Home & Living', slug: 'home', imageUrl: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80' },
  { id: '4', name: 'Minimalist', slug: 'minimalist', imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80' },
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    price: 348.00,
    originalPrice: 399.00,
    description: 'Industry leading noise canceling with two processors and eight microphones for unprecedented noise cancellation.',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80'],
    rating: 4.8,
    reviewsCount: 1245,
    isFeatured: true,
  },
  {
    id: 'p2',
    name: 'Minimalist Titanium Watch',
    price: 199.99,
    description: 'Sleek, lightweight titanium body with sapphire crystal face and precision automatic movement.',
    category: 'Fashion',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
    rating: 4.6,
    reviewsCount: 89,
    isTrending: true,
  },
  {
    id: 'p3',
    name: 'Ergonomic Desk Chair',
    price: 450.00,
    description: 'Advanced ergonomic design providing optimal lumbar support for long working hours.',
    category: 'Home & Living',
    images: ['https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80'],
    rating: 4.9,
    reviewsCount: 312,
  },
  {
    id: 'p4',
    name: 'Matte Black Mechanical Keyboard',
    price: 129.99,
    originalPrice: 149.99,
    description: 'Tactile switches with a stealthy matte black finish and customizable RGB backlighting.',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80'],
    rating: 4.7,
    reviewsCount: 450,
    isTrending: true,
  }
];
