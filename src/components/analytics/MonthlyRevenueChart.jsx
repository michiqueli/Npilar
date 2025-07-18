import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MonthlyRevenueChart = () => {
  const [showFullYear, setShowFullYear] = useState(false);

  const monthlyData = [
    { month: 'Ene', amount: 15200, trend: 'neutral' },
    { month: 'Feb', amount: 16800, trend: 'up' },
    { month: 'Mar', amount: 14500, trend: 'down' },
    { month: 'Abr', amount: 17200, trend: 'up' },
    { month: 'May', amount: 16500, trend: 'down' },
    { month: 'Jun', amount: 18500, trend: 'up' }
  ];

  const fullYearData = [
    ...monthlyData,
    { month: 'Jul', amount: 19200, trend: 'up' },
    { month: 'Ago', amount: 18800, trend: 'down' },
    { month: 'Sep', amount: 20100, trend: 'up' },
    { month: 'Oct', amount: 19500, trend: 'down' },
    { month: 'Nov', amount: 21000, trend: 'up' },
    { month: 'Dic', amount: 22500, trend: 'up' }
  ];

  const dataToShow = showFullYear ? fullYearData : monthlyData;
  const maxAmount = Math.max(...dataToShow.map(d => d.amount));

  return (
    <div className="premium-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-card-foreground flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-primary" />
          Gráfico de Ingresos Mensuales
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFullYear(!showFullYear)}
          className="text-foreground hover:bg-accent"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {showFullYear ? 'Ver últimos 6 meses' : 'Ver año completo'}
        </Button>
      </div>

      <div className="space-y-4">
        {dataToShow.map((item, index) => {
          const percentage = (item.amount / maxAmount) * 100;
          const barColor = item.trend === 'up' ? 'bg-green-500/20' : 
                          item.trend === 'down' ? 'bg-red-500/20' : 'bg-gray-500/20';
          
          return (
            <motion.div
              key={item.month}
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium w-12">{item.month}</span>
                <span className="text-card-foreground font-semibold">${item.amount.toLocaleString()}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-4">
                <motion.div
                  className={`h-4 rounded-full ${barColor} border`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyRevenueChart;