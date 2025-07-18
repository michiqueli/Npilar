import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Receipt, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TransactionHistory = ({ transactions, onEdit, onDelete, onConfirm }) => {
  const getPaymentMethodColor = (method) => {
    const colors = {
      'Efectivo': 'text-green-400',
      'Tarjeta': 'text-blue-400',
      'Transferencia': 'text-purple-400',
      'MercadoPago': 'text-yellow-400'
    };
    return colors[method] || 'text-gray-400';
  };

  const getTransactionTypeColor = (type) => {
    return type === 'income' ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="premium-card p-6">
      <h3 className="text-xl font-semibold text-card-foreground mb-6">Historial de Transacciones</h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-accent transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${transaction.type === 'income' ? 'bg-green-400' : 'bg-red-400'}`} />
                <div>
                  <h4 className="font-medium text-card-foreground">
                    {transaction.type === 'income' ? transaction.clientName : transaction.description}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {transaction.type === 'income' ? transaction.service : transaction.category}
                  </p>
                  <p className="text-xs text-muted-foreground/70">{transaction.date}</p>
                </div>
              </div>
            </div>
            
            <div className="text-right mr-4">
              <p className={`font-bold text-lg ${getTransactionTypeColor(transaction.type)}`}>
                {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
              </p>
              <p className={`text-xs ${getPaymentMethodColor(transaction.paymentMethod)}`}>
                {transaction.paymentMethod}
              </p>
              {transaction.type === 'income' && !transaction.confirmed && (
                <p className="text-xs text-yellow-400">Pendiente confirmación</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {transaction.receipt && (
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Receipt className="w-4 h-4" />
                </Button>
              )}
              
              {transaction.type === 'income' && !transaction.confirmed && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onConfirm(transaction.id)}
                  className="text-yellow-400 hover:text-green-400"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(transaction)}
                className="text-muted-foreground hover:text-primary"
              >
                <Edit className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(transaction.id)}
                className="text-muted-foreground hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
        
        {transactions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay transacciones registradas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;