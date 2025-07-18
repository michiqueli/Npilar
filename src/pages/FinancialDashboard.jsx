import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Dialog } from '@/components/ui/dialog';
import FinancialIndicators from '@/components/financial/FinancialIndicators';
import TransactionTable from '@/components/financial/TransactionTable';
import EmptyTransactionsState from '@/components/financial/EmptyTransactionsState';
import PaymentModal from '@/components/payments/PaymentModal';
import ExpenseForm from '@/components/accounting/ExpenseForm';
import FinancialActions from '@/components/financial/FinancialActions';
import FilterBar from '@/components/financial/FilterBar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const FinancialDashboard = () => {
  const { toast } = useToast();
  const [allTransactions, setAllTransactions] = useState([]);
  const [clients, setClients] = useState([]);
  const [isIncomeModalOpen, setIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState(null);

  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem('dailyTransactions');
      if (storedTransactions) {
        setAllTransactions(JSON.parse(storedTransactions));
      } else {
        const today = new Date();
        const mock = [
          { id: 1, type: 'income', clientName: 'Juan Pérez', service: 'Corte + Barba', amount: 35, paymentMethod: 'Efectivo', date: format(today, 'yyyy-MM-dd'), confirmed: true, appointmentId: 'appt-1' },
          { id: 2, type: 'expense', description: 'Compra de productos', category: 'Suministros', amount: 50, paymentMethod: 'Tarjeta', date: format(today, 'yyyy-MM-dd'), receipt: true },
          { id: 3, type: 'income', clientName: 'Carlos López', service: 'Corte', amount: 25, paymentMethod: 'Tarjeta', date: format(today, 'yyyy-MM-dd'), confirmed: false, appointmentId: 'appt-2' },
        ];
        setAllTransactions(mock);
      }
      
      const storedClients = localStorage.getItem('nehue-clients');
      if (storedClients) {
        setClients(JSON.parse(storedClients));
      } else {
        setClients([
          { id: 1, name: 'Juan Pérez' },
          { id: 2, name: 'Carlos López' },
          { id: 3, name: 'Ana García' },
        ]);
      }
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyTransactions', JSON.stringify(allTransactions));
  }, [allTransactions]);

  const filteredTransactions = useMemo(() => {
    if (!filters) {
      return allTransactions;
    }
    return allTransactions.filter(t => {
      const transactionDate = startOfDay(new Date(t.date));
      const from = filters.dateRange?.from ? startOfDay(filters.dateRange.from) : null;
      const to = filters.dateRange?.to ? endOfDay(filters.dateRange.to) : null;

      if (from && transactionDate < from) return false;
      if (to && transactionDate > to) return false;
      if (filters.type && t.type !== filters.type) return false;
      if (filters.paymentMethod && t.paymentMethod !== filters.paymentMethod) return false;
      if (filters.minAmount && t.amount < filters.minAmount) return false;
      if (filters.maxAmount && t.amount > filters.maxAmount) return false;
      
      if (filters.category) {
        if (t.type === 'income' && t.service !== filters.category) return false;
        if (t.type === 'expense' && t.category !== filters.category) return false;
      }

      return true;
    });
  }, [allTransactions, filters]);
  
  const financialSummary = useMemo(() => {
    const transactionsToSummarize = filters ? filteredTransactions : allTransactions;
    const income = transactionsToSummarize.filter(t => t.type === 'income' && t.confirmed);
    const expenses = transactionsToSummarize.filter(t => t.type === 'expense');
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const avgTicket = income.length > 0 ? totalIncome / income.length : 0;
    
    return { totalIncome, totalExpenses, netProfit, avgTicket };
  }, [allTransactions, filteredTransactions, filters]);

  const handleSaveTransaction = (transactionData) => {
    if (editingTransaction) {
      setAllTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...transactionData, id: t.id } : t));
      toast({ title: '✅ Transacción actualizada', description: 'El movimiento ha sido editado con éxito.' });
    } else {
      setAllTransactions(prev => [...prev, { ...transactionData, id: Date.now() }]);
      toast({ title: '🎉 Nuevo movimiento registrado', description: 'La transacción ha sido añadida a tu caja.' });
    }
    setEditingTransaction(null);
    setIncomeModalOpen(false);
    setExpenseModalOpen(false);
  };

  const openIncomeModal = () => {
    setEditingTransaction(null);
    setIncomeModalOpen(true);
  };
  
  const openExpenseModal = () => {
    setEditingTransaction(null);
    setExpenseModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6 pb-24 md:pb-0">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <FinancialIndicators financialSummary={financialSummary} />
          <div className="hidden md:block">
            <FinancialActions onOpenIncomeModal={openIncomeModal} onOpenExpenseModal={openExpenseModal} />
          </div>
        </div>

        <FilterBar onApplyFilters={setFilters} onClearFilters={() => setFilters(null)} />

        {filteredTransactions.length > 0 ? (
          <TransactionTable 
            transactions={filteredTransactions} 
          />
        ) : allTransactions.length > 0 ? (
            <Alert variant="info">
                <Info className="h-4 w-4" />
                <AlertTitle>No se encontraron resultados</AlertTitle>
                <AlertDescription>
                    Prueba a ajustar o limpiar los filtros para ver tus movimientos.
                </AlertDescription>
            </Alert>
        ) : (
          <EmptyTransactionsState onOpenIncomeModal={openIncomeModal} onOpenExpenseModal={openExpenseModal} />
        )}
      </div>

      <div className="md:hidden">
        <FinancialActions onOpenIncomeModal={openIncomeModal} onOpenExpenseModal={openExpenseModal} />
      </div>

      <PaymentModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        onSave={handleSaveTransaction}
        isManual={true}
        prefillData={editingTransaction || {}}
        clients={clients}
      />
      
      <Dialog open={isExpenseModalOpen} onOpenChange={setExpenseModalOpen}>
        <ExpenseForm
          onSave={handleSaveTransaction}
          onClose={() => setExpenseModalOpen(false)}
          transaction={editingTransaction}
        />
      </Dialog>
    </>
  );
};

export default FinancialDashboard;