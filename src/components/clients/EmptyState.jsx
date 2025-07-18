import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EmptyState = ({ onAddClient }) => {
  return (
    <motion.div
      className="text-center py-16 px-6 bg-card border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div 
        className="relative w-24 h-24 mb-6 flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4, type: "spring", stiffness: 150 }}
      >
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl"></div>
        <UserPlus className="w-16 h-16 text-primary/50" />
      </motion.div>

      <h3 className="text-2xl font-bold text-foreground mb-3">
        Tu cartera de clientes está lista para crecer
      </h3>
      
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Registra visitas, preferencias y envía recordatorios automáticos. Empieza a construir relaciones duraderas con tus clientes.
      </p>
      
      <Button 
        onClick={onAddClient} 
        size="lg"
        variant="primary"
        className="w-full max-w-xs"
        aria-label="Agregar nuevo cliente"
      >
        <UserPlus className="w-5 h-5 mr-3" />
        Agregar mi primer cliente
      </Button>
    </motion.div>
  );
};

export default EmptyState;