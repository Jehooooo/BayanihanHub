// ============================================================
// Bayanihan Hub — Facial Verification Camera Component
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertTriangle, Sparkles, Upload, Eye } from 'lucide-react';
import Button from '@/components/ui/Button';

interface FacialVerificationCameraProps {
  selfieDataUrl?: string;
  onCapture: (dataUrl: string) => void;
  onRetake: () => void;
}

export default function FacialVerificationCamera({
  selfieDataUrl,
  onCapture,
  onRetake,
}: FacialVerificationCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser. Please upload a selfie image below.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 720 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      setStream(mediaStream);
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access denied or failed:', err);
      setCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera permissions in your browser or upload a face selfie.');
      } else {
        setCameraError(err.message || 'Unable to access camera. You can upload a photo of your face instead.');
      }
    }
  }, []);

  // Clean up camera stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  useEffect(() => {
    if (!selfieDataUrl) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [selfieDataUrl, startCamera, stopCamera]);

  // Handle capture with optional flash animation
  const handleSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    setCountdown(3);

    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(null);
        performCapture();
      }
    }, 600);
  };

  const performCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Center crop to 1:1 square
    const startX = ((video.videoWidth || 480) - size) / 2;
    const startY = ((video.videoHeight || 480) - size) / 2;

    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    stopCamera();
    setIsCapturing(false);
    onCapture(dataUrl);
  };

  const handleRetakeClick = () => {
    onRetake();
    startCamera();
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        stopCamera();
        onCapture(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Instructions header */}
      <div
        style={{
          padding: '1rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          display: 'flex',
          gap: '0.75rem',
        }}
      >
        <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: '#2563eb', flexShrink: 0, marginTop: '0.125rem' }} />
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e3a8a', margin: 0 }}>
            Verify Your Identity
          </h4>
          <p style={{ fontSize: '0.75rem', color: '#1e40af', margin: '0.25rem 0 0 0', lineHeight: 1.5 }}>
            Please position your face inside the frame. Make sure you are in a well-lit area and your face is clearly visible without sunglasses or face coverings.
          </p>
        </div>
      </div>

      {/* Camera Viewport or Captured Selfie Preview */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '22rem',
          margin: '0 auto',
          aspectRatio: '1/1',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          backgroundColor: '#0f172a',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          border: '3px solid var(--color-primary-500)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!selfieDataUrl ? (
          <>
            {/* Live Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)', // Mirror user's webcam for natural feel
              }}
            />

            {/* Oval Face Positioning Guide Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  width: '65%',
                  height: '82%',
                  borderRadius: '50%',
                  border: isCapturing ? '3px solid #22c55e' : '2.5px dashed rgba(255,255,255,0.85)',
                  boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.45)',
                  transition: 'border 200ms ease-in-out',
                }}
              />
            </div>

            {/* Countdown Banner */}
            {countdown !== null && (
              <div
                style={{
                  position: 'absolute',
                  fontSize: '4rem',
                  fontWeight: 900,
                  color: '#fff',
                  textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                  animation: 'pulse 0.5s infinite',
                }}
              >
                {countdown}
              </div>
            )}

            {/* Alignment prompt */}
            <div
              style={{
                position: 'absolute',
                bottom: '1rem',
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(6px)',
                color: '#fff',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <Eye style={{ width: '0.875rem', height: '0.875rem', color: 'var(--color-primary-400)' }} />
              Look straight into camera
            </div>
          </>
        ) : (
          /* Captured Snapshot Preview */
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <img
              src={selfieDataUrl}
              alt="Captured Facial Selfie"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                backgroundColor: '#22c55e',
                color: '#fff',
                padding: '0.25rem 0.625rem',
                borderRadius: '9999px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              }}
            >
              <CheckCircle style={{ width: '0.75rem', height: '0.75rem' }} />
              Selfie Captured
            </div>
          </div>
        )}
      </div>

      {/* Camera controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        {!selfieDataUrl ? (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={handleSnap}
              disabled={!cameraActive || isCapturing}
              leftIcon={<Camera style={{ width: '1.25rem', height: '1.25rem' }} />}
              className="font-bold px-8 shadow-button"
            >
              {isCapturing ? 'Capturing...' : 'Capture Face Photo'}
            </Button>

            {!cameraActive && (
              <Button
                variant="outline"
                size="lg"
                onClick={startCamera}
                leftIcon={<RefreshCw style={{ width: '1.125rem', height: '1.125rem' }} />}
              >
                Retry Camera
              </Button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              variant="outline"
              size="md"
              onClick={handleRetakeClick}
              leftIcon={<RefreshCw style={{ width: '1rem', height: '1rem' }} />}
            >
              Retake Photo
            </Button>
          </div>
        )}

        {/* Fallback File Upload (if camera fails or user device has issues) */}
        {(!cameraActive || cameraError) && !selfieDataUrl && (
          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleManualUpload}
              style={{ display: 'none' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginBottom: '0.5rem' }}>
              Camera not working on your device?
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              leftIcon={<Upload style={{ width: '0.875rem', height: '0.875rem' }} />}
            >
              Upload Face Selfie Instead
            </Button>
          </div>
        )}

        {/* Error message */}
        {cameraError && !selfieDataUrl && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              color: '#b45309',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              maxWidth: '26rem',
            }}
          >
            <AlertTriangle style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0 }} />
            <span>{cameraError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
