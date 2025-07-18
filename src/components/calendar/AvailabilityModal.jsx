import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const weekDays = [
  { key: '1', label: 'Lunes' },
  { key: '2', label: 'Martes' },
  { key: '3', label: 'Miércoles' },
  { key: '4', label: 'Jueves' },
  { key: '5', label: 'Viernes' },
  { key: '6', label: 'Sábado' },
  { key: '0', label: 'Domingo' },
];

const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const AvailabilityModal = ({ isOpen, onClose, availability, onSave, appointments }) => {
  const { toast } = useToast();
  const [defaultHours, setDefaultHours] = useState(availability.default);
  const [exceptions, setExceptions] = useState(availability.exceptions);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tab, setTab] = useState('default');

  useEffect(() => {
    // Deep copy to prevent state mutation issues
    setDefaultHours(JSON.parse(JSON.stringify(availability.default)));
    setExceptions(JSON.parse(JSON.stringify(availability.exceptions)));
  }, [availability, isOpen]);

  const handleDefaultHoursChange = (day, field, value, rangeIndex) => {
    setDefaultHours(prev => {
      const newDayConfig = { ...prev[day] };
      if (field === 'available') {
        newDayConfig.available = value;
      } else {
        newDayConfig.ranges[rangeIndex][field] = value;
      }
      return { ...prev, [day]: newDayConfig };
    });
  };

  const addDefaultRange = (day) => {
    setDefaultHours(prev => {
      const newDayConfig = { ...prev[day] };
      newDayConfig.ranges.push({ start: '15:00', end: '20:00' });
      return { ...prev, [day]: newDayConfig };
    });
  };

  const removeDefaultRange = (day, rangeIndex) => {
    setDefaultHours(prev => {
      const newDayConfig = { ...prev[day] };
      newDayConfig.ranges.splice(rangeIndex, 1);
      return { ...prev, [day]: newDayConfig };
    });
  };

  const handleExceptionChange = (field, value, rangeIndex) => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    setExceptions(prev => {
      const newException = prev[dateKey] ? { ...prev[dateKey] } : { available: true, ranges: [{ start: '08:00', end: '20:00' }] };
      if (field === 'available') {
        newException.available = value;
      } else {
        newException.ranges[rangeIndex][field] = value;
      }
      return { ...prev, [dateKey]: newException };
    });
  };

  const addExceptionRange = () => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    setExceptions(prev => {
      const newException = prev[dateKey] ? { ...prev[dateKey] } : { available: true, ranges: [{ start: '08:00', end: '14:00' }] };
      newException.ranges.push({ start: '15:00', end: '20:00' });
      return { ...prev, [dateKey]: newException };
    });
  };

  const removeExceptionRange = (rangeIndex) => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    setExceptions(prev => {
      const newException = { ...prev[dateKey] };
      newException.ranges.splice(rangeIndex, 1);
      return { ...prev, [dateKey]: newException };
    });
  };

  const validateRanges = (ranges) => {
    for (let i = 0; i < ranges.length; i++) {
      const start1 = timeToMinutes(ranges[i].start);
      const end1 = timeToMinutes(ranges[i].end);
      if (start1 >= end1) return false; // Invalid range
      for (let j = i + 1; j < ranges.length; j++) {
        const start2 = timeToMinutes(ranges[j].start);
        const end2 = timeToMinutes(ranges[j].end);
        if (Math.max(start1, start2) < Math.min(end1, end2)) {
          return false; // Overlap
        }
      }
    }
    return true;
  };

  const handleSave = () => {
    // Validate all ranges
    for (const dayKey in defaultHours) {
      if (defaultHours[dayKey].available && !validateRanges(defaultHours[dayKey].ranges)) {
        toast({ variant: "destructive", title: "Error de Horario", description: `Los rangos para ${weekDays.find(d => d.key === dayKey).label} son inválidos o se superponen.` });
        return;
      }
    }
    for (const dateKey in exceptions) {
      if (exceptions[dateKey].available && !validateRanges(exceptions[dateKey].ranges)) {
        toast({ variant: "destructive", title: "Error de Horario", description: `Los rangos para la excepción del ${dateKey} son inválidos o se superponen.` });
        return;
      }
    }

    const newAvailability = { default: defaultHours, exceptions };
    
    const conflicts = [];
    appointments.forEach(appt => {
        const apptDate = parse(appt.date, 'yyyy-MM-dd', new Date());
        const dayOfWeek = apptDate.getDay().toString();
        const dateKey = appt.date;
        const schedule = newAvailability.exceptions[dateKey] ?? newAvailability.default[dayOfWeek];

        if (!schedule.available) {
            conflicts.push(appt);
            return;
        }

        const apptTime = 8 * 60 + appt.hourIndex * 30;
        const isInRange = schedule.ranges.some(range => {
            const startTime = timeToMinutes(range.start);
            const endTime = timeToMinutes(range.end);
            return apptTime >= startTime && apptTime < endTime;
        });

        if (!isInRange) {
            conflicts.push(appt);
        }
    });

    if (conflicts.length > 0) {
        toast({
            variant: "destructive",
            title: "⚠️ Conflicto de Horarios",
            description: `No se puede guardar. ${conflicts.length} cita(s) programada(s) quedan fuera del nuevo horario. Por favor, ajústalas primero.`,
            duration: 7000,
        });
        return;
    }

    onSave(newAvailability);
    toast({
        title: "✅ Horarios Guardados",
        description: "Tu disponibilidad ha sido actualizada.",
    });
    onClose();
  };

  const selectedException = exceptions[format(selectedDate, 'yyyy-MM-dd')] || {
    available: true,
    ranges: [{ start: '08:00', end: '20:00' }],
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar Horarios de Disponibilidad</DialogTitle>
          <DialogDescription>
            Define tu horario de trabajo estándar, añade descansos y gestiona excepciones para días específicos.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={tab} onValueChange={setTab} className="mt-4">
          <TabsList>
            <TabsTrigger value="default">Horario Predeterminado</TabsTrigger>
            <TabsTrigger value="exceptions">Excepciones por Día</TabsTrigger>
          </TabsList>
          
          <TabsContent value="default" className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {weekDays.map(({ key, label }) => (
              <div key={key} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                <span className="font-semibold w-24 pt-2">{label}</span>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={defaultHours[key].available}
                    onCheckedChange={(checked) => handleDefaultHoursChange(key, 'available', checked)}
                    aria-label={`Disponibilidad para ${label}`}
                  />
                  {defaultHours[key].available ? (
                    <div className="space-y-2">
                      {defaultHours[key].ranges.map((range, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input type="time" step="1800" value={range.start} onChange={(e) => handleDefaultHoursChange(key, 'start', e.target.value, index)} className="w-32" />
                          <span>-</span>
                          <Input type="time" step="1800" value={range.end} onChange={(e) => handleDefaultHoursChange(key, 'end', e.target.value, index)} className="w-32" />
                          <Button variant="ghost" size="icon" onClick={() => removeDefaultRange(key, index)} disabled={defaultHours[key].ranges.length === 1}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="link" size="sm" onClick={() => addDefaultRange(key)}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Agregar Rango
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground w-[24rem] text-center">No disponible</span>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="exceptions" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Selecciona una fecha</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border mt-2"
                locale={es}
              />
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">
                Excepción para {format(selectedDate, 'PPP', { locale: es })}
              </h3>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="font-semibold">Disponibilidad</span>
                <Switch
                  checked={selectedException.available}
                  onCheckedChange={(checked) => handleExceptionChange('available', checked)}
                />
              </div>
              {selectedException.available && (
                <div className="space-y-2">
                  {selectedException.ranges.map((range, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input type="time" step="1800" value={range.start} onChange={(e) => handleExceptionChange('start', e.target.value, index)} />
                      <span>-</span>
                      <Input type="time" step="1800" value={range.end} onChange={(e) => handleExceptionChange('end', e.target.value, index)} />
                      <Button variant="ghost" size="icon" onClick={() => removeExceptionRange(index)} disabled={selectedException.ranges.length === 1}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="link" size="sm" onClick={addExceptionRange}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Agregar Rango
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvailabilityModal;