import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { mockRequests } from '@/data/mockData';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ManageRequestsPage() {
  const [requests, setRequests] = useState(mockRequests);

  const handleDelete = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast.success('Community request removed.');
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>Manage Requests</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0' }}>Moderate urgent item requests posted by neighbors</p>
        </div>

        <Card padding="none" style={{ overflowX: 'auto', border: '1px solid var(--color-neutral-200)' }}>
          <table style={{ width: '100%', textAlign: 'left', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-neutral-200)', color: 'var(--color-neutral-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Request Title</th>
                <th style={{ padding: '1rem' }}>Urgency</th>
                <th style={{ padding: '1rem' }}>Needed Before</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{req.title}</td>
                  <td style={{ padding: '1rem' }}>
                    <Badge variant={req.urgency === 'critical' ? 'danger' : 'warning'}>
                      {req.urgency.toUpperCase()}
                    </Badge>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--color-neutral-600)' }}>{req.neededBefore}</td>
                  <td style={{ padding: '1rem' }}>
                    <Badge variant="default">{req.status}</Badge>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(req.id)}>
                      Delete Request
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

