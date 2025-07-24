import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, UserPlus, Calendar as CalendarIcon, AlertTriangle, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, addMinutes, parse, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import TimePicker from '@/components/calendar/TimePicker'; // Usaremos el nuevo TimePicker

const AppointmentModal = ({ isOpen, onClose, modalData, onSave, clients, services, appointments }) => {
    const { toast } = useToast();
    const [tab, setTab] = useState('existing');
    const [clientSearch, setClientSearch] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');
    const [newClientName, setNewClientName] = useState('');
    const [newClientPhone, setNewClientPhone] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState('09:00');
    const [endTime, setEndTime] = useState('');
    const [overlapWarning, setOverlapWarning] = useState(false);
    const [notes, setNotes] = useState('');
    
    const [filteredClients, setFilteredClients] = useState([]);
    const [isClientListVisible, setIsClientListVisible] = useState(false);
    
    const resetForm = () => {
        setTab('existing');
        setClientSearch('');
        setSelectedClientId('');
        setNewClientName('');
        setNewClientPhone('');
        setSelectedServiceId('');
        setEndTime('');
        setOverlapWarning(false);
        setIsClientListVisible(false);
        setNotes('');
    };

    useEffect(() => {
        if (isOpen) {
            const preselectedClient = modalData?.preselectedClient;
            
            if (preselectedClient) {
                setTab('existing');
                setSelectedClientId(preselectedClient.id);
                setClientSearch(preselectedClient.name);
                setIsClientListVisible(false);
            }

            if (modalData && modalData.date && modalData.hourIndex !== undefined) {
                setSelectedDate(modalData.date);
                // MODIFICADO: Cálculo de tiempo para intervalos de 15
                const initialTime = addMinutes(new Date(modalData.date).setHours(8, 0, 0, 0), modalData.hourIndex * 15);
                setSelectedTime(format(initialTime, 'HH:mm'));
            } else {
                setSelectedDate(new Date());
                setSelectedTime('09:00');
            }
        } else {
            resetForm();
        }
    }, [modalData, isOpen]);
    
    useEffect(() => {
        if (clientSearch && !selectedClientId) {
            const results = clients.filter(c => 
                c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                (c.phone && c.phone.includes(clientSearch))
            );
            setFilteredClients(results);
            setIsClientListVisible(true);
        } else {
            setIsClientListVisible(false);
        }
    }, [clientSearch, clients, selectedClientId]);
    
    useEffect(() => {
        if (selectedServiceId && selectedTime && selectedDate && services.length > 0) {
            const service = services.find(s => s.id.toString() === selectedServiceId);
            if (service) {
                try {
                    const startTime = parse(selectedTime, 'HH:mm', selectedDate);
                    const newEndTime = addMinutes(startTime, service.duration_min);
                    setEndTime(format(newEndTime, 'HH:mm'));
                    
                    const appointmentStart = startTime.getTime();
                    const appointmentEnd = newEndTime.getTime();
                    
                    const isOverlap = appointments.some(appt => {
                        const existingStart = parseISO(appt.appointment_at).getTime();
                        const existingEnd = addMinutes(existingStart, appt.duration_at_time_minutes).getTime();
                        return (appointmentStart < existingEnd && appointmentEnd > existingStart);
                    });

                    setOverlapWarning(isOverlap);
                    if(isOverlap) {
                        toast({
                            variant: "destructive",
                            title: "Cuidado: Superposición de Cita",
                            description: "El horario seleccionado se superpone con otra cita.",
                        })
                    }
                } catch (error) {
                    setEndTime('');
                }
            }
        } else {
            setEndTime('');
        }
    }, [selectedServiceId, selectedTime, selectedDate, services, appointments, toast]);

    const handleSave = () => {
        let clientDetails;

        if (tab === 'new') {
            if (!newClientName.trim()) {
                toast({ variant: 'destructive', title: 'Datos incompletos', description: 'Por favor, completa el nombre del nuevo cliente.' });
                return;
            }
            clientDetails = { isNew: true, name: newClientName, phone: newClientPhone };
        } else {
            if (!selectedClientId) {
                toast({ variant: 'destructive', title: 'Datos incompletos', description: 'Por favor, selecciona un cliente existente.' });
                return;
            }
            const client = clients.find(c => c.id === selectedClientId);
            
            if (!client) {
                toast({ variant: 'destructive', title: 'Error', description: 'El cliente seleccionado no es válido.' });
                return;
            }
            clientDetails = { isNew: false, clientId: client.id, clientName: client.name };
        }

        if (!selectedServiceId) {
            toast({ variant: 'destructive', title: 'Datos incompletos', description: 'Por favor, selecciona un servicio.'});
            return;
        }
        
        const service = services.find(s => s.id.toString() === selectedServiceId);
        if (!service) {
            toast({ variant: 'destructive', title: 'Error', description: 'El servicio seleccionado no es válido.' });
            return;
        }

        // MODIFICADO: Cálculo de hourIndex para intervalos de 15 minutos
        const [hour, minute] = selectedTime.split(':');
        const hourIndex = (parseInt(hour) - 8) * 4 + Math.floor(parseInt(minute) / 15);

        onSave({
            date: selectedDate,
            hourIndex: hourIndex,
            details: {
                ...clientDetails,
                serviceId: service.id,
                notes: notes,
            }
        });
        handleClose();
    };
    
    const handleClose = () => {
        onClose();
    };

    const isPrefilled = !!modalData?.date && modalData?.hourIndex !== undefined && !modalData?.preselectedClient;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-w-[90vw] rounded-xl top-12 sm:left-[20%] left-[5%] fixed xl:top-12 xl:left-[35%]">
                <DialogHeader>
                    <DialogTitle>Nueva Cita</DialogTitle>
                    <DialogDescription>
                        Completa los datos para agendar una nueva cita.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 overflow-y-auto max-h-[70vh] pr-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label htmlFor="date">Fecha</Label>
                           {isPrefilled ? (
                                <div className="premium-input flex items-center bg-secondary cursor-not-allowed">
                                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{format(selectedDate, 'PPP', { locale: es })}</span>
                                </div>
                           ) : (
                               <Popover>
                                   <PopoverTrigger asChild>
                                       <Button variant="secondary" className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                                           <CalendarIcon className="mr-2 h-4 w-4" />
                                           {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : <span>Elige una fecha</span>}
                                       </Button>
                                   </PopoverTrigger>
                                   <PopoverContent className="w-auto p-0" align="start">
                                       <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus aria-label="Calendario" />
                                   </PopoverContent>
                               </Popover>
                           )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">Hora</Label>
                             {isPrefilled ? (
                                <div className="premium-input flex items-center bg-secondary cursor-not-allowed">
                                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{selectedTime}</span>
                                </div>
                            ) : (
                                <TimePicker value={selectedTime} onChange={setSelectedTime} />
                            )}
                        </div>
                    </div>
                    {overlapWarning && (
                         <div role="alert" className="flex items-center p-2 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300">
                             <AlertTriangle className="flex-shrink-0 inline w-4 h-4 mr-3" />
                             <span className="sr-only">Warning</span>
                             <div>
                                 <span className="font-medium">Alerta:</span> La cita se superpone con otra.
                             </div>
                         </div>
                    )}

                    <Tabs value={tab} onValueChange={setTab} className="pt-2">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="existing" aria-label="Seleccionar cliente existente"><User className="w-4 h-4 mr-2" />Existente</TabsTrigger>
                            <TabsTrigger value="new" aria-label="Crear cliente nuevo"><UserPlus className="w-4 h-4 mr-2" />Nuevo</TabsTrigger>
                        </TabsList>
                        <TabsContent value="existing" className="space-y-4 pt-4">
                            <div className="relative">
                                <Label htmlFor="client-search">Buscar cliente</Label>
                                <Input id="client-search" placeholder="Escribe para buscar..." value={clientSearch} onChange={e => { setClientSearch(e.target.value); setSelectedClientId(''); }} onFocus={() => setIsClientListVisible(true)} onBlur={() => setTimeout(() => setIsClientListVisible(false), 150)} autoComplete="off" />
                                {isClientListVisible && (
                                    <div aria-live="polite" className="absolute z-20 w-full mt-1 bg-card border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                        {filteredClients.length > 0 ? filteredClients.map(client => (
                                            <div key={client.id} onMouseDown={() => { setSelectedClientId(client.id); setClientSearch(client.name); setIsClientListVisible(false); }}
                                                 className={cn("p-3 cursor-pointer hover:bg-accent flex justify-between items-center", selectedClientId === client.id ? "bg-primary/10" : "")}>
                                                <div>
                                                    <p className="font-semibold">{client.name}</p>
                                                    <p className="text-xs text-muted-foreground">{client.phone}</p>
                                                </div>
                                                {client.last_visit_at && <p className="text-xs text-muted-foreground">Última visita: {format(new Date(client.last_visit_at), 'dd/MM/yy')}</p>}
                                            </div>
                                        )) : (
                                            <p className="text-sm text-muted-foreground text-center p-4">No se encontraron clientes.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="new" className="space-y-4 pt-4">
                            <div>
                                <Label htmlFor="new-name">Nombre (requerido)</Label>
                                <Input id="new-name" value={newClientName} onChange={e => setNewClientName(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="new-phone">Teléfono (opcional)</Label>
                                <Input id="new-phone" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="space-y-2 pt-2">
                        <Label htmlFor="service">Servicio (requerido)</Label>
                        <Select onValueChange={setSelectedServiceId} value={selectedServiceId}>
                            <SelectTrigger id="service" className="w-full">
                                <SelectValue placeholder="Selecciona un servicio" />
                            </SelectTrigger>
                            <SelectContent>
                                {services.map(service => (
                                    <SelectItem key={service.id} value={service.id.toString()}>
                                        {service.name} - ${service.sale_price} ({service.duration_min} min)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {endTime && <p className="text-xs text-right text-muted-foreground">Finaliza aprox. a las {endTime}</p>}
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notas (opcional)</Label>
                        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Alergias, preferencias, etc." />
                    </div>
                </div>
                <DialogFooter className="pt-4">
                    <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSave}>Guardar Cita</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AppointmentModal;