import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { addMonths, subMonths, startOfYear, endOfYear, startOfMonth, endOfMonth } from 'date-fns';
import { motion } from 'framer-motion';

dayjs.locale('es');

const PeriodPicker = ({ dateRange, setDateRange }) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [displayMonth, setDisplayMonth] = useState(dateRange?.from || new Date());

    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            setPopoverOpen(false);
        }
    }, [dateRange]);

    const handleQuickSelect = (period) => {
        const today = new Date();
        let newRange = { from: today, to: today };

        if (period === 'this_month') {
            newRange = { from: startOfMonth(today), to: endOfMonth(today) };
        } else if (period === 'last_3_months') {
            const startDate = subMonths(today, 2);
            newRange = { from: startOfMonth(startDate), to: endOfMonth(today) };
        } else if (period === 'this_year') {
            newRange = { from: startOfYear(today), to: endOfYear(today) };
        }
        
        setDateRange(newRange);
        setDisplayMonth(newRange.from);
    };

    // --- FUNCIÓN CORREGIDA ---
    // Ahora, al hacer clic en las flechas, se actualiza el rango de fechas seleccionado.
    const navigateMonth = (direction) => {
        // Usamos la fecha de inicio del rango actual como base para navegar.
        const baseDate = dateRange?.from || new Date();
        
        // Calculamos el primer día del nuevo mes.
        const newMonth = direction === 'prev' ? subMonths(baseDate, 1) : addMonths(baseDate, 1);

        // Creamos el nuevo rango de fechas para el mes completo.
        const newRange = {
            from: startOfMonth(newMonth),
            to: endOfMonth(newMonth),
        };

        // Actualizamos el estado que controla el rango seleccionado.
        setDateRange(newRange);
        
        // También actualizamos el mes que se muestra en el calendario para consistencia.
        setDisplayMonth(newMonth);
    };

    // --- MEJORA DE UX: Muestra el nombre del mes si se selecciona un mes completo ---
    const displayLabel = useMemo(() => {
        if (!dateRange || !dateRange.from) {
            return <span>Selecciona un periodo</span>;
        }
        
        const from = dateRange.from;
        const to = dateRange.to || from;

        const isFullMonth = 
            dayjs(from).isSame(startOfMonth(from), 'day') &&
            dayjs(to).isSame(endOfMonth(from), 'day');

        if (isFullMonth) {
            return <span className="capitalize">{dayjs(from).format('MMMM YYYY')}</span>;
        }

        return `${dayjs(from).format('DD/MM/YY')} - ${dayjs(to).format('DD/MM/YY')}`;
    }, [dateRange]);

    return (
        <div className="flex items-center gap-1">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                    variant="ghost"
                    size="icon"
                    className="bg-primary/10 hover:bg-primary/20 rounded-full h-9 w-9"
                    onClick={() => navigateMonth('prev')}
                    aria-label="Mes anterior"
                >
                    <ChevronLeft className="h-5 w-5 text-primary" />
                </Button>
            </motion.div>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={'secondary'}
                        className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {displayLabel}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 flex" align="start">
                    <div className="p-4 border-r">
                        <h4 className="font-bold mb-4 text-sm">Accesos Rápidos</h4>
                        <div className="flex flex-col gap-2">
                            <Button variant="ghost" size="sm" className="justify-start" onClick={() => handleQuickSelect('this_month')}>Este Mes</Button>
                            <Button variant="ghost" size="sm" className="justify-start" onClick={() => handleQuickSelect('last_3_months')}>Últimos 3 Meses</Button>
                            <Button variant="ghost" size="sm" className="justify-start" onClick={() => handleQuickSelect('this_year')}>Este Año</Button>
                        </div>
                    </div>
                    <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        month={displayMonth}
                        onMonthChange={setDisplayMonth}
                        initialFocus
                        numberOfMonths={1}
                    />
                </PopoverContent>
            </Popover>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
               <Button
                    variant="ghost"
                    size="icon"
                    className="bg-primary/10 hover:bg-primary/20 rounded-full h-9 w-9"
                    onClick={() => navigateMonth('next')}
                    aria-label="Mes siguiente"
                >
                    <ChevronRight className="h-5 w-5 text-primary" />
                </Button>
            </motion.div>
        </div>
    );
};

export default PeriodPicker;