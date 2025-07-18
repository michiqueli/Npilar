import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Users } from 'lucide-react';

const WeeklyAnalysis = () => {
  const weeklyData = [
    { day: 'Lunes', avgTurnos: 8, avgIngresos: 560, percentage: 12, trend: 'neutral' },
    { day: 'Martes', avgTurnos: 12, avgIngresos: 890, percentage: 18, trend: 'up' },
    { day: 'Miércoles', avgTurnos: 15, avgIngresos: 1100, percentage: 20, trend: 'up' },
    { day: 'Jueves', avgTurnos: 14, avgIngresos: 1050, percentage: 19, trend: 'up' },
    { day: 'Viernes', avgTurnos: 18, avgIngresos: 1400, percentage: 23, trend: 'up' },
    { day: 'Sábado', avgTurnos: 10, avgIngresos: 750, percentage: 8, trend: 'down' }
  ];

  const bestDay = weeklyData.reduce((prev, current) => 
    prev.avgIngresos > current.avgIngresos ? prev : current
  );

  const maxIngresos = Math.max(...weeklyData.map(d => d.avgIngresos));

  return (
    <div className="premium-card p-6">
      <h3 className="text-xl font-semibold text-card-foreground mb-6 flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-primary" />
        Rendimiento por Día de la Semana
      </h3>

      <div className="overflow-x-auto mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Día</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-medium">Turnos promedio</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-medium">Ingresos promedio</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-medium">% sobre el total</th>
            </tr>
          </thead>
          <tbody>
            {weeklyData.map((day, index) => (
              <motion.tr
                key={day.day}
                className={`border-b border-border/50 hover:bg-accent transition-colors ${
                  day.day === bestDay.day ? 'border-l-4 border-l-primary bg-primary/5' : ''
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    {day.day === bestDay.day && (
                      <TrendingUp className="w-4 h-4 text-primary" />
                    )}
                    <span className="text-card-foreground font-medium">{day.day}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center text-muted-foreground">{day.avgTurnos}</td>
                <td className="py-4 px-4 text-center text-muted-foreground">${day.avgIngresos}</td>
                <td className="py-4 px-4 text-center text-muted-foreground">{day.percentage}%</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gráfico de barras horizontales */}
      <div className="space-y-4 mb-6">
        <h4 className="text-lg font-medium text-card-foreground">Visualización de Ingresos</h4>
        {weeklyData.map((day, index) => {
          const percentage = (day.avgIngresos / maxIngresos) * 100;
          const barColor = day.day === bestDay.day ? 'bg-primary/30' : 'bg-muted/50';
          
          return (
            <motion.div
              key={day.day}
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium w-20">{day.day}</span>
                <span className="text-card-foreground font-semibold">${day.avgIngresos}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <motion.div
                  className={`h-3 rounded-full ${barColor} border`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Insights interpretativos */}
      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
        <p className="text-primary font-medium">
          📊 {bestDay.day} es el día más productivo del mes
        </p>
        <p className="text-muted-foreground text-sm">
          💡 Considerá reforzar el equipo los miércoles y viernes para maximizar ingresos
        </p>
        <p className="text-muted-foreground text-sm">
          🎯 Los fines de semana tienen menor demanda - ideal para mantenimiento o promociones
        </p>
      </div>
    </div>
  );
};

export default WeeklyAnalysis;