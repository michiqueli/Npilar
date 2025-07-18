import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AgendaOverview = () => {
  const { toast } = useToast();
  const [agendaData, setAgendaData] = useState({
    totalAppointments: 0,
    freeSlots: 0,
    cancelledToday: 0,
    newClients: 0,
  });

  useEffect(() => {
    const mockData = {
      totalAppointments: 8,
      freeSlots: 2,
      cancelledToday: 1,
      newClients: 2,
    };
    setAgendaData(mockData);
  }, []);

  const cards = [
    {
      title: 'Citas del Día',
      value: agendaData.totalAppointments,
      subtitle: 'cortes programados',
      icon: Calendar,
      color: 'primary'
    },
    {
      title: 'Huecos Libres',
      value: agendaData.freeSlots,
      subtitle: 'espacios disponibles',
      icon: Users,
      color: 'success'
    },
    {
      title: 'Cancelaciones',
      value: agendaData.cancelledToday,
      subtitle: 'canceladas hoy',
      icon: AlertCircle,
      color: 'error'
    },
    {
      title: 'Clientes Nuevos',
      value: agendaData.newClients,
      subtitle: 'primera visita',
      icon: Sparkles,
      color: 'secondary'
    }
  ];

  const getCardStyles = (color) => {
    return "premium-card p-4 transition-all duration-300 cursor-pointer hover:border-primary/30";
  };

  const getIconColor = (color) => {
    const colors = {
      primary: 'text-primary',
      secondary: 'text-secondary-foreground',
      success: 'text-success',
      error: 'text-error'
    };
    return colors[color] || 'text-primary';
  };

  const handleCardClick = (card) => {
    toast({
      title: `📊 ${card.title}`,
      description: `${card.value} ${card.subtitle}`,
    });
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={index}
              className={getCardStyles(card.color)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              onClick={() => handleCardClick(card)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {card.title}
                </h3>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-accent`}>
                  <Icon className={`w-4 h-4 ${getIconColor(card.color)}`} />
                </div>
              </div>
              
              <div className="text-left">
                <p className={`text-2xl font-bold tracking-tight text-foreground`}>
                  {card.value}
                </p>
                <p className="text-sm text-muted-foreground">
                  {card.subtitle}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
};

export default AgendaOverview;