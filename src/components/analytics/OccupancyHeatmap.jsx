import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const OccupancyHeatmap = ({ data }) => {
  const hours = Array.from({ length: 12 }, (_, i) => i + 9); // 9 AM to 8 PM
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const getColor = (value) => {
    if (value === null || value === undefined) return 'bg-muted/20';
    if (value < 20) return 'bg-red-200';
    if (value < 40) return 'bg-orange-200';
    if (value < 60) return 'bg-yellow-200';
    if (value < 80) return 'bg-green-200';
    return 'bg-green-400';
  };

  const getSuggestion = (value) => {
    if (value === null || value === undefined) return 'Sin datos';
    if (value < 30) return 'Considera una promoción en esta franja.';
    if (value > 80) return '¡Hora pico! Considera personal extra.';
    return 'Ocupación normal.';
  };

  return (
    <div className="premium-card p-6">
      <h3 className="text-xl font-bold mb-4">Mapa de Calor de Ocupación</h3>
      <div className="flex justify-end items-center gap-4 mb-4 text-xs text-muted-foreground">
        <span>Baja</span>
        <div className="flex">
          <div className="w-4 h-4 rounded-sm bg-red-200"></div>
          <div className="w-4 h-4 rounded-sm bg-orange-200"></div>
          <div className="w-4 h-4 rounded-sm bg-yellow-200"></div>
          <div className="w-4 h-4 rounded-sm bg-green-200"></div>
          <div className="w-4 h-4 rounded-sm bg-green-400"></div>
        </div>
        <span>Alta</span>
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-2">
        <div className="grid grid-rows-[auto_1fr] text-xs text-muted-foreground">
          <div />
          <div className="flex flex-col justify-around">
            {hours.map(hour => (
              <div key={hour} className="h-8 flex items-center">{`${hour}:00`}</div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => (
            <div key={day} className="text-center text-xs font-bold text-muted-foreground">{day.substring(0,3)}</div>
          ))}
          {days.map((day, dayIndex) => (
            <div key={day} className="grid grid-rows-12 gap-1">
              {hours.map(hour => {
                const entry = data.find(d => d.day === day && d.hour === hour);
                const occupancy = entry ? entry.occupancy : null;
                return (
                  <Tooltip key={`${day}-${hour}`} delayDuration={100}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'w-full h-8 rounded-md cursor-pointer transition-transform hover:scale-110 hover:z-10',
                          getColor(occupancy)
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-bold">{day} a las {hour}:00</p>
                      <p>Ocupación: {occupancy !== null ? `${occupancy}%` : 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">{getSuggestion(occupancy)}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OccupancyHeatmap;