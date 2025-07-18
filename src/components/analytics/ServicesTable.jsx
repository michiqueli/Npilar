import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

const ServicesTable = () => {
  const servicesData = [
    {
      service: 'Corte + Barba',
      percentage: '43.1%',
      avgPrice: '$35',
      timesPerformed: 243,
      isMostProfitable: true
    },
    {
      service: 'Solo Corte',
      percentage: '26.4%',
      avgPrice: '$20',
      timesPerformed: 260,
      isMostProfitable: false
    },
    {
      service: 'Servicio Completo',
      percentage: '24.4%',
      avgPrice: '$50',
      timesPerformed: 96,
      isMostProfitable: false
    },
    {
      service: 'Arreglo de Cejas',
      percentage: '6.1%',
      avgPrice: '$15',
      timesPerformed: 80,
      isMostProfitable: false
    }
  ];

  return (
    <div className="premium-card p-6">
      <h3 className="text-xl font-semibold text-card-foreground mb-6">
        Servicios más realizados
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Servicio</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-medium">% sobre total</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-medium">Precio promedio</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-medium">Veces realizado</th>
            </tr>
          </thead>
          <tbody>
            {servicesData.map((service, index) => (
              <motion.tr
                key={service.service}
                className={`border-b border-border/50 hover:bg-accent transition-colors ${
                  service.isMostProfitable ? 'border-l-4 border-l-primary bg-primary/5' : ''
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    {service.isMostProfitable && (
                      <Award className="w-4 h-4 text-primary" />
                    )}
                    <span className="text-card-foreground font-medium">{service.service}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center text-muted-foreground">{service.percentage}</td>
                <td className="py-4 px-4 text-center text-muted-foreground">{service.avgPrice}</td>
                <td className="py-4 px-4 text-center text-muted-foreground">{service.timesPerformed}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServicesTable;