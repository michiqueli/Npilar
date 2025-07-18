import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Receipt, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import CameraCapture from '@/components/CameraCapture';

const ExpenseWidget = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [lastExpenses, setLastExpenses] = useState([]);

  useEffect(() => {
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    setLastExpenses(expenses.slice(-2).reverse()); // Mostrar las últimas 2 facturas
  }, [isProcessing]); // Actualizar cuando se procesa una nueva factura

  const handleCameraCapture = () => {
    setShowCamera(true);
  };

  const handleImageCapture = (imageUrl) => {
    setIsProcessing(true);
    
    // Simular procesamiento de IA
    setTimeout(() => {
      setIsProcessing(false);
      
      // Guardar la imagen
      const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      const newExpense = {
        id: Date.now(),
        type: 'factura',
        imageUrl: imageUrl,
        date: new Date().toISOString(),
        status: 'procesada',
        amount: null,
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

  return (
    <>
      <motion.div
        className="premium-card p-6 text-center relative overflow-hidden bg-gradient-to-br from-card to-accent/50"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.01 }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4 w-16 h-16 bg-primary rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-primary rounded-full blur-lg"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-center mb-4">
            <motion.div
              className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg mr-4"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              {isProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="w-8 h-8" />
                </motion.div>
              ) : (
                <Camera className="w-8 h-8" />
              )}
            </motion.div>
            
            <div className="text-left">
              <h3 className="text-xl font-bold text-foreground mb-1 tracking-tight">
                Cargar Gastos del Día
              </h3>
              <p className="text-primary font-medium">
                (sacá foto del ticket)
              </p>
            </div>
          </div>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            Captura facturas para análisis automático con IA.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleCameraCapture}
              disabled={isProcessing}
              className="premium-button flex items-center justify-center"
            >
              <Camera className="w-5 h-5 mr-2" />
              Sacar Foto
            </Button>

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isProcessing}
              />
              <Button
                variant="outline"
                disabled={isProcessing}
                className="w-full"
              >
                <Upload className="w-5 h-5 mr-2" />
                Cargar Imagen
              </Button>
            </div>
          </div>

          {isProcessing && (
            <motion.div
              className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-center space-x-3 mb-2">
                <motion.div
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <motion.div
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </div>
              <p className="text-primary font-medium">
                Analizando factura con IA...
              </p>
            </motion.div>
          )}

          {lastExpenses.length > 0 && !isProcessing && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">Últimas cargas</h4>
              <div className="flex justify-center gap-4">
                {lastExpenses.map(exp => (
                  <motion.div 
                    key={exp.id}
                    className="w-20 h-20 rounded-lg overflow-hidden border-2 border-primary/20 shadow-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img 
                      src={exp.imageUrl}
                      alt={exp.description}
                      className="w-full h-full object-cover"
                     src="https://images.unsplash.com/photo-1616959394171-ceb678bda835" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleImageCapture}
      />
    </>
  );
};

export default ExpenseWidget;