import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Clock, Trophy } from 'lucide-react';

const ClientMetrics = () => {
  // Datos simulados basados en la información del mes
  const clientMetrics = {
    attendanceRate: 92,
    cancellations: 5,
    uniqueClients: 82,
    avgVisitsPerClient: 1.5,
    avgReturnDays: 23,
    topClients: [
      { name: 'Juan Pérez', visits: 4, totalSpent: 120 },
      { name: 'Carlos López', visits: 3, totalSpent: 105 },
      { name: 'Matías Gómez', visits: 3, totalSpent: 100 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          className="premium-card p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <UserCheck className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-card-foreground mb-2">Tasa de Asistencia</h4>
          <p className="text-3xl font-bold text-green-500 mb-1">{clientMetrics.attendanceRate}%</p>
          <p className="text-muted-foreground text-sm">De turnos confirmados</p>
        </motion.div>

        <motion.div
          className="premium-card p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-card-foreground mb-2">Clientes Únicos</h4>
          <p className="text-3xl font-bold text-blue-500 mb-1">{clientMetrics.uniqueClients}</p>
          <p className="text-muted-foreground text-sm">Este mes</p>
        </motion.div>

        <motion.div
          className="premium-card p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Clock className="w-8 h-8 text-purple-500 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-card-foreground mb-2">Retorno Promedio</h4>
          <p className="text-3xl font-bold text-purple-500 mb-1">{clientMetrics.avgReturnDays}</p>
          <p className="text-muted-foreground text-sm">Días entre visitas</p>
        </motion.div>

        <motion.div
          className="premium-card p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-card-foreground mb-2">Visitas por Cliente</h4>
          <p className="text-3xl font-bold text-yellow-500 mb-1">{clientMetrics.avgVisitsPerClient}</p>
          <p className="text-muted-foreground text-sm">Promedio mensual</p>
        </motion.div>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cancelaciones */}
        <motion.div
          className="premium-card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h4 className="text-lg font-semibold text-card-foreground mb-4">Cancelaciones del Mes</h4>
          <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/30">
            <div>
              <p className="text-2xl font-bold text-red-500">{clientMetrics.cancellations}</p>
              <p className="text-muted-foreground text-sm">Turnos cancelados</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-sm">Representa el</p>
              <p className="text-red-500 font-semibold">{(100 - clientMetrics.attendanceRate)}%</p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm mt-3">
            💡 Considerá implementar recordatorios automáticos para reducir cancelaciones
          </p>
        </motion.div>

        {/* Top 3 clientes */}
        <motion.div
          className="premium-card p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h4 className="text-lg font-semibold text-card-foreground mb-4">Top 3 Clientes del Mes</h4>
          <div className="space-y-3">
            {clientMetrics.topClients.map((client, index) => (
              <motion.div
                key={client.name}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-card-foreground font-medium">{client.name}</p>
                    <p className="text-muted-foreground text-sm">{client.visits} visitas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-500 font-semibold">${client.totalSpent}</p>
                  <p className="text-muted-foreground text-xs">Total gastado</p>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-muted-foreground text-sm mt-3">
            🎁 Considerá premiar a estos clientes fieles con descuentos especiales
          </p>
        </motion.div>
      </div>

      {/* Análisis de retorno */}
      <motion.div
        className="premium-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <h4 className="text-lg font-semibold text-card-foreground mb-4">Análisis de Fidelización</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <p className="text-2xl font-bold text-green-500 mb-2">{clientMetrics.avgReturnDays} días</p>
            <p className="text-muted-foreground text-sm">Tiempo promedio entre visitas</p>
            <p className="text-muted-foreground text-xs mt-1">Ritmo saludable de retorno</p>
          </div>
          <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <p className="text-2xl font-bold text-blue-500 mb-2">68%</p>
            <p className="text-muted-foreground text-sm">Clientes que regresan</p>
            <p className="text-muted-foreground text-xs mt-1">Tasa de retención mensual</p>
          </div>
          <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
            <p className="text-2xl font-bold text-purple-500 mb-2">32%</p>
            <p className="text-muted-foreground text-sm">Clientes nuevos</p>
            <p className="text-muted-foreground text-xs mt-1">Crecimiento de base</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/30">
          <p className="text-primary font-medium text-sm">
            📈 Tus clientes vuelven en promedio cada {clientMetrics.avgReturnDays} días - esto indica una buena fidelización
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ClientMetrics;