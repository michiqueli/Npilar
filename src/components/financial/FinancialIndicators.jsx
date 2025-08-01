import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Receipt } from "lucide-react";

const FinancialIndicators = ({ financialSummary }) => {
  return (
    <motion.div
      className="space-y-6 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="premium-card p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mr-3">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-sm text-green-500 font-semibold tracking-wide">
                ENTRA
              </span>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">
              ${financialSummary.totalIncome.toLocaleString()}
            </h3>
            <p className="text-sm text-muted-foreground">Ingresos Totales</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mr-3">
                <TrendingDown className="w-6 h-6 text-red-500" />
              </div>
              <span className="text-sm text-red-500 font-semibold tracking-wide">
                SALE
              </span>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">
              ${financialSummary.totalExpenses.toLocaleString()}
            </h3>
            <p className="text-sm text-muted-foreground">Gastos Totales</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm text-primary font-semibold tracking-wide">
                GANANCIA
              </span>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">
              ${financialSummary.netProfit.toLocaleString()}
            </h3>
            <p className="text-sm text-muted-foreground">Ganancia Neta</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Receipt className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm text-primary font-semibold tracking-wide">
                PROMEDIO
              </span>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">
              ${Math.round(financialSummary.avgTicket)}
            </h3>
            <p className="text-sm text-muted-foreground">
              Promedio por Cliente
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default FinancialIndicators;
