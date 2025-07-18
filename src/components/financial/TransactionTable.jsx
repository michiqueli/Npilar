import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Receipt } from 'lucide-react';
import SectionHeader from '@/components/financial/SectionHeader';

const TransactionTable = ({ transactions }) => {
  const getPaymentMethodColor = (method) => {
    const colors = {
      'Efectivo': 'text-green-500',
      'Tarjeta': 'text-blue-500',
      'Transferencia': 'text-purple-500',
      'Bizum': 'text-yellow-500',
      'MercadoPago': 'text-purple-500'
    };
    return colors[method] || 'text-gray-400';
  };

  const getTransactionIcon = (type) => {
    return type === 'income' ? '💰' : '💸';
  };

  const getOriginLabel = (transaction) => {
    if (transaction.origin) return transaction.origin;
    if (transaction.appointmentId) return 'Desde Calendario';
    return 'Manual';
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
  };

  return (
    <div className="premium-card p-6">
      <SectionHeader 
        title="Historial de movimientos"
        description="Registro completo de ingresos y gastos"
        icon={Receipt}
      />
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Fecha</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Tipo</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Categoría</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">Monto</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-medium">Método de pago</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Nota</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-medium">Origen</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <motion.tr
                key={transaction.id}
                className="border-b border-border/50 hover:bg-accent transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <td className="py-4 px-4 text-muted-foreground">
                  {formatDate(transaction.date)}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTransactionIcon(transaction.type)}</span>
                    <span className={`font-medium ${
                      transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-muted-foreground">
                  {transaction.type === 'income' ? transaction.service : transaction.category}
                </td>
                <td className="py-4 px-4 text-right">
                  <span className={`font-bold text-lg ${
                    transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    ${transaction.amount}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(transaction.paymentMethod)} bg-current/10`}>
                    {transaction.paymentMethod}
                  </span>
                </td>
                <td className="py-4 px-4 text-muted-foreground text-sm">
                  {transaction.type === 'income' 
                    ? (transaction.clientName || '-')
                    : (transaction.description || '-')
                  }
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-xs px-2 py-1 bg-muted/50 rounded-full text-muted-foreground">
                    {getOriginLabel(transaction)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;