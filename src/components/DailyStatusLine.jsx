import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Calendar, AlertTriangle } from 'lucide-react';

const DailyStatusLine = () => {
  // Datos simulados
  const nextClientName = "Juan";
  const nextClientTime = "09:00";
  const totalAppointments = 8;
  const freeSlots = 2;
  const cancellations = 1;
  const newClients = 2;

  // Lógica para elegir qué mensaje mostrar
  let statusMessage;
  if (cancellations > 0) {
    statusMessage = `Comenzamos bien: solo ${cancellations} cancelación · ${newClients} clientes nuevos`;
  } else {
    statusMessage = `Arrancás con ${nextClientName} a las ${nextClientTime} · Hoy tenés ${totalAppointments} turnos · ${freeSlots} huecos libres`;
  }

  const Icon = cancellations > 0 ? AlertTriangle : Sun;

  return (
    <motion.div
      className="flex items-center justify-center gap-3 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Icon className={`w-4 h-4 ${cancellations > 0 ? 'text-warning' : 'text-primary'}`} />
      <p className="font-medium">{statusMessage}</p>
    </motion.div>
  );
};

export default DailyStatusLine;