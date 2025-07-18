import React from 'react';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';

const MonthView = ({ monthDays, currentDate, appointments, onDayClick }) => {
  return (
    <div className="grid grid-cols-7 grid-rows-5 gap-1">
      {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(day => (
        <div key={day} className="text-center font-semibold text-gray-400 p-2">{day}</div>
      ))}
      {monthDays.map(day => {
        const dayAppointments = appointments.filter(a => isSameDay(new Date(a.date), day));
        return (
          <div
            key={day.toString()}
            className={cn(
              "premium-card p-2 min-h-[100px] flex flex-col cursor-pointer hover:border-orange-400/50 transition-all duration-200",
              !isSameMonth(day, currentDate) && "bg-gray-800/20 opacity-50"
            )}
            onClick={() => onDayClick(day)}
          >
            <p className={cn("font-bold", isSameDay(new Date(), day) && "text-orange-400")}>{format(day, 'd')}</p>
            {dayAppointments.length > 0 && (
              <div className="mt-2 text-xs bg-orange-400/20 text-orange-400 rounded px-2 py-1 text-center border border-orange-400/30">
                {dayAppointments.length} corte{dayAppointments.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MonthView;