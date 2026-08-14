import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import SearchBar from '@/components/ui/SearchBar';
import { mockUsers } from '@/data/mockData';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ManageUsersPage() {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState('');

  const toggleSuspend = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isSuspended: !u.isSuspended } : u))
    );
    toast.success('User status updated');
  };

  const filtered = users.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>Manage Users</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0' }}>View, verify, or suspend registered accounts</p>
        </div>

        <SearchBar value={search} onChange={setSearch} placeholder="Search users by name or email..." />

        <Card padding="none" style={{ overflowX: 'auto', border: '1px solid var(--color-neutral-200)' }}>
          <table style={{ width: '100%', textAlign: 'left', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-neutral-200)', color: 'var(--color-neutral-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <tr>
                <th style={{ padding: '1rem' }}>User</th>
                <th style={{ padding: '1rem' }}>Location</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Avatar src={u.avatar} name={u.fullName} size="sm" />
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>{u.fullName}</p>
                      <p style={{ fontSize: '0.625rem', color: 'var(--color-neutral-400)', margin: 0 }}>{u.email}</p>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--color-neutral-600)' }}>{u.barangay}, {u.municipality}</td>
                  <td style={{ padding: '1rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-neutral-700)' }}>{u.role}</td>
                  <td style={{ padding: '1rem' }}>
                    <Badge variant={u.isSuspended ? 'danger' : 'success'}>
                      {u.isSuspended ? 'Suspended' : 'Active'}
                    </Badge>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <Button
                      variant={u.isSuspended ? 'outline' : 'danger'}
                      size="sm"
                      onClick={() => toggleSuspend(u.id)}
                    >
                      {u.isSuspended ? 'Unsuspend' : 'Suspend'}
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

