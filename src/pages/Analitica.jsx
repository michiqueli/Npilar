import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useToast } from '@/components/ui/use-toast';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay, parseISO } from 'date-fns';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import {
  DollarSign,
  Scissors,
  BarChart2,
  PieChart,
  TrendingUp,
  Download,
  Target,
  Repeat,
  Wallet,
  ChevronDown
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import DayFilterDropdown from '@/components/analytics/DayFilterDropdown';
import PeriodPicker from '@/components/analytics/PeriodPicker';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import SummaryTab from '@/components/analytics/SummaryTab';
import ServicesTab from '@/components/analytics/ServicesTab';
import HistoricTab from '@/components/analytics/HistoricTab';
import FinancialDashboard from '@/pages/FinancialDashboard';

dayjs.locale('es');

const Analitica = () => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState(null);
  const [activeTab, setActiveTab] = useState('resumen');
  const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const TABS_CONFIG = [
    { value: 'resumen', label: 'Resumen', icon: BarChart2 },
    { value: 'servicios', label: 'Servicios', icon: PieChart },
    { value: 'historico', label: 'Tendencias', icon: TrendingUp },
    { value: 'caja', label: 'Caja/Finanzas', icon: Wallet },
  ];

  const mockData = useMemo(() => {
    const monthStart = dateRange ? dateRange.from : startOfMonth(currentDate);
    const monthEnd = dateRange ? dateRange.to : endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const dailyData = days.map(day => {
        const isWeekend = getDay(day) === 0 || getDay(day) === 6;
        const baseRevenue = isWeekend ? 80 : 150;
        return {
            date: format(day, 'yyyy-MM-dd'),
            day: format(day, 'dd'),
            revenue: Math.floor(baseRevenue + Math.random() * 100),
            appointments: Math.floor((baseRevenue / 20) + Math.random() * 5),
        }
    });

    const totalRevenue = dailyData.reduce((acc, day) => acc + day.revenue, 0);
    const totalAppointments = dailyData.reduce((acc, day) => acc + day.appointments, 0);
    
    const services = [
      { name: 'Corte + Barba', revenue: totalRevenue * 0.4, appointments: Math.floor(totalAppointments * 0.3) },
      { name: 'Solo Corte', revenue: totalRevenue * 0.3, appointments: Math.floor(totalAppointments * 0.4) },
      { name: 'Servicio Completo', revenue: totalRevenue * 0.2, appointments: Math.floor(totalAppointments * 0.15) },
      { name: 'Otros', revenue: totalRevenue * 0.1, appointments: Math.floor(totalAppointments * 0.15) },
    ];
    
    const topClients = [
        { name: 'Juan Pérez', avatar: 'JP', visits: 5, spent: 175 },
        { name: 'Carlos López', avatar: 'CL', visits: 4, spent: 140 },
        { name: 'Ana García', avatar: 'AG', visits: 3, spent: 150 },
        { name: 'Luis Rodríguez', avatar: 'LR', visits: 3, spent: 90 },
    ];

    const occupancyData = [];
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    for (let dayIndex = 1; dayIndex < 7; dayIndex++) { // Lunes a Sábado
        for (let hour = 9; hour < 21; hour++) { // 9 AM a 8 PM
            occupancyData.push({
                day: daysOfWeek[dayIndex],
                hour: hour,
                occupancy: Math.floor(Math.random() * 101)
            });
        }
    }

    const serviceProfitData = services.map(s => {
        const costs = s.revenue * (0.2 + Math.random() * 0.3); // Costos entre 20% y 50%
        const margin = ((s.revenue - costs) / s.revenue) * 100;
        return { ...s, costs, margin };
    });

    const benchmarkData = {
        user: { revenue: totalRevenue, retention: 72, avgTicket: 45 },
        industry: { revenue: 18000, retention: 65, avgTicket: 50 }
    };

    const historicalData = Array.from({length: 6}, (_, i) => {
        const monthRevenue = totalRevenue * (1 - (i * 0.05) + (Math.random() - 0.5) * 0.1);
        return { name: dayjs(currentDate).subtract(i, 'month').format('MMM'), revenue: monthRevenue };
    }).reverse();

    const projection = historicalData[5].revenue * 1.05;
    historicalData.push({ name: dayjs(currentDate).add(1, 'month').format('MMM'), projection });


    return { dailyData, totalRevenue, totalAppointments, services, topClients, occupancyData, serviceProfitData, benchmarkData, historicalData };
  }, [currentDate, dateRange]);

  const filteredDailyData = useMemo(() => {
    if (selectedDays.length === 7) return mockData.dailyData;
    return mockData.dailyData.filter(entry => selectedDays.includes(getDay(parseISO(entry.date))));
  }, [mockData.dailyData, selectedDays]);
  
  const handleExport = () => toast({ title: "🚧 Próximamente", description: "La exportación a PDF/CSV estará disponible pronto." });

  const renderTabs = () => {
    if (isMobile) {
      const activeTabConfig = TABS_CONFIG.find(t => t.value === activeTab);
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="w-full justify-between text-base h-12">
              <div className="flex items-center">
                {activeTabConfig && <activeTabConfig.icon className="w-5 h-5 mr-3" />}
                {activeTabConfig ? activeTabConfig.label : 'Seleccionar...'}
              </div>
              <ChevronDown className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
            {TABS_CONFIG.map(tab => (
              <DropdownMenuItem key={tab.value} onSelect={() => setActiveTab(tab.value)} className={cn(activeTab === tab.value && "bg-accent")}>
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <TabsList variant="underline" className="w-full justify-start overflow-x-auto pb-0">
        {TABS_CONFIG.map(tab => (
          <TabsTrigger key={tab.value} value={tab.value} variant="underline" className="flex-shrink-0">
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    );
  };

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
            <PeriodPicker date={currentDate} setDate={setCurrentDate} dateRange={dateRange} setDateRange={setDateRange} />
            <Button variant="primary" onClick={handleExport} className="hidden sm:flex"><Download className="w-4 h-4 mr-2" /> Exportar</Button>
          </div>
        </motion.div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {renderTabs()}
          
          <AnimatePresence mode="wait">
              <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
              >
                  <TabsContent value="resumen" forceMount className={cn(activeTab !== 'resumen' && 'hidden')}>
                    <SummaryTab 
                      mockData={mockData} 
                      filteredDailyData={filteredDailyData} 
                      dateRange={dateRange}
                    />
                  </TabsContent>
                  <TabsContent value="servicios" forceMount className={cn(activeTab !== 'servicios' && 'hidden')}>
                    <ServicesTab mockData={mockData} />
                  </TabsContent>
                  <TabsContent value="historico" forceMount className={cn(activeTab !== 'historico' && 'hidden')}>
                    <HistoricTab mockData={mockData} />
                  </TabsContent>
                  <TabsContent value="caja" forceMount className={cn(activeTab !== 'caja' && 'hidden')}>
                    <FinancialDashboard />
                  </TabsContent>
              </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </>
  );
};

export default Analitica;