import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const TodayHeader = () => {
  const today = new Date();
  const dayName = format(today, 'EEEE', { locale: es });
  const dayNumber = format(today, 'd', { locale: es });
  const monthName = format(today, 'MMMM', { locale: es });

  return (
    <motion.div
      className="premium-card p-6 text-center mb-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center justify-center mb-4">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg mr-4">
          <Calendar className="w-8 h-8 text-primary-foreground" />
        </div>
        <div className="text-left">
          <h1 className="text-4xl font-bold text-foreground capitalize tracking-tight">
            Hoy es {dayName}
          </h1>
          <p className="text-xl text-primary font-semibold">
            {dayNumber} de {monthName}
          </p>
        </div>
      </div>
      
      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
    </motion.div>
  );
};

export default TodayHeader;