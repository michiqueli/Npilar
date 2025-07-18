import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Sparkles, Receipt, CheckCircle, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import PaymentModal from '@/components/payments/PaymentModal';

const NextClientHeader = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [nextClient, setNextClient] = useState(null);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  
  const today = new Date();
  const dayAndMonth = format(today, 'EEEE, d MMMM', { locale: es });

  useEffect(() => {
    const clientData = {
      id: 1,
      name: 'Juan Pérez',
      phone: '34600123456', // Número para WhatsApp
      time: '09:00',
      service: 'Corte + Barba',
      status: 'confirmada',
      isPaid: false,
    };

    const payments = JSON.parse(localStorage.getItem('dailyTransactions')) || [];
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const paymentExists = payments.some(p => p.client?.id === clientData.id && format(new Date(p.date), 'yyyy-MM-dd') === todayStr);
    
    setNextClient({ ...clientData, isPaid: paymentExists });
  }, []);

  const handleViewProfileClick = (e) => {
    e.stopPropagation();
    if (nextClient) {
      navigate(`/clientes/${nextClient.id}`);
    }
  };

  const handleWhatsAppClick = (e) => {
    e.stopPropagation();
    if (nextClient && nextClient.phone) {
      const message = encodeURIComponent(`Hola ${nextClient.name}, te esperamos hoy a las ${nextClient.time} para tu ${nextClient.service.toLowerCase()}. ¡Nos vemos!`);
      window.open(`https://wa.me/${nextClient.phone}?text=${message}`, '_blank');
    }
  };

  const handleRegisterPaymentClick = (e) => {
    e.stopPropagation();
    setPaymentModalOpen(true);
  };

  const handleSavePayment = (paymentData) => {
    const existingPayments = JSON.parse(localStorage.getItem('dailyTransactions')) || [];
    localStorage.setItem('dailyTransactions', JSON.stringify([...existingPayments, paymentData]));

    setNextClient(prev => ({...prev, isPaid: true }));
    setPaymentModalOpen(false);
    toast({
      title: '✅ Pago Registrado',
      description: `El pago de ${paymentData.client.name} se ha guardado con éxito.`,
      variant: 'default',
    });
  };

  return (
    <>
      <motion.div
        className="premium-card w-full p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-base font-bold text-primary uppercase tracking-wider">Próximo Cliente</h2>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-5 h-5" />
              <p className="text-base font-medium capitalize">{dayAndMonth}</p>
            </div>
          </div>
          
          {nextClient ? (
            <div className="pl-2 space-y-6">
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-card-foreground tracking-tight">{nextClient.name}</p>
                <div className="flex items-center gap-4 text-muted-foreground font-medium mt-2">
                  <span>{nextClient.time}</span>
                  <span className="w-1.5 h-1.5 bg-border rounded-full"></span>
                  <span>{nextClient.service}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Button onClick={handleViewProfileClick} variant="secondary" className="w-full sm:w-auto">
                  <User className="w-5 h-5 mr-2" />
                  Ver Ficha
                </Button>
                {nextClient.phone && (
                  <Button onClick={handleWhatsAppClick} variant="secondary" className="w-full sm:w-auto">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Enviar WhatsApp
                  </Button>
                )}
              </div>

              <div className="pt-2">
                 {nextClient.isPaid ? (
                    <div className="flex items-center gap-3 text-success font-semibold bg-success/10 border border-success/20 rounded-lg px-4 py-3 w-full sm:w-auto justify-center">
                        <CheckCircle className="w-6 h-6"/>
                        <span className="text-lg">Pago Registrado</span>
                    </div>
                 ) : (
                    <Button onClick={handleRegisterPaymentClick} variant="primary" size="lg" className="w-full sm:w-auto">
                      <Receipt className="w-5 h-5 mr-2" />
                      Registrar Pago
                    </Button>
                 )}
              </div>
            </div>
          ) : (
             <div className="pl-2 space-y-2">
              <p className="text-3xl sm:text-4xl font-bold text-card-foreground tracking-tight">Agenda Libre</p>
              <div className="flex items-center gap-3 text-muted-foreground font-medium mt-2">
                <Sparkles className="w-5 h-5 text-success" />
                <span>Disfrutá tu descanso</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {nextClient && (
        <PaymentModal 
          isOpen={isPaymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          onSave={handleSavePayment}
          isManual={false}
          prefillData={{ client: nextClient, service: nextClient.service, time: nextClient.time }}
        />
      )}
    </>
  );
};

export default NextClientHeader;