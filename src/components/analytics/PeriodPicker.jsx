import React, { useState } from 'react';
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

const PeriodPicker = ({ date, setDate, dateRange, setDateRange }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleQuickSelect = (period) => {
    const today = new Date();
    if (period === 'this_month') {
      setDate(today);
      if (setDateRange) setDateRange(null);
    } else if (period === 'last_3_months') {
      const startDate = subMonths(today, 2);
      if (setDateRange) setDateRange({ from: startOfMonth(startDate), to: endOfMonth(today) });
      setDate(today);
    } else if (period === 'this_year') {
      if (setDateRange) setDateRange({ from: startOfYear(today), to: endOfYear(today) });
      setDate(today);
    }
    setPopoverOpen(false);
  };

  const handleMonthChange = (newMonth) => {
    setDate(newMonth);
    if (setDateRange) setDateRange(null);
  };

  const navigateMonth = (direction) => {
    const newDate = direction === 'prev' ? subMonths(date, 1) : addMonths(date, 1);
    handleMonthChange(newDate);
  };

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
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange
              ? `${dayjs(dateRange.from).format('DD/MM/YYYY')} - ${dayjs(dateRange.to).format('DD/MM/YYYY')}`
              : dayjs(date).format('MMMM YYYY')
            }
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
            mode="single"
            selected={date}
            onSelect={(day) => {
              if (day) {
                handleMonthChange(day);
                setPopoverOpen(false);
              }
            }}
            onMonthChange={handleMonthChange}
            month={date}
            captionLayout="dropdown-buttons"
            fromYear={2020}
            toYear={dayjs().year() + 1}
            initialFocus
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