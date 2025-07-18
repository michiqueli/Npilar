import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Scissors } from 'lucide-react';

const ServiceTrends = () => {
  const serviceTrends = [
    {
      service: 'Corte + Barba',
      currentMonth: 243,
      previousMonth: 220,
      change: 10.5,
      trend: 'up'
    },
    {
      service: 'Solo Corte',
      currentMonth: 260,
      previousMonth: 275,
      change: -5.5,
      trend: 'down'
    },
    {
      service: 'Servicio Completo',
      currentMonth: 96,
      previousMonth: 88,
      change: 9.1,
      trend: 'up'
    },
    {
      service: 'Arreglo de Cejas',
      currentMonth: 80,
      previousMonth: 100,
      change: -20.0,
      trend: 'down'
    }
  ];

  const decreasingServices = serviceTrends.filter(s => s.trend === 'down');

  return (
    <div className="space-y-6">
      {/* Tendencias generales */}
      <div className="premium-card p-6">
        <h3 className="text-xl font-semibold text-card-foreground mb-6 flex items-center">
          <Scissors className="w-5 h-5 mr-2 text-primary" />
          Tendencias de Servicios vs Mes Anterior
        </h3>

        <div className="space-y-4">
          {serviceTrends.map((service, index) => (
            <motion.div
              key={service.service}
              className={`p-4 rounded-lg border ${
                service.trend === 'up' 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-red-500/10 border-red-500/30'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {service.trend === 'up' ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <h4 className="text-card-foreground font-medium">{service.service}</h4>
                    <p className="text-muted-foreground text-sm">
                      {service.currentMonth} servicios este mes
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    service.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {service.change > 0 ? '+' : ''}{service.change}%
                  </p>
                  <p className="text-muted-foreground text-sm">
                    vs {service.previousMonth} anterior
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Servicios en declive */}
      {decreasingServices.length > 0 && (
        <motion.div
          className="premium-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h4 className="text-lg font-semibold text-card-foreground mb-4 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-red-500" />
            Servicios que Necesitan Atención
          </h4>
          
          <div className="space-y-3">
            {decreasingServices.map((service, index) => (
              <motion.div
                key={service.service}
                className="p-3 bg-red-500/10 rounded-lg border border-red-500/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              >
                <p className="text-red-500 font-medium">
                  {service.service} tuvo {Math.abs(service.change)}% menos demanda que el mes anterior
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  💡 Considerá promociones especiales o revisar la estrategia de marketing
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <h5 className="text-card-foreground font-medium mb-2">Posibles Acciones:</h5>
            <ul className="text-muted-foreground text-sm space-y-1">
              <li>• Crear paquetes promocionales para servicios en declive</li>
              <li>• Revisar precios y competencia</li>
              <li>• Capacitar al equipo en técnicas de venta cruzada</li>
              <li>• Implementar descuentos por fidelidad</li>
            </ul>
          </div>
        </motion.div>
      )}

      {/* Oportunidades de crecimiento */}
      <motion.div
        className="premium-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h4 className="text-lg font-semibold text-card-foreground mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
          Oportunidades de Crecimiento
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <h5 className="text-green-500 font-medium mb-2">Servicios en Alza</h5>
            <p className="text-muted-foreground text-sm">
              Corte + Barba y Servicio Completo están creciendo. Considerá:
            </p>
            <ul className="text-muted-foreground/80 text-xs mt-2 space-y-1">
              <li>• Ampliar horarios para estos servicios</li>
              <li>• Capacitar más personal especializado</li>
              <li>• Crear paquetes premium</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <h5 className="text-blue-500 font-medium mb-2">Potencial de Recuperación</h5>
            <p className="text-muted-foreground text-sm">
              Los servicios en declive pueden recuperarse con estrategias específicas
            </p>
            <ul className="text-muted-foreground/80 text-xs mt-2 space-y-1">
              <li>• Promociones de temporada</li>
              <li>• Combos con servicios populares</li>
              <li>• Marketing dirigido en redes sociales</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ServiceTrends;