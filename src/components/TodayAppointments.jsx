import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Scissors, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';

const TodayAppointments = () => {
  const { toast } = useToast();
  const { notifyReminderSent } = useNotifications();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Simular citas del día con recordatorios
    const todayAppointments = [
      { 
        id: 1, 
        client: 'Juan Pérez', 
        service: 'Corte + Barba', 
        time: '09:00', 
        status: 'confirmada',
        reminderSent: true,
        reminderTime: '07:00'
      },
      { 
        id: 2, 
        client: 'Carlos López', 
        service: 'Corte', 
        time: '10:30', 
        status: 'en-proceso',
        reminderSent: true,
        reminderTime: '08:30'
      },
      { 
        id: 3, 
        client: 'Miguel Torres', 
        service: 'Barba', 
        time: '11:00', 
        status: 'pendiente',
        reminderSent: false,
        reminderTime: null
      },
      { 
        id: 4, 
        client: 'Roberto Silva', 
        service: 'Servicio Completo', 
        time: '14:00', 
        status: 'confirmada',
        reminderSent: true,
        reminderTime: '12:00'
      },
      { 
        id: 5, 
        client: 'Diego Martín', 
        service: 'Corte', 
        time: '15:30', 
        status: 'pendiente',
        reminderSent: false,
        reminderTime: null
      },
      { 
        id: 6, 
        client: 'Andrés Ruiz', 
        service: 'Corte + Barba', 
        time: '16:00', 
        status: 'confirmada',
        reminderSent: true,
        reminderTime: '14:00'
      }
    ];
    setAppointments(todayAppointments);
  }, []);

  const statusColors = {
    'confirmada': 'bg-green-500/20 text-green-500 border-green-500/30',
    'en-proceso': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    'pendiente': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
  };

  const handleAppointmentClick = (appointment) => {
    toast({
      title: `📅 Cita de ${appointment.client}`,
      description: `${appointment.service} a las ${appointment.time}`,
    });
  };

  const handleSendReminder = (appointmentId) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    const currentTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    setAppointments(prev => prev.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, reminderSent: true, reminderTime: currentTime }
        : apt
    ));
    
    // Crear notificación de recordatorio enviado
    notifyReminderSent({
      clientName: appointment.client,
      service: appointment.service,
      time: appointment.time
    });
    
    toast({
      title: "📱 Recordatorio Enviado",
      description: "El cliente ha recibido la notificación de su cita.",
    });
  };

  return (
    <div className="premium-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-card-foreground flex items-center tracking-tight">
          <Clock className="w-5 h-5 mr-3 text-primary" />
          Cortes de Hoy
        </h3>
        <div className="text-sm text-muted-foreground">
          {appointments.length} citas programadas
        </div>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {appointments.map((appointment, index) => (
          <motion.div
            key={appointment.id}
            className="flex items-center justify-between p-4 bg-muted/50 rounded-xl cursor-pointer hover:bg-accent transition-all duration-300 border hover:border-primary/30"
            onClick={() => handleAppointmentClick(appointment)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ x: 6, scale: 1.01 }}
          >
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-card-foreground tracking-tight">{appointment.client}</h4>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Scissors className="w-3 h-3 mr-1" />
                  {appointment.service}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Indicador de recordatorio */}
              <div className="flex flex-col items-center">
                {appointment.reminderSent ? (
                  <div className="flex items-center space-x-1 text-green-500">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Enviado</span>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendReminder(appointment.id);
                    }}
                    className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 p-1"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                )}
                {appointment.reminderSent && appointment.reminderTime && (
                  <span className="text-xs text-muted-foreground">{appointment.reminderTime}</span>
                )}
              </div>

              <div className="text-right">
                <p className="font-semibold text-card-foreground text-lg">{appointment.time}</p>
                <span className={`text-xs px-3 py-1 rounded-full border ${statusColors[appointment.status]}`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Resumen de recordatorios */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-green-500">
              <CheckCircle className="w-4 h-4" />
              <span>{appointments.filter(apt => apt.reminderSent).length} recordatorios enviados</span>
            </div>
            <div className="flex items-center space-x-2 text-yellow-500">
              <AlertCircle className="w-4 h-4" />
              <span>{appointments.filter(apt => !apt.reminderSent).length} pendientes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayAppointments;