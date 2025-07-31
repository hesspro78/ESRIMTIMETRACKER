import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { QrCode, CheckCircle, LogIn, LogOut, Clock, Settings } from 'lucide-react';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import QRScannerPage from './QRScannerPage';

const ClockingInterface = ({ onAdminAccess }) => {
  const { appName, appLogo } = useAppSettings();
  const [view, setView] = useState('main'); // 'main' or 'scanner'
  const [confirmation, setConfirmation] = useState(null);
  const [adminKeySequence, setAdminKeySequence] = useState('');

  // Gestion des raccourcis clavier pour l'accès admin
  useEffect(() => {
    const handleKeyPress = (e) => {
      const newSequence = adminKeySequence + e.key.toLowerCase();
      setAdminKeySequence(newSequence);
      
      // Vérifier si la séquence "admin" a été tapée
      if (newSequence.includes('admin')) {
        onAdminAccess();
        setAdminKeySequence('');
      } else if (newSequence.length > 10) {
        // Réinitialiser si trop long
        setAdminKeySequence('');
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [adminKeySequence, onAdminAccess]);

  // Auto-reset après timeout de séquence
  useEffect(() => {
    const timer = setTimeout(() => {
      setAdminKeySequence('');
    }, 3000);
    return () => clearTimeout(timer);
  }, [adminKeySequence]);

  const handleScanSuccess = (userInfo, actionType) => {
    setView('main');
    setConfirmation({
      userName: userInfo.userName || 'Utilisateur',
      actionType,
      time: new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    });

    // Retour automatique après 3 secondes
    setTimeout(() => {
      setConfirmation(null);
    }, 3000);
  };

  if (view === 'scanner') {
    return (
      <QRScannerPage 
        onBackToMain={() => setView('main')}
        onScanSuccess={handleScanSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background animated elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Bouton admin discret en bas à droite */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onAdminAccess}
        className="absolute bottom-4 right-4 opacity-20 hover:opacity-100 transition-opacity text-white/50 hover:text-white p-2"
      >
        <Settings className="h-4 w-4" />
      </Button>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo et titre */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <img
              src={appLogo}
              alt={`${appName} Logo`}
              className="h-16 w-16 rounded-xl shadow-2xl bg-white/20 p-2"
            />
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {appName}
              </h1>
              <p className="text-gray-300 text-lg">
                Système de Pointage
              </p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Interface principale */}
          {!confirmation && (
            <motion.div
              key="main"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mb-8"
              >
                <Button
                  onClick={() => setView('scanner')}
                  className="relative w-full h-32 text-xl font-bold overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:from-purple-500 hover:via-blue-500 hover:to-cyan-400 border-0 shadow-2xl group"
                  size="lg"
                >
                  {/* Animation de fond */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"}></div>
                  
                  {/* Contenu du bouton */}
                  <div className="relative z-10 flex flex-col items-center space-y-3">
                    <motion.div
                      animate={{ 
                        rotateY: [0, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <QrCode className="h-12 w-12 text-white drop-shadow-lg" />
                    </motion.div>
                    <span className="text-white drop-shadow-lg">
                      Pointer avec QR Code
                    </span>
                  </div>

                  {/* Effet de brillance */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                    animate={{ x: [-100, 400] }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  />
                </Button>
              </motion.div>

              {/* Indicateur d'heure en temps réel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-center space-x-3 text-white">
                    <Clock className="h-6 w-6 text-cyan-400" />
                    <div>
                      <p className="text-lg font-semibold">
                        {new Date().toLocaleTimeString('fr-FR')}
                      </p>
                      <p className="text-sm text-gray-300">
                        {new Date().toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Message de confirmation */}
          {confirmation && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mb-6"
                >
                  <CheckCircle className="h-20 w-20 text-green-400 mx-auto mb-4" />
                  {confirmation.actionType === 'in' ? (
                    <LogIn className="h-12 w-12 mx-auto text-green-400" />
                  ) : (
                    <LogOut className="h-12 w-12 mx-auto text-red-400" />
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-2">
                    ✅ Bienvenue {confirmation.userName}
                  </h2>
                  <p className="text-lg text-gray-300 mb-2">
                    Pointage {confirmation.actionType === 'in' ? "d'entrée" : "de sortie"} enregistré
                  </p>
                  <p className="text-xl font-semibold text-cyan-400">
                    à {confirmation.time}
                  </p>
                </motion.div>

                {/* Barre de progression pour le retour automatique */}
                <motion.div
                  className="w-full bg-white/20 rounded-full h-2 mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.div
                    className="bg-gradient-to-r from-green-400 to-cyan-400 h-2 rounded-full"
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 3, ease: "linear" }}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClockingInterface;
