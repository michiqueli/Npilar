import React from 'react';
import { DatePickerInput } from '@mantine/dates';
import { MantineProvider } from '@mantine/core';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { motion } from 'framer-motion';

import { DatesProvider } from '@mantine/dates';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const PeriodPicker = ({ dateRange, setDateRange, variant = 'default' }) => {
  const value = [
    dateRange.from ? dayjs(dateRange.from).toDate() : null,
    dateRange.to ? dayjs(dateRange.to).toDate() : null
  ];

  const handleChange = (newValue) => {
    setDateRange({
      from: newValue[0] ? dayjs(newValue[0]).startOf('day').toDate() : null,
      to: newValue[1] ? dayjs(newValue[1]).endOf('day').toDate() : null,
    });
  };

  const getVariantStyles = () => {
    if (variant === 'primary') {
      return {
        input: {
          backgroundColor: '',
          borderRadius: '0.75rem',
          textAlign: 'center',
          fontWeight: 500,
          height: '2.75rem',
          marginTop: '0.5rem',
        },
      };
    }
    return {
      input: {
        borderRadius: '0.75rem',
        textAlign: 'center',
        fontWeight: 500,
        height: '2.75rem',
        marginTop: '0.5rem',
      }
    };
  };

  return (
    <MantineProvider>
      <DatesProvider settings={{ locale: 'es', firstDayOfWeek: 1, weekendDays: [0], timezone: 'UTC' }}>
        <DatePickerInput
          type="range"
          placeholder="Selecciona un rango..."
          value={value}
          onChange={handleChange}
          valueFormatter={() => {
            const from = dateRange.from;
            const to = dateRange.to;

            if (from && to) {
              return `${dayjs(from).format('DD/MM/YYYY')} – ${dayjs(to).format('DD/MM/YYYY')}`;
            }
            if (from) {
              return `${dayjs(from).format('DD/MM/YYYY')} – ...`;
            }
            return '';
          }}
          leftSection={<Calendar className="h-4 w-4 text-gray-500" />}
          leftSectionPointerEvents="none"
          clearable={false}
          styles={getVariantStyles()}
          w="100%"
          popoverProps={{ withinPortal: true, zIndex: 9999 }}
          previousIcon={
            <motion.div whileTap={{ rotate: -180, scale: 0.9 }}>
              <ChevronLeft className="h-5 w-5" />
            </motion.div>
          }
          nextIcon={
            <motion.div whileTap={{ rotate: 180, scale: 0.9 }}>
              <ChevronRight className="h-5 w-5" />
            </motion.div>
          }

          classNames={{
            calendarHeaderControl: 'h-10 w-10 rounded-full p-0 transition-transform duration-200 ease-out hover:bg-accent hover:scale-110',
            calendarHeaderLevel: 'text-sm font-medium',
            weekday: 'text-muted-foreground w-9 font-normal text-[0.8rem]',
            day: `
              h-9 w-9 p-0 font-semibold rounded-md transition-colors 
              hover:bg-accent hover:text-accent-foreground
              
              data-[in-range]:bg-accent data-[in-range]:text-accent-foreground
              
              data-[first-in-range]:bg-primary data-[first-in-range]:text-primary-foreground data-[first-in-range]:rounded-l-md
              
              data-[last-in-range]:bg-primary data-[last-in-range]:text-primary-foreground data-[last-in-range]:rounded-r-md
              
              data-[selected]:not([data-in-range]):bg-primary data-[selected]:not([data-in-range]):text-primary-foreground data-[selected]:not([data-in-range]):rounded-full
              
              data-[today]:bg-accent/50 data-[today]:text-accent-foreground

              data-[outside]:text-muted-foreground data-[outside]:opacity-50
              data-[disabled]:text-muted-foreground data-[disabled]:opacity-50
            `,
          }}
        />
      </DatesProvider>
    </MantineProvider>
  );
};

export default PeriodPicker;