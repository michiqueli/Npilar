import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const AnalyticsCard = ({ title, value, change, isPositive, icon: Icon, iconBgColor }) => {
  const trendColor = isPositive ? 'text-success' : 'text-destructive';
  const TrendIcon = isPositive ? ArrowUp : ArrowDown;

  return (
    <motion.div
      className="premium-card p-6 flex flex-col justify-between"
      whileHover={{ y: -5, boxShadow: '0 10px 20px -5px rgba(0,0,0,0.07)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-start">
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconBgColor)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={cn("flex items-center space-x-1 font-bold", trendColor)}>
          <TrendIcon className="w-4 h-4" />
          <span>{change}</span>
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-foreground mt-4">{value}</h3>
        <p className="text-muted-foreground text-sm">{title}</p>
      </div>
    </motion.div>
  );
};

export default AnalyticsCard;