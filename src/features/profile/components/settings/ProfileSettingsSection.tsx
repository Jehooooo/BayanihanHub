// ============================================================
// ProfileSettingsSection — Profile Picture + Personal Info + Location
// ============================================================

import React, { useState } from 'react';
import { User, Phone, MapPin, Camera, Clock, AlertTriangle, Save } from 'lucide-react';
import SettingsSection from './SettingsSection';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import ProfilePictureUploadModal from '../ProfilePictureUploadModal';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

const PHILIPPINE_PROVINCES = [
  'Abra', 'Agusan del Norte', 'Agusan del Sur', 'Aklan', 'Albay', 'Antique',
  'Apayao', 'Aurora', 'Basilan', 'Bataan', 'Batanes', 'Batangas', 'Benguet',
  'Biliran', 'Bohol', 'Bukidnon', 'Bulacan', 'Cagayan', 'Camarines Norte',
  'Camarines Sur', 'Camiguin', 'Capiz', 'Catanduanes', 'Cavite', 'Cebu',
  'Compostela Valley', 'Cotabato', 'Davao del Norte', 'Davao del Sur',
  'Davao Occidental', 'Davao Oriental', 'Dinagat Islands', 'Eastern Samar',
  'Guimaras', 'Ifugao', 'Ilocos Norte', 'Ilocos Sur', 'Iloilo', 'Isabela',
  'Kalinga', 'La Union', 'Laguna', 'Lanao del Norte', 'Lanao del Sur', 'Leyte',
  'Maguindanao', 'Marinduque', 'Masbate', 'Metro Manila', 'Misamis Occidental',
  'Misamis Oriental', 'Mountain Province', 'Negros Occidental', 'Negros Oriental',
  'Northern Samar', 'Nueva Ecija', 'Nueva Vizcaya', 'Occidental Mindoro',
  'Oriental Mindoro', 'Palawan', 'Pampanga', 'Pangasinan', 'Quezon', 'Quirino',
  'Rizal', 'Romblon', 'Samar', 'Sarangani', 'Siquijor', 'Sorsogon',
  'South Cotabato', 'Southern Leyte', 'Sultan Kudarat', 'Sulu', 'Surigao del Norte',
  'Surigao del Sur', 'Tarlac', 'Tawi-Tawi', 'Zambales', 'Zamboanga del Norte',
  'Zamboanga del Sur', 'Zamboanga Sibugay',
];

export default function ProfileSettingsSection() {
  const { user, updateProfile } = useAuthStore();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: user?.fullName ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    barangay: user?.barangay ?? '',
    municipality: user?.municipality ?? '',
    province: user?.province ?? '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast.error('Full name is required.');
      return;
    }
    setIsSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      updateProfile(form);
      toast.success('Profile updated successfully.');
    } catch {
      toast.error('Unable to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Profile Picture Card */}
      <SettingsSection
        id="profile-picture"
        icon={<Camera className="w-4 h-4" />}
        title="Profile Picture"
        description="Your photo helps neighbors recognize you in the community."
      >
        <div className="flex items-center justify-between gap-4 flex-wrap py-1">
          <div className="flex items-center gap-4">
            <Avatar
              src={
                user?.avatar ||
                (user?.avatarStatus === 'pending' ? user?.pendingAvatar : undefined)
              }
              name={user?.fullName || 'User'}
              size="lg"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-neutral-900">
                  {user?.fullName || 'User'}
                </span>
                {user?.avatarStatus === 'pending' && (
                  <Badge variant="warning" size="sm">
                    <Clock className="w-3 h-3 mr-1" /> Pending Review
                  </Badge>
                )}
                {user?.avatarStatus === 'rejected' && (
                  <Badge variant="danger" size="sm">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Photo Declined
                  </Badge>
                )}
              </div>
              <p className="text-xs text-neutral-500">
                {user?.avatarStatus === 'pending'
                  ? 'Your photo is currently under admin verification.'
                  : user?.avatarStatus === 'rejected'
                  ? `Declined: "${user.avatarRejectionReason || 'Please upload a clear image'}"`
                  : 'Upload a clear, recent photo of yourself.'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            leftIcon={<Camera className="w-4 h-4" />}
          >
            {user?.avatar ? 'Change Photo' : 'Upload Photo'}
          </Button>
        </div>
      </SettingsSection>

      {/* Personal Info + Location */}
      <SettingsSection
        id="personal-info"
        icon={<User className="w-4 h-4" />}
        title="Personal Information"
        description="Update your name, contact details, and community location."
      >
        <form onSubmit={handleSave} className="space-y-4 pt-1">
          {/* Full Name */}
          <Input
            label="Full Name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Your full name"
            required
          />

          {/* Phone */}
          <Input
            label="Phone Number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+63 9XX XXX XXXX"
            leftIcon={<Phone className="w-4 h-4" />}
            type="tel"
          />

          {/* Address */}
          <Input
            label="Street / House Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Street, House No., Subdivision"
            leftIcon={<MapPin className="w-4 h-4" />}
          />

          {/* Location — Philippine Structure */}
          <div>
            <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-2.5">
              Community Location
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Barangay"
                value={form.barangay}
                onChange={(e) => setForm({ ...form, barangay: e.target.value })}
                placeholder="e.g. Brgy. San Antonio"
              />
              <Input
                label="Municipality / City"
                value={form.municipality}
                onChange={(e) => setForm({ ...form, municipality: e.target.value })}
                placeholder="e.g. San Fernando"
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-neutral-700">Province</label>
                <select
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                  className="
                    w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm
                    text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    transition-colors
                  "
                >
                  <option value="">Select province</option>
                  {PHILIPPINE_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2 border-t border-neutral-100">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </SettingsSection>

      <ProfilePictureUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </>
  );
}
