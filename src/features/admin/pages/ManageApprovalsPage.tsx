// ============================================================
// Bayanihan Hub — Admin Manage Approvals & Identity Verifications
// ============================================================

import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Eye,
  Camera,
  MapPin,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  Check,
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';
import { useProfilePictureStore } from '@/stores/profilePictureStore';
import { useIdentityVerificationStore } from '@/stores/identityVerificationStore';
import type {
  ProfilePictureSubmission,
  ProfilePictureStatus,
  IdentityVerificationRecord,
  VerificationStatus,
} from '@/types';
import toast from 'react-hot-toast';

export default function ManageApprovalsPage() {
  // Main Section Tab: 'identity' | 'photos'
  const [activeMainSection, setActiveMainSection] = useState<'identity' | 'photos'>('identity');

  // --- Identity Verification State & Store ---
  const {
    verifications,
    approveVerification,
    rejectVerification,
    requestRetry,
    fetchVerifications,
    getPendingCount: getPendingVerifCount,
  } = useIdentityVerificationStore();

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const [verifStatusFilter, setVerifStatusFilter] = useState<'all' | VerificationStatus>('PENDING');
  const [verifSearch, setVerifSearch] = useState('');
  const [selectedVerif, setSelectedVerif] = useState<IdentityVerificationRecord | null>(null);
  const [isVerifDetailModalOpen, setIsVerifDetailModalOpen] = useState(false);
  const [isRejectVerifModalOpen, setIsRejectVerifModalOpen] = useState(false);
  const [verifRejectReason, setVerifRejectReason] = useState('');
  const [isRetryVerifModalOpen, setIsRetryVerifModalOpen] = useState(false);
  const [verifRetryInstructions, setVerifRetryInstructions] = useState('');

  const pendingVerifCount = getPendingVerifCount();
  const verifiedCount = verifications.filter((v) => v.status === 'VERIFIED' || v.status === 'APPROVED').length;
  const rejectedVerifCount = verifications.filter((v) => v.status === 'REJECTED' || v.status === 'RETRY_REQUIRED').length;

  const filteredVerifications = verifications.filter((v) => {
    const matchesTab =
      verifStatusFilter === 'all' ||
      v.status === verifStatusFilter ||
      (verifStatusFilter === 'VERIFIED' && (v.status === 'VERIFIED' || v.status === 'APPROVED'));
    const name = (v.user?.fullName || v.fullNameOnId || '').toLowerCase();
    const email = (v.user?.email || '').toLowerCase();
    const idType = (v.idType || '').toLowerCase();
    const q = verifSearch.toLowerCase();
    const matchesSearch = name.includes(q) || email.includes(q) || idType.includes(q);
    return matchesTab && matchesSearch;
  });

  const handleApproveVerif = (record: IdentityVerificationRecord) => {
    approveVerification(record.id, 'Admin');
    toast.success(`Approved account for ${record.user?.fullName || record.fullNameOnId}! Status: APPROVED`);
    setIsVerifDetailModalOpen(false);
    setSelectedVerif(null);
  };

  const handleConfirmRejectVerif = () => {
    if (!selectedVerif) return;
    rejectVerification(selectedVerif.id, verifRejectReason.trim(), 'Admin');
    toast.success(`Rejected verification for ${selectedVerif.user?.fullName || selectedVerif.fullNameOnId}`);
    setIsRejectVerifModalOpen(false);
    setIsVerifDetailModalOpen(false);
    setSelectedVerif(null);
  };

  const handleConfirmRetryVerif = () => {
    if (!selectedVerif) return;
    requestRetry(selectedVerif.id, 'Information or photo needs correction.', verifRetryInstructions.trim(), 'Admin');
    toast.success(`Requested verification retry for ${selectedVerif.user?.fullName || selectedVerif.fullNameOnId}`);
    setIsRetryVerifModalOpen(false);
    setIsVerifDetailModalOpen(false);
    setSelectedVerif(null);
  };

  // --- Profile Picture Submissions State & Store ---
  const { submissions, approveSubmission, rejectSubmission } = useProfilePictureStore();

  const [activePhotoTab, setActivePhotoTab] = useState<'all' | ProfilePictureStatus>('pending');
  const [photoSearch, setPhotoSearch] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<ProfilePictureSubmission | null>(null);
  const [isRejectPhotoModalOpen, setIsRejectPhotoModalOpen] = useState(false);
  const [photoRejectReason, setPhotoRejectReason] = useState('');
  const [photoPreviewModalOpen, setPhotoPreviewModalOpen] = useState(false);

  const pendingPhotoCount = submissions.filter((s) => s.status === 'pending').length;
  const approvedPhotoCount = submissions.filter((s) => s.status === 'approved').length;
  const rejectedPhotoCount = submissions.filter((s) => s.status === 'rejected').length;

  const filteredPhotoSubmissions = submissions.filter((sub) => {
    const matchesTab = activePhotoTab === 'all' || sub.status === activePhotoTab;
    const userName = sub.user?.fullName || 'User';
    const userEmail = sub.user?.email || '';
    const q = photoSearch.toLowerCase();
    const matchesSearch = userName.toLowerCase().includes(q) || userEmail.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const handleApprovePhoto = (submission: ProfilePictureSubmission) => {
    approveSubmission(submission.id);
    toast.success(`Approved profile picture for ${submission.user?.fullName || 'User'}`);
    if (selectedSubmission?.id === submission.id) {
      setSelectedSubmission(null);
    }
  };

  const handleConfirmRejectPhoto = () => {
    if (!selectedSubmission) return;
    rejectSubmission(selectedSubmission.id, photoRejectReason.trim());
    toast.success(`Rejected photo submission for ${selectedSubmission.user?.fullName || 'User'}`);
    setIsRejectPhotoModalOpen(false);
    setSelectedSubmission(null);
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Page Header & Main Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>
              Approvals & Identity Verifications
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0' }}>
              Review valid Philippine IDs, facial biometric comparisons, and profile photos to maintain community trust.
            </p>
          </div>

          {/* Main Section Switcher Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#e2e8f0', padding: '0.375rem', borderRadius: 'var(--radius-lg)' }}>
            <button
              type="button"
              onClick={() => setActiveMainSection('identity')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeMainSection === 'identity' ? '#fff' : 'transparent',
                color: activeMainSection === 'identity' ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
                boxShadow: activeMainSection === 'identity' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 150ms',
              }}
            >
              <ShieldCheck style={{ width: '1.125rem', height: '1.125rem' }} />
              <span>Identity Verifications</span>
              {pendingVerifCount > 0 && (
                <span style={{ backgroundColor: '#d97706', color: '#fff', fontSize: '0.6875rem', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontWeight: 800 }}>
                  {pendingVerifCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveMainSection('photos')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeMainSection === 'photos' ? '#fff' : 'transparent',
                color: activeMainSection === 'photos' ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
                boxShadow: activeMainSection === 'photos' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 150ms',
              }}
            >
              <Camera style={{ width: '1.125rem', height: '1.125rem' }} />
              <span>Photo Approvals</span>
              {pendingPhotoCount > 0 && (
                <span style={{ backgroundColor: '#d97706', color: '#fff', fontSize: '0.6875rem', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontWeight: 800 }}>
                  {pendingPhotoCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ============================================================
            SECTION 1: Identity & Facial Verifications
            ============================================================ */}
        {activeMainSection === 'identity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Metric Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <Card padding="md" style={{ backgroundColor: '#fff', border: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock style={{ width: '1.5rem', height: '1.5rem' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontWeight: 700, margin: 0 }}>Pending Identity Review</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', margin: '0.125rem 0 0 0' }}>{pendingVerifCount}</p>
                </div>
              </Card>

              <Card padding="md" style={{ backgroundColor: '#fff', border: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f0fdf4', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 style={{ width: '1.5rem', height: '1.5rem' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontWeight: 700, margin: 0 }}>Verified Identities</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-600)', margin: '0.125rem 0 0 0' }}>{verifiedCount}</p>
                </div>
              </Card>

              <Card padding="md" style={{ backgroundColor: '#fff', border: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <XCircle style={{ width: '1.5rem', height: '1.5rem' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontWeight: 700, margin: 0 }}>Rejected / Retry Required</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626', margin: '0.125rem 0 0 0' }}>{rejectedVerifCount}</p>
                </div>
              </Card>
            </div>

            {/* Toolbar: Status Filter Pills & Search */}
            <Card style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--color-neutral-100)', padding: '0.25rem', borderRadius: 'var(--radius-md)', flexWrap: 'wrap' }}>
                {[
                  { id: 'PENDING', label: `Pending (${pendingVerifCount})` },
                  { id: 'VERIFIED', label: `Approved (${verifiedCount})` },
                  { id: 'RETRY_REQUIRED', label: `Retry Required (${verifications.filter((v) => v.status === 'RETRY_REQUIRED').length})` },
                  { id: 'REJECTED', label: `Rejected (${verifications.filter((v) => v.status === 'REJECTED').length})` },
                  { id: 'all', label: `All (${verifications.length})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setVerifStatusFilter(tab.id as any)}
                    style={{
                      padding: '0.4rem 0.875rem',
                      fontSize: '0.8125rem',
                      fontWeight: verifStatusFilter === tab.id ? 700 : 500,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: verifStatusFilter === tab.id ? '#fff' : 'transparent',
                      color: verifStatusFilter === tab.id ? 'var(--color-neutral-900)' : 'var(--color-neutral-600)',
                      boxShadow: verifStatusFilter === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 120ms ease-in-out',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative', width: '18rem', maxWidth: '100%' }}>
                <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--color-neutral-400)' }} />
                <input
                  type="text"
                  placeholder="Search by name, email, or ID..."
                  value={verifSearch}
                  onChange={(e) => setVerifSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                    fontSize: '0.8125rem',
                    border: '1px solid var(--color-neutral-200)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-neutral-50)',
                    outline: 'none',
                  }}
                />
              </div>
            </Card>

            {/* Verifications Table */}
            {filteredVerifications.length === 0 ? (
              <Card style={{ padding: '4rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck style={{ width: '3rem', height: '3rem', color: 'var(--color-neutral-300)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-800)', margin: 0 }}>
                  No identity verifications found
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: 0, maxWidth: '24rem' }}>
                  There are no identity verification submissions matching the selected filters.
                </p>
              </Card>
            ) : (
              <Card padding="none" style={{ overflowX: 'auto', border: '1px solid var(--color-neutral-200)' }}>
                <table style={{ width: '100%', textAlign: 'left', fontSize: '0.8125rem', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-neutral-200)', color: 'var(--color-neutral-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <tr>
                      <th style={{ padding: '1rem' }}>User & Location</th>
                      <th style={{ padding: '1rem' }}>Philippine ID Presented</th>
                      <th style={{ padding: '1rem' }}>Biometric Match</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                      <th style={{ padding: '1rem' }}>Submitted</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVerifications.map((record) => {
                      const user = record.user;
                      return (
                        <tr key={record.id} style={{ borderBottom: '1px solid var(--color-neutral-100)', transition: 'background-color 150ms' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <Avatar src={record.faceImageUrl || user?.avatar} name={user?.fullName || record.fullNameOnId} size="md" />
                              <div>
                                <p style={{ fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
                                  {user?.fullName || record.fullNameOnId}
                                </p>
                                <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', margin: '0.125rem 0 0 0' }}>
                                  {user?.email || 'N/A'}
                                </p>
                                <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-500)', margin: '0.125rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <MapPin style={{ width: '0.75rem', height: '0.75rem' }} />
                                  {user?.barangay ? `${user.barangay}, ${user.municipality}` : 'La Union'}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <span style={{ fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                                {record.idType}
                              </span>
                              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--color-neutral-600)', backgroundColor: 'var(--color-neutral-100)', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-sm)', width: 'fit-content' }}>
                                {record.maskedIdNumber}
                              </span>
                            </div>
                          </td>

                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span
                                  style={{
                                    fontWeight: 800,
                                    fontSize: '0.875rem',
                                    color: record.confidenceScore >= 80 ? 'var(--color-primary-700)' : '#d97706',
                                  }}
                                >
                                  {record.confidenceScore}% Match
                                </span>
                              </div>
                              <div style={{ width: '6rem', height: '6px', backgroundColor: 'var(--color-neutral-200)', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    width: `${record.confidenceScore}%`,
                                    height: '100%',
                                    backgroundColor: record.confidenceScore >= 80 ? 'var(--color-primary-600)' : '#d97706',
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>
                                {record.matchDetails.faceMatch ? '✓ Face Matched' : '✗ Face Discrepancy'}
                              </span>
                            </div>
                          </td>

                          <td style={{ padding: '1rem' }}>
                            <Badge
                              variant={
                                record.status === 'VERIFIED' || record.status === 'APPROVED'
                                  ? 'success'
                                  : record.status === 'PENDING'
                                  ? 'warning'
                                  : 'danger'
                              }
                            >
                              {record.status === 'RETRY_REQUIRED' ? 'RETRY REQ.' : record.status}
                            </Badge>
                          </td>

                          <td style={{ padding: '1rem', color: 'var(--color-neutral-500)', fontSize: '0.75rem' }}>
                            {new Date(record.submittedAt).toLocaleDateString()}
                          </td>

                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedVerif(record);
                                setIsVerifDetailModalOpen(true);
                              }}
                              leftIcon={<Eye style={{ width: '0.875rem', height: '0.875rem' }} />}
                            >
                              Review Details
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            )}

            {/* Side-by-Side Biometric Comparison Modal */}
            <Modal
              isOpen={isVerifDetailModalOpen}
              onClose={() => setIsVerifDetailModalOpen(false)}
              title="Identity & Facial Biometric Review"
              size="lg"
            >
              {selectedVerif && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Top Candidate Summary */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--color-neutral-200)', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Avatar src={selectedVerif.faceImageUrl} name={selectedVerif.fullNameOnId} size="lg" />
                      <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>
                          {selectedVerif.user?.fullName || selectedVerif.fullNameOnId}
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0.125rem 0 0 0' }}>
                          Legal Name on ID: <strong>{selectedVerif.fullNameOnId}</strong>
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Badge
                        variant={
                          selectedVerif.status === 'VERIFIED' || selectedVerif.status === 'APPROVED'
                            ? 'success'
                            : selectedVerif.status === 'PENDING'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        Account: {selectedVerif.status}
                      </Badge>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-700)', backgroundColor: 'var(--color-primary-50)', padding: '0.25rem 0.5rem', borderRadius: '9999px', border: '1px solid var(--color-primary-200)' }}>
                        Facial Check: PASSED ({selectedVerif.confidenceScore}%)
                      </span>
                    </div>
                  </div>

                  {/* Side-by-Side Visual Inspection Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                    {/* Left: Uploaded ID Document */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-800)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <CreditCard style={{ width: '1rem', height: '1rem', color: 'var(--color-primary-600)' }} />
                          Uploaded {selectedVerif.idType}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-500)', fontFamily: 'monospace' }}>
                          {selectedVerif.maskedIdNumber}
                        </span>
                      </div>

                      <div
                        style={{
                          width: '100%',
                          height: '15rem',
                          borderRadius: 'var(--radius-lg)',
                          backgroundColor: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          border: '1px solid var(--color-neutral-300)',
                        }}
                      >
                        <img
                          src={selectedVerif.idDocumentUrl}
                          alt="Government ID Document"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    </div>

                    {/* Right: Live Captured Facial Selfie */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-800)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Camera style={{ width: '1rem', height: '1rem', color: 'var(--color-primary-600)' }} />
                          Captured Facial Biometric Selfie
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: '#16a34a', fontWeight: 600 }}>
                          ✓ Live Camera Frame
                        </span>
                      </div>

                      <div
                        style={{
                          width: '100%',
                          height: '15rem',
                          borderRadius: 'var(--radius-lg)',
                          backgroundColor: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          border: '2px solid var(--color-primary-400)',
                        }}
                      >
                        <img
                          src={selectedVerif.faceImageUrl}
                          alt="Facial Selfie"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Biometric Analysis Breakdown */}
                  <div style={{ padding: '1rem', backgroundColor: 'var(--color-neutral-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 700, margin: 0 }}>FACIAL GEOMETRY</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: selectedVerif.matchDetails.faceMatch ? '#16a34a' : '#dc2626', margin: '0.25rem 0 0 0' }}>
                        {selectedVerif.matchDetails.faceMatch ? '✓ Features Match' : '✗ Discrepancy Detected'}
                      </p>
                    </div>

                    <div>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 700, margin: 0 }}>LEGAL NAME MATCH</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: selectedVerif.matchDetails.nameMatch ? '#16a34a' : '#dc2626', margin: '0.25rem 0 0 0' }}>
                        {selectedVerif.matchDetails.nameMatch ? '✓ 100% Name Match' : '✗ Name Mismatch'}
                      </p>
                    </div>

                    <div>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 700, margin: 0 }}>LIVENESS DETECTION</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: selectedVerif.matchDetails.livenessVerified ? '#16a34a' : '#dc2626', margin: '0.25rem 0 0 0' }}>
                        {selectedVerif.matchDetails.livenessVerified ? '✓ Genuine Liveness' : '✗ Spoof Suspected'}
                      </p>
                    </div>
                  </div>

                  {/* ID Details Details Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.75rem' }}>
                    <div>
                      <span style={{ color: 'var(--color-neutral-400)' }}>Date of Birth:</span>
                      <p style={{ margin: '0.125rem 0 0 0', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
                        {selectedVerif.dob || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-neutral-400)' }}>Expiration Date:</span>
                      <p style={{ margin: '0.125rem 0 0 0', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
                        {selectedVerif.expirationDate || 'No Expiration (Lifetime)'}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-neutral-400)' }}>Verification Engine:</span>
                      <p style={{ margin: '0.125rem 0 0 0', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
                        {selectedVerif.provider}
                      </p>
                    </div>
                  </div>

                  {/* Rejection / Retry Reason display if present */}
                  {selectedVerif.rejectionReason && (
                    <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: '#b91c1c' }}>
                      <strong>Rejection Note:</strong> {selectedVerif.rejectionReason}
                    </div>
                  )}

                  {selectedVerif.retryInstructions && (
                    <div style={{ padding: '0.75rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: '#92400e' }}>
                      <strong>Retry Instructions:</strong> {selectedVerif.retryInstructions}
                    </div>
                  )}

                  {/* Admin Actions Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--color-neutral-200)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button
                        variant="danger"
                        size="md"
                        onClick={() => {
                          setVerifRejectReason('Photo on ID does not match live selfie.');
                          setIsRejectVerifModalOpen(true);
                        }}
                      >
                        Reject Verification
                      </Button>

                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => {
                          setVerifRetryInstructions('Please retake selfie in brighter room and lay ID on flat surface.');
                          setIsRetryVerifModalOpen(true);
                        }}
                        leftIcon={<RotateCcw style={{ width: '1rem', height: '1rem' }} />}
                      >
                        Request Retry
                      </Button>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      disabled={selectedVerif.status === 'APPROVED'}
                      onClick={() => handleApproveVerif(selectedVerif)}
                      leftIcon={<Check style={{ width: '1.125rem', height: '1.125rem' }} />}
                      className="font-bold px-6 shadow-button"
                    >
                      {selectedVerif.status === 'APPROVED' ? 'Account Approved ✓' : 'Approve Account (PENDING → APPROVED)'}
                    </Button>
                  </div>
                </div>
              )}
            </Modal>

            {/* Rejection Reason Modal */}
            <Modal
              isOpen={isRejectVerifModalOpen}
              onClose={() => setIsRejectVerifModalOpen(false)}
              title="Reject Identity Verification"
              size="sm"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)', margin: 0 }}>
                  Please enter the specific reason for rejecting this identity submission:
                </p>
                <textarea
                  value={verifRejectReason}
                  onChange={(e) => setVerifRejectReason(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-neutral-300)',
                    fontSize: '0.8125rem',
                  }}
                  placeholder="e.g. ID photo obscured, expiration date passed, name discrepancy..."
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Button variant="outline" size="sm" onClick={() => setIsRejectVerifModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleConfirmRejectVerif}>
                    Confirm Rejection
                  </Button>
                </div>
              </div>
            </Modal>

            {/* Retry Request Modal */}
            <Modal
              isOpen={isRetryVerifModalOpen}
              onClose={() => setIsRetryVerifModalOpen(false)}
              title="Request Identity Verification Retry"
              size="sm"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)', margin: 0 }}>
                  Provide clear instructions so the neighbor can successfully retake their photo or document:
                </p>
                <textarea
                  value={verifRetryInstructions}
                  onChange={(e) => setVerifRetryInstructions(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-neutral-300)',
                    fontSize: '0.8125rem',
                  }}
                  placeholder="e.g. Lay ID flat to eliminate flash glare; look straight into camera..."
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Button variant="outline" size="sm" onClick={() => setIsRetryVerifModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleConfirmRetryVerif}>
                    Send Retry Request
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        )}

        {/* ============================================================
            SECTION 2: Profile Picture Photo Approvals (Preserved)
            ============================================================ */}
        {activeMainSection === 'photos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Summary Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <Card padding="md" style={{ backgroundColor: '#fff', border: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock style={{ width: '1.5rem', height: '1.5rem' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontWeight: 700, margin: 0 }}>Pending Review</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', margin: '0.125rem 0 0 0' }}>{pendingPhotoCount}</p>
                </div>
              </Card>

              <Card padding="md" style={{ backgroundColor: '#fff', border: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', backgroundColor: '#f0fdf4', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 style={{ width: '1.5rem', height: '1.5rem' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontWeight: 700, margin: 0 }}>Approved Photos</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-600)', margin: '0.125rem 0 0 0' }}>{approvedPhotoCount}</p>
                </div>
              </Card>

              <Card padding="md" style={{ backgroundColor: '#fff', border: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <XCircle style={{ width: '1.5rem', height: '1.5rem' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontWeight: 700, margin: 0 }}>Declined Photos</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626', margin: '0.125rem 0 0 0' }}>{rejectedPhotoCount}</p>
                </div>
              </Card>
            </div>

            {/* Filter Toolbar & Search */}
            <Card style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--color-neutral-100)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
                {[
                  { id: 'pending', label: `Pending (${pendingPhotoCount})` },
                  { id: 'approved', label: `Approved (${approvedPhotoCount})` },
                  { id: 'rejected', label: `Rejected (${rejectedPhotoCount})` },
                  { id: 'all', label: `All (${submissions.length})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActivePhotoTab(tab.id as any)}
                    style={{
                      padding: '0.4rem 0.875rem',
                      fontSize: '0.8125rem',
                      fontWeight: activePhotoTab === tab.id ? 700 : 500,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: activePhotoTab === tab.id ? '#fff' : 'transparent',
                      color: activePhotoTab === tab.id ? 'var(--color-neutral-900)' : 'var(--color-neutral-600)',
                      boxShadow: activePhotoTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 120ms ease-in-out',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative', width: '18rem', maxWidth: '100%' }}>
                <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--color-neutral-400)' }} />
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={photoSearch}
                  onChange={(e) => setPhotoSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                    fontSize: '0.8125rem',
                    border: '1px solid var(--color-neutral-200)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-neutral-50)',
                    outline: 'none',
                  }}
                />
              </div>
            </Card>

            {/* Submissions List */}
            {filteredPhotoSubmissions.length === 0 ? (
              <Card style={{ padding: '4rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <Camera style={{ width: '3rem', height: '3rem', color: 'var(--color-neutral-300)' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-800)', margin: 0 }}>No photo submissions found</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: 0, maxWidth: '24rem' }}>
                  There are no profile picture submissions matching your selected filter.
                </p>
              </Card>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 1fr))', gap: '1.25rem' }}>
                {filteredPhotoSubmissions.map((sub) => {
                  const user = sub.user;
                  return (
                    <Card key={sub.id} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <div style={{ position: 'relative', width: '100%', height: '14rem', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={sub.imageUrl}
                          alt={user?.fullName || 'User avatar'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setPhotoPreviewModalOpen(true);
                          }}
                          style={{
                            position: 'absolute',
                            bottom: '0.75rem',
                            right: '0.75rem',
                            backgroundColor: 'rgba(0,0,0,0.65)',
                            backdropFilter: 'blur(4px)',
                            border: 'none',
                            borderRadius: '9999px',
                            padding: '0.4rem 0.6rem',
                            color: '#fff',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Eye style={{ width: '0.75rem', height: '0.75rem' }} /> Preview
                        </button>
                      </div>

                      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
                            {user?.fullName || 'User'}
                          </h4>
                          <Badge variant={sub.status === 'approved' ? 'success' : sub.status === 'pending' ? 'warning' : 'danger'}>
                            {sub.status}
                          </Badge>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: 0 }}>
                          {user?.email} • {user?.barangay}, {user?.municipality}
                        </p>

                        {sub.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                            <Button
                              variant="outline"
                              size="sm"
                              fullWidth
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setPhotoRejectReason('Image does not meet community guidelines.');
                                setIsRejectPhotoModalOpen(true);
                              }}
                            >
                              Reject
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              fullWidth
                              onClick={() => handleApprovePhoto(sub)}
                            >
                              Approve
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Photo Reject Modal */}
            <Modal
              isOpen={isRejectPhotoModalOpen}
              onClose={() => setIsRejectPhotoModalOpen(false)}
              title="Reject Profile Picture"
              size="sm"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)', margin: 0 }}>
                  Enter reason for declining this photo submission:
                </p>
                <textarea
                  value={photoRejectReason}
                  onChange={(e) => setPhotoRejectReason(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-300)', fontSize: '0.8125rem' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Button variant="outline" size="sm" onClick={() => setIsRejectPhotoModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleConfirmRejectPhoto}>
                    Confirm Reject
                  </Button>
                </div>
              </div>
            </Modal>

            {/* Photo Preview Modal */}
            <Modal
              isOpen={photoPreviewModalOpen}
              onClose={() => setPhotoPreviewModalOpen(false)}
              title="Profile Picture Preview"
              size="md"
            >
              {selectedSubmission && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={selectedSubmission.imageUrl}
                    alt="Full preview"
                    style={{ maxWidth: '100%', maxHeight: '24rem', objectFit: 'contain', borderRadius: 'var(--radius-lg)' }}
                  />
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700 }}>{selectedSubmission.user?.fullName}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Status: {selectedSubmission.status}</span>
                    </div>
                    {selectedSubmission.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setPhotoPreviewModalOpen(false);
                            setIsRejectPhotoModalOpen(true);
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            handleApprovePhoto(selectedSubmission);
                            setPhotoPreviewModalOpen(false);
                          }}
                        >
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Modal>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
