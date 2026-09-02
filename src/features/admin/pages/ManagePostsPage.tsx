import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SearchBar from '@/components/ui/SearchBar';
import { mockItems } from '@/data/mockData';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ManagePostsPage() {
  const [items, setItems] = useState(mockItems);
  const [search, setSearch] = useState('');

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success('Post removed by administrator');
  };

  const filtered = items.filter((i) =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>Manage Posts & Items</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0' }}>Moderate active community listings and donations</p>
        </div>

        <SearchBar value={search} onChange={setSearch} placeholder="Search posts by title or category..." />

        <Card padding="none" style={{ overflowX: 'auto', border: '1px solid var(--color-neutral-200)' }}>
          <table style={{ width: '100%', textAlign: 'left', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-neutral-200)', color: 'var(--color-neutral-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Item Title</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Type</th>
                <th style={{ padding: '1rem' }}>Condition</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{item.title}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-neutral-600)', textTransform: 'capitalize' }}>{item.category}</td>
                  <td style={{ padding: '1rem' }}>
                    <Badge variant={item.type === 'donation' ? 'success' : 'primary'}>
                      {item.type === 'donation' ? 'Donation' : 'Exchange'}
                    </Badge>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--color-neutral-600)' }}>{item.condition}</td>
                  <td style={{ padding: '1rem' }}>
                    <Badge variant="default">{item.status}</Badge>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                      Remove Post
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </AdminLayout>
  );
}

