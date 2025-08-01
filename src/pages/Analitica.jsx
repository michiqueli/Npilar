import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useToast } from '@/components/ui/use-toast';
import { startOfMonth, endOfMonth, parseISO, format, subMonths, differenceInDays, subDays, eachDayOfInterval, getDay } from 'date-fns';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import {
    BarChart2,
    PieChart,
    TrendingUp,
    Download,
    Wallet,
    ChevronDown
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import DayFilterDropdown from '@/components/analytics/DayFilterDropdown';
import PeriodPicker from '@/components/analytics/PeriodPicker';
import { cn } from '@/lib/utils';
import SummaryTab from '@/components/analytics/SummaryTab';
import ServicesTab from '@/components/analytics/ServicesTab';
import HistoricTab from '@/components/analytics/HistoricTab';
import FinancialDashboard from '@/pages/FinancialDashboard';
import { supabase } from '@/lib/supabaseClient';

dayjs.locale('es');

const Analitica = () => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('resumen');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    
    const [appointmentsData, setAppointmentsData] = useState([]);
    const [paymentsData, setPaymentsData] = useState([]);
    const [currentMonthPayments, setCurrentMonthPayments] = useState([]);
    const [prevPeriodPayments, setPrevPeriodPayments] = useState([]);
    const [prevPeriodAppointments, setPrevPeriodAppointments] = useState([]);
    const [prevMonthAppointments, setPrevMonthAppointments] = useState([]);
    const [prevPrevMonthAppointments, setPrevPrevMonthAppointments] = useState([]);
    const [historicalAppointments, setHistoricalAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [dateRange, setDateRange] = useState({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });
    const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4, 5, 6]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            if (!dateRange || !dateRange.from || !dateRange.to) return;
            setLoading(true);
            setError(null);
            try {
                const daysInPeriod = differenceInDays(dateRange.to, dateRange.from) + 1;
                const prevPeriodStart = subDays(dateRange.from, daysInPeriod);
                const prevPeriodEnd = subDays(dateRange.to, daysInPeriod);
                const prevMonthStart = startOfMonth(subMonths(dateRange.from, 1));
                const prevMonthEnd = endOfMonth(subMonths(dateRange.from, 1));
                const prevPrevMonthStart = startOfMonth(subMonths(dateRange.from, 2));
                const prevPrevMonthEnd = endOfMonth(subMonths(dateRange.from, 2));
                const sixMonthsAgo = startOfMonth(subMonths(new Date(), 6));
                const currentMonthStart = startOfMonth(new Date());
                const currentMonthEnd = endOfMonth(new Date());

                const [currentPeriodRes, currentPaymentsRes, currentMonthPaymentsRes, prevPeriodPaymentsRes, prevPeriodAppointmentsRes, prevMonthRes, prevPrevMonthRes, historicalRes] = await Promise.all([
                    supabase.from('appointments').select('*, services(name, sale_price, service_cost), clients(id, name, total_visits)').gte('appointment_at', dateRange.from.toISOString()).lte('appointment_at', dateRange.to.toISOString()).in('status', ['COMPLETED', 'PAID']),
                    supabase.from('payments').select('*, services(name, service_cost)').gte('payment_at', dateRange.from.toISOString()).lte('payment_at', dateRange.to.toISOString()),
                    supabase.from('payments').select('amount').gte('payment_at', currentMonthStart.toISOString()).lte('payment_at', currentMonthEnd.toISOString()),
                    supabase.from('payments').select('amount').gte('payment_at', prevPeriodStart.toISOString()).lte('payment_at', prevPeriodEnd.toISOString()),
                    supabase.from('appointments').select('id').gte('appointment_at', prevPeriodStart.toISOString()).lte('appointment_at', prevPeriodEnd.toISOString()).in('status', ['COMPLETED', 'PAID']),
                    supabase.from('appointments').select('client_id').gte('appointment_at', prevMonthStart.toISOString()).lte('appointment_at', prevMonthEnd.toISOString()).in('status', ['COMPLETED', 'PAID']),
                    supabase.from('appointments').select('client_id').gte('appointment_at', prevPrevMonthStart.toISOString()).lte('appointment_at', prevPrevMonthEnd.toISOString()).in('status', ['COMPLETED', 'PAID']),
                    supabase.from('appointments').select('appointment_at, price_at_time').gte('appointment_at', sixMonthsAgo.toISOString()).in('status', ['COMPLETED', 'PAID'])
                ]);

                if (currentPeriodRes.error) throw currentPeriodRes.error;
                if (currentPaymentsRes.error) throw currentPaymentsRes.error;
                if (currentMonthPaymentsRes.error) throw currentMonthPaymentsRes.error;
                if (prevPeriodPaymentsRes.error) throw prevPeriodPaymentsRes.error;
                if (prevPeriodAppointmentsRes.error) throw prevPeriodAppointmentsRes.error;
                if (prevMonthRes.error) throw prevMonthRes.error;
                if (prevPrevMonthRes.error) throw prevPrevMonthRes.error;
                if (historicalRes.error) throw historicalRes.error;

                setAppointmentsData(currentPeriodRes.data || []);
                setPaymentsData(currentPaymentsRes.data || []);
                setCurrentMonthPayments(currentMonthPaymentsRes.data || []);
                setPrevPeriodPayments(prevPeriodPaymentsRes.data || []);
                setPrevPeriodAppointments(prevPeriodAppointmentsRes.data || []);
                setPrevMonthAppointments(prevMonthRes.data || []);
                setPrevPrevMonthAppointments(prevPrevMonthRes.data || []);
                setHistoricalAppointments(historicalRes.data || []);

            } catch (err) {
                console.error("Error fetching analytics data:", err);
                setError("No se pudieron cargar los datos de análisis.");
            } finally {
                setLoading(false);
            }
        };
        fetchAnalyticsData();
    }, [dateRange]);

    const analyticsData = useMemo(() => {
        if (!appointmentsData || !paymentsData) return {};

        const periodTotalRevenue = paymentsData.reduce((acc, payment) => acc + (payment.amount || 0), 0);
        const currentMonthTotalRevenue = currentMonthPayments.reduce((acc, payment) => acc + (payment.amount || 0), 0);
        const prevPeriodTotalRevenue = prevPeriodPayments.reduce((acc, payment) => acc + (payment.amount || 0), 0);
        
        const totalAppointments = appointmentsData.length;
        const averageTicket = totalAppointments > 0 ? periodTotalRevenue / totalAppointments : 0;
        const newClients = appointmentsData.filter(a => a.clients && a.clients.total_visits <= 1).length;

        const prevTotalAppointments = prevPeriodAppointments.length;
        const prevAverageTicket = prevTotalAppointments > 0 ? prevPeriodTotalRevenue / prevTotalAppointments : 0;

        const calculateChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };
        const revenueChange = calculateChange(periodTotalRevenue, prevPeriodTotalRevenue);
        const avgTicketChange = calculateChange(averageTicket, prevAverageTicket);

        const calculateRetention = (current, previous) => {
            if (previous.length === 0) return 0;
            const prevClientIds = new Set(previous.map(a => a.client_id));
            const currentClientIds = new Set(current.map(a => a.client_id));
            let retainedCount = 0;
            prevClientIds.forEach(id => {
                if (currentClientIds.has(id)) retainedCount++;
            });
            return (retainedCount / prevClientIds.size) * 100;
        };
        const retentionRate = calculateRetention(appointmentsData, prevMonthAppointments);
        const prevRetentionRate = calculateRetention(prevMonthAppointments, prevPrevMonthAppointments);
        const retentionChange = retentionRate - prevRetentionRate;

        const servicesMap = new Map();
        const clientsMap = new Map();
        const dailyMap = new Map();

        const processService = (service, amount, isAppointment) => {
            if (!service) return;
            if (!servicesMap.has(service.name)) {
                servicesMap.set(service.name, { revenue: 0, appointments: 0, manual_sales: 0, cost_per_service: service.service_cost || 0 });
            }
            const currentService = servicesMap.get(service.name);
            currentService.revenue += amount || 0;
            if (isAppointment) {
                currentService.appointments += 1;
            } else {
                currentService.manual_sales += 1;
            }
        };

        appointmentsData.forEach(app => {
            processService(app.services, app.price_at_time, true);

            if (app.client_id && app.clients) {
                if (!clientsMap.has(app.client_id)) clientsMap.set(app.client_id, { name: app.clients.name, visits: 0, spent: 0 });
                const currentClient = clientsMap.get(app.client_id);
                currentClient.visits += 1;
                currentClient.spent += app.price_at_time || 0;
            }

            const date = format(parseISO(app.appointment_at), 'yyyy-MM-dd');
            if (!dailyMap.has(date)) dailyMap.set(date, { revenue: 0, appointments: 0 });
            const currentDay = dailyMap.get(date);
            currentDay.revenue += app.price_at_time || 0;
            currentDay.appointments += 1;
        });

        paymentsData.forEach(payment => {
            if (!payment.appointment_id) {
                processService(payment.services, payment.amount, false);
            }
        });
        
        const services = Array.from(servicesMap, ([name, data]) => ({ name, ...data, total_sales: data.appointments + data.manual_sales })).sort((a, b) => b.revenue - a.revenue);
        const topClients = Array.from(clientsMap.values()).sort((a, b) => b.spent - a.spent).slice(0, 5).map(client => ({ ...client, avatar: client.name.substring(0, 2).toUpperCase() }));
        const dailyData = Array.from(dailyMap, ([date, data]) => ({ date, day: format(parseISO(date), 'dd'), ...data })).sort((a, b) => a.date.localeCompare(b.date));

        const serviceProfitData = services.map(s => {
            const totalCosts = s.cost_per_service * s.total_sales;
            const margin = s.revenue > 0 ? ((s.revenue - totalCosts) / s.revenue) * 100 : 0;
            return { name: s.name, revenue: s.revenue, appointments: s.total_sales, costs: totalCosts, margin };
        });

        const benchmarkData = {
            user: { revenue: periodTotalRevenue, retention: retentionRate, avgTicket: averageTicket },
            industry: { revenue: 18000, retention: 65, avgTicket: 50 },
        };

        const monthlyRevenue = {};
        historicalAppointments.forEach(app => {
            const monthName = dayjs(app.appointment_at).format('MMM');
            monthlyRevenue[monthName] = (monthlyRevenue[monthName] || 0) + app.price_at_time;
        });
        const historicalData = Object.keys(monthlyRevenue).map(name => ({ name, revenue: monthlyRevenue[name] }));

        return {
            periodTotalRevenue,
            currentMonthTotalRevenue,
            totalAppointments,
            averageTicket,
            newClients,
            retentionRate,
            revenueChange,
            avgTicketChange,
            retentionChange,
            services,
            topClients,
            dailyData,
            benchmarkData,
            historicalData,
            serviceProfitData,
        };
    }, [appointmentsData, paymentsData, currentMonthPayments, prevPeriodPayments, prevPeriodAppointments, prevMonthAppointments, prevPrevMonthAppointments, historicalAppointments]);

    if(loading) return <div>Cargando...</div>
    if(error) return <div>Error: {error}</div>

    return (
        <>
            <Helmet>
                <title>Análisis del Negocio - Skin Hair Studio</title>
                <meta name="description" content="Análisis financiero y estadísticas de rendimiento de tu negocio." />
            </Helmet>
            
            <div className="space-y-6">
                <motion.div
                    className="flex flex-col md:flex-row flex-wrap items-start md:items-center justify-between gap-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-foreground">Análisis del Negocio</h1>
                        <p className="text-muted-foreground mt-1">Tus insights para tomar decisiones inteligentes.</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                        <DayFilterDropdown selectedDays={selectedDays} setSelectedDays={setSelectedDays} />
                        <PeriodPicker dateRange={dateRange} setDateRange={setDateRange} />
                        <Button variant="primary" disabled className="hidden sm:flex"><Download className="w-4 h-4 mr-2" /> Exportar</Button>
                    </div>
                </motion.div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                        <TabsTrigger value="resumen"><BarChart2 className="w-4 h-4 mr-2" />Resumen</TabsTrigger>
                        <TabsTrigger value="servicios"><PieChart className="w-4 h-4 mr-2" />Servicios</TabsTrigger>
                        <TabsTrigger value="historico"><TrendingUp className="w-4 h-4 mr-2" />Tendencias</TabsTrigger>
                        <TabsTrigger value="caja"><Wallet className="w-4 h-4 mr-2" />Caja/Finanzas</TabsTrigger>
                    </TabsList>
                    
                    <div className="mt-4">
                        {activeTab === 'resumen' && (
                            <SummaryTab 
                                analyticsData={analyticsData} 
                                dateRange={dateRange}
                                selectedDays={selectedDays}
                            />
                        )}
                        {activeTab === 'servicios' && <ServicesTab analyticsData={analyticsData} />}
                        {activeTab === 'historico' && <HistoricTab analyticsData={analyticsData} />}
                        {activeTab === 'caja' && <FinancialDashboard />}
                    </div>
                </Tabs>
            </div>
        </>
    );
};

export default Analitica;