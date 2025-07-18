import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

const RevenueProjection = ({ clients, appointments }) => {
  const projectionData = useMemo(() => {
    const recurringClients = clients.filter(c => c.visits >= 5);
    const avgMonthlyVisits = recurringClients.reduce((sum, c) => sum + (c.visits / 12), 0);
    const avgServicePrice = 28;
    
    const monthlyProjection = Math.round(avgMonthlyVisits * avgServicePrice);
    const weeklyProjection = Math.round(monthlyProjection / 4.33);
    const dailyProjection = Math.round(weeklyProjection / 7);
    
    return {
      daily: dailyProjection,
      weekly: weeklyProjection,
      monthly: monthlyProjection,
      recurringClients: recurringClients.length,
      growthRate: 12
    };
  }, [clients, appointments]);

  return (
    <div className="nehue-card p-6">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-nehue-verde" />
        Proyección de Ingresos
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
            <span className="text-gray-300">Proyección Diaria</span>
            <span className="text-white font-semibold">${projectionData.daily}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
            <span className="text-gray-300">Proyección Semanal</span>
            <span className="text-white font-semibold">${projectionData.weekly}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
            <span className="text-gray-300">Proyección Mensual</span>
            <span className="text-white font-semibold">${projectionData.monthly}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="text-center p-4 bg-nehue-verde/10 rounded-lg border border-nehue-verde/30">
            <h4 className="text-lg font-semibold text-white mb-2">Basado en Clientes Recurrentes</h4>
            <p className="text-3xl font-bold text-nehue-verde">{projectionData.recurringClients}</p>
            <p className="text-sm text-gray-400">clientes con 5+ visitas</p>
          </div>
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-400">Tasa de crecimiento estimada</p>
            <p className="text-xl font-bold text-green-400">+{projectionData.growthRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueProjection;