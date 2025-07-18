import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Phone, Mail, MessageSquare, Edit, Calendar, DollarSign, Scissors, CheckCircle, Clock, User, Tag, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const ClientProfile = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [client, setClient] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    const storedClients = JSON.parse(localStorage.getItem('nehue-clients')) || [];
    const currentClient = storedClients.find(c => c.id.toString() === id);
    
    if (currentClient) {
      setClient(currentClient);
      const allPayments = JSON.parse(localStorage.getItem('dailyPayments')) || [];
      const clientPayments = allPayments.filter(p => p.client.id.toString() === id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setPaymentHistory(clientPayments);
    }
  }, [id]);

  const getClientAvatar = (name) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['bg-primary', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];
    const colorIndex = name.length % colors.length;
    return { initials, color: colors[colorIndex] };
  };

  const handleActionClick = (action) => {
    toast({
      title: `🚧 ${action}`,
      description: "Esta función no está implementada aún. ¡Pídela en tu próximo prompt! 🚀"
    });
  };

  if (!client) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Cliente no encontrado</h2>
          <p className="text-muted-foreground">El cliente que buscas no existe o ha sido eliminado.</p>
          <Button asChild className="mt-4">
            <Link to="/clientes">Volver a Clientes</Link>
          </Button>
        </div>
      </div>
    );
  }

  const avatar = getClientAvatar(client.name);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <>
      <Helmet>
        <title>{client.name} - Perfil de Cliente</title>
        <meta name="description" content={`Perfil detallado de ${client.name}, incluyendo historial de servicios y preferencias.`} />
      </Helmet>

      <motion.div 
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Link to="/clientes" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Volver a todos los clientes
          </Link>
        </motion.div>

        {/* Header del Perfil */}
        <motion.div variants={itemVariants} className="premium-card p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className={`w-24 h-24 rounded-full ${avatar.color} flex-shrink-0 flex items-center justify-center text-primary-foreground font-bold text-4xl shadow-lg`}>
              {avatar.initials}
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-foreground">{client.name}</h1>
              <p className="text-muted-foreground mt-1">Cliente desde {format(new Date(client.createdAt), 'MMMM yyyy', { locale: es })}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => handleActionClick('Llamar')} variant="outline" size="sm"><Phone className="w-4 h-4 mr-2" />Llamar</Button>
                <Button onClick={() => handleActionClick('WhatsApp')} variant="outline" size="sm"><MessageSquare className="w-4 h-4 mr-2" />WhatsApp</Button>
                <Button onClick={() => handleActionClick('Editar')} variant="outline" size="sm"><Edit className="w-4 h-4 mr-2" />Editar</Button>
                <Button onClick={() => handleActionClick('Agendar')} variant="primary" size="sm"><Calendar className="w-4 h-4 mr-2" />Agendar Cita</Button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna de Historial */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <div className="premium-card p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-primary"/> Historial de Servicios</h2>
              {paymentHistory.length > 0 ? (
                <ul className="space-y-4">
                  {paymentHistory.map((payment, index) => (
                    <li key={index} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg border">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Scissors className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-foreground">{payment.serviceName}</p>
                          <p className="text-sm font-bold text-success">€{payment.amount.toFixed(2)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{format(new Date(payment.timestamp), 'PPP', { locale: es })}</p>
                        <p className="text-xs text-muted-foreground mt-1">Pagado con: {payment.paymentMethod}</p>
                        {payment.comment && <p className="text-xs italic text-muted-foreground mt-2">"{payment.comment}"</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-8">No hay historial de servicios registrados.</p>
              )}
            </div>
          </motion.div>

          {/* Columna de Información */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="premium-card p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><Info className="w-5 h-5 text-primary"/> Información General</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-muted-foreground"/> <span className="text-foreground">{client.phone}</span></div>
                {client.email && <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-muted-foreground"/> <span className="text-foreground">{client.email}</span></div>}
                <div className="flex items-center gap-3"><Tag className="w-4 h-4 text-muted-foreground"/> <span className="text-foreground">Servicio preferido: {client.preferredService}</span></div>
              </div>
            </div>
            <div className="premium-card p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><User className="w-5 h-5 text-primary"/> Notas del Barbero</h2>
              <p className="text-sm text-muted-foreground italic">
                {client.notes || "No hay notas personales para este cliente."}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default ClientProfile;