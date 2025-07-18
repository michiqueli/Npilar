import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useToast } from '@/components/ui/use-toast';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, startOfMonth, endOfMonth, isToday, isSameDay, parseISO, getDay, parse, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Edit, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import AppointmentModal from '@/components/calendar/AppointmentModal';
import AvailabilityModal from '@/components/calendar/AvailabilityModal';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import MobileDayView from '@/components/calendar/MobileDayView';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';

const hours = Array.from({ length: 29 }, (_, i) => {
    const totalMinutes = 8 * 60 + i * 30;
    const h = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const m = (totalMinutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
});

const mockClients = [
    { id: 1, name: 'Juan Pérez', phone: '111222333', historicSlots: [{ day: 1, hourIndex: 2 }], lastVisit: '2025-06-15' },
    { id: 2, name: 'Carlos López', phone: '444555666', historicSlots: [], lastVisit: '2025-05-20' },
    { id: 3, name: 'Ana García', phone: '777888999', historicSlots: [{ day: 3, hourIndex: 5 }], lastVisit: '2025-06-30' },
    { id: 4, name: 'Luis Rodríguez', phone: '123456789', historicSlots: [], lastVisit: '2025-07-01' },
];

const mockServices = [
    { id: 1, name: 'Corte', price: 20, duration: 30 },
    { id: 2, name: 'Corte + Barba', price: 30, duration: 45 },
    { id: 3, name: 'Barba', price: 15, duration: 20 },
    { id: 4, name: 'Servicio completo', price: 40, duration: 60 },
    { id: 5, name: 'Diseño de cejas', price: 10, duration: 15 },
];

const initialAvailability = {
  default: {
    '1': { available: true, ranges: [{ start: '08:00', end: '13:00' }, { start: '14:00', end: '20:00' }] }, // Lunes
    '2': { available: true, ranges: [{ start: '08:00', end: '20:00' }] }, // Martes
    '3': { available: true, ranges: [{ start: '08:00', end: '20:00' }] }, // Miércoles
    '4': { available: true, ranges: [{ start: '08:00', end: '20:00' }] }, // Jueves
    '5': { available: true, ranges: [{ start: '08:00', end: '20:00' }] }, // Viernes
    '6': { available: true, ranges: [{ start: '09:00', end: '14:00' }] }, // Sábado
    '0': { available: false, ranges: [{ start: '09:00', end: '17:00' }] }, // Domingo
  },
  exceptions: {
    '2025-07-25': { available: false, ranges: [{ start: '09:00', end: '17:00' }] }
  }
};

const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const MonthView = ({ monthDays, onDayClick, appointments, currentDate, availability }) => (
    <div className="grid grid-cols-7">
        {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map(day => (
            <div key={day} className="text-center font-bold text-sm text-muted-foreground p-2 border-b">{day}</div>
        ))}
        {monthDays.map((day, index) => {
            const dayAppointments = appointments.filter(a => isSameDay(parseISO(a.date), day));
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isTheToday = isToday(day);
            
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayOfWeek = day.getDay().toString();
            const schedule = availability.exceptions[dateKey] ?? availability.default[dayOfWeek];

            return (
                <div
                    key={index}
                    className={cn(
                        "premium-card p-2 min-h-[100px] flex flex-col cursor-pointer hover:border-primary/50 transition-all duration-200 rounded-none border-t-0 border-l-0",
                        !isCurrentMonth && "bg-muted/50 opacity-60",
                        !schedule.available && "bg-muted/50 opacity-60",
                        (index % 7 !== 0) && "border-l"
                    )}
                    onClick={() => onDayClick(day)}
                >
                    <p className={cn("font-bold", isTheToday && "text-primary")}>
                        {format(day, 'd')}
                    </p>
                    {dayAppointments.length > 0 && isCurrentMonth && schedule.available && (
                        <div className="mt-2 text-xs bg-primary/20 text-primary rounded px-2 py-1 text-center font-semibold">
                            {dayAppointments.length} cita{dayAppointments.length > 1 ? 's' : ''}
                        </div>
                    )}
                    {!schedule.available && isCurrentMonth && (
                         <div className="mt-2 text-xs bg-destructive/20 text-destructive rounded px-2 py-1 text-center font-semibold">
                            Cerrado
                        </div>
                    )}
                </div>
            )
        })}
    </div>
);


const Calendario = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 7)); // 7 de Julio 2025
    const [view, setView] = useState('week');
    const [appointments, setAppointments] = useState([]);
    const [clients, setClients] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [availability, setAvailability] = useState(initialAvailability);
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const swiperRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const storedAppointments = localStorage.getItem('nehue-appointments');
        const storedClients = localStorage.getItem('nehue-clients');
        const storedAvailability = localStorage.getItem('nehue-availability');

        if (storedAppointments) setAppointments(JSON.parse(storedAppointments).map(a => ({...a, date: a.date.split('T')[0]})));
        else setAppointments([]);
        
        if (storedClients) setClients(JSON.parse(storedClients));
        else setClients(mockClients);

        if (storedAvailability) setAvailability(JSON.parse(storedAvailability));
        else setAvailability(initialAvailability);

    }, []);

    useEffect(() => {
        localStorage.setItem('nehue-appointments', JSON.stringify(appointments));
    }, [appointments]);

    useEffect(() => {
        localStorage.setItem('nehue-clients', JSON.stringify(clients));
    }, [clients]);

    useEffect(() => {
        localStorage.setItem('nehue-availability', JSON.stringify(availability));
    }, [availability]);

    const weekDays = useMemo(() => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end: addDays(start, 6) });
    }, [currentDate]);

    const monthDays = useMemo(() => {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    }, [currentDate]);


    const handleOpenModal = (data) => {
        setModalData(data);
        setIsModalOpen(true);
    };

    const handleAppointmentAction = (action, appointment) => {
      toast({ title: `Acción: ${action}`, description: `Cita de ${appointment.clientName}` });
    };

    const handleSaveAppointment = (data) => {
        const newAppointment = {
            id: Date.now(),
            date: format(data.date, 'yyyy-MM-dd'),
            hourIndex: data.hourIndex,
            ...data.details
        };
        
        if (!clients.some(c => c.id === data.details.clientId)) {
            const newClient = { id: data.details.clientId, name: data.details.clientName, phone: '', lastVisit: format(new Date(), 'yyyy-MM-dd') };
            setClients([...clients, newClient]);
        }


        setAppointments([...appointments, newAppointment]);
        setIsModalOpen(false);
        toast({
            title: "✅ Cita Guardada",
            description: `Cita para ${data.details.clientName} guardada con éxito.`,
            className: 'bg-success text-white'
        });
    };

    const todayDate = new Date();

    const handleDateChange = (date) => {
        if (date) {
            setCurrentDate(date);
        }
    };
    
    useEffect(() => {
        if (swiperRef.current && swiperRef.current.swiper) {
            const todayIndex = weekDays.findIndex(day => isSameDay(day, currentDate));
            if(todayIndex !== -1) {
                 swiperRef.current.swiper.slideTo(todayIndex);
            }
        }
    }, [currentDate, weekDays]);

    const changeDate = (amount, unit) => {
        if (unit === 'week') {
            setCurrentDate(prev => addDays(prev, amount * 7));
        } else {
            setCurrentDate(prev => addMonths(prev, amount));
        }
    }

    const title = useMemo(() => {
        if (view === 'week' || isMobile) {
            const start = startOfWeek(currentDate, { weekStartsOn: 1 });
            const end = endOfWeek(currentDate, { weekStartsOn: 1 });
            if (start.getMonth() === end.getMonth()) {
                return `${format(start, 'd')} - ${format(end, 'd \'de\' MMMM \'de\' yyyy', { locale: es })}`;
            }
            return `${format(start, 'd \'de\' MMMM')} - ${format(end, 'd \'de\' MMMM \'de\' yyyy', { locale: es })}`;
        }
        return format(currentDate, 'MMMM yyyy', { locale: es });
    }, [currentDate, view, isMobile]);

    const isSlotAvailable = (day, hourIndex) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const dayOfWeek = day.getDay().toString();
        const schedule = availability.exceptions[dateKey] ?? availability.default[dayOfWeek];

        if (!schedule.available) return false;

        const slotTime = 8 * 60 + hourIndex * 30;
        
        return schedule.ranges.some(range => {
            const startTime = timeToMinutes(range.start);
            const endTime = timeToMinutes(range.end);
            return slotTime >= startTime && slotTime < endTime;
        });
    };

    return (
        <>
            <Helmet>
                <title>Agenda - N - Pilar</title>
                <meta name="description" content="Agenda semanal y mensual interactiva para gestionar citas." />
            </Helmet>
            <div className="space-y-4">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <Button variant="secondary" onClick={() => setCurrentDate(todayDate)}>Hoy</Button>
                        <div className="flex items-center gap-1 bg-card p-1 rounded-lg border">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => changeDate(-1, view)} aria-label="Periodo anterior">
                                        <ChevronLeft className="h-6 w-6 text-foreground" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Periodo anterior</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => changeDate(1, view)} aria-label="Siguiente periodo">
                                        <ChevronRight className="h-6 w-6 text-foreground" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Siguiente periodo</p></TooltipContent>
                            </Tooltip>
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="secondary" className="w-auto sm:w-[280px] justify-start text-left font-normal text-lg">
                                    <CalendarIcon className="mr-3 h-5 w-5" />
                                    <span className="capitalize">{title}</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={currentDate} onSelect={handleDateChange} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <Tabs value={view} onValueChange={setView} className={cn("transition-all duration-300 ease-in-out", isMobile && "hidden")}>
                            <TabsList>
                                <TabsTrigger value="week">Semana</TabsTrigger>
                                <TabsTrigger value="month">Mes</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <Button variant="secondary" onClick={() => setIsAvailabilityModalOpen(true)}>
                            <Edit className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Editar Horarios</span>
                        </Button>
                        <Button size="lg" variant="primary" onClick={() => handleOpenModal(null)}>
                            <Plus className="w-5 h-5 md:mr-2" />
                            <span className="hidden md:inline">Nueva Cita</span>
                        </Button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={view + isMobile}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {isMobile ? (
                            <div className="space-y-4">
                                <Swiper
                                  ref={swiperRef}
                                  slidesPerView={5}
                                  centeredSlides={true}
                                  spaceBetween={10}
                                  onSlideChange={(swiper) => handleDateChange(weekDays[swiper.activeIndex])}
                                  className="w-full"
                                  initialSlide={weekDays.findIndex(day => isSameDay(day, currentDate))}
                                >
                                    {weekDays.map((day) => (
                                        <SwiperSlide key={day.toISOString()}>
                                            <div
                                                onClick={() => handleDateChange(day)}
                                                className={cn(
                                                    "p-3 rounded-lg text-center cursor-pointer transition-all duration-200 border",
                                                    isSameDay(day, currentDate)
                                                        ? 'bg-primary text-primary-foreground font-bold shadow-lg'
                                                        : 'bg-secondary hover:bg-accent'
                                                )}
                                            >
                                                <p className="text-xs capitalize">{format(day, 'EEE', { locale: es })}</p>
                                                <p className="text-lg font-bold">{format(day, 'd')}</p>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                                <MobileDayView
                                    day={currentDate}
                                    appointments={appointments}
                                    onAppointmentAction={handleAppointmentAction}
                                    onNewAppointment={handleOpenModal}
                                    isSlotAvailable={isSlotAvailable}
                                />
                            </div>
                        ) : view === 'week' ? (
                            <div className="premium-card p-0 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <div className="grid grid-cols-[60px_repeat(7,1fr)] min-w-[800px]">
                                        <div className="p-2 border-b border-r"></div>
                                        {weekDays.map(day => (
                                            <div key={day.toISOString()} className={cn("p-2 text-center border-b border-r", { 'bg-primary/10': isToday(day) })}>
                                                <p className="text-sm text-muted-foreground">{format(day, 'EEE', { locale: es })}</p>
                                                <p className={cn("text-xl font-bold text-foreground", { "text-primary": isToday(day) })}>{format(day, 'd')}</p>
                                            </div>
                                        ))}
                                        {hours.map((hour, hourIndex) => (
                                            <React.Fragment key={hour}>
                                                <div className="p-2 border-b border-r text-sm text-center text-muted-foreground flex items-center justify-center">{hour}</div>
                                                {weekDays.map(day => {
                                                    const appointment = appointments.find(a => isSameDay(parseISO(a.date), day) && a.hourIndex === hourIndex);
                                                    const available = isSlotAvailable(day, hourIndex);
                                                    return (
                                                        <div key={day.toISOString() + hour} className={cn("p-1 border-b border-r min-h-[60px] flex items-center justify-center", { 'bg-primary/5': isToday(day), 'bg-muted/30': !available })}>
                                                            {appointment ? (
                                                                <div className="bg-primary/20 text-primary-foreground p-2 rounded-md text-xs w-full h-full flex flex-col justify-center">
                                                                    <p className="font-bold text-primary">{appointment.clientName}</p>
                                                                    <p className="text-primary/80">{appointment.serviceName}</p>
                                                                </div>
                                                            ) : (
                                                                available ? (
                                                                    <Button variant="ghost" size="icon" className="w-full h-full text-muted-foreground hover:bg-primary/10 hover:text-primary" onClick={() => handleOpenModal({ date: day, hourIndex })} aria-label="Añadir cita">
                                                                        <Plus className="h-5 w-5" />
                                                                    </Button>
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <Tooltip>
                                                                            <TooltipTrigger>
                                                                                <Coffee className="w-5 h-5 text-muted-foreground/50" />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>Descanso</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="premium-card p-0 overflow-hidden">
                               <MonthView monthDays={monthDays} onDayClick={(day) => { setView('week'); setCurrentDate(day); }} appointments={appointments} currentDate={currentDate} availability={availability} />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
            {isModalOpen && (
                <AppointmentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveAppointment}
                    modalData={modalData}
                    clients={clients}
                    services={mockServices}
                    appointments={appointments}
                />
            )}
            <AvailabilityModal
                isOpen={isAvailabilityModalOpen}
                onClose={() => setIsAvailabilityModalOpen(false)}
                availability={availability}
                onSave={setAvailability}
                appointments={appointments}
            />
        </>
    );
};

export default Calendario;