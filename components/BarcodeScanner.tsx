import React, { useEffect, useRef, useState } from 'react';
import { CloseIcon } from './Icons';
import { useTranslations } from '../contexts';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

// Type guard to check if the browser supports BarcodeDetector
const isBarcodeDetectorSupported = (): boolean => 'BarcodeDetector' in window;

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslations();

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const startScan = async () => {
      if (!isBarcodeDetectorSupported()) {
        setError('Barcode detection is not supported in this browser.');
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_39', 'code_128', 'qr_code'],
        });

        const detect = async () => {
          if (videoRef.current && videoRef.current.readyState === 4) {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              onScan(barcodes[0].rawValue);
            } else {
              animationFrameId = requestAnimationFrame(detect);
            }
          } else {
             animationFrameId = requestAnimationFrame(detect);
          }
        };
        detect();

      } catch (err) {
        console.error('Error accessing camera:', err);
        if (err instanceof Error) {
            if (err.name === 'NotAllowedError') {
                setError('Camera permission denied. Please enable it in your browser settings.');
            } else {
                setError(`Could not start camera: ${err.message}`);
            }
        }
      }
    };

    startScan();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <video ref={videoRef} className="absolute top-0 left-0 w-full h-full object-cover" playsInline />
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50"></div>
      
      <div className="relative z-10 text-white text-center p-4">
        <div className="absolute top-1/2 left-1/2 w-11/12 max-w-sm h-48 -translate-x-1/2 -translate-y-1/2 border-4 border-white border-dashed rounded-lg"></div>
        <p className="font-bold text-lg mb-4">{t('scanProductBarcode')}</p>
        {error && (
            <div className="bg-red-500/80 p-3 rounded-md mb-4 max-w-sm mx-auto">
                <p>{error}</p>
            </div>
        )}
      </div>

      <button
        onClick={onClose}
        className="absolute bottom-10 z-10 bg-white text-gray-800 font-bold py-3 px-6 rounded-lg shadow-lg"
      >
        {t('cancel')}
      </button>

       <button onClick={onClose} className="absolute top-5 right-5 z-10 text-white bg-black/30 rounded-full p-2">
            <CloseIcon className="h-6 w-6"/>
       </button>
    </div>
  );
};
