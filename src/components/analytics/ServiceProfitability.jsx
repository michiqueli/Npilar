import React from 'react';
import { motion } from 'framer-motion';
import { PieChart } from 'lucide-react';

const ServiceProfitability = ({ services }) => {
  const totalRevenue = services.reduce((sum, service) => sum + service.revenue, 0);

  return (
    <div className="nehue-card p-6">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <PieChart className="w-5 h-5 mr-2 text-nehue-verde" />
        Análisis de Rentabilidad por Servicio
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => {
          const percentage = totalRevenue > 0 ? ((service.revenue / totalRevenue) * 100).toFixed(1) : 0;
          const colors = ['from-cyan-500 to-blue-500', 'from-green-500 to-emerald-500', 'from-purple-500 to-pink-500', 'from-orange-500 to-red-500'];
          
          return (
            <motion.div
              key={service.name}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-r ${colors[index % colors.length]} flex items-center justify-center`}>
                <span className="text-xl font-bold text-gray-900">{percentage}%</span>
              </div>
              <h4 className="font-semibold text-white">{service.name}</h4>
              <p className="text-sm text-gray-400">${service.avgPrice} promedio</p>
              <p className="text-xs text-gray-500">{service.count} servicios</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceProfitability;