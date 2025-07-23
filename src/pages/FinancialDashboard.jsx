import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { format, startOfDay, endOfDay, parseISO } from 'date-fns';
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
import { supabase } from '@/lib/supabaseClient'; // Usamos la ruta correcta

const FinancialDashboard = () => {
    const { toast } = useToast();
    const [allTransactions, setAllTransactions] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isIncomeModalOpen, setIncomeModalOpen] = useState(false);
    const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [filters, setFilters] = useState(null);

    // --- NUEVO: useEffect para cargar todas las transacciones desde Supabase ---
    useEffect(() => {
        const fetchFinancialData = async () => {
            setLoading(true);
            try {
                // Cargamos pagos, gastos y clientes en paralelo
                const [paymentsRes, expensesRes, clientsRes] = await Promise.all([
                    supabase.from('payments').select('*, clients(id, name), appointments(id, services(name))'),
                    supabase.from('expenses').select('*'),
                    supabase.from('clients').select('*')
                ]);

                if (paymentsRes.error) throw paymentsRes.error;
                if (expensesRes.error) throw expensesRes.error;
                if (clientsRes.error) throw clientsRes.error;

                // Transformamos los pagos al formato unificado de transacciones
                const incomeTransactions = (paymentsRes.data || []).map(p => ({
                    id: p.id,
                    type: 'income',
                    clientName: p.clients?.name || 'Cliente no especificado',
                    service: p.appointments?.services?.name || 'Ingreso manual',
                    amount: p.amount,
                    paymentMethod: p.method,
                    date: p.payment_at,
                    confirmed: p.status === 'COMPLETED',
                    appointmentId: p.appointment_id,
                }));

                // Transformamos los gastos al formato unificado de transacciones
                const expenseTransactions = (expensesRes.data || []).map(e => ({
                    id: e.id,
                    type: 'expense',
                    description: e.description,
                    category: 'Gastos', // Puedes añadir una columna de categoría a tu tabla de gastos si quieres
                    amount: e.amount,
                    paymentMethod: 'N/A', // La tabla de gastos no tiene método de pago
                    date: e.expense_date,
                    receipt: !!e.image_url,
                }));

                // Unimos y ordenamos todas las transacciones por fecha
                const combinedTransactions = [...incomeTransactions, ...expenseTransactions]
                    .sort((a, b) => new Date(b.date) - new Date(a.date));

                setAllTransactions(combinedTransactions);
                setClients(clientsRes.data || []);

            } catch (error) {
                console.error("Error fetching financial data:", error);
                toast({
                    variant: "destructive",
                    title: "Error al cargar datos",
                    description: "No se pudieron obtener los movimientos financieros."
                });
            } finally {
                setLoading(false);
            }
        };

        fetchFinancialData();
    }, [toast]);

    const filteredTransactions = useMemo(() => {
        if (!filters) {
            return allTransactions;
        }
        return allTransactions.filter(t => {
            const transactionDate = startOfDay(parseISO(t.date));
            const from = filters.dateRange?.from ? startOfDay(filters.dateRange.from) : null;
            const to = filters.dateRange?.to ? endOfDay(filters.dateRange.to) : null;

            if (from && transactionDate < from) return false;
            if (to && transactionDate > to) return false;
            if (filters.type && t.type !== filters.type) return false;
            if (filters.paymentMethod && t.paymentMethod !== filters.paymentMethod) return false;
            if (filters.minAmount && t.amount < parseFloat(filters.minAmount)) return false;
            if (filters.maxAmount && t.amount > parseFloat(filters.maxAmount)) return false;
            
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

    // --- NUEVO: handleSaveTransaction modificado para Supabase ---
    const handleSaveTransaction = async (transactionData) => {
        try {
            if (transactionData.type === 'income') {
                // Lógica para guardar un INGRESO
                const { data, error } = await supabase
                    .from('payments')
                    .insert({
                        client_id: transactionData.clientId,
                        amount: transactionData.amount,
                        method: transactionData.paymentMethod,
                        status: 'COMPLETED',
                        notes: transactionData.notes,
                        payment_at: new Date().toISOString(),
                    })
                    .select('*, clients(id, name)')
                    .single();

                if (error) throw error;
                
                const newTransaction = {
                    id: data.id, type: 'income', clientName: data.clients.name,
                    service: 'Ingreso manual', amount: data.amount, paymentMethod: data.method,
                    date: data.payment_at, confirmed: true,
                };
                setAllTransactions(prev => [newTransaction, ...prev]);
                toast({ title: '🎉 Nuevo ingreso registrado', description: 'El pago ha sido añadido a tu caja.' });

            } else if (transactionData.type === 'expense') {
                // Lógica para guardar un GASTO
                const { data, error } = await supabase
                    .from('expenses')
                    .insert({
                        description: transactionData.description,
                        amount: transactionData.amount,
                        expense_date: transactionData.date,
                        notes: transactionData.notes,
                    })
                    .select()
                    .single();

                if (error) throw error;

                const newTransaction = {
                    id: data.id, type: 'expense', description: data.description,
                    category: 'Gastos', amount: data.amount, paymentMethod: 'N/A',
                    date: data.expense_date, receipt: false,
                };
                setAllTransactions(prev => [newTransaction, ...prev]);
                toast({ title: '🎉 Nuevo gasto registrado', description: 'El gasto ha sido añadido a tu caja.' });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error al guardar",
                description: "No se pudo guardar la transacción. " + error.message,
            });
        } finally {
            setEditingTransaction(null);
            setIncomeModalOpen(false);
            setExpenseModalOpen(false);
        }
    };

    const openIncomeModal = () => {
        setEditingTransaction(null);
        setIncomeModalOpen(true);
    };
    
    const openExpenseModal = () => {
        setEditingTransaction(null);
        setExpenseModalOpen(true);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Cargando datos financieros...</div>;
    }

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