import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon: Icon, trend, color }) => {
  const colorClasses = {
    cyan: 'text-cyan-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    red: 'text-red-400'
  };

  return (
    <motion.div
      className="premium-card p-6"
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className={`text-sm font-medium ${colorClasses[color]} bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20`}>
          {trend}
        </span>
      </div>
      
      <h3 className="text-3xl font-bold text-card-foreground mb-2 tracking-tight">{value}</h3>
      <p className="text-muted-foreground text-sm font-medium">{title}</p>
    </motion.div>
  );
};

export default StatsCard;