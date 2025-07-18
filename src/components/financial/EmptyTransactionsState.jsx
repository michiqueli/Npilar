import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EmptyTransactionsState = ({ onOpenIncomeModal, onOpenExpenseModal }) => {
  return (
    <motion.div
      className="premium-card p-12 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
        <div className="text-6xl">💰</div>
      </div>
      
      <h3 className="text-2xl font-bold text-foreground mb-3">Tu caja está esperando</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
        Todavía no registraste movimientos. Empezá con un ingreso o gasto para ver tu caja diaria en acción.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button 
          onClick={onOpenExpenseModal} 
          variant="secondary" 
          className="w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          Registrar Gasto
        </Button>
        <Button 
          onClick={onOpenIncomeModal} 
          variant="primary"
          className="w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          Registrar Ingreso
        </Button>
      </div>
    </motion.div>
  );
};

export default EmptyTransactionsState;