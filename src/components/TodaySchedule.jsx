import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, MessageSquare, User, Banknote, PlusCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import AppointmentModal from '@/components/calendar/AppointmentModal';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const TodaySchedule = () => {
  const { toast } = useToast();
  const { notifyReminderSent } = useNotifications();
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const todaySchedule = [
      { id: 1, time: '09:00', client: 'Juan Pérez', service: 'Corte + Barba', status: 'confirmada', reminderSent: true, reminderTime: '07:00', price: 35 },
      { id: 2, time: '10:30', client: 'Carlos López', service: 'Corte', status: 'en-proceso', reminderSent: true, reminderTime: '08:30', price: 25 },
      { id: 3, time: '11:00', client: 'Miguel Torres', service: 'Barba', status: 'pendiente', reminderSent: false, reminderTime: null, price: 15 },
      { id: 4, time: '12:00', client: null, service: 'HUECO LIBRE', status: 'libre', reminderSent: false, reminderTime: null, price: 0 },
      { id: 5, time: '14:00', client: 'Roberto Silva', service: 'Servicio Completo', status: 'confirmada', reminderSent: true, reminderTime: '12:00', price: 45 },
      { id: 6, time: '15:30', client: 'Diego Martín', service: 'Corte', status: 'pendiente', reminderSent: false, reminderTime: null, price: 25 },
      { id: 7, time: '16:00', client: 'Andrés Ruiz', service: 'Corte + Barba', status: 'confirmada', reminderSent: true, reminderTime: '14:00', price: 35 },
      { id: 8, time: '17:00', client: null, service: 'HUECO LIBRE', status: 'libre', reminderSent: false, reminderTime: null, price: 0 }
    ];
    setAppointments(todaySchedule);

    const storedClients = JSON.parse(localStorage.getItem('nehue-clients')) || [];
    const storedServices = JSON.parse(localStorage.getItem('nehue-services')) || [];
    setClients(storedClients);
    setServices(storedServices);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmada':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'en-proceso':
        return <Clock className="w-5 h-5 text-info animate-spin" style={{ animationDuration: '3s' }} />;
      case 'pendiente':
        return <Clock className="w-5 h-5 text-warning" />;
      case 'libre':
        return <PlusCircle className="w-5 h-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getReminderStatus = (appointment) => {
    if (appointment.status === 'libre') return null;
    
    if (appointment.reminderSent) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center w-8 h-8">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Recordatorio enviado a las {appointment.reminderTime}</p>
          </TooltipContent>
        </Tooltip>
      );
    } else {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleSendReminder(appointment.id);
              }}
              className="text-warning hover:text-yellow-700 hover:bg-yellow-100/50 h-8 w-8"
              aria-label="Enviar recordatorio"
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Enviar recordatorio de cita</p>
          </TooltipContent>
        </Tooltip>
      );
    }
  };

  const handleSendReminder = (appointmentId) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    const currentTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    setAppointments(prev => prev.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, reminderSent: true, reminderTime: currentTime }
        : apt
    ));
    
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

  const handleNewAppointment = (time) => {
    const [hour, minute] = time.split(':');
    const hourIndex = (parseInt(hour) - 8) * 2 + Math.floor(parseInt(minute) / 30);
    setModalData({
        date: new Date(),
        hourIndex: hourIndex,
    });
    setIsModalOpen(true);
  };

  const handleAppointmentClick = (appointment) => {
    if (appointment.status === 'libre') {
      handleNewAppointment(appointment.time);
    } else {
      toast({
        title: `📅 Cita de ${appointment.client}`,
        description: `${appointment.service} a las ${appointment.time}`,
      });
    }
  };

  const handleSaveAppointment = (newAppointment) => {
    toast({
        title: '✅ Cita Guardada',
        description: `Se ha agendado a ${newAppointment.details.clientName} para el servicio ${newAppointment.details.serviceName}.`
    });
    setIsModalOpen(false);
  };

  const totalHours = appointments.filter(a => a.status !== 'libre').length * 0.75;
  const estimatedRevenue = appointments
    .filter(a => a.status === 'confirmada' || a.status === 'en-proceso')
    .reduce((sum, a) => sum + a.price, 0);

  return (
    <>
      <div className="premium-card p-4 sm:p-6 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
          <h3 className="text-xl sm:text-2xl font-bold text-card-foreground flex items-center tracking-tight">
            <Clock className="w-6 sm:w-7 h-6 sm:h-7 mr-3 text-primary" />
            Lista de Turnos
          </h3>
          <div className="text-sm sm:text-base text-muted-foreground">
            {appointments.filter(apt => apt.status !== 'libre').length} citas programadas
          </div>
        </div>
        
        <div className="space-y-3 max-h-[30rem] overflow-y-auto pr-2 custom-scrollbar" aria-label="Lista de turnos móvil">
          {appointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {appointment.status === 'libre' ? (
                <Button
                  variant="ghost"
                  className="w-full h-auto p-4 flex items-center justify-between rounded-xl transition-all duration-300 border border-dashed border-border/50 hover:bg-accent hover:border-primary/50"
                  onClick={() => handleAppointmentClick(appointment)}
                  aria-label={`Agendar cita a las ${appointment.time}`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="text-center min-w-[50px]">
                      <p className="text-base sm:text-lg font-bold text-card-foreground">
                        {appointment.time}
                      </p>
                    </div>
                    <div className="w-px h-10 bg-border/70 hidden sm:block"></div>
                    <div className="flex items-center text-muted-foreground font-semibold text-sm sm:text-base">
                      <PlusCircle className="w-5 h-5 mr-3 text-gray-400" />
                      Hueco Libre - Agendar
                    </div>
                  </div>
                </Button>
              ) : (
                <div
                  className="flex items-center justify-between p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 border bg-card hover:bg-accent"
                  onClick={() => handleAppointmentClick(appointment)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleAppointmentClick(appointment)}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className="text-center min-w-[50px]">
                      <p className="text-base sm:text-lg font-bold text-card-foreground">
                        {appointment.time}
                      </p>
                    </div>
                    <div className="w-px h-10 bg-border/70 hidden sm:block"></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-card-foreground tracking-tight text-base sm:text-lg truncate" title={appointment.client}>
                        {appointment.client}
                      </h4>
                      <p className="text-muted-foreground text-sm sm:text-base truncate" title={appointment.service}>
                        {appointment.service}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-4 ml-2">
                    {getReminderStatus(appointment)}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-6 h-6 flex items-center justify-center">
                          {getStatusIcon(appointment.status)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="capitalize">{appointment.status.replace('_', ' ')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm sm:text-base">
            <div className="flex flex-col items-center p-3 rounded-lg bg-accent/50">
              <div className="flex items-center space-x-2 text-success mb-1">
                <Clock className="w-5 h-5" />
                <span className="font-bold text-base sm:text-lg text-card-foreground">{totalHours.toFixed(1)} hs</span>
              </div>
              <span className="text-muted-foreground text-xs sm:text-sm">Horas estimadas</span>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-lg bg-accent/50">
              <div className="flex items-center space-x-2 text-primary mb-1">
                <Banknote className="w-5 h-5" />
                <span className="font-bold text-base sm:text-lg text-card-foreground">${estimatedRevenue.toFixed(2)}</span>
              </div>
              <span className="text-muted-foreground text-xs sm:text-sm">Ganancia estimada</span>
            </div>

            <div className="flex flex-col items-center p-3 rounded-lg bg-accent/50">
              <div className="flex items-center space-x-2 text-card-foreground mb-1">
                <User className="w-5 h-5" />
                <span className="font-bold text-base sm:text-lg">
                  {appointments.filter(apt => apt.status !== 'libre').length}
                </span>
              </div>
              <span className="text-muted-foreground text-xs sm:text-sm">Citas totales</span>
            </div>
          </div>
        </div>
      </div>
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalData={modalData}
        onSave={handleSaveAppointment}
        clients={clients}
        services={services}
        appointments={appointments}
      />
    </>
  );
};

export default TodaySchedule;