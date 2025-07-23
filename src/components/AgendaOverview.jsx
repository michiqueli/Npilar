import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { startOfDay, endOfDay, getDay } from 'date-fns';
import { supabase } from '@/lib/supabaseClient'; // Usamos la ruta correcta

const AgendaOverview = () => {
    const { toast } = useToast();
    const [agendaData, setAgendaData] = useState({
        totalAppointments: 0,
        freeHours: 0,
        cancelledToday: 0,
        newClients: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverviewData = async () => {
            const todayStart = startOfDay(new Date()).toISOString();
            const todayEnd = endOfDay(new Date()).toISOString();
            const todayDayOfWeek = getDay(new Date());

            try {
                const [appointmentsRes, workSchedulesRes] = await Promise.all([
                    supabase
                        .from('appointments')
                        .select('*, clients(total_visits)')
                        .gte('appointment_at', todayStart)
                        .lte('appointment_at', todayEnd),
                    supabase
                        .from('work_schedules')
                        .select('*')
                        .eq('day_of_week', todayDayOfWeek)
                ]);

                if (appointmentsRes.error) throw appointmentsRes.error;
                if (workSchedulesRes.error) throw workSchedulesRes.error;

                const todaysAppointments = appointmentsRes.data || [];
                const todaysSchedules = workSchedulesRes.data || [];

                // Calcular estadísticas
                const totalAppointments = todaysAppointments.filter(a => a.status !== 'CANCELLED').length;
                const cancelledToday = todaysAppointments.filter(a => a.status === 'CANCELLED').length;
                
                // Un cliente es "nuevo" si tiene una cita hoy y su contador de visitas totales es 1 o menos.
                const newClients = todaysAppointments
                    .filter(a => a.status !== 'CANCELLED' && a.clients && a.clients.total_visits <= 1)
                    .length;

                // Calcular horas libres
                const timeToMinutes = (time) => {
                    const [hours, minutes] = time.split(':').map(Number);
                    return hours * 60 + minutes;
                };

                const totalWorkMinutes = todaysSchedules
                    .filter(s => !s.is_break)
                    .reduce((sum, range) => sum + (timeToMinutes(range.end_time) - timeToMinutes(range.start_time)), 0);
                
                const bookedMinutes = todaysAppointments
                    .filter(a => a.status !== 'CANCELLED')
                    .reduce((sum, a) => sum + a.duration_at_time_minutes, 0);

                const freeMinutes = totalWorkMinutes - bookedMinutes;
                const freeHours = Math.max(0, freeMinutes / 60); // Aseguramos que no sea negativo

                setAgendaData({
                    totalAppointments,
                    freeHours: parseFloat(freeHours.toFixed(1)), // Redondeamos a un decimal
                    cancelledToday,
                    newClients,
                });

            } catch (error) {
                console.error("Error fetching agenda overview:", error);
                // No mostramos toast para no saturar el dashboard
            } finally {
                setLoading(false);
            }
        };

        fetchOverviewData();
    }, []);

    const cards = [
        {
            title: 'Citas del Día',
            value: agendaData.totalAppointments,
            subtitle: 'cortes programados',
            icon: Calendar,
            color: 'primary'
        },
        {
            title: 'Horas Libres',
            value: `${agendaData.freeHours} hs`,
            subtitle: 'disponibles hoy',
            icon: Users,
            color: 'success'
        },
        {
            title: 'Cancelaciones',
            value: agendaData.cancelledToday,
            subtitle: 'canceladas hoy',
            icon: AlertCircle,
            color: 'error'
        },
        {
            title: 'Clientes Nuevos',
            value: agendaData.newClients,
            subtitle: 'primera visita hoy',
            icon: Sparkles,
            color: 'secondary'
        }
    ];

    const getCardStyles = (color) => {
        return "premium-card p-4 transition-all duration-300 cursor-pointer hover:border-primary/30";
    };

    const getIconColor = (color) => {
        const colors = {
            primary: 'text-primary',
            secondary: 'text-secondary-foreground',
            success: 'text-success',
            error: 'text-destructive' // Usamos destructive para un rojo más consistente
        };
        return colors[color] || 'text-primary';
    };

    const handleCardClick = (card) => {
        toast({
            title: `📊 ${card.title}`,
            description: `${card.value} ${card.subtitle}`,
        });
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array(4).fill(0).map((_, index) => (
                    <div key={index} className="premium-card p-4 h-28 bg-muted animate-pulse"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <motion.div
                        key={index}
                        className={getCardStyles(card.color)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        onClick={() => handleCardClick(card)}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                {card.title}
                            </h3>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-accent`}>
                                <Icon className={`w-4 h-4 ${getIconColor(card.color)}`} />
                            </div>
                        </div>
                        
                        <div className="text-left">
                            <p className={`text-2xl font-bold tracking-tight text-foreground`}>
                                {card.value}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {card.subtitle}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default AgendaOverview;