"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import jsQR from 'jsqr';

import { 
  QrCode, 
  Camera, 
  X, 
  CheckCircle, 
  AlertTriangle
} from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (data: any) => void;
  onCancel: () => void;
  mode?: 'checkin' | 'checkout' | 'verification';
}

export function QRScanner({ onScanSuccess, onCancel, mode = 'checkin' }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanningRef = useRef<boolean>(false);

  const startCamera = async () => {
    try {
      setError(null);
      
      // Check if we're in a secure context (HTTPS or localhost)
      if (!window.isSecureContext) {
        setError('Camera access requires HTTPS. Please use a secure connection.');
        return;
      }

      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported in this browser.');
        return;
      }
      
      // Try different camera configurations for better mobile compatibility
      let mediaStream;
      
      try {
        // Mobile-optimized constraints
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { ideal: 'environment' }, // Prefer back camera
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30, max: 60 }
          },
          audio: false,
        });
      } catch (backCameraError) {
        console.warn('Back camera failed, trying front camera:', backCameraError);
        try {
          // Try front camera
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { 
              facingMode: 'user',
              width: { ideal: 640, max: 1280 },
              height: { ideal: 480, max: 720 }
            },
            audio: false,
          });
        } catch (frontCameraError) {
          console.warn('Front camera failed, trying any camera:', frontCameraError);
          // Final fallback - any available camera
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 }
            },
            audio: false,
          });
        }
      }
      
      setStream(mediaStream);
      setIsScanning(true);
      
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = mediaStream;
        
        // Mobile-specific video attributes
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.muted = true;
        
        // Wait for video to be ready
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Video load timeout')), 10000);
          
          video.onloadedmetadata = () => {
            clearTimeout(timeout);
            resolve(undefined);
          };
          
          video.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Video load error'));
          };
        });
        
        await video.play();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Camera access failed: ${errorMessage}. Please ensure you're using HTTPS and have granted camera permissions.`);
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const scanQRCode = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !scanningRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      // Slower retry for mobile performance
      setTimeout(() => {
        if (scanningRef.current) scanQRCode();
      }, 100);
      return;
    }

    // Optimize canvas size for mobile performance
    const scale = Math.min(1, 600 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Use jsQR with mobile-optimized settings
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert", // Faster scanning
      });

      if (code) {
        console.log('QR Code detected:', code.data);
        setScanning(false);
        scanningRef.current = false;
        
        // Process the QR code data
        processQRCode(code.data);
      } else if (scanningRef.current) {
        // Reduced frequency for mobile performance (200ms instead of 16ms)
        setTimeout(() => {
          if (scanningRef.current) scanQRCode();
        }, 200);
      }
    } catch (error) {
      console.error('QR detection failed:', error);
      if (scanningRef.current) {
        setTimeout(() => {
          if (scanningRef.current) scanQRCode();
        }, 500); // Longer delay on error
      }
    }
  }, []);

  const startScanning = () => {
    setScanning(true);
    scanningRef.current = true;
    scanQRCode();
  };

  const stopScanning = () => {
    setScanning(false);
    scanningRef.current = false;
  };

  const processQRCode = (qrData: string) => {
    try {
      let parsedData;
      
      if (qrData.startsWith('http')) {
        // Handle invitation links
        const url = new URL(qrData);
        const token = url.pathname.split('/').pop();
        parsedData = {
          type: 'invitation',
          token,
          valid: true,
          message: 'Invitation link scanned'
        };
      } else if (qrData.startsWith('VISIT_')) {
        // Handle digital pass QR codes
        const [, visitId] = qrData.split('_');
        parsedData = {
          type: 'digital_pass',
          visitId,
          valid: true,
          message: 'Guest ready for checkout'
        };
      } else {
        // Try to parse as JSON for other QR codes
        parsedData = JSON.parse(qrData);
      }

      setScanResult(parsedData);
    } catch {
      setError('Invalid QR code format');
    }
  };



  const handleConfirm = () => {
    if (scanResult) {
      onScanSuccess(scanResult);
      stopCamera();
    }
  };

  const handleRetry = () => {
    setScanResult(null);
    setError(null);
    startCamera();
  };

  useEffect(() => {
    return () => {
      stopScanning();
      stopCamera();
    };
  }, []);

  // Auto-start scanning when camera starts
  useEffect(() => {
    if (stream && videoRef.current && !scanning) {
      const video = videoRef.current;
      const onLoadedData = () => {
        startScanning();
      };
      video.addEventListener('loadeddata', onLoadedData);
      return () => video.removeEventListener('loadeddata', onLoadedData);
    }
  }, [stream, scanning, startScanning]);

  const getScanModeTitle = () => {
    switch (mode) {
      case 'checkin': return 'Scan Invitation QR Code';
      case 'checkout': return 'Scan Digital Pass for Checkout';
      case 'verification': return 'Scan Guest QR Code';
      default: return 'QR Code Scanner';
    }
  };

  const getScanModeDescription = () => {
    switch (mode) {
      case 'checkin': return 'Scan the invitation QR code to check in a pre-registered guest';
      case 'checkout': return 'Scan the guest\'s digital pass to complete checkout';
      case 'verification': return 'Scan any guest QR code to verify their status';
      default: return 'Scan a QR code to continue';
    }
  };

  if (scanResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            QR Code Scanned Successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  {scanResult.message}
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-green-700">
                    <strong>Type:</strong> {scanResult.type}
                  </p>
                  {scanResult.guestName && (
                    <p className="text-xs text-green-700">
                      <strong>Guest:</strong> {scanResult.guestName}
                    </p>
                  )}
                  {scanResult.token && (
                    <p className="text-xs text-green-700">
                      <strong>Token:</strong> {scanResult.token}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleConfirm} className="flex-1">
              Continue with {mode === 'checkin' ? 'Check-in' : mode === 'checkout' ? 'Checkout' : 'Verification'}
            </Button>
            <Button variant="outline" onClick={handleRetry}>
              Scan Again
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          {getScanModeTitle()}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {getScanModeDescription()}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {!isScanning ? (
          <div className="text-center space-y-6">
            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
            </div>
            <div className="space-y-4">
              <p className="text-responsive text-gray-600">
                Ready to scan QR codes
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={startCamera}
                  className="touch-target px-6 py-3"
                  size="lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Camera
                </Button>
                <Button 
                  onClick={() => {
                    const sampleResult = {
                      type: 'invitation',
                      token: 'sample-invite-123',
                      guestName: 'James Kariuki',
                      valid: true,
                      message: 'Invitation recognised'
                    };
                    setScanResult(sampleResult);
                  }}
                  variant="outline"
                  className="touch-target px-6 py-3"
                  size="lg"
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Use sample code
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full object-cover"
                style={{ 
                  maxHeight: '60vh',
                  minHeight: '250px',
                  aspectRatio: '4/3'
                }}
              />
              
              {/* QR Code overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-48 h-48 sm:w-56 sm:h-56 border-2 rounded-lg ${
                  scanning ? 'border-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'border-blue-400'
                } opacity-80`}>
                  <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 ${
                    scanning ? 'border-green-400' : 'border-blue-400'
                  }`}></div>
                  <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 ${
                    scanning ? 'border-green-400' : 'border-blue-400'
                  }`}></div>
                  <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 ${
                    scanning ? 'border-green-400' : 'border-blue-400'
                  }`}></div>
                  <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 ${
                    scanning ? 'border-green-400' : 'border-blue-400'
                  }`}></div>
                </div>
                {scanning && (
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse shadow-lg">
                      Scanning for QR codes...
                    </div>
                  </div>
                )}
              </div>
              
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Position the QR code within the frame
              </p>
                             <div className="flex gap-2 justify-center">
                 <Button variant="outline" onClick={scanning ? stopScanning : startScanning}>
                   <QrCode className="w-4 h-4 mr-2" />
                   {scanning ? 'Stop Scanning' : 'Start Scanning'}
                 </Button>
                 <Button variant="outline" onClick={stopCamera}>
                   <X className="w-4 h-4 mr-2" />
                   Stop Camera
                 </Button>
                 <Button variant="outline" onClick={onCancel}>
                   Cancel
                 </Button>
               </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 