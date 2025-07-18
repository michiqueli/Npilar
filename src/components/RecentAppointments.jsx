import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Scissors } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const RecentAppointments = () => {
  const { toast } = useToast();

  const appointments = [
    { id: 1, client: 'Juan Pérez', service: 'Corte + Barba', time: '09:00', status: 'confirmada' },
    { id: 2, client: 'Carlos López', service: 'Corte', time: '10:30', status: 'en-proceso' },
    { id: 3, client: 'Miguel Torres', service: 'Barba', time: '11:00', status: 'pendiente' },
    { id: 4, client: 'Roberto Silva', service: 'Servicio Completo', time: '14:00', status: 'confirmada' },
    { id: 5, client: 'Diego Martín', service: 'Corte', time: '15:30', status: 'pendiente' }
  ];

  const statusColors = {
    'confirmada': 'bg-green-500/20 text-green-500 border-green-500/30',
    'en-proceso': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    'pendiente': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
  };

  const handleAppointmentClick = (client) => {
    toast({
      title: `📅 Cita de ${client}`,
      description: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  return (
    <div className="premium-card p-6">
      <h3 className="text-xl font-semibold text-card-foreground mb-6 flex items-center tracking-tight">
        <Clock className="w-5 h-5 mr-3 text-primary" />
        Citas de Hoy
      </h3>
      
      <div className="space-y-4">
        {appointments.map((appointment, index) => (
          <motion.div
            key={appointment.id}
            className="flex items-center justify-between p-4 bg-muted/50 rounded-xl cursor-pointer hover:bg-accent transition-all duration-300 border hover:border-primary/30"
            onClick={() => handleAppointmentClick(appointment.client)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ x: 6, scale: 1.01 }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h4 className="font-medium text-card-foreground tracking-tight">{appointment.client}</h4>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Scissors className="w-3 h-3 mr-1" />
                  {appointment.service}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-semibold text-card-foreground text-lg">{appointment.time}</p>
              <span className={`text-xs px-3 py-1 rounded-full border ${statusColors[appointment.status]}`}>
                {appointment.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecentAppointments;