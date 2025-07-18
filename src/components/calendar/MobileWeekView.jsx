import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Scissors, User, Edit, Trash2, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, isSameDay, parseISO, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const hours = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`);

const MobileWeekView = ({ 
  weekDays, 
  appointments, 
  mobileScrollIndex, 
  setMobileScrollIndex,
  onAppointmentAction, 
  onNewAppointment 
}) => {
  const currentDay = weekDays[mobileScrollIndex];
  const isDayToday = isToday(currentDay);

  const goToNextDay = () => {
    if (mobileScrollIndex < weekDays.length - 1) {
      setMobileScrollIndex(mobileScrollIndex + 1);
    }
  };

  const goToPrevDay = () => {
    if (mobileScrollIndex > 0) {
      setMobileScrollIndex(mobileScrollIndex - 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile day navigation */}
      <div className={cn(
        "flex items-center justify-between rounded-lg p-3 relative",
        isDayToday 
          ? "bg-primary/10 border-2 border-primary/30" 
          : "bg-accent/50"
      )}>
        {/* Marcador dorado superior para día actual */}
        {isDayToday && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-16 h-1 bg-gradient-to-r from-primary to-yellow-400 rounded-full shadow-lg"></div>
        )}
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={goToPrevDay}
          disabled={mobileScrollIndex === 0}
          className="text-primary hover:bg-primary/10 disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            {isDayToday && <MapPin className="w-5 h-5 text-primary" />}
            <p className={cn(
              "text-lg font-bold capitalize",
              isDayToday ? "text-primary" : "text-foreground"
            )}>
              {format(currentDay, 'EEEE', { locale: es })}
            </p>
          </div>
          <p className={cn(
            "text-sm",
            isDayToday ? "text-primary/80" : "text-muted-foreground"
          )}>
            {format(currentDay, 'd MMMM', { locale: es })}
          </p>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={goToNextDay}
          disabled={mobileScrollIndex === weekDays.length - 1}
          className="text-primary hover:bg-primary/10 disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Day indicator dots */}
      <div className="flex justify-center space-x-2">
        {weekDays.map((day, index) => {
          const isDotToday = isToday(day);
          return (
            <button
              key={index}
              onClick={() => setMobileScrollIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === mobileScrollIndex 
                  ? isDotToday 
                    ? "bg-primary w-8 shadow-lg shadow-primary/50" 
                    : "bg-primary w-6"
                  : isDotToday
                    ? "bg-primary/60 hover:bg-primary/80"
                    : "bg-muted-foreground/50 hover:bg-muted-foreground/80"
              )}
            />
          );
        })}
      </div>

      {/* Single day schedule */}
      <div className="space-y-2">
        {hours.map((hour, hourIndex) => {
          const appointment = appointments.find(a => 
            isSameDay(parseISO(a.date), currentDay) && a.hourIndex === hourIndex
          );
          
          return (
            <div key={hour} className="flex items-center space-x-3">
              <div className="w-16 text-center text-muted-foreground font-medium text-sm">
                {hour}
              </div>
              <div className="flex-1">
                {appointment ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div
                        className={cn(
                          "premium-card p-4 cursor-pointer border-l-4",
                          isDayToday 
                            ? "border-primary bg-primary/5" 
                            : "border-primary bg-accent/30"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{appointment.clientName}</p>
                            <p className="text-sm text-muted-foreground">{appointment.service}</p>
                          </div>
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            "bg-primary/20"
                          )}>
                            <Scissors className="w-4 h-4 text-primary" />
                          </div>
                        </div>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onAppointmentAction('profile', appointment)}>
                        <User className="mr-2 h-4 w-4" />Ver Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAppointmentAction('edit', appointment)}>
                        <Edit className="mr-2 h-4 w-4" />Modificar Cita
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive" 
                        onClick={() => onAppointmentAction('cancel', appointment)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />Cancelar Cita
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full h-16 border-dashed transition-all duration-200",
                      isDayToday 
                        ? "border-primary/50 hover:border-primary hover:bg-primary/10" 
                        : "border-muted/80 hover:border-primary hover:bg-primary/5"
                    )}
                    onClick={() => onNewAppointment({ date: currentDay, hourIndex })}
                  >
                    <Plus className={cn(
                      "w-5 h-5",
                      isDayToday ? "text-primary" : "text-muted-foreground/60"
                    )} />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileWeekView;