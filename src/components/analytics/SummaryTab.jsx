import React, { useMemo } from 'react';
import { DollarSign, Repeat, Target, Scissors, Lightbulb, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Bar, Brush, ReferenceLine, ComposedChart } from 'recharts';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { getDay, parseISO } from 'date-fns';
import AnalyticsCard from '@/components/analytics/AnalyticsCard';
import OccupancyHeatmap from '@/components/analytics/OccupancyHeatmap';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';

dayjs.locale('es');

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const entryData = payload[0].payload;
        const fullDate = dayjs(entryData.date).format('dddd, DD [de] MMMM [de] YYYY');
        return (
            <div className="bg-card p-3 border rounded-lg shadow-lg">
                <p className="font-bold text-base">{fullDate}</p>
                <p className="text-sm text-primary">{`Ingresos: $${entryData.revenue.toLocaleString()}`}</p>
                {/* Aseguramos que 'average' exista antes de mostrarlo */}
                {entryData.average && (
                    <p className="text-sm text-muted-foreground">{`Promedio del periodo: $${entryData.average.toFixed(2)}`}</p>
                )}
            </div>
        );
    }
    return null;
};

// PROP CAMBIADA: Recibimos `analyticsData` en lugar de `mockData`.
// También necesitamos `selectedDays` para filtrar los datos del gráfico.
const SummaryTab = ({ analyticsData, dateRange, selectedDays }) => {
    const { toast } = useToast();

    // CÁLCULO NUEVO: Filtramos los datos diarios aquí mismo.
    const filteredDailyData = useMemo(() => {
        if (!analyticsData.dailyData) return [];
        if (selectedDays.length === 7) return analyticsData.dailyData;
        return analyticsData.dailyData.filter(entry =>
            selectedDays.includes(getDay(parseISO(entry.date)))
        );
    }, [analyticsData.dailyData, selectedDays]);

    const monthlyAvg = useMemo(() => {
        if (filteredDailyData.length === 0) return 0;
        const total = filteredDailyData.reduce((sum, day) => sum + day.revenue, 0);
        return total / filteredDailyData.length;
    }, [filteredDailyData]);

    const dataWithAverage = useMemo(() => {
        return filteredDailyData.map(d => ({ ...d, average: monthlyAvg }));
    }, [filteredDailyData, monthlyAvg]);

    const formatXAxisTick = (tickItem) => {
        const date = filteredDailyData.find(d => d.day === tickItem)?.date;
        if (date) {
            const formatString = dateRange ? 'MMM DD' : 'ddd DD';
            return dayjs(date).format(formatString);
        }
        return tickItem;
    };

    // Prevenimos errores si analyticsData aún no ha cargado completamente.
    if (!analyticsData) {
        return <div>Cargando resumen...</div>;
    }
    
    // Evitamos división por cero si no hay citas.
    const averageTicket = analyticsData.totalAppointments > 0 
        ? (analyticsData.totalRevenue / analyticsData.totalAppointments).toFixed(2) 
        : '0.00';

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* DATOS REALES: Usamos analyticsData para las tarjetas */}
                <AnalyticsCard title="Ingresos Totales" value={`$${analyticsData.totalRevenue.toLocaleString()}`} change="+12.5%" isPositive icon={DollarSign} iconBgColor="bg-success" />
                <AnalyticsCard title="Tasa Retención" value="72%" change="+2.1%" isPositive icon={Repeat} iconBgColor="bg-info" />
                <AnalyticsCard title="LTV Promedio" value="$258" change="+5.5%" isPositive icon={Target} iconBgColor="bg-primary" />
                <AnalyticsCard title="Ticket Promedio" value={`$${averageTicket}`} change="-3.1%" isPositive={false} icon={Scissors} iconBgColor="bg-warning" />
            </div>

            <div className="premium-card p-4 sm:p-6">
                <h3 className="text-xl font-bold mb-4">Ingresos del Periodo</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={dataWithAverage} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                            </linearGradient>
                        </defs>
                        <XAxis 
                            dataKey="day" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12}
                            tickFormatter={formatXAxisTick}
                            angle={filteredDailyData.length > 20 ? -45 : 0}
                            textAnchor={filteredDailyData.length > 20 ? 'end' : 'middle'}
                            height={filteredDailyData.length > 20 ? 50 : 30}
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value}`} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsla(var(--primary), 0.1)' }} />
                        <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[4, 4, 0, 0]} />
                        <ReferenceLine y={monthlyAvg} stroke="#4B5563" strokeDasharray="3 3" strokeWidth={2}>
                           <recharts-label value={`Promedio: $${monthlyAvg.toFixed(0)}`} position="insideTopLeft" fill="#4B5563" fontSize="12" />
                        </ReferenceLine>
                        <Brush dataKey="day" height={30} stroke="hsl(var(--primary))" tickFormatter={formatXAxisTick}/>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            
            {/* NOTA: Los datos de ocupación aún no se calculan. Pasamos un array vacío. */}
            <OccupancyHeatmap data={[]} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 premium-card p-4 sm:p-6">
                    <h3 className="text-xl font-bold mb-4">Consejos Accionables</h3>
                       <div className="space-y-4">
                            <Alert variant="info">
                                <Lightbulb className="h-4 w-4" />
                                <AlertTitle>Fideliza a tus mejores clientes</AlertTitle>
                                <AlertDescription className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <p>Los clientes frecuentes son la base de tu negocio. ¡Prémialos!</p>
                                    <Button size="sm" variant="secondary" onClick={() => toast({title: "Función activada!"})} className="w-full sm:w-auto">Crear Descuento</Button>
                                </AlertDescription>
                            </Alert>
                            <Alert variant="warning">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Optimiza tus horas valle</AlertTitle>
                                <AlertDescription className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <p>Lanza una promoción los martes y miércoles por la tarde.</p>
                                    <Button size="sm" variant="secondary" onClick={() => toast({title: "Función activada!"})} className="w-full sm:w-auto">Crear Promoción</Button>
                                </AlertDescription>
                            </Alert>
                       </div>
                </div>
                <div className="premium-card p-4 sm:p-6">
                    <h3 className="text-xl font-bold mb-4">Top Clientes</h3>
                    <div className="space-y-4">
                        {/* DATOS REALES: Usamos analyticsData para la lista de clientes */}
                        {analyticsData.topClients && analyticsData.topClients.map(client => (
                            <div key={client.name} className="flex items-center">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-muted text-foreground">{client.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 flex-1">
                                    <p className="font-bold">{client.name}</p>
                                    <p className="text-sm text-muted-foreground">{client.visits} visitas</p>
                                </div>
                                <p className="font-bold text-success">${client.spent}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryTab;