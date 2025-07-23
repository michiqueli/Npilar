import React from 'react';
import ProfitMarginTable from '@/components/analytics/ProfitMarginTable';
import { Progress } from '@/components/ui/progress';
import ServicesPieChart from '@/components/analytics/ServicesPieChart';

// CORRECCIÓN: Cambiamos `analiticsData` por `analyticsData` para que coincida con la prop del padre.
const ServicesTab = ({ analyticsData }) => {
    // Agregamos una comprobación para evitar errores si los datos aún no están listos.
    if (!analyticsData || !analyticsData.services) {
        return <div>Cargando datos de servicios...</div>;
    }

    return (
        <div className="space-y-6">
            <ProfitMarginTable data={analyticsData.serviceProfitData} />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 premium-card p-4 sm:p-6">
                    <h3 className="text-xl font-bold mb-4">Popularidad por Servicio</h3>
                    <div className="space-y-4">
                        {analyticsData.services.map(service => (
                            <div key={service.name}>
                                <div className="flex justify-between mb-1">
                                    <span className="font-medium text-sm text-foreground">{service.name}</span>
                                    <span className="text-sm text-muted-foreground">{service.appointments} citas</span>
                                </div>
                                {/* Evitamos la división por cero si no hay citas totales */}
                                <Progress value={analyticsData.totalAppointments > 0 ? (service.appointments / analyticsData.totalAppointments) * 100 : 0} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-2 premium-card p-4 sm:p-6 flex flex-col items-center justify-center">
                    <h3 className="text-xl font-bold mb-4">Mix de Ingresos</h3>
                    <ServicesPieChart data={analyticsData.services} />
                </div>
            </div>
        </div>
    );
};

export default ServicesTab;