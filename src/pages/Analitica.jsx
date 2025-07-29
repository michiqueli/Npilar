import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import { useToast } from "@/components/ui/use-toast";
import {
  startOfMonth,
  endOfMonth,
  parseISO,
  format,
  subMonths,
  differenceInDays,
  subDays
} from "date-fns";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
  BarChart2,
  PieChart,
  TrendingUp,
  Download,
  Wallet,
  ChevronDown,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import DayFilterDropdown from "@/components/analytics/DayFilterDropdown";
import PeriodPicker from "@/components/analytics/PeriodPicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import SummaryTab from "@/components/analytics/SummaryTab";
import ServicesTab from "@/components/analytics/ServicesTab";
import HistoricTab from "@/components/analytics/HistoricTab";
import FinancialDashboard from "@/pages/FinancialDashboard";
// Importamos el cliente de Supabase
import { supabase } from "@/lib/supabaseClient"; // Asegúrate de que la ruta sea correcta

dayjs.locale("es");

const Analitica = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("resumen");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Estados para manejar los datos reales
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para los filtros de fecha
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4, 5, 6]);

  // --- NUEVO: Estado para guardar las citas del mes anterior ---
  const [prevMonthAppointments, setPrevMonthAppointments] = useState([]);
  const [prevPeriodAppointments, setPrevPeriodAppointments] = useState([]);
  const [prevPrevMonthAppointments, setPrevPrevMonthAppointments] = useState([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- useEffect para cargar datos desde Supabase ---
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      // No hacer nada si el rango de fechas no está definido
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

        const [
          currentPeriodRes,
          prevPeriodRes,
          prevMonthRes,
          prevPrevMonthRes,
        ] = await Promise.all([
          supabase
            .from("appointments")
            .select("*, services(name, sale_price), clients(name)")
            .gte("appointment_at", dateRange.from.toISOString())
            .lte("appointment_at", dateRange.to.toISOString())
            .in("status", ["COMPLETED", "PAID"]),
          supabase
            .from("appointments")
            .select("price_at_time")
            .gte("appointment_at", prevPeriodStart.toISOString())
            .lte("appointment_at", prevPeriodEnd.toISOString())
            .in("status", ["COMPLETED", "PAID"]),
          supabase
            .from("appointments")
            .select("client_id")
            .gte("appointment_at", prevMonthStart.toISOString())
            .lte("appointment_at", prevMonthEnd.toISOString())
            .in("status", ["COMPLETED", "PAID"]),
          supabase
            .from("appointments")
            .select("client_id")
            .gte("appointment_at", prevPrevMonthStart.toISOString())
            .lte("appointment_at", prevPrevMonthEnd.toISOString())
            .in("status", ["COMPLETED", "PAID"]),
        ]);

        if (currentPeriodRes.error) throw currentPeriodRes.error;
        if (prevPeriodRes.error) throw prevPeriodRes.error;
        if (prevMonthRes.error) throw prevMonthRes.error;
        if (prevPrevMonthRes.error) throw prevPrevMonthRes.error;

        setAppointmentsData(currentPeriodRes.data || []);
        setPrevPeriodAppointments(prevPeriodRes.data || []);
        setPrevMonthAppointments(prevMonthRes.data || []);
        setPrevPrevMonthAppointments(prevPrevMonthRes.data || []);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("No se pudieron cargar los datos de análisis.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [dateRange]);
  // --- useMemo para procesar los datos reales ---
  // Aquí es donde calcularemos todas las estadísticas basadas en `appointmentsData`
  const analyticsData = useMemo(() => {
        if (!appointmentsData) return {};

        const totalRevenue = appointmentsData.reduce((acc, app) => acc + (app.price_at_time || 0), 0);
        const totalAppointments = appointmentsData.length;
        const averageTicket = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;

        const prevTotalRevenue = prevPeriodAppointments.reduce((acc, app) => acc + (app.price_at_time || 0), 0);
        const prevTotalAppointments = prevPeriodAppointments.length;
        const prevAverageTicket = prevTotalAppointments > 0 ? prevTotalRevenue / prevTotalAppointments : 0;

        const calculateChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        const revenueChange = calculateChange(totalRevenue, prevTotalRevenue);
        const avgTicketChange = calculateChange(averageTicket, prevAverageTicket);

        const calculateRetention = (currentPeriod, previousPeriod) => {
            if (previousPeriod.length === 0) return 0;
            const prevClientIds = new Set(previousPeriod.map(a => a.client_id));
            const currentClientIds = new Set(currentPeriod.map(a => a.client_id));
            let retainedCount = 0;
            for (const id of prevClientIds) {
                if (currentClientIds.has(id)) {
                    retainedCount++;
                }
            }
            return (retainedCount / prevClientIds.size) * 100;
        };
        
        const retentionRate = calculateRetention(appointmentsData, prevMonthAppointments);
        const prevRetentionRate = calculateRetention(prevMonthAppointments, prevPrevMonthAppointments);
        const retentionChange = retentionRate - prevRetentionRate;

        const servicesMap = new Map();
        const clientsMap = new Map();
        const dailyMap = new Map();

        appointmentsData.forEach(app => {
            const serviceName = app.services?.name || 'Servicio Desconocido';
            if (!servicesMap.has(serviceName)) {
                servicesMap.set(serviceName, { revenue: 0, appointments: 0 });
            }
            const currentService = servicesMap.get(serviceName);
            currentService.revenue += app.price_at_time || 0;
            currentService.appointments += 1;

            if (app.client_id && app.clients) {
                if (!clientsMap.has(app.client_id)) {
                    clientsMap.set(app.client_id, { name: app.clients.name, visits: 0, spent: 0 });
                }
                const currentClient = clientsMap.get(app.client_id);
                currentClient.visits += 1;
                currentClient.spent += app.price_at_time || 0;
            }

            const date = format(parseISO(app.appointment_at), 'yyyy-MM-dd');
            if (!dailyMap.has(date)) {
                dailyMap.set(date, { revenue: 0, appointments: 0 });
            }
            const currentDay = dailyMap.get(date);
            currentDay.revenue += app.price_at_time || 0;
            currentDay.appointments += 1;
        });

        const services = Array.from(servicesMap, ([name, data]) => ({ name, ...data })).sort((a, b) => b.revenue - a.revenue);
        const topClients = Array.from(clientsMap.values()).sort((a, b) => b.spent - a.spent).slice(0, 5).map(client => ({ ...client, avatar: client.name.substring(0, 2).toUpperCase() }));
        const dailyData = Array.from(dailyMap, ([date, data]) => ({ date, day: format(parseISO(date), 'dd'), ...data })).sort((a, b) => a.date.localeCompare(b.date));

        return {
            totalRevenue,
            totalAppointments,
            averageTicket,
            retentionRate,
            revenueChange,
            avgTicketChange,
            retentionChange,
            services,
            topClients,
            dailyData,
        };
    }, [appointmentsData, prevPeriodAppointments, prevMonthAppointments, prevPrevMonthAppointments]);
    
  const TABS_CONFIG = [
    { value: "resumen", label: "Resumen", icon: BarChart2 },
    { value: "servicios", label: "Servicios", icon: PieChart },
    { value: "historico", label: "Tendencias", icon: TrendingUp },
    { value: "caja", label: "Caja/Finanzas", icon: Wallet },
  ];

  const handleExport = () =>
    toast({
      title: "🚧 Próximamente",
      description: "La exportación a PDF/CSV estará disponible pronto.",
    });

  const renderTabs = () => {
    if (isMobile) {
      const activeTabConfig = TABS_CONFIG.find((t) => t.value === activeTab);
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              className="w-full justify-between text-base h-12"
            >
              <div className="flex items-center">
                {activeTabConfig && (
                  <activeTabConfig.icon className="w-5 h-5 mr-3" />
                )}
                {activeTabConfig ? activeTabConfig.label : "Seleccionar..."}
              </div>
              <ChevronDown className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
            {TABS_CONFIG.map((tab) => (
              <DropdownMenuItem
                key={tab.value}
                onSelect={() => setActiveTab(tab.value)}
                className={cn(activeTab === tab.value && "bg-accent")}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <TabsList
        variant="underline"
        className="w-full justify-start overflow-x-auto pb-0"
      >
        {TABS_CONFIG.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            variant="underline"
            className="flex-shrink-0"
          >
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
        <meta
          name="description"
          content="Análisis financiero y estadísticas de rendimiento de tu negocio."
        />
      </Helmet>
      <div className="space-y-6">
        <motion.div
          className="flex flex-col md:flex-row flex-wrap items-start md:items-center justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">
              Análisis del Negocio
            </h1>
            <p className="text-muted-foreground mt-1">
              Tus insights para tomar decisiones inteligentes.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <DayFilterDropdown
              selectedDays={selectedDays}
              setSelectedDays={setSelectedDays}
            />
            <PeriodPicker dateRange={dateRange} setDateRange={setDateRange} />
           { /*<Button
              variant="primary"
              onClick={handleExport}
              className="hidden sm:flex"
            >
              <Download className="w-4 h-4 mr-2" /> Exportar
            </Button>*/}
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
              {loading && (
                <div className="text-center p-8">Cargando datos...</div>
              )}
              {error && (
                <div className="text-center p-8 text-red-500">{error}</div>
              )}
              {!loading && !error && (
                <>
                  <TabsContent
                    value="resumen"
                    forceMount
                    className={cn(activeTab !== "resumen" && "hidden")}
                  >
                    <SummaryTab
                      analyticsData={analyticsData}
                      dateRange={dateRange}
                      selectedDays={selectedDays}
                    />
                  </TabsContent>
                  <TabsContent
                    value="servicios"
                    forceMount
                    className={cn(activeTab !== "servicios" && "hidden")}
                  >
                    <ServicesTab analyticsData={analyticsData} />
                  </TabsContent>
                  <TabsContent
                    value="historico"
                    forceMount
                    className={cn(activeTab !== "historico" && "hidden")}
                  >
                    <HistoricTab analyticsData={analyticsData} />
                  </TabsContent>
                  <TabsContent
                    value="caja"
                    forceMount
                    className={cn(activeTab !== "caja" && "hidden")}
                  >
                    <FinancialDashboard />
                  </TabsContent>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </>
  );
};

export default Analitica;
