import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, Scissors, TrendingUp } from 'lucide-react';

const MonthSummary = ({ currentMonth, previousMonth }) => {
  const summaryData = [
    {
      title: 'Ingresos totales',
      value: '$18.500',
      change: '+12% vs mayo',
      icon: DollarSign,
      trend: 'up'
    },
    {
      title: 'Turnos realizados',
      value: '120 turnos',
      change: '+8 turnos',
      icon: Calendar,
      trend: 'up'
    },
    {
      title: 'Servicio más frecuente',
      value: 'Corte + Barba',
      change: '43% del total',
      icon: Scissors,
      trend: 'neutral'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {summaryData.map((item, index) => (
        <motion.div
          key={item.title}
          className="premium-card p-6 border-b-2 border-b-primary/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <item.icon className="w-8 h-8 text-primary" />
            {item.trend === 'up' && (
              <TrendingUp className="w-5 h-5 text-green-500" />
            )}
          </div>
          
          <div className="text-center">
            <h3 className="text-2xl font-bold text-card-foreground mb-2">{item.value}</h3>
            <p className="text-muted-foreground text-sm mb-1">{item.title}</p>
            <p className="text-muted-foreground/80 text-xs">{item.change}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MonthSummary;