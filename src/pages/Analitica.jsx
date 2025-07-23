import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import { useToast } from "@/components/ui/use-toast";
import { startOfMonth, endOfMonth } from "date-fns";
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
import { parseISO, format } from "date-fns";
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
        // Hacemos la consulta a la tabla 'appointments'
        const { data, error: fetchError } = await supabase
          .from("appointments")
          .select(
            `
            *,
            services ( name, sale_price ),
            clients ( name )
          `
          )
          // Filtramos por el rango de fechas seleccionado
          .gte("appointment_at", dateRange.from.toISOString())
          .lte("appointment_at", dateRange.to.toISOString())
          // Solo contamos las citas que generan ingresos
          .in("status", ["COMPLETED", "PAID"]);

        if (fetchError) {
          throw fetchError;
        }

        setAppointmentsData(data || []);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("No se pudieron cargar los datos de análisis.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [dateRange]); // Este efecto se ejecutará cada vez que cambie el `dateRange`

  // --- useMemo para procesar los datos reales ---
  // Aquí es donde calcularemos todas las estadísticas basadas en `appointmentsData`
  const analyticsData = useMemo(() => {
    if (!appointmentsData || appointmentsData.length === 0) {
      // Devolvemos una estructura por defecto para evitar errores en los componentes hijos
      return {
        totalRevenue: 0,
        totalAppointments: 0,
        services: [],
        topClients: [],
        dailyData: [],
        serviceProfitData: [],
        benchmarkData: { user: {}, industry: {} },
        historicalData: [],
      };
    }

    // 1. Calcular totales
    const totalRevenue = appointmentsData.reduce(
      (acc, app) => acc + (app.price_at_time || 0),
      0
    );
    const totalAppointments = appointmentsData.length;

    // 2. Agrupar datos por servicio
    const servicesMap = new Map();
    appointmentsData.forEach((app) => {
      const serviceName = app.services?.name || "Servicio Desconocido";
      if (!servicesMap.has(serviceName)) {
        servicesMap.set(serviceName, { revenue: 0, appointments: 0 });
      }
      const current = servicesMap.get(serviceName);
      current.revenue += app.price_at_time || 0;
      current.appointments += 1;
    });
    const services = Array.from(servicesMap, ([name, data]) => ({
      name,
      ...data,
    })).sort((a, b) => b.revenue - a.revenue);

    // 3. Agrupar datos por cliente
    const clientsMap = new Map();
    appointmentsData.forEach((app) => {
      if (app.client_id && app.clients) {
        if (!clientsMap.has(app.client_id)) {
          clientsMap.set(app.client_id, {
            name: app.clients.name,
            visits: 0,
            spent: 0,
          });
        }
        const current = clientsMap.get(app.client_id);
        current.visits += 1;
        current.spent += app.price_at_time || 0;
      }
    });
    const topClients = Array.from(clientsMap.values())
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5)
      .map((client) => ({
        ...client,
        avatar: client.name.substring(0, 2).toUpperCase(),
      }));

    // 4. Agrupar datos por día
    const dailyMap = new Map();
    appointmentsData.forEach((app) => {
      const date = format(parseISO(app.appointment_at), "yyyy-MM-dd");
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { revenue: 0, appointments: 0 });
      }
      const current = dailyMap.get(date);
      current.revenue += app.price_at_time || 0;
      current.appointments += 1;
    });
    const dailyData = Array.from(dailyMap, ([date, data]) => ({
      date,
      day: format(parseISO(date), "dd"),
      ...data,
    })).sort((a, b) => a.date.localeCompare(b.date));

    // 5. Generar datos derivados (con placeholders por ahora)
    const serviceProfitData = services.map((s) => ({
      ...s,
      costs: s.revenue * 0.3, // Costo de ejemplo
      margin: 70, // Margen de ejemplo
    }));

    const benchmarkData = {
      user: {
        revenue: totalRevenue,
        retention: 0,
        avgTicket: totalAppointments > 0 ? totalRevenue / totalAppointments : 0,
      },
      industry: { revenue: 18000, retention: 65, avgTicket: 50 },
    };

    const historicalData = [
      { name: dayjs().format("MMM"), revenue: totalRevenue },
    ];

    return {
      totalRevenue,
      totalAppointments,
      services,
      topClients,
      dailyData,
      serviceProfitData,
      benchmarkData,
      historicalData,
    };
  }, [appointmentsData]);
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
            <Button
              variant="primary"
              onClick={handleExport}
              className="hidden sm:flex"
            >
              <Download className="w-4 h-4 mr-2" /> Exportar
            </Button>
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
