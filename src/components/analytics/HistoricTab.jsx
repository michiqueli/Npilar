import React from 'react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Bar, ComposedChart, Line } from 'recharts';

// CORRECCIÓN: Cambiamos `mockData` por `analyticsData`.
const HistoricTab = ({ analyticsData }) => {
    // Agregamos una comprobación para evitar errores si los datos aún no están listos.
    if (!analyticsData || !analyticsData.benchmarkData || !analyticsData.historicalData) {
        return <div>Cargando datos históricos...</div>;
    }

    // Extraemos los datos para que el código sea más limpio.
    const { benchmarkData, historicalData } = analyticsData;
    const { user, industry } = benchmarkData;

    return (
        <div className="space-y-6">
            <div className="premium-card p-4 sm:p-6">
                <h3 className="text-xl font-bold mb-4">Comparativa Sectorial</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                        <p className="text-muted-foreground text-sm">Ingresos Mensuales</p>
                        <p className="text-2xl font-bold text-primary">${(user.revenue || 0).toLocaleString()}</p>
                        <p className="text-xs text-success">vs. ${(industry.revenue || 0).toLocaleString()} (promedio)</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-sm">Tasa de Retención</p>
                        <p className="text-2xl font-bold text-primary">{user.retention || 0}%</p>
                        <p className="text-xs text-success">vs. {industry.retention || 0}% (promedio)</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-sm">Ticket Promedio</p>
                        <p className="text-2xl font-bold text-destructive">${(user.avgTicket || 0).toFixed(2)}</p>
                        <p className="text-xs text-destructive">vs. ${industry.avgTicket || 0} (promedio)</p>
                    </div>
                </div>
            </div>
            <div className="premium-card p-4 sm:p-6">
                <h3 className="text-xl font-bold mb-4">Proyección de Ingresos</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={historicalData}>
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${Math.round(value/1000)}k`} />
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Bar dataKey="revenue" fill="hsl(var(--primary), 0.5)" name="Histórico" />
                        <Line type="monotone" dataKey="projection" stroke="hsl(var(--success))" strokeWidth={2} name="Proyección" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HistoricTab;