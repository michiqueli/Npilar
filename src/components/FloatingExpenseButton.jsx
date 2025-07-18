import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Receipt, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import CameraCapture from '@/components/CameraCapture';

const FloatingExpenseButton = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleCameraCapture = () => {
    setShowOptions(false);
    setShowCamera(true);
  };

  const handleImageCapture = (imageUrl) => {
    setIsProcessing(true);
    
    // Simular procesamiento de IA
    setTimeout(() => {
      setIsProcessing(false);
      
      // Aquí se guardaría la imagen y se procesaría con IA
      const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      const newExpense = {
        id: Date.now(),
        type: 'factura',
        imageUrl: imageUrl,
        date: new Date().toISOString(),
        status: 'procesada',
        amount: null, // Se llenaría con IA
        description: 'Factura capturada con cámara'
      };
      
      expenses.push(newExpense);
      localStorage.setItem('expenses', JSON.stringify(expenses));
      
      toast({
        title: "✅ Factura Guardada",
        description: "La factura ha sido guardada y está lista para análisis con IA.",
      });
    }, 1500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsProcessing(true);
      setShowOptions(false);
      
      const imageUrl = URL.createObjectURL(file);
      
      setTimeout(() => {
        setIsProcessing(false);
        
        // Guardar archivo subido
        const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        const newExpense = {
          id: Date.now(),
          type: 'factura',
          imageUrl: imageUrl,
          date: new Date().toISOString(),
          status: 'procesada',
          amount: null,
          description: 'Factura subida desde galería'
        };
        
        expenses.push(newExpense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        
        toast({
          title: "📄 Archivo Guardado",
          description: "El archivo ha sido guardado y está listo para análisis con IA.",
        });
      }, 1500);
    }
  };

  const toggleOptions = () => {
    if (!isProcessing) {
      setShowOptions(!showOptions);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-4">
        <AnimatePresence>
          {!showOptions && !isProcessing && (
            <motion.div
              className="bg-card text-foreground px-4 py-2 rounded-lg shadow-lg border text-sm font-medium"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: 1 }}
            >
              Cargar gasto
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="relative"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <motion.button
            onClick={toggleOptions}
            disabled={isProcessing}
            className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-primary/30 transition-all duration-300 relative overflow-hidden"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              boxShadow: '0 8px 32px hsl(var(--primary) / 0.4)' 
            }}
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-2 right-2 w-4 h-4 bg-primary-foreground rounded-full blur-sm"></div>
              <div className="absolute bottom-2 left-2 w-3 h-3 bg-primary-foreground rounded-full blur-sm"></div>
            </div>

            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-8 h-8 text-primary-foreground" />
              </motion.div>
            ) : showOptions ? (
               <X className="w-8 h-8 text-primary-foreground" />
            ) : (
              <Camera className="w-8 h-8 text-primary-foreground" />
            )}

            {isProcessing && (
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-primary"
                animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isProcessing && (
          <motion.div
            className="fixed bottom-24 right-6 bg-card text-foreground px-4 py-2 rounded-lg shadow-lg border z-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex items-center space-x-2">
               <motion.div
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              <p className="text-sm font-medium">Procesando...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOptions && !isProcessing && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOptions(false)}
            />
            <motion.div
              className="fixed bottom-24 right-6 z-50 premium-card p-6 w-80 max-w-[calc(100vw-3rem)]"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <button
                onClick={() => setShowOptions(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-md">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground tracking-tight">
                      Control de Gastos IA
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Análisis automático de facturas
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Captura facturas para que la IA extraiga los datos y los registre por ti.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleCameraCapture}
                  className="premium-button w-full flex items-center justify-center"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capturar con Cámara
                </Button>

                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Cargar desde Galería
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleImageCapture}
      />
    </>
  );
};

export default FloatingExpenseButton;