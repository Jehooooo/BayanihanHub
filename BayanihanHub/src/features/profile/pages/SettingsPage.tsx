import { useState } from 'react';
import { User, Lock, Phone, MapPin, Save, Camera, Clock, AlertTriangle } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import ProfilePictureUploadModal from '../components/ProfilePictureUploadModal';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateProfile } = useAuthStore();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    barangay: user?.barangay ?? '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    toast.success('Account settings saved!');
  };

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Account Settings</h1>
          <p className="text-xs text-neutral-500">Manage your profile info, phone number, and security preferences.</p>
        </div>

        {/* Profile Picture Section */}
        <Card className="space-y-4 border border-neutral-200 shadow-card">
          <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2 border-b border-neutral-100 pb-3">
            <Camera className="w-4 h-4 text-primary-600" /> Profile Picture
          </h3>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Avatar
                src={user?.avatar || (user?.avatarStatus === 'pending' ? user?.pendingAvatar : undefined)}
                name={user?.fullName || 'User'}
                size="lg"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-neutral-900">{user?.fullName || 'User'}</span>
                  {user?.avatarStatus === 'pending' && (
                    <Badge variant="warning" size="sm">
                      <Clock className="w-3 h-3 mr-1" /> Pending Admin Review
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
                    : 'Personalize your profile across the Bayanihan community.'}
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
        </Card>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Info Section */}
          <Card className="space-y-5 border border-neutral-200 shadow-card">
            <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2 border-b border-neutral-100 pb-3">
              <User className="w-4 h-4 text-primary-600" /> Personal Information
            </h3>

            <Input
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                leftIcon={<Phone className="w-4 h-4" />}
              />
              <Input
                label="Barangay"
                value={formData.barangay}
                onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                leftIcon={<MapPin className="w-4 h-4" />}
              />
            </div>
          </Card>

          {/* Password & Security Section */}
          <Card className="space-y-5 border border-neutral-200 shadow-card">
            <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2 border-b border-neutral-100 pb-3">
              <Lock className="w-4 h-4 text-primary-600" /> Password & Security
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Current Password" type="password" placeholder="••••••••" />
              <Input label="New Password" type="password" placeholder="••••••••" />
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              type="submit"
              className="font-bold shadow-button px-6"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>

        <ProfilePictureUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        />
      </div>
    </PageLayout>
  );
}
