import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, RotateCcw, Check, Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const CameraCapture = ({ isOpen, onClose, onCapture }) => {
  const { toast } = useToast();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Inicializar cámara
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Cámara trasera preferida
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('No se pudo acceder a la cámara. Verifica los permisos.');
      toast({
        title: "❌ Error de Cámara",
        description: "No se pudo acceder a la cámara. Verifica los permisos del navegador.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Detener cámara
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Capturar foto
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Configurar canvas con las dimensiones del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar el frame actual del video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir a blob
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        stopCamera();
        
        toast({
          title: "📸 Foto Capturada",
          description: "Imagen capturada exitosamente. Revisa y confirma.",
        });
      }
    }, 'image/jpeg', 0.9);
  }, [stopCamera, toast]);

  // Confirmar y procesar imagen
  const confirmCapture = useCallback(async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    
    try {
      // Simular procesamiento con IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Llamar callback con la imagen
      onCapture(capturedImage);
      
      toast({
        title: "✅ Factura Procesada",
        description: "🚧 El análisis con IA no está implementado aún—¡pero no te preocupes! ¡Puedes solicitarlo en tu próximo prompt! 🚀",
      });
      
      // Limpiar y cerrar
      setCapturedImage(null);
      onClose();
    } catch (error) {
      toast({
        title: "❌ Error de Procesamiento",
        description: "Hubo un error al procesar la imagen. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [capturedImage, onCapture, onClose, toast]);

  // Reiniciar captura
  const retakePhoto = useCallback(() => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
      setCapturedImage(null);
    }
    startCamera();
  }, [capturedImage, startCamera]);

  // Manejar carga de archivo
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      stopCamera();
      
      toast({
        title: "📁 Imagen Cargada",
        description: "Imagen cargada desde galería. Revisa y confirma.",
      });
    }
  }, [stopCamera, toast]);

  // Cleanup al cerrar
  const handleClose = useCallback(() => {
    stopCamera();
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
      setCapturedImage(null);
    }
    setCameraError(null);
    onClose();
  }, [stopCamera, capturedImage, onClose]);

  // Inicializar cámara al abrir
  React.useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }
    
    return () => {
      if (!isOpen) {
        stopCamera();
      }
    };
  }, [isOpen, capturedImage, startCamera, stopCamera]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-lg font-bold">
                {capturedImage ? 'Revisar Captura' : 'Capturar Factura'}
              </h2>
              <button
                onClick={handleClose}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="relative w-full h-full flex items-center justify-center">
            {capturedImage ? (
              // Preview de imagen capturada
              <div className="relative w-full h-full">
                <img
                  src={capturedImage}
                  alt="Factura capturada"
                  className="w-full h-full object-contain"
                />
                
                {/* Overlay de procesamiento */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <motion.div
                        className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full mx-auto mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <p className="text-white text-lg font-medium">Procesando con IA...</p>
                      <p className="text-gray-300 text-sm mt-2">Analizando factura</p>
                    </div>
                  </div>
                )}
              </div>
            ) : isCameraActive ? (
              // Vista de cámara activa
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay de guía */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-white/50 rounded-lg w-80 h-48 relative">
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded">
                      Centra la factura aquí
                    </div>
                  </div>
                </div>
              </div>
            ) : cameraError ? (
              // Error de cámara
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-10 h-10 text-red-400" />
                </div>
                <h3 className="text-white text-xl font-bold mb-2">Error de Cámara</h3>
                <p className="text-gray-300 mb-6">{cameraError}</p>
                <Button onClick={startCamera} className="premium-button">
                  <Camera className="w-4 h-4 mr-2" />
                  Reintentar
                </Button>
              </div>
            ) : (
              // Cargando cámara
              <div className="text-center">
                <motion.div
                  className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full mx-auto mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-white text-lg">Iniciando cámara...</p>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            {capturedImage ? (
              // Controles de confirmación
              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                  disabled={isProcessing}
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Repetir
                </Button>
                <Button
                  onClick={confirmCapture}
                  size="lg"
                  className="premium-button px-8"
                  disabled={isProcessing}
                >
                  <Check className="w-5 h-5 mr-2" />
                  {isProcessing ? 'Procesando...' : 'Confirmar'}
                </Button>
              </div>
            ) : isCameraActive ? (
              // Controles de captura
              <div className="flex items-center justify-center space-x-8">
                {/* Botón de galería */}
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                    <Image className="w-6 h-6" />
                  </button>
                </div>

                {/* Botón de captura principal */}
                <motion.button
                  onClick={capturePhoto}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl"
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-700" />
                  </div>
                </motion.button>

                {/* Botón de archivo */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                    <Upload className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ) : (
              // Controles de error/carga
              <div className="flex justify-center">
                <Button onClick={startCamera} className="premium-button">
                  <Camera className="w-4 h-4 mr-2" />
                  Activar Cámara
                </Button>
              </div>
            )}
          </div>

          {/* Canvas oculto para captura */}
          <canvas ref={canvasRef} className="hidden" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CameraCapture;