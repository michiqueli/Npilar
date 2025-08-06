import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const hours = Array.from(
  { length: 13 },
  (_, i) => `${(i + 8).toString().padStart(2, "0")}:00`
); // 08:00 to 20:00

// Función para determinar el color de la celda basado en la ocupación
const getHeatColor = (value) => {
  if (value === null || value === undefined || value === 0)
    return "bg-muted/30 hover:bg-muted/50";
  if (value <= 0.25) return "bg-green-300/50 hover:bg-green-300/80";
  if (value <= 0.5) return "bg-green-500/60 hover:bg-green-500/90";
  if (value <= 0.75) return "bg-yellow-400/60 hover:bg-yellow-400/90";
  return "bg-red-500/60 hover:bg-red-500/90";
};

const OccupancyHeatmap = ({ data }) => {
  if (!data) {
    return <div>Cargando mapa de calor...</div>;
  }

  return (
    <div className="premium-card p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h3 className="text-xl font-bold mb-2 sm:mb-0">
          Mapa de Calor de Ocupación
        </h3>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span>Baja</span>
          <div className="w-3 h-3 rounded-sm bg-green-300/50"></div>
          <div className="w-3 h-3 rounded-sm bg-green-500/60"></div>
          <div className="w-3 h-3 rounded-sm bg-yellow-400/60"></div>
          <div className="w-3 h-3 rounded-sm bg-red-500/60"></div>
          <span>Alta</span>
        </div>
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-x-4">
        {/* Etiquetas de Hora */}
        <div className="flex flex-col text-xs text-muted-foreground space-y-1 mt-6">
          {hours.map((hour) => (
            <div key={hour} className="h-8 flex items-center">
              {hour}
            </div>
          ))}
        </div>

        {/* Cuadrícula del Mapa de Calor */}
        <div className="grid grid-cols-7 gap-1">
          {/* Cabeceras de Días */}
          {weekDays.map((day) => (
            <div key={day} className="h-6 text-center font-semibold text-sm">
              {day}
            </div>
          ))}

          {/* Celdas */}
          {hours.map((hour, hourIndex) => (
            <React.Fragment key={hour}>
              {weekDays.map((day, dayIndex) => {
                const cellData = data.find(
                  (d) => d.day === day && d.hour === hour
                );
                const occupancy = cellData ? cellData.occupancy : 0;
                const appointments = cellData ? cellData.appointments : 0;

                return (
                  <Tooltip key={`${day}-${hour}`} delayDuration={100}>
                    <TooltipTrigger asChild>
                      <motion.div
                        className={cn(
                          "w-full h-8 rounded-md cursor-pointer transition-all",
                          getHeatColor(occupancy)
                        )}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: hourIndex * 0.02 + dayIndex * 0.05,
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-bold">
                        {day}, {hour}
                      </p>
                      <p>Ocupación: {(occupancy * 100).toFixed(0)}%</p>
                      <p>{appointments} cita(s) en este horario</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OccupancyHeatmap;
