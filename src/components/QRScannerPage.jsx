import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { QrCode, X, CheckCircle, LogIn, LogOut, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { playClockInSound, playClockOutSound } from '@/lib/audioUtils';

const QRScannerPage = ({ onBackToLogin }) => {
  const [status, setStatus] = useState('scanning'); // scanning, verifying, success, error
  const [message, setMessage] = useState('Veuillez scanner votre QR Code');
  const [messageStyle, setMessageStyle] = useState('text-muted-foreground');
  const [actionType, setActionType] = useState(''); // 'in' or 'out'
  const scannerRef = useRef(null);

  const resetScanner = useCallback(() => {
    setActionType('');
    setStatus('scanning');
    setMessage('Veuillez scanner votre QR Code');
    setMessageStyle('text-muted-foreground');
  }, []);

  const handleScanVerification = useCallback(async (userId) => {
    setStatus('verifying');
    setMessage('Vérification en cours...');
    setMessageStyle('text-muted-foreground');

    try {
      const { data, error } = await supabase.functions.invoke('record-time-entry', {
        body: { userId },
      });
      
      if (error) {
        throw new Error(`Erreur de fonction Edge : ${error.message}`);
      }

      if (data.error) {
        throw new Error(data.error);
      }
      
      setActionType(data.action);
      
      if (data.action === 'in') {
        setMessage("Pointage d'entrée enregistré avec succès");
        setMessageStyle('text-green-500 font-semibold');
        playClockInSound();
      } else {
        setMessage("Pointage de sortie enregistré avec succès");
        setMessageStyle('text-red-500 font-semibold');
        playClockOutSound();
      }

      setStatus('success');
      setTimeout(resetScanner, 2000);

    } catch (error) {
      console.error("Verification failed:", error);
      setStatus('error');
      setMessage(error.message || "Une erreur est survenue.");
      setMessageStyle('text-red-500 font-semibold');
      setTimeout(resetScanner, 2000);
    }
  }, [resetScanner]);

  useEffect(() => {
    let html5Qrcode;
    if (status === 'scanning' && !scannerRef.current) {
      html5Qrcode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5Qrcode;
      
      const onScanSuccess = (decodedText) => {
        if (status === 'scanning') {
          handleScanVerification(decodedText);
        }
      };
      
      html5Qrcode.start(
        { facingMode: "environment" }, 
        { fps: 25, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true, supportedScanTypes: [0] },
        onScanSuccess,
        (errorMessage) => {}
      ).catch(err => {
        console.error("Unable to start scanner", err);
        setStatus('error');
        setMessage("Impossible d'activer la caméra.");
        toast({
          title: "Erreur de caméra",
          description: "Vérifiez que vous avez autorisé l'accès à la caméra.",
          variant: "destructive"
        });
      });
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
        scannerRef.current = null;
      }
    };
  }, [status, handleScanVerification]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white relative">
      <Button onClick={onBackToLogin} variant="ghost" className="absolute top-4 left-4">
        <ArrowLeft className="mr-2" /> Retour
      </Button>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-black/30 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20"
      >
        <div className="text-center mb-6">
          <QrCode className="mx-auto h-12 w-12 text-primary mb-2" />
          <h1 className="text-3xl font-bold">Pointage Automatique</h1>
          <p className={`h-6 transition-colors duration-300 ${messageStyle}`}>{message}</p>
        </div>

        <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-black flex items-center justify-center mb-6">
          <AnimatePresence mode="wait">
            {status === 'scanning' && (
              <motion.div
                key="scanner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <div id="qr-reader" className="w-full h-full"></div>
                <div className="absolute inset-0 border-4 border-dashed border-primary/50 rounded-lg animate-pulse"></div>
              </motion.div>
            )}
            {status === 'verifying' && (
              <motion.div key="verifying" className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </motion.div>
            )}
            {(status === 'success' || status === 'error') && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="text-center"
              >
                {status === 'success' ? (
                  <>
                    <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-4" />
                    {actionType === 'in' ? <LogIn className="h-12 w-12 mx-auto text-green-400" /> : <LogOut className="h-12 w-12 mx-auto text-red-400" />}
                  </>
                ) : (
                  <X className="h-24 w-24 text-red-500 mx-auto mb-4" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default QRScannerPage;