import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { mockReports } from '@/data/mockData';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ManageReportsPage() {
  const [reports, setReports] = useState(mockReports);

  const handleResolve = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'resolved' as const } : r))
    );
    toast.success('Report marked as resolved.');
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>Manage Reports & Moderation</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0' }}>Review reported listings, inappropriate content, and user violations</p>
        </div>

        <Card padding="none" style={{ overflowX: 'auto', border: '1px solid var(--color-neutral-200)' }}>
          <table style={{ width: '100%', textAlign: 'left', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-neutral-200)', color: 'var(--color-neutral-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Target Type</th>
                <th style={{ padding: '1rem' }}>Reason</th>
                <th style={{ padding: '1rem' }}>Target ID</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', textTransform: 'capitalize' }}>{r.targetType}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-neutral-600)' }}>{r.reason}</td>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.6875rem', color: 'var(--color-neutral-500)' }}>{r.targetId}</td>
                  <td style={{ padding: '1rem' }}>
                    <Badge variant={r.status === 'pending' ? 'warning' : 'success'}>
                      {r.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {r.status === 'pending' ? (
                      <Button variant="primary" size="sm" onClick={() => handleResolve(r.id)}>
                        Resolve Report
                      </Button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-success)' }}>Resolved</span>
                    )}
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

