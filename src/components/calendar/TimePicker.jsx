import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isToday } from 'date-fns';

const allHours = Array.from({ length: 13 }, (_, i) => (i + 8).toString().padStart(2, '0'));
const allMinutes = ['00', '15', '30', '45'];

const TimePicker = ({ value, onChange, selectedDate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedHour, setSelectedHour] = useState('09');
    const [selectedMinute, setSelectedMinute] = useState('00');

    const hourRef = useRef(null);
    const minuteRef = useRef(null);

    const availableHours = useMemo(() => {
        if (!selectedDate || !isToday(selectedDate)) {
            return allHours;
        }
        const currentHour = new Date().getHours();
        return allHours.filter(hour => parseInt(hour) >= currentHour);
    }, [selectedDate]);

    const availableMinutes = useMemo(() => {
        if (!selectedDate || !isToday(selectedDate) || parseInt(selectedHour) > new Date().getHours()) {
            return allMinutes;
        }
        const currentMinute = new Date().getMinutes();
        return allMinutes.filter(minute => parseInt(minute) >= currentMinute);
    }, [selectedDate, selectedHour]);

    useEffect(() => {
        if (value) {
            const [h, m] = value.split(':');
            setSelectedHour(h);
            const closestMinute = (Math.round(parseInt(m) / 15) * 15).toString().padStart(2, '0');
            setSelectedMinute(closestMinute === '60' ? '45' : closestMinute);
        }
    }, [value]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                if (hourRef.current) {
                    const selected = hourRef.current.querySelector(`[data-value="${selectedHour}"]`);
                    if (selected) {
                        selected.scrollIntoView({ block: 'center', behavior: 'smooth' });
                    }
                }
                if (minuteRef.current) {
                    const selected = minuteRef.current.querySelector(`[data-value="${selectedMinute}"]`);
                    if (selected) {
                        selected.scrollIntoView({ block: 'center', behavior: 'smooth' });
                    }
                }
            }, 100);
        }
    }, [isOpen, selectedHour, selectedMinute]);

    const handleScroll = (e, type) => {
        clearTimeout(e.target.scrollTimeout);
        e.target.scrollTimeout = setTimeout(() => {
            const { scrollTop, clientHeight } = e.target;
            const itemHeight = e.target.firstChild.children[0].clientHeight;
            const centerIndex = Math.round((scrollTop + clientHeight / 2 - itemHeight * 2.5) / itemHeight);
            
            const values = type === 'hour' ? availableHours : availableMinutes;
            const newValue = values[centerIndex];

            if (newValue) {
                if (type === 'hour') {
                    setSelectedHour(newValue);
                    onChange(`${newValue}:${selectedMinute}`);
                } else {
                    setSelectedMinute(newValue);
                    onChange(`${selectedHour}:${newValue}`);
                }
            }
        }, 150);
    };
    
    const TimeColumn = ({ values, selectedValue, colRef, title, onScroll, onSelect }) => (
        <div className="flex flex-col items-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
            <div ref={colRef} className="h-48 w-20 overflow-y-scroll no-scrollbar" style={{ scrollSnapType: 'y mandatory' }} onScroll={onScroll}>
                <div className="flex flex-col items-center py-[68px]">
                    {values.map((val) => (
                        <motion.div
                            key={val}
                            data-value={val}
                            onClick={() => onSelect(val)}
                            className={cn(
                                'w-16 h-10 flex items-center justify-center rounded-md cursor-pointer text-2xl font-semibold transition-all duration-200',
                                selectedValue === val ? 'text-primary' : 'text-muted-foreground'
                            )}
                            style={{ scrollSnapAlign: 'center' }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {val}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{value || 'Seleccionar hora'}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-xl" align="start">
                <div className="bg-card p-4 rounded-xl relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-32px)] h-10 bg-primary/10 rounded-lg pointer-events-none border border-primary/20"></div>
                    <div className="flex space-x-2 relative z-10">
                        <TimeColumn
                            values={availableHours}
                            selectedValue={selectedHour}
                            colRef={hourRef}
                            title="Hora"
                            onScroll={(e) => handleScroll(e, 'hour')}
                            onSelect={(h) => {
                                setSelectedHour(h);
                                onChange(`${h}:${selectedMinute}`);
                            }}
                        />
                        <div className="self-center text-3xl font-bold text-muted-foreground pb-8">:</div>
                        <TimeColumn
                            values={availableMinutes}
                            selectedValue={selectedMinute}
                            colRef={minuteRef}
                            title="Min"
                            onScroll={(e) => handleScroll(e, 'minute')}
                            onSelect={(m) => {
                                setSelectedMinute(m);
                                onChange(`${selectedHour}:${m}`);
                            }}
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default TimePicker;