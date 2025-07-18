import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Users, BarChart3 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const QuickActions = () => {
  const { toast } = useToast();

  const actions = [
    {
      icon: Plus,
      title: 'Nueva Cita',
      description: 'Agendar nueva cita',
      action: () => toast({
        title: "📅 Nueva Cita",
        description: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀",
      })
    },
    {
      icon: Users,
      title: 'Nuevo Cliente',
      description: 'Registrar cliente',
      action: () => toast({
        title: "👤 Nuevo Cliente",
        description: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀",
      })
    },
    {
      icon: Calendar,
      title: 'Ver Agenda',
      description: 'Revisar calendario',
      action: () => toast({
        title: "📅 Ver Agenda",
        description: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀",
      })
    },
    {
      icon: BarChart3,
      title: 'Reportes',
      description: 'Generar reporte',
      action: () => toast({
        title: "📊 Reportes",
        description: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀",
      })
    }
  ];

  return (
    <div className="premium-card p-6">
      <h3 className="text-xl font-semibold text-card-foreground mb-6 tracking-tight">Acciones Rápidas</h3>
      
      <div className="space-y-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={index}
              className="w-full p-4 bg-muted/50 rounded-xl border transition-all duration-300 hover:bg-accent hover:border-primary/30 group"
              onClick={action.action}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-card-foreground tracking-tight">{action.title}</h4>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;