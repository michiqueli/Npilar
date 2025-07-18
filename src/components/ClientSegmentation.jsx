import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

const ClientSegmentation = () => {
  const segments = [
    { type: 'Clientes Frecuentes', count: 85, percentage: 34, color: 'from-cyan-500 to-blue-500' },
    { type: 'Clientes Regulares', count: 120, percentage: 48, color: 'from-green-500 to-emerald-500' },
    { type: 'Clientes Ocasionales', count: 43, percentage: 18, color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <div className="kia-card p-6">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Users className="w-5 h-5 mr-2 text-cyan-400" />
        Segmentación de Clientes
      </h3>
      
      <div className="space-y-6">
        {segments.map((segment, index) => (
          <motion.div
            key={segment.type}
            className="space-y-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-medium">{segment.type}</span>
              <span className="text-white font-semibold">{segment.count} clientes</span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-3">
              <motion.div
                className={`h-3 rounded-full bg-gradient-to-r ${segment.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${segment.percentage}%` }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
              />
            </div>
            
            <div className="text-right">
              <span className="text-sm text-gray-400">{segment.percentage}% del total</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ClientSegmentation;