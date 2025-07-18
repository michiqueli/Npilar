import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

const RevenueChart = () => {
  const monthlyData = [
    { month: 'Ene', revenue: 15000 },
    { month: 'Feb', revenue: 16500 },
    { month: 'Mar', revenue: 14800 },
    { month: 'Abr', revenue: 17200 },
    { month: 'May', revenue: 18900 },
    { month: 'Jun', revenue: 18500 }
  ];

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <div className="kia-card p-6">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <BarChart3 className="w-5 h-5 mr-2 text-cyan-400" />
        Ingresos Mensuales
      </h3>
      
      <div className="space-y-4">
        {monthlyData.map((data, index) => {
          const percentage = (data.revenue / maxRevenue) * 100;
          
          return (
            <div key={data.month} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 font-medium">{data.month}</span>
                <span className="text-white font-semibold">${data.revenue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <motion.div
                  className="h-3 rounded-full kia-gradient"
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