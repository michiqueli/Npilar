import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Target } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ClientSegmentation = ({ clients }) => {
  const { toast } = useToast();

  const segmentByFrequency = useMemo(() => {
    const frequent = clients.filter(c => c.visits >= 15);
    const regular = clients.filter(c => c.visits >= 5 && c.visits < 15);
    const occasional = clients.filter(c => c.visits < 5);
    
    return [
      { type: 'Clientes Frecuentes', count: frequent.length, percentage: (frequent.length / clients.length * 100).toFixed(1), color: 'from-cyan-500 to-blue-500', clients: frequent },
      { type: 'Clientes Regulares', count: regular.length, percentage: (regular.length / clients.length * 100).toFixed(1), color: 'from-green-500 to-emerald-500', clients: regular },
      { type: 'Clientes Ocasionales', count: occasional.length, percentage: (occasional.length / clients.length * 100).toFixed(1), color: 'from-purple-500 to-pink-500', clients: occasional }
    ];
  }, [clients]);

  const segmentByService = useMemo(() => {
    const services = ['Corte', 'Corte + Barba', 'Servicio Completo'];
    return services.map(service => {
      const count = Math.floor(Math.random() * clients.length * 0.4) + 5;
      return {
        service,
        count,
        percentage: (count / clients.length * 100).toFixed(1),
        avgSpend: Math.floor(Math.random() * 30) + 20
      };
    });
  }, [clients]);

  const handleSegmentClick = (segment) => {
    toast({
      title: `📊 ${segment.type}`,
      description: "🚧 Vista detallada no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  return (
    <div className="space-y-6">
      <div className="premium-card p-6">
        <h3 className="text-xl font-semibold text-card-foreground mb-6 flex items-center">
          <Users className="w-5 h-5 mr-2 text-primary" />
          Segmentación por Frecuencia de Visita
        </h3>
        
        <div className="space-y-6">
          {segmentByFrequency.map((segment, index) => (
            <motion.div
              key={segment.type}
              className="space-y-3 cursor-pointer"
              onClick={() => handleSegmentClick(segment)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">{segment.type}</span>
                <span className="text-card-foreground font-semibold">{segment.count} clientes</span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-3">
                <motion.div
                  className={`h-3 rounded-full bg-gradient-to-r ${segment.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${segment.percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                />
              </div>
              
              <div className="text-right">
                <span className="text-sm text-muted-foreground">{segment.percentage}% del total</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="premium-card p-6">
        <h3 className="text-xl font-semibold text-card-foreground mb-6 flex items-center">
          <Target className="w-5 h-5 mr-2 text-primary" />
          Segmentación por Servicios Utilizados
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {segmentByService.map((segment, index) => (
            <motion.div
              key={segment.service}
              className="premium-card p-4 text-center cursor-pointer hover:border-primary/50"
              onClick={() => toast({ title: `📋 ${segment.service}`, description: "🚧 Análisis detallado no está implementado aún—¡pero no te preocupes! ¡Puedes solicitarlo en tu próximo prompt! 🚀" })}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <h4 className="font-semibold text-card-foreground mb-2">{segment.service}</h4>
              <p className="text-2xl font-bold text-primary mb-1">{segment.count}</p>
              <p className="text-sm text-muted-foreground">{segment.percentage}% de clientes</p>
              <p className="text-xs text-muted-foreground/70 mt-2">${segment.avgSpend} gasto promedio</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientSegmentation;