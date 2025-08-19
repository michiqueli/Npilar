import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { format, parseISO } from 'date-fns';
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

// Componente interno para renderizar las filas de rangos de tiempo de forma responsiva
const TimeRangeRow = ({ range, onTimeChange, onRemove }) => (
    <div className="flex items-center gap-2 mt-1">
        <Input type="time" step="900" value={range.start} onChange={(e) => onTimeChange('start', e.target.value)} className="w-full" />
        <span>-</span>
        <Input type="time" step="900" value={range.end} onChange={(e) => onTimeChange('end', e.target.value)} className="w-full" />
        <Button variant="ghost" size="icon" onClick={onRemove}>
            <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
    </div>
);

const AvailabilityModal = ({ isOpen, onClose, availability, onSave }) => {
    const { toast } = useToast();
    const [defaultHours, setDefaultHours] = useState({});
    const [exceptions, setExceptions] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tab, setTab] = useState('default');

    useEffect(() => {
        if (isOpen) {
            setDefaultHours(JSON.parse(JSON.stringify(availability.default)));
            setExceptions(JSON.parse(JSON.stringify(availability.exceptions)));
        }
    }, [availability, isOpen]);

    const handleDefaultHoursChange = (day, field, value, rangeType, rangeIndex) => {
        setDefaultHours(prev => {
            const newDayConfig = { ...prev[day] };
            if (field === 'available') {
                newDayConfig.available = value;
            } else {
                newDayConfig[rangeType][rangeIndex][field] = value;
            }
            return { ...prev, [day]: newDayConfig };
        });
    };

    const addDefaultRange = (day, rangeType) => {
        setDefaultHours(prev => {
            const newDayConfig = { ...prev[day] };
            const newRange = rangeType === 'breaks' ? { start: '13:00', end: '14:00' } : { start: '15:00', end: '20:00' };
            newDayConfig[rangeType].push(newRange);
            return { ...prev, [day]: newDayConfig };
        });
    };

    const removeDefaultRange = (day, rangeType, rangeIndex) => {
        setDefaultHours(prev => {
            const newDayConfig = { ...prev[day] };
            newDayConfig[rangeType].splice(rangeIndex, 1);
            return { ...prev, [day]: newDayConfig };
        });
    };

    const handleExceptionToggle = (date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        setExceptions(prev => {
            const newExceptions = { ...prev };
            if (newExceptions[dateKey]) {
                delete newExceptions[dateKey];
            } else {
                newExceptions[dateKey] = { available: false, ranges: [], breaks: [] };
            }
            return newExceptions;
        });
    };
    
    const handleSave = () => {
        const newAvailability = { default: defaultHours, exceptions };
        onSave(newAvailability);
    };

    const sortedExceptions = useMemo(() => {
        return Object.keys(exceptions).sort((a, b) => new Date(a) - new Date(b));
    }, [exceptions]);

    const dateKeyForSelected = format(selectedDate, 'yyyy-MM-dd');
    const isException = !!exceptions[dateKeyForSelected];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl top-12 left-[5%] md:left-[10%] lg:left-[20%] xl:left-[30%] " style={{ maxWidth: '50rem' }}>
                <DialogHeader>
                    <DialogTitle>Editar Horarios de Disponibilidad</DialogTitle>
                    <DialogDescription>
                        Define tu horario de trabajo estándar, añade descansos y gestiona excepciones para días específicos.
                    </DialogDescription>
                </DialogHeader>
                
                <Tabs value={tab} onValueChange={setTab} className="mt-4">
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2">
                        <TabsTrigger value="default">Horario Predeterminado</TabsTrigger>
                        <TabsTrigger value="exceptions">Excepciones por Día</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="default" className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {weekDays.map(({ key, label }) => {
                            const dayConfig = defaultHours[key];
                            if (!dayConfig) return null;

                            return (
                                <div key={key} className="p-4 rounded-lg bg-muted/50">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                        <span className="font-semibold w-full sm:w-28 mb-2 sm:mb-0">{label}</span>
                                        <div className="flex items-center gap-4">
                                            <Label htmlFor={`switch-${key}`} className="text-sm">Disponible</Label>
                                            <Switch
                                                id={`switch-${key}`}
                                                checked={dayConfig.available}
                                                onCheckedChange={(checked) => handleDefaultHoursChange(key, 'available', checked)}
                                                aria-label={`Disponibilidad para ${label}`}
                                            />
                                        </div>
                                    </div>
                                    {dayConfig.available && (
                                        <div className="mt-4 pl-0 sm:pl-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground">Horarios de Trabajo</Label>
                                                {dayConfig.ranges.map((range, index) => (
                                                    <TimeRangeRow 
                                                        key={`range-${index}`}
                                                        range={range}
                                                        onTimeChange={(field, value) => handleDefaultHoursChange(key, field, value, 'ranges', index)}
                                                        onRemove={() => removeDefaultRange(key, 'ranges', index)}
                                                    />
                                                ))}
                                                <Button variant="link" size="sm" onClick={() => addDefaultRange(key, 'ranges')} className="p-0 h-auto">
                                                    <PlusCircle className="w-4 h-4 mr-1" /> Agregar Horario
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground">Descansos</Label>
                                                {dayConfig.breaks.map((range, index) => (
                                                    <TimeRangeRow 
                                                        key={`break-${index}`}
                                                        range={range}
                                                        onTimeChange={(field, value) => handleDefaultHoursChange(key, field, value, 'breaks', index)}
                                                        onRemove={() => removeDefaultRange(key, 'breaks', index)}
                                                    />
                                                ))}
                                                <Button variant="link" size="sm" onClick={() => addDefaultRange(key, 'breaks')} className="p-0 h-auto">
                                                    <PlusCircle className="w-4 h-4 mr-1" /> Agregar Descanso
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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
                            <div className="mt-4 space-y-4">
                                <h3 className="font-semibold text-lg">
                                    Excepción para {format(selectedDate, 'PPP', { locale: es })}
                                </h3>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <span className="font-semibold">Día no laborable</span>
                                    <Switch
                                        checked={isException}
                                        onCheckedChange={() => handleExceptionToggle(selectedDate)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                             <h3 className="font-semibold text-lg">Excepciones Activas</h3>
                             <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2">
                                {sortedExceptions.length > 0 ? (
                                    sortedExceptions.map(dateKey => (
                                        <div key={dateKey} className="flex items-center justify-between p-2 bg-card rounded">
                                            <span className="text-sm font-medium">{format(parseISO(dateKey), 'PPP', { locale: es })}</span>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleExceptionToggle(parseISO(dateKey))}>
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center p-4">No hay excepciones configuradas.</p>
                                )}
                             </div>
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