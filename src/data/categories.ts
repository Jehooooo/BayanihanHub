// ============================================================
// Bayanihan Hub — Item Categories
// ============================================================

import type { Category } from '../types';

export const categories: Category[] = [
  {
    id: 'clothing',
    name: 'Clothing',
    icon: 'Shirt',
    description: 'Daily wear, school uniforms, formal attire, shoes, and bags',
    itemCount: 3,
  },
  {
    id: 'school-supplies',
    name: 'School Supplies',
    icon: 'GraduationCap',
    description: 'Backpacks, notebooks, calculators, art & drafting kits',
    itemCount: 3,
  },
  {
    id: 'appliances',
    name: 'Appliances',
    icon: 'Refrigerator',
    description: 'Electric fans, rice cookers, kettles, blenders, and home appliances',
    itemCount: 3,
  },
  {
    id: 'books',
    name: 'Books',
    icon: 'BookOpen',
    description: 'STEM textbooks, nursing reviewers, literature, and children\'s books',
    itemCount: 3,
  },
  {
    id: 'toys',
    name: 'Toys & Games',
    icon: 'Gamepad2',
    description: 'Educational wooden blocks, LEGO sets, board games, and puzzles',
    itemCount: 2,
  },
  {
    id: 'furniture',
    name: 'Furniture',
    icon: 'Sofa',
    description: 'Study desks, ergonomic chairs, bookshelves, and dining tables',
    itemCount: 2,
  },
  {
    id: 'food',
    name: 'Food & Pantry',
    icon: 'UtensilsCrossed',
    description: 'Rice packs, canned goods, fresh harvest produce, and infant nutrition',
    itemCount: 3,
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: 'Smartphone',
    description: 'Student laptops, monitors, keyboards, webcams, and study gadgets',
    itemCount: 3,
  },
  {
    id: 'tools',
    name: 'Tools & Hardware',
    icon: 'Wrench',
    description: 'Hand tool kits, cordless drills, carpentry tools, and repair gear',
    itemCount: 2,
  },
  {
    id: 'sports',
    name: 'Sports & Outdoors',
    icon: 'Dumbbell',
    description: 'Basketballs, volleyballs, badminton sets, dumbbells, and cycling gear',
    itemCount: 3,
  },
  {
    id: 'baby-kids',
    name: 'Baby & Kids',
    icon: 'Baby',
    description: 'Baby strollers, wooden cribs, carriers, sterilizers, and toddler gear',
    itemCount: 2,
  },
  {
    id: 'health',
    name: 'Health & Medical',
    icon: 'HeartPulse',
    description: 'Wheelchairs, crutches, BP monitors, nebulizers, and first aid kits',
    itemCount: 3,
  },
  {
    id: 'other',
    name: 'Others',
    icon: 'Package',
    description: 'Musical instruments, emergency solar kits, handwoven textiles, and misc.',
    itemCount: 3,
  },
];

const CATEGORY_ALIASES: Record<string, string> = {
  others: 'other',
  medical: 'health',
};

export const getCategoryByid = (id: string): Category | undefined => {
  const normalized = CATEGORY_ALIASES[id] ?? id;
  return categories.find((c) => c.id === normalized);
};

export const getCategoryName = (id: string): string => {
  const normalized = CATEGORY_ALIASES[id] ?? id;
  return categories.find((c) => c.id === normalized)?.name ?? 'Others';
};
