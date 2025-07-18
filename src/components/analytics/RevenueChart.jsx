import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

const RevenueChart = ({ period, data }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue));

  return (
    <div className="nehue-card p-6">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <BarChart3 className="w-5 h-5 mr-2 text-nehue-verde" />
        Ingresos {period === 'daily' ? 'Diarios' : period === 'weekly' ? 'Semanales' : 'Mensuales'}
      </h3>
      
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {data.map((item, index) => {
          const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
          
          return (
            <div key={item.period} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 font-medium">{item.period}</span>
                <span className="text-white font-semibold">${item.revenue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <motion.div
                  className="h-3 rounded-full nehue-gradient"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RevenueChart;