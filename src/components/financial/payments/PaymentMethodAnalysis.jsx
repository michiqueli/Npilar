import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CreditCard, Smartphone, Building, PieChart } from 'lucide-react';

const PaymentMethodAnalysis = ({ transactions }) => {
  const incomeTransactions = transactions.filter(t => t.type === 'income' && t.confirmed);
  
  const paymentMethodStats = incomeTransactions.reduce((acc, transaction) => {
    const method = transaction.paymentMethod;
    if (!acc[method]) {
      acc[method] = { total: 0, count: 0 };
    }
    acc[method].total += transaction.amount;
    acc[method].count += 1;
    return acc;
  }, {});

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

  const methodsWithPercentage = Object.entries(paymentMethodStats).map(([method, data]) => ({
    method,
    total: data.total,
    count: data.count,
    percentage: totalIncome > 0 ? (data.total / totalIncome) * 100 : 0
  })).sort((a, b) => b.total - a.total);

  const getMethodIcon = (method) => {
    switch (method) {
      case 'Efectivo': return DollarSign;
      case 'Tarjeta': return CreditCard;
      case 'Bizum': return Smartphone;
      case 'MercadoPago': return Building;
      default: return DollarSign;
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'Efectivo': return 'text-green-400';
      case 'Tarjeta': return 'text-blue-400';
      case 'Bizum': return 'text-yellow-400';
      case 'MercadoPago': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  if (methodsWithPercentage.length === 0) {
    return (
      <div className="premium-card p-6 text-center">
        <PieChart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">Análisis por Método de Pago</h3>
        <p className="text-gray-400">
          Cuando tengas pagos registrados, verás aquí el desglose por método de pago.
        </p>
      </div>
    );
  }

  return (
    <div className="premium-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <PieChart className="w-5 h-5 mr-3 text-orange-400" />
          Balance por Método de Pago
        </h3>
        <div className="text-sm text-gray-400">
          Total: ${totalIncome.toLocaleString()}
        </div>
      </div>

      <div className="space-y-4">
        {methodsWithPercentage.map((item, index) => {
          const IconComponent = getMethodIcon(item.method);
          const colorClass = getMethodColor(item.method);
          
          return (
            <motion.div
              key={item.method}
              className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg bg-current/10 flex items-center justify-center ${colorClass}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{item.method}</h4>
                  <p className="text-sm text-gray-400">{item.count} transacciones</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-bold text-lg ${colorClass}`}>
                  ${item.total.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">
                  {item.percentage.toFixed(1)}%
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Barra de progreso visual */}
      <div className="mt-6">
        <div className="flex h-3 rounded-full overflow-hidden bg-gray-800">
          {methodsWithPercentage.map((item, index) => {
            const colorClass = getMethodColor(item.method);
            const bgColorClass = colorClass.replace('text-', 'bg-').replace('-400', '-400/80');
            
            return (
              <div
                key={item.method}
                className={bgColorClass}
                style={{ width: `${item.percentage}%` }}
                title={`${item.method}: ${item.percentage.toFixed(1)}%`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodAnalysis;