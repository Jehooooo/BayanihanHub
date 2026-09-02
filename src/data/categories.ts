// ============================================================
// Bayanihan Hub — Item Categories
// ============================================================

import type { Category } from '../types';

export const categories: Category[] = [
  {
    id: 'clothing',
    name: 'Clothing',
    icon: 'Shirt',
    description: 'Clothes, shoes, and accessories',
    itemCount: 0,
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: 'Smartphone',
    description: 'Gadgets, appliances, and tech items',
    itemCount: 0,
  },
  {
    id: 'books',
    name: 'Books',
    icon: 'BookOpen',
    description: 'Textbooks, novels, and educational materials',
    itemCount: 0,
  },
  {
    id: 'furniture',
    name: 'Furniture',
    icon: 'Sofa',
    description: 'Tables, chairs, shelves, and home decor',
    itemCount: 0,
  },
  {
    id: 'school-supplies',
    name: 'School Supplies',
    icon: 'GraduationCap',
    description: 'Bags, notebooks, and school essentials',
    itemCount: 0,
  },
  {
    id: 'food',
    name: 'Food',
    icon: 'UtensilsCrossed',
    description: 'Rice, canned goods, and groceries',
    itemCount: 0,
  },
  {
    id: 'toys',
    name: 'Toys & Games',
    icon: 'Gamepad2',
    description: 'Children\'s toys, board games, and puzzles',
    itemCount: 0,
  },
  {
    id: 'appliances',
    name: 'Appliances',
    icon: 'Refrigerator',
    description: 'Kitchen and household appliances',
    itemCount: 0,
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: 'Dumbbell',
    description: 'Sports equipment and outdoor gear',
    itemCount: 0,
  },
  {
    id: 'baby-kids',
    name: 'Baby & Kids',
    icon: 'Baby',
    description: 'Baby items, strollers, and children\'s needs',
    itemCount: 0,
  },
  {
    id: 'health',
    name: 'Health & Medical',
    icon: 'HeartPulse',
    description: 'Medical supplies and health essentials',
    itemCount: 0,
  },
  {
    id: 'others',
    name: 'Others',
    icon: 'Package',
    description: 'Miscellaneous items',
    itemCount: 0,
  },
];

export const getCategoryByid = (id: string): Category | undefined =>
  categories.find((c) => c.id === id);

export const getCategoryName = (id: string): string =>
  categories.find((c) => c.id === id)?.name ?? 'Unknown';
