import React from 'react';
import { motion } from 'framer-motion';
import { Plus, User, Edit, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, isSameDay, parseISO, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const hours = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`);

const WeekView = ({ days, appointments, onAppointmentAction, onNewAppointment }) => {
  return (
    <div className="grid" style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)`}}>
      <div />
      {days.map(day => {
        const isDayToday = isToday(day);
        return (
          <div 
            key={day.toString()} 
            className={cn(
              "font-semibold text-center p-2 border-b border-l",
              isDayToday 
                ? "bg-primary/10 border-primary/20 text-primary" 
                : "bg-accent/50 border-border text-muted-foreground"
            )}
          >
            <div className="flex flex-col items-center justify-center">
              <span className="text-sm uppercase">{format(day, 'EEE', { locale: es })}</span>
              <p className={cn(
                "text-2xl font-bold mt-1",
                isDayToday ? "text-primary" : "text-foreground"
              )}>
                {format(day, 'd')}
              </p>
            </div>
          </div>
        );
      })}
      {hours.map((hour, hourIndex) => (
        <React.Fragment key={hour}>
          <div className="bg-accent/50 font-medium text-center text-muted-foreground p-2 border-l border-t border-border flex items-center justify-center">{hour}</div>
          {days.map(day => {
            const appointment = appointments.find(a => isSameDay(parseISO(a.date), day) && a.hourIndex === hourIndex);
            const isDayToday = isToday(day);
            return (
              <div 
                key={day.toString() + hour} 
                className={cn(
                  "border-l border-t border-border p-1 min-h-[80px]",
                  isDayToday 
                    ? "bg-primary/5" 
                    : "bg-transparent"
                )}
              >
                {appointment ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div
                        className={cn(
                          "cursor-pointer h-full flex flex-col justify-center rounded-lg p-2 text-left",
                          isDayToday 
                            ? "bg-primary/20 border border-primary/30 text-primary-foreground" 
                            : "bg-accent border text-foreground"
                        )}
                        whileHover={{ scale: 1.02, zIndex: 10, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
                      >
                        <p className="font-semibold text-sm">{appointment.clientName}</p>
                        <p className="text-xs opacity-80">{appointment.service}</p>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onAppointmentAction('profile', appointment)}>
                        <User className="mr-2 h-4 w-4" />Ver Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAppointmentAction('edit', appointment)}>
                        <Edit className="mr-2 h-4 w-4" />Modificar Cita
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => onAppointmentAction('cancel', appointment)}>
                        <Trash2 className="mr-2 h-4 w-4" />Cancelar Cita
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "h-full w-full transition-all duration-200",
                      isDayToday 
                        ? "hover:bg-primary/20 hover:border-primary/50 border border-transparent" 
                        : "hover:bg-accent/80"
                    )}
                    onClick={() => onNewAppointment({ date: day, hourIndex })}
                  >
                    <Plus className={cn(
                      "w-4 h-4",
                      isDayToday ? "text-primary" : "text-muted-foreground/60"
                    )}/>
                  </Button>
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default WeekView;