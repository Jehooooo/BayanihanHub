// ============================================================
// Bayanihan Hub — Verified Multi-Step Registration Page
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Clock,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { verificationService, maskIdNumber } from '@/services/verification.service';
import {
  PHILIPPINE_ID_CONFIGS,
  type PhilippineIdType,
  type VerificationStatus,
} from '@/types';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import RegistrationStepper from '../components/RegistrationStepper';
import IdDocumentUploader from '../components/IdDocumentUploader';
import FacialVerificationCamera from '../components/FacialVerificationCamera';
import { compressImageDataUrl } from '@/utils/imageCompression';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, error, clearError } = useAuthStore();

  // Multi-step registration flow state (1: Account, 2: Select ID, 3: ID Details & Upload, 4: Face Verification, 5: Verification & Activation)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Complete registration & identity verification form state
  const [formData, setFormData] = useState({
    // Step 1: Account Information
    fullName: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    barangay: 'Poblacion',
    municipality: 'San Fernando',
    province: 'La Union',
    password: '',
    confirmPassword: '',
    acceptTerms: false,

    // Step 2 & 3: ID Details
    idType: '' as PhilippineIdType | '',
    idNumber: '',
    fullNameOnId: '',
    dob: '',
    expirationDate: '',
    extraInfo: '',
    idDocumentDataUrl: '',

    // Step 4: Facial Selfie
    facialSelfieDataUrl: '',
  });

  // Verification processing state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationProgressStep, setVerificationProgressStep] = useState<number>(0);
  const [showPendingNotification, setShowPendingNotification] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    status: VerificationStatus;
    confidenceScore: number;
    rejectionReason?: string;
    retryInstructions?: string;
    details?: string;
  } | null>(null);

  const selectedIdConfig = formData.idType ? PHILIPPINE_ID_CONFIGS[formData.idType] : null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!formData.fullName.trim() || !formData.username.trim() || !formData.email.trim()) {
      toast.error('Please fill in all required account fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password should be at least 6 characters long.');
      return;
    }

    if (!formData.acceptTerms) {
      toast.error('Please accept the Terms of Service to register.');
      return;
    }

    // Prefill full name on ID if not already edited
    if (!formData.fullNameOnId) {
      setFormData((prev) => ({ ...prev, fullNameOnId: prev.fullName }));
    }

    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 Validation -> Proceed to Step 3
  const handleStep2Next = () => {
    if (!formData.idType) {
      toast.error('Please select a valid Philippine ID type to proceed.');
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 3 Validation -> Proceed to Step 4
  const handleStep3Next = () => {
    if (!formData.idNumber.trim()) {
      toast.error('Please provide your valid ID number.');
      return;
    }

    if (!formData.fullNameOnId.trim()) {
      toast.error('Please enter your full name as it appears on your ID.');
      return;
    }

    if (!formData.dob) {
      toast.error('Please specify your Date of Birth.');
      return;
    }

    if (selectedIdConfig?.requiresExpiration && !formData.expirationDate) {
      toast.error('Please specify the Expiration Date printed on your ID.');
      return;
    }

    if (!formData.idDocumentDataUrl) {
      toast.error('Please upload a clear photo of your valid ID document.');
      return;
    }

    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 4 Validation & Trigger Biometric Verification -> Step 5
  const handleStartVerification = async () => {
    if (!formData.facialSelfieDataUrl) {
      toast.error('Please capture or upload your facial verification selfie.');
      return;
    }

    setCurrentStep(5);
    setIsVerifying(true);
    setVerificationProgressStep(1);

    try {
      // Animated inspection stages
      setTimeout(() => setVerificationProgressStep(2), 500);
      setTimeout(() => setVerificationProgressStep(3), 1000);
      setTimeout(() => setVerificationProgressStep(4), 1400);

      // Compress both images before sending to avoid browser localStorage quota issues (~50KB)
      const compressedIdDoc = await compressImageDataUrl(formData.idDocumentDataUrl);
      const compressedSelfie = await compressImageDataUrl(formData.facialSelfieDataUrl);

      const response = await verificationService.verifyIdentity({
        idType: formData.idType as PhilippineIdType,
        idNumber: formData.idNumber,
        fullNameOnId: formData.fullNameOnId,
        registrationFullName: formData.fullName,
        dob: formData.dob,
        expirationDate: formData.expirationDate || undefined,
        extraInfo: formData.extraInfo || undefined,
        idDocumentDataUrl: compressedIdDoc,
        facialSelfieDataUrl: compressedSelfie,
      });

      setIsVerifying(false);
      setVerificationResult(response);

      if (response.success && response.status === 'VERIFIED') {
        // Finalize user registration and save verification record as PENDING
        const registerSuccess = await register({
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          barangay: formData.barangay,
          municipality: formData.municipality,
          province: formData.province,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          acceptTerms: formData.acceptTerms,
          avatar: compressedSelfie,
          idType: formData.idType as PhilippineIdType,
          idNumber: formData.idNumber,
          fullNameOnId: formData.fullNameOnId,
          dob: formData.dob,
          expirationDate: formData.expirationDate || undefined,
          extraInfo: formData.extraInfo || undefined,
          idDocumentUrl: compressedIdDoc,
          faceImageUrl: compressedSelfie,
          verificationConfidence: response.confidenceScore,
        });

        if (registerSuccess) {
          setShowPendingNotification(true);
          toast('Verifying your profile please wait within an our', {
            icon: '⏳',
            duration: 8000,
            style: {
              fontWeight: 700,
              borderRadius: '12px',
              background: '#0f172a',
              color: '#ffffff',
            },
          });
        }
      } else {
        toast.error(response.rejectionReason || 'Verification check could not be completed.');
      }
    } catch (err: any) {
      setIsVerifying(false);
      setVerificationResult({
        success: false,
        status: 'RETRY_REQUIRED',
        confidenceScore: 0,
        rejectionReason: err.message || 'An unexpected verification error occurred.',
        retryInstructions: 'Please try taking a clearer photo in a brighter room.',
      });
      toast.error('Verification error. Please retry.');
    }
  };

  const handleRetryVerification = () => {
    setVerificationResult(null);
    setCurrentStep(4);
  };

  // Philippine ID Select Options
  const idSelectOptions = Object.keys(PHILIPPINE_ID_CONFIGS).map((key) => ({
    value: key,
    label: PHILIPPINE_ID_CONFIGS[key as PhilippineIdType].label,
  }));

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Verify your identity with a valid Philippine ID to keep our community safe"
      wide
    >
      {/* 5-Step Progress Stepper */}
      <RegistrationStepper
        currentStep={currentStep}
        onStepClick={(step) => {
          if (step < currentStep) setCurrentStep(step);
        }}
      />

      {error && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: 'var(--color-danger)',
            fontSize: '0.8125rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* ============================================================
          STEP 1: Account Information
          ============================================================ */}
      {currentStep === 1 && (
        <form onSubmit={handleStep1Next} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ paddingBottom: '0.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
              Step 1: Account Information
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0' }}>
              Enter your basic contact and community location details.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <Input
              label="Full Name (Legal Name)"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="Juan Dela Cruz"
              leftIcon={<User className="w-4 h-4" />}
              required
            />
            <Input
              label="Username"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              placeholder="juandc"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="juan@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+63 912 345 6789"
              leftIcon={<Phone className="w-4 h-4" />}
              required
            />
          </div>

          <Input
            label="Street Address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="123 Rizal St."
            leftIcon={<MapPin className="w-4 h-4" />}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <Input
              label="Barangay"
              value={formData.barangay}
              onChange={(e) => handleChange('barangay', e.target.value)}
              required
            />
            <Input
              label="Municipality / City"
              value={formData.municipality}
              onChange={(e) => handleChange('municipality', e.target.value)}
              required
            />
            <Input
              label="Province"
              value={formData.province}
              onChange={(e) => handleChange('province', e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
          </div>

          <div style={{ paddingTop: '0.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', cursor: 'pointer', userSelect: 'none', fontSize: '0.75rem', color: 'var(--color-neutral-600)' }}>
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => handleChange('acceptTerms', e.target.checked)}
                style={{ marginTop: '0.125rem', width: '1rem', height: '1rem', borderRadius: '0.25rem', accentColor: 'var(--color-primary-600)' }}
                required
              />
              <span>
                I accept the{' '}
                <Link to="/terms" className="text-primary-600 underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 underline">
                  Privacy Policy
                </Link>.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="font-bold shadow-button"
          >
            Continue to Valid ID Selection
          </Button>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-neutral-600)', margin: 0 }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ fontWeight: 600, color: 'var(--color-primary-600)', textDecoration: 'none' }}
            >
              Log In
            </Link>
          </p>
        </form>
      )}

      {/* ============================================================
          STEP 2: Valid ID Requirement Selection
          ============================================================ */}
      {currentStep === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
              Step 2: Select Your Valid Philippine ID
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0' }}>
              Choose an official government-issued ID to verify your identity.
            </p>
          </div>

          {/* Identity Trust Notice */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(232, 245, 233, 0.7)',
              border: '1px solid var(--color-primary-200)',
              display: 'flex',
              gap: '0.75rem',
            }}
          >
            <ShieldCheck style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-primary-700)', flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary-900)', margin: 0 }}>
                Why ID Verification is Required
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-primary-800)', margin: '0.25rem 0 0 0', lineHeight: 1.5 }}>
                Bayanihan Hub protects donors and recipients by verifying that all participating neighbors are authentic. ID numbers are stored securely with strict encryption and masked for privacy.
              </p>
            </div>
          </div>

          {/* Valid ID Type Dropdown (Required) */}
          <div>
            <Select
              label="Valid ID Type"
              required
              options={idSelectOptions}
              value={formData.idType}
              onChange={(e) => handleChange('idType', e.target.value)}
              placeholder="-- Select your Valid Philippine ID --"
            />
            {selectedIdConfig && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-primary-700)', marginTop: '0.375rem', fontWeight: 500 }}>
                ℹ️ {selectedIdConfig.helpText}
              </p>
            )}
          </div>

          {/* Quick ID Highlights Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)', backgroundColor: '#fff', fontSize: '0.75rem' }}>
              <p style={{ fontWeight: 700, color: 'var(--color-neutral-800)', margin: 0 }}>Primary National IDs</p>
              <p style={{ color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0' }}>PhilSys National ID, Passport, Driver's License, UMID, Postal ID</p>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)', backgroundColor: '#fff', fontSize: '0.75rem' }}>
              <p style={{ fontWeight: 700, color: 'var(--color-neutral-800)', margin: 0 }}>Sectoral & Social IDs</p>
              <p style={{ color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0' }}>PRC, Senior Citizen, PWD, SSS, GSIS, TIN, PhilHealth, School ID</p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', paddingTop: '0.5rem' }}>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCurrentStep(1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Account
            </Button>

            <Button
              variant="primary"
              size="lg"
              disabled={!formData.idType}
              onClick={handleStep2Next}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="font-bold shadow-button"
            >
              Continue to ID Information
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================
          STEP 3: Dynamic ID Information & Document Upload
          ============================================================ */}
      {currentStep === 3 && selectedIdConfig && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
              Step 3: {selectedIdConfig.label} Details
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0' }}>
              Provide the exact identification numbers and upload a photo of your card.
            </p>
          </div>

          {/* Full Name on ID */}
          <Input
            label="Full Name on ID"
            value={formData.fullNameOnId}
            onChange={(e) => handleChange('fullNameOnId', e.target.value)}
            placeholder="As printed on your card/document"
            leftIcon={<User className="w-4 h-4" />}
            helperText="Must match the name printed on your physical ID"
            required
          />

          {/* Dynamic ID Number Field */}
          <Input
            label={selectedIdConfig.numberLabel}
            value={formData.idNumber}
            onChange={(e) => handleChange('idNumber', e.target.value)}
            placeholder={selectedIdConfig.formatPlaceholder}
            leftIcon={<CreditCard className="w-4 h-4" />}
            helperText={selectedIdConfig.formatHint}
            required
          />

          {/* Date of Birth & Expiration Date */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <Input
              label="Date of Birth"
              type="date"
              value={formData.dob}
              onChange={(e) => handleChange('dob', e.target.value)}
              leftIcon={<Calendar className="w-4 h-4" />}
              required
            />

            {selectedIdConfig.requiresExpiration ? (
              <Input
                label="Expiration Date"
                type="date"
                value={formData.expirationDate}
                onChange={(e) => handleChange('expirationDate', e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
                required
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>
                  Expiration Date
                </label>
                <div
                  style={{
                    height: '2.5rem',
                    padding: '0 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-neutral-100)',
                    border: '1px solid var(--color-neutral-200)',
                    fontSize: '0.8125rem',
                    color: 'var(--color-neutral-600)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  Lifetime Validity / No Expiration
                </div>
              </div>
            )}
          </div>

          {/* Optional Extra ID Specific Field */}
          {selectedIdConfig.extraFieldLabel && (
            <Input
              label={selectedIdConfig.extraFieldLabel}
              value={formData.extraInfo}
              onChange={(e) => handleChange('extraInfo', e.target.value)}
              placeholder={selectedIdConfig.extraFieldPlaceholder}
            />
          )}

          {/* ID Document Uploader */}
          <div style={{ paddingTop: '0.5rem' }}>
            <IdDocumentUploader
              idType={selectedIdConfig.label}
              documentDataUrl={formData.idDocumentDataUrl}
              onDocumentChange={(dataUrl) => handleChange('idDocumentDataUrl', dataUrl)}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', paddingTop: '0.5rem' }}>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCurrentStep(2)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to ID Selection
            </Button>

            <Button
              variant="primary"
              size="lg"
              disabled={!formData.idNumber || !formData.dob || !formData.idDocumentDataUrl}
              onClick={handleStep3Next}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="font-bold shadow-button"
            >
              Proceed to Facial Verification
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================
          STEP 4: Live Facial Verification Camera
          ============================================================ */}
      {currentStep === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
              Step 4: Facial Verification
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0 0' }}>
              We will cross-verify your live selfie with your uploaded {formData.idType || 'ID'} to confirm your identity.
            </p>
          </div>

          {/* Facial Camera Component */}
          <FacialVerificationCamera
            selfieDataUrl={formData.facialSelfieDataUrl}
            onCapture={(dataUrl) => handleChange('facialSelfieDataUrl', dataUrl)}
            onRetake={() => handleChange('facialSelfieDataUrl', '')}
          />

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', paddingTop: '0.5rem' }}>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCurrentStep(3)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to ID Details
            </Button>

            <Button
              variant="primary"
              size="lg"
              disabled={!formData.facialSelfieDataUrl}
              onClick={handleStartVerification}
              rightIcon={<ShieldCheck className="w-5 h-5" />}
              className="font-bold shadow-button"
            >
              Submit Registration
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================
          STEP 5: Verification Processing & Result State
          ============================================================ */}
      {currentStep === 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1rem 0', gap: '1.5rem' }}>
          {isVerifying ? (
            /* Analyzing Biometric Animation State */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', maxWidth: '28rem' }}>
              <div
                style={{
                  width: '5rem',
                  height: '5rem',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--color-primary-50)',
                  color: 'var(--color-primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 1.5s infinite',
                }}
              >
                <RefreshCw style={{ width: '2.5rem', height: '2.5rem', animation: 'spin 2s linear infinite' }} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>
                  Analyzing Biometric Identity
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
                  Please hold on while our automated verification engine analyzes your document and facial match.
                </p>
              </div>

              {/* Progress Inspection Steps */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.625rem', textAlign: 'left', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.75rem', color: verificationProgressStep >= 1 ? 'var(--color-primary-700)' : 'var(--color-neutral-400)' }}>
                  <CheckCircle2 style={{ width: '1rem', height: '1rem', color: verificationProgressStep >= 1 ? 'var(--color-primary-600)' : 'var(--color-neutral-300)' }} />
                  <span>Checking {formData.idType} document structure and clarity...</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.75rem', color: verificationProgressStep >= 2 ? 'var(--color-primary-700)' : 'var(--color-neutral-400)' }}>
                  <CheckCircle2 style={{ width: '1rem', height: '1rem', color: verificationProgressStep >= 2 ? 'var(--color-primary-600)' : 'var(--color-neutral-300)' }} />
                  <span>Extracting facial landmarks and biometric descriptors...</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.75rem', color: verificationProgressStep >= 3 ? 'var(--color-primary-700)' : 'var(--color-neutral-400)' }}>
                  <CheckCircle2 style={{ width: '1rem', height: '1rem', color: verificationProgressStep >= 3 ? 'var(--color-primary-600)' : 'var(--color-neutral-300)' }} />
                  <span>Cross-comparing ID photo with captured facial selfie...</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.75rem', color: verificationProgressStep >= 4 ? 'var(--color-primary-700)' : 'var(--color-neutral-400)' }}>
                  <CheckCircle2 style={{ width: '1rem', height: '1rem', color: verificationProgressStep >= 4 ? 'var(--color-primary-600)' : 'var(--color-neutral-300)' }} />
                  <span>Confirming name consistency and active community status...</span>
                </div>
              </div>
            </div>
          ) : verificationResult?.success ? (
            /* Big Notification State: "Verifying your profile please wait within an our" */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', maxWidth: '32rem', width: '100%' }}>
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    width: '6.5rem',
                    height: '6.5rem',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                  }}
                />
                <div
                  style={{
                    width: '5rem',
                    height: '5rem',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    border: '2px solid #f59e0b',
                    color: '#b45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.3)',
                  }}
                >
                  <Clock style={{ width: '2.5rem', height: '2.5rem', strokeWidth: 2.2 }} />
                </div>
              </div>

              <div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.375rem 0.875rem',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    color: '#92400e',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    marginBottom: '0.75rem',
                  }}
                >
                  <span
                    style={{
                      width: '0.5rem',
                      height: '0.5rem',
                      borderRadius: '9999px',
                      backgroundColor: '#f59e0b',
                      display: 'inline-block',
                    }}
                  />
                  VERIFICATION PENDING • ESTIMATED WAIT: WITHIN 1 HOUR
                </span>

                {/* Big Notification Headline (Exact user-requested string) */}
                <h2
                  style={{
                    fontSize: '1.625rem',
                    fontWeight: 800,
                    color: 'var(--color-neutral-900)',
                    lineHeight: 1.25,
                    margin: '0 0 0.5rem 0',
                    letterSpacing: '-0.025em',
                  }}
                >
                  Verifying your profile please wait within an our
                </h2>

                <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', margin: 0, lineHeight: 1.6 }}>
                  Thank you for submitting your registration, <strong>{formData.fullName}</strong>. We have securely received your <strong>{formData.idType}</strong> and facial biometric photo. Our barangay safety moderators and automated verification engine are currently processing your credentials.
                </p>
              </div>

              {/* Overview Card */}
              <div
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-xl)',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  textAlign: 'left',
                  fontSize: '0.8125rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Applicant Name
                  </span>
                  <p style={{ margin: '0.125rem 0 0 0', fontWeight: 700, color: '#0f172a' }}>
                    {formData.fullName}
                  </p>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Valid ID Type
                  </span>
                  <p style={{ margin: '0.125rem 0 0 0', fontWeight: 700, color: '#0f172a' }}>
                    {formData.idType || 'Philippine ID'}
                  </p>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Masked ID Number
                  </span>
                  <p style={{ margin: '0.125rem 0 0 0', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                    {maskIdNumber(formData.idNumber)}
                  </p>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Expected Review Time
                  </span>
                  <p style={{ margin: '0.125rem 0 0 0', fontWeight: 700, color: '#b45309' }}>
                    Within an hour
                  </p>
                </div>
              </div>

              {/* Safety Badge Info */}
              <div
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  color: '#065f46',
                }}
              >
                <ShieldCheck style={{ width: '1.5rem', height: '1.5rem', color: '#059669', flexShrink: 0 }} />
                <span>
                  Once verified, your profile will automatically receive the <strong>Verified Neighbor 🛡️</strong> badge and full community exchange privileges.
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => navigate('/pending-verification')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="font-bold shadow-button"
                >
                  View Pending Verification Page
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => navigate('/login')}
                >
                  Return to Login
                </Button>
              </div>
            </div>
          ) : (
            /* Failure / Retry Required State */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', maxWidth: '28rem' }}>
              <div
                style={{
                  width: '4.5rem',
                  height: '4.5rem',
                  borderRadius: '9999px',
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertCircle style={{ width: '2.5rem', height: '2.5rem' }} />
              </div>

              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                  }}
                >
                  VERIFICATION FAILED • {verificationResult?.status || 'RETRY_REQUIRED'}
                </span>
                <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0 }}>
                  Unable to Verify Identity
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)', marginTop: '0.375rem', lineHeight: 1.5 }}>
                  {verificationResult?.rejectionReason || 'The facial biometric features did not match the photo on the provided ID.'}
                </p>
              </div>

              {verificationResult?.retryInstructions && (
                <div
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    textAlign: 'left',
                    fontSize: '0.75rem',
                    color: '#92400e',
                  }}
                >
                  <strong>How to resolve:</strong> {verificationResult.retryInstructions}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => setCurrentStep(3)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Change ID / Details
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleRetryVerification}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  className="font-bold shadow-button"
                >
                  Retry Facial Check
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* ============================================================
          BIG NOTIFICATION OVERLAY MODAL: "Verifying your profile please wait within an our"
          ============================================================ */}
      {showPendingNotification && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '32rem',
              backgroundColor: '#ffffff',
              borderRadius: '1.75rem',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setShowPendingNotification(false);
                navigate('/pending-verification');
              }}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                padding: '0.5rem',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Dismiss Notification"
            >
              <X style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>

            {/* Glowing Ring & Clock Icon */}
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  position: 'absolute',
                  width: '6.5rem',
                  height: '6.5rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(245, 158, 11, 0.25)',
                  animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                }}
              />
              <div
                style={{
                  width: '5rem',
                  height: '5rem',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  border: '2px solid #f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b45309',
                  boxShadow: '0 10px 20px -3px rgba(245, 158, 11, 0.35)',
                }}
              >
                <Clock style={{ width: '2.5rem', height: '2.5rem', strokeWidth: 2.2 }} />
              </div>
            </div>

            {/* Pill Tag */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.875rem',
                borderRadius: '9999px',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#92400e',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <span
                style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: '#f59e0b',
                  display: 'inline-block',
                }}
              />
              Verification In Progress
            </div>

            {/* Big Notification Headline (Exact user requested string) */}
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.25,
                margin: 0,
                letterSpacing: '-0.025em',
              }}
            >
              Verifying your profile please wait within an our
            </h2>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '0.9375rem',
                color: '#475569',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Thank you for completing your registration, <strong>{formData.fullName}</strong>. We have securely received your <strong>{formData.idType || 'Philippine ID'}</strong> and live facial selfie. Our community verification team will review and approve your profile within an hour.
            </p>

            {/* Overview Box */}
            <div
              style={{
                width: '100%',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '1rem',
                padding: '1rem 1.25rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                textAlign: 'left',
                fontSize: '0.8125rem',
              }}
            >
              <div>
                <span style={{ color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 600 }}>
                  Applicant
                </span>
                <p style={{ margin: '0.125rem 0 0 0', fontWeight: 700, color: '#0f172a' }}>
                  {formData.fullName}
                </p>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 600 }}>
                  Valid ID
                </span>
                <p style={{ margin: '0.125rem 0 0 0', fontWeight: 700, color: '#0f172a' }}>
                  {formData.idType}
                </p>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 600 }}>
                  ID Number
                </span>
                <p style={{ margin: '0.125rem 0 0 0', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                  {maskIdNumber(formData.idNumber)}
                </p>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: 600 }}>
                  Estimated Wait
                </span>
                <p style={{ margin: '0.125rem 0 0 0', fontWeight: 700, color: '#b45309' }}>
                  Within 1 hour
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => {
                  setShowPendingNotification(false);
                  navigate('/pending-verification');
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="font-bold shadow-button"
              >
                View Pending Verification Page
              </Button>

              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => {
                  setShowPendingNotification(false);
                  navigate('/login');
                }}
              >
                Return to Login
              </Button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
