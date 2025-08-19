import React, { useState, useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isToday } from 'date-fns';

// Generamos todas las opciones de hora y minutos una sola vez
const allHours = Array.from({ length: 15 }, (_, i) => (i + 8).toString().padStart(2, '0')); // 08:00 a 22:00
const allMinutes = ['00', '15', '30', '45'];

const TimePicker = ({ value, onChange, selectedDate }) => {
    // Estados internos para manejar la hora y el minuto por separado
    const [selectedHour, setSelectedHour] = useState('09');
    const [selectedMinute, setSelectedMinute] = useState('00');

    // Cuando el valor que viene de afuera (prop `value`) cambia, actualizamos los estados internos
    useEffect(() => {
        if (value) {
            const [h, m] = value.split(':');
            if (h && m) {
                setSelectedHour(h);
                setSelectedMinute(m);
            }
        } else {
            // Si no hay valor, reseteamos a un valor por defecto
            setSelectedHour('09');
            setSelectedMinute('00');
        }
    }, [value]);

    // Lógica para filtrar las horas que ya pasaron si la fecha es hoy
    const availableHours = useMemo(() => {
        if (!selectedDate || !isToday(selectedDate)) {
            return allHours; // Si no es hoy, todas las horas están disponibles
        }
        const currentHour = new Date().getHours();
        return allHours.filter(hour => parseInt(hour) >= currentHour);
    }, [selectedDate]);

    // Lógica para filtrar los minutos que ya pasaron si la fecha y la hora son las actuales
    const availableMinutes = useMemo(() => {
        if (!selectedDate || !isToday(selectedDate) || parseInt(selectedHour) > new Date().getHours()) {
            return allMinutes; // Si no es hoy o la hora seleccionada es futura, todos los minutos están disponibles
        }
        const currentMinute = new Date().getMinutes();
        return allMinutes.filter(minute => parseInt(minute) >= currentMinute);
    }, [selectedDate, selectedHour]);

    // Función para manejar el cambio en el selector de HORAS
    const handleHourChange = (hour) => {
        setSelectedHour(hour);
        onChange(`${hour}:${selectedMinute}`); // Notificamos al componente padre del cambio completo
    };

    // Función para manejar el cambio en el selector de MINUTOS
    const handleMinuteChange = (minute) => {
        setSelectedMinute(minute);
        onChange(`${selectedHour}:${minute}`); // Notificamos al componente padre del cambio completo
    };

    return (
        <div className="flex items-center gap-2">
            {/* Selector de Horas */}
            <Select onValueChange={handleHourChange} value={selectedHour}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Hora" />
                </SelectTrigger>
                <SelectContent>
                    {availableHours.length > 0 ? (
                        availableHours.map(hour => (
                            <SelectItem key={hour} value={hour}>
                                {hour}
                            </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="no-hours" disabled>No hay horas</SelectItem>
                    )}
                </SelectContent>
            </Select>

            <span className="font-bold text-muted-foreground">:</span>

            {/* Selector de Minutos */}
            <Select onValueChange={handleMinuteChange} value={selectedMinute}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                    {availableMinutes.length > 0 ? (
                        availableMinutes.map(minute => (
                            <SelectItem key={minute} value={minute}>
                                {minute}
                            </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="no-minutes" disabled>No hay min.</SelectItem>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
};

export default TimePicker;