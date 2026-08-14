import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { categories as initialCategories } from '@/data/categories';
import { useState } from 'react';
import type { Category } from '@/types';
import toast from 'react-hot-toast';

export default function ManageCategoriesPage() {
  const [categoriesList, setCategoriesList] = useState<Category[]>(initialCategories);
  const [newCatName, setNewCatName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: Category = {
      id: newCatName.toLowerCase().replace(/\s+/g, '-'),
      name: newCatName.trim(),
      icon: 'Tag',
      description: 'Community item category',
      itemCount: 0,
    };

    setCategoriesList((prev) => [...prev, newCat]);
    setNewCatName('');
    toast.success('Category added successfully!');
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '56rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>Manage Item Categories</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0' }}>Create and update item classification categories</p>
        </div>

        {/* Add Category Card Form */}
        <Card style={{ padding: '1.5rem', border: '1px solid var(--color-neutral-200)' }}>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Input
                label="New Category Name"
                placeholder="e.g. Sports & Fitness"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="primary" className="font-bold shrink-0">
              Add Category
            </Button>
          </form>
        </Card>

        {/* Existing Categories Table */}
        <Card padding="none" style={{ overflowX: 'auto', border: '1px solid var(--color-neutral-200)' }}>
          <table style={{ width: '100%', textAlign: 'left', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-neutral-200)', color: 'var(--color-neutral-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Category Name</th>
                <th style={{ padding: '1rem' }}>Slug ID</th>
                <th style={{ padding: '1rem' }}>Active Items</th>
              </tr>
            </thead>
            <tbody>
              {categoriesList.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{cat.name}</td>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.6875rem', color: 'var(--color-neutral-500)' }}>{cat.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>{cat.itemCount || 12} items</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </AdminLayout>
  );
}

