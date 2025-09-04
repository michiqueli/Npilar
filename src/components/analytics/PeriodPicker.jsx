import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro';

dayjs.locale('es');

const PeriodPicker = ({ dateRange, setDateRange, variant = 'default' }) => {
  const muiDateRange = useMemo(() => [
    dateRange.from ? dayjs(dateRange.from) : null,
    dateRange.to ? dayjs(dateRange.to) : null
  ], [dateRange]);

  const navigateMonth = (direction) => {
    const baseDate = dateRange?.from || new Date();
    const newMonth = direction === 'prev'
      ? dayjs(baseDate).subtract(1, 'month')
      : dayjs(baseDate).add(1, 'month');

    setDateRange({
      from: newMonth.startOf('month').toDate(),
      to: newMonth.endOf('month').toDate(),
    });
  };

  const textFieldClasses = variant === 'ghost'
    ? 'border-0 shadow-none bg-secondary focus:ring-0 mt-1'
    : '';

  const arrowClases = variant === 'ghost'
    ? "bg-primary/10 hover:bg-primary/20 rounded-full h-9 w-9"
    : "bg-secondary/50 hover:bg-secondary rounded-full h-9 w-9";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <div className="flex items-center gap-2">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            className={arrowClases}
            onClick={() => navigateMonth('prev')}
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-5 w-5 text-primary" />
          </Button>
        </motion.div>

        <DateRangePicker
          value={muiDateRange}
          onChange={(newValue) => {
            setDateRange({
              from: newValue[0] ? newValue[0].toDate() : null,
              to: newValue[1] ? newValue[1].toDate() : null,
            });
          }}
          localeText={{ start: 'Desde', end: 'Hasta' }}
          slotProps={{
            textField: {
              size: 'small',
              InputProps: {
                className: textFieldClasses,
              },
            },
          }}
          sx={{
            width: '100%',
            maxWidth: '260px',
          }}
        />

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            className={arrowClases}
            onClick={() => navigateMonth('next')}
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-5 w-5 text-primary" />
          </Button>
        </motion.div>
      </div>
    </LocalizationProvider>
  );
};

export default PeriodPicker;