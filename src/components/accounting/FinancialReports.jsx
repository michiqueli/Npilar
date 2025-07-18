import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const FinancialReports = ({ transactions, period }) => {
  const { toast } = useToast();

  const reportData = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    
    // Análisis por día de la semana
    const dayAnalysis = {};
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    days.forEach(day => {
      dayAnalysis[day] = { income: 0, count: 0 };
    });
    
    income.forEach(transaction => {
      const date = new Date(transaction.date);
      const dayName = days[date.getDay()];
      dayAnalysis[dayName].income += transaction.amount;
      dayAnalysis[dayName].count += 1;
    });
    
    // Encontrar el día más rentable
    const mostProfitableDay = Object.entries(dayAnalysis)
      .sort(([,a], [,b]) => b.income - a.income)[0];
    
    // Análisis por método de pago
    const paymentMethodAnalysis = {};
    income.forEach(transaction => {
      if (!paymentMethodAnalysis[transaction.paymentMethod]) {
        paymentMethodAnalysis[transaction.paymentMethod] = 0;
      }
      paymentMethodAnalysis[transaction.paymentMethod] += transaction.amount;
    });
    
    return {
      totalIncome,
      totalExpenses,
      netProfit,
      dayAnalysis,
      mostProfitableDay,
      paymentMethodAnalysis,
      transactionCount: transactions.length
    };
  }, [transactions]);

  const handleExport = () => {
    toast({
      title: "📊 Exportar Reporte",
      description: "🚧 Esta función no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  return (
    <div className="space-y-6">
      <div className="premium-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-card-foreground flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-primary" />
            Reporte Financiero - {period}
          </h3>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <h4 className="text-lg font-semibold text-card-foreground mb-2">Ingresos Totales</h4>
            <p className="text-3xl font-bold text-green-500">${reportData.totalIncome.toLocaleString()}</p>
          </div>
          
          <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/30">
            <h4 className="text-lg font-semibold text-card-foreground mb-2">Gastos Totales</h4>
            <p className="text-3xl font-bold text-red-500">${reportData.totalExpenses.toLocaleString()}</p>
          </div>
          
          <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/30">
            <h4 className="text-lg font-semibold text-card-foreground mb-2">Ganancia Neta</h4>
            <p className="text-3xl font-bold text-primary">${reportData.netProfit.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="premium-card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h4 className="text-lg font-semibold text-card-foreground mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary" />
            Análisis por Día de la Semana
          </h4>
          
          <div className="space-y-3">
            {Object.entries(reportData.dayAnalysis).map(([day, data], index) => {
              const maxIncome = Math.max(...Object.values(reportData.dayAnalysis).map(d => d.income));
              const percentage = maxIncome > 0 ? (data.income / maxIncome) * 100 : 0;
              
              return (
                <div key={day} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">{day}</span>
                    <div className="text-right">
                      <span className="text-card-foreground font-semibold">${data.income.toLocaleString()}</span>
                      <p className="text-xs text-muted-foreground">{data.count} servicios</p>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          {reportData.mostProfitableDay && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/30">
              <p className="text-sm text-primary font-medium">
                Día más rentable: {reportData.mostProfitableDay[0]} 
                (${reportData.mostProfitableDay[1].income.toLocaleString()})
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          className="premium-card p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h4 className="text-lg font-semibold text-card-foreground mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            Balance por Método de Pago
          </h4>
          
          <div className="space-y-4">
            {Object.entries(reportData.paymentMethodAnalysis).map(([method, amount], index) => {
              const percentage = reportData.totalIncome > 0 ? ((amount / reportData.totalIncome) * 100).toFixed(1) : 0;
              const colors = {
                'Efectivo': 'from-green-500 to-emerald-500',
                'Tarjeta': 'from-blue-500 to-cyan-500',
                'Transferencia': 'from-purple-500 to-pink-500',
                'MercadoPago': 'from-yellow-500 to-orange-500'
              };
              
              return (
                <motion.div
                  key={method}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${colors[method] || 'from-gray-500 to-gray-600'}`} />
                    <span className="text-muted-foreground font-medium">{method}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-card-foreground font-semibold">${amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{percentage}%</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FinancialReports;