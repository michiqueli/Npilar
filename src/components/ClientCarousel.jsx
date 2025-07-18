import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y } from 'swiper/modules';
import { motion } from 'framer-motion';
import { User, MessageSquare, Receipt, Clock, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PaymentModal from '@/components/payments/PaymentModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import 'swiper/css';
import 'swiper/css/navigation';

const mockAppointments = [
  { id: 1, client: { id: 101, name: 'Carlos Sánchez', phone: '34600111222' }, service: 'Corte Clásico', time: '09:00', status: 'completed' },
  { id: 2, client: { id: 102, name: 'Laura Gómez', phone: '34600222333' }, service: 'Corte + Barba', time: '10:00', status: 'in_progress' },
  { id: 3, client: { id: 103, name: 'Pedro Martínez', phone: '34600333444' }, service: 'Afeitado Navaja', time: '11:00', status: 'pending' },
  { id: 4, client: { id: 104, name: 'Ana Fernández', phone: '34600444555' }, service: 'Corte Degradado', time: '12:00', status: 'pending' },
];

const ClientCard = ({ title, appointment, onRegisterPayment, onWhatsApp, onViewProfile }) => {
  if (!appointment) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-card rounded-xl border border-border-gray">
        <Info className="w-10 h-10 text-muted-foreground mb-4" />
        <p className="font-bold text-text-dark-gray">{title}</p>
        <p className="text-sm text-muted-foreground">No hay cliente</p>
      </div>
    );
  }

  const { client, service, time } = appointment;

  return (
    <motion.div 
      className="h-full flex flex-col justify-between p-6 bg-card rounded-xl border border-border-gray shadow-sm"
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
      transition={{ duration: 0.2 }}
    >
      <div>
        <p className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">{title}</p>
        <h3 className="text-2xl font-bold text-text-dark-gray truncate">{client.name}</h3>
        <div className="flex items-center gap-2 text-muted-foreground mt-1">
          <Clock className="w-4 h-4" />
          <p className="font-medium">{time} - {service}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-col sm:flex-row gap-2">
        <Button onClick={() => onViewProfile(client.id)} variant="secondary" size="sm" className="flex-1">
          <User className="w-4 h-4 mr-2" /> Ficha
        </Button>
        <Button onClick={() => onWhatsApp(client)} variant="secondary" size="sm" className="flex-1">
          <MessageSquare className="w-4 h-4 mr-2" /> WhatsApp
        </Button>
        <Button onClick={() => onRegisterPayment(appointment)} variant="primary" size="sm" className="flex-1 bg-active-dark-gray hover:bg-active-dark-gray/90">
          <Receipt className="w-4 h-4 mr-2" /> Cobrar
        </Button>
      </div>
    </motion.div>
  );
};

const ClientCarousel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    // In a real app, you would fetch this from an API
    // For now, we use mock data and simulate API call
    setAppointments(mockAppointments);
  }, []);

  const { past, current, next } = useMemo(() => {
    const now = new Date();
    // This logic is simplified. A real implementation would compare times more robustly.
    const completed = appointments.filter(a => a.status === 'completed').sort((a, b) => b.time.localeCompare(a.time));
    const inProgress = appointments.find(a => a.status === 'in_progress');
    const pending = appointments.filter(a => a.status === 'pending').sort((a, b) => a.time.localeCompare(b.time));

    return {
      past: completed[0] || null,
      current: inProgress || null,
      next: pending[0] || null,
    };
  }, [appointments]);

  const handleRegisterPayment = (appointment) => {
    setSelectedAppointment(appointment);
    setPaymentModalOpen(true);
  };

  const handleSavePayment = (paymentData) => {
    const existingPayments = JSON.parse(localStorage.getItem('dailyTransactions')) || [];
    localStorage.setItem('dailyTransactions', JSON.stringify([...existingPayments, paymentData]));
    setPaymentModalOpen(false);
    toast({
      title: '✅ Pago Registrado',
      description: `El pago de ${paymentData.client.name} se ha guardado con éxito.`,
    });
  };

  const handleWhatsApp = (client) => {
    if (client && client.phone) {
      const message = encodeURIComponent(`Hola ${client.name}, un saludo desde Skin Hair Studio PILAR!`);
      window.open(`https://wa.me/${client.phone}?text=${message}`, '_blank');
    } else {
       toast({
        title: '⚠️ Sin número de teléfono',
        description: 'Este cliente no tiene un número de WhatsApp guardado.',
        variant: 'destructive'
      });
    }
  };

  const handleViewProfile = (clientId) => {
    navigate(`/clientes/${clientId}`);
  };

  return (
    <div className="relative">
      <Swiper
        modules={[Navigation, A11y]}
        spaceBetween={20}
        slidesPerView={1}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        breakpoints={{
          768: { slidesPerView: 2 },
          1280: { slidesPerView: 3 },
        }}
        className="!pb-2"
      >
        <SwiperSlide>
          <ClientCard title="Pasado" appointment={past} onRegisterPayment={handleRegisterPayment} onWhatsApp={handleWhatsApp} onViewProfile={handleViewProfile} />
        </SwiperSlide>
        <SwiperSlide>
          <ClientCard title="Actual" appointment={current} onRegisterPayment={handleRegisterPayment} onWhatsApp={handleWhatsApp} onViewProfile={handleViewProfile} />
        </SwiperSlide>
        <SwiperSlide>
          <ClientCard title="Próximo" appointment={next} onRegisterPayment={handleRegisterPayment} onWhatsApp={handleWhatsApp} onViewProfile={handleViewProfile} />
        </SwiperSlide>
      </Swiper>

      <button className="swiper-button-prev-custom absolute top-1/2 -translate-y-1/2 left-0 z-10 w-10 h-10 rounded-full bg-card border border-border-gray flex items-center justify-center text-text-dark-gray hover:bg-hover-gray transition-transform duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button className="swiper-button-next-custom absolute top-1/2 -translate-y-1/2 right-0 z-10 w-10 h-10 rounded-full bg-card border border-border-gray flex items-center justify-center text-text-dark-gray hover:bg-hover-gray transition-transform duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">
        <ChevronRight className="w-6 h-6" />
      </button>

      {selectedAppointment && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          onSave={handleSavePayment}
          isManual={false}
          prefillData={{ 
            client: selectedAppointment.client, 
            service: selectedAppointment.service, 
            time: selectedAppointment.time 
          }}
        />
      )}
    </div>
  );
};

export default ClientCarousel;