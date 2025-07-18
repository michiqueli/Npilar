import React from 'react';
import ProfitMarginTable from '@/components/analytics/ProfitMarginTable';
import { Progress } from '@/components/ui/progress';
import ServicesPieChart from '@/components/analytics/ServicesPieChart';

const ServicesTab = ({ mockData }) => {
    return (
        <div className="space-y-6">
            <ProfitMarginTable data={mockData.serviceProfitData} />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 premium-card p-4 sm:p-6">
                    <h3 className="text-xl font-bold mb-4">Popularidad por Servicio</h3>
                    <div className="space-y-4">
                    {mockData.services.map(service => (
                        <div key={service.name}>
                            <div className="flex justify-between mb-1">
                                <span className="font-medium text-sm text-foreground">{service.name}</span>
                                <span className="text-sm text-muted-foreground">{service.appointments} citas</span>
                            </div>
                            <Progress value={(service.appointments / mockData.totalAppointments) * 100} />
                        </div>
                    ))}
                    </div>
                </div>
                <div className="lg:col-span-2 premium-card p-4 sm:p-6 flex flex-col items-center justify-center">
                    <h3 className="text-xl font-bold mb-4">Mix de Ingresos</h3>
                    <ServicesPieChart data={mockData.services} />
                </div>
            </div>
        </div>
    );
};

export default ServicesTab;