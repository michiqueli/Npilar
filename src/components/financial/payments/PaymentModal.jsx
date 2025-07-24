import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, DollarSign, CreditCard, Send, HelpCircle, User, Scissors, Search, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const paymentMethods = [
  { value: 'Efectivo', label: 'Efectivo', icon: DollarSign },
  { value: 'Tarjeta', label: 'Tarjeta', icon: CreditCard },
  { value: 'Transferencia', label: 'Transferencia', icon: Send },
  { value: 'Otro', label: 'Otro', icon: HelpCircle },
];

const PaymentModal = ({ isOpen, onClose, onSave, isManual = false, prefillData = {}, clients = [] }) => {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date(),
    clientId: '',
    clientName: '',
    serviceName: '',
    amount: '',
    paymentMethod: 'Efectivo',
    comment: '',
  });
  const [clientSearch, setClientSearch] = useState('');

  useEffect(() => {
    try {
      const storedServices = localStorage.getItem('nehue-services');
      if (storedServices) {
        setServices(JSON.parse(storedServices));
      } else {
        setServices([
            { id: 1, name: 'Corte', price: 20 },
            { id: 2, name: 'Corte + Barba', price: 35 },
            { id: 3, name: 'Barba', price: 15 },
        ]);
      }
    } catch (error) {
      console.error("Failed to parse services from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const initialDate = prefillData.date ? new Date(prefillData.date) : new Date();
      const clientService = services.find(s => s.name === prefillData.service);
      
      setFormData({
        date: initialDate,
        clientId: prefillData.client?.id || '',
        clientName: prefillData.client?.name || '',
        serviceName: prefillData.service || '',
        amount: clientService ? clientService.price.toString() : '',
        paymentMethod: 'Efectivo',
        comment: '',
      });
      setClientSearch(prefillData.client?.name || '');
    }
  }, [isOpen, prefillData, services]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceChange = (serviceName) => {
    const selectedService = services.find(s => s.name === serviceName);
    if (selectedService) {
      setFormData(prev => ({
        ...prev,
        serviceName: selectedService.name,
        amount: selectedService.price.toString()
      }));
    }
  };

  const handleClientSelect = (client) => {
    setFormData(prev => ({ ...prev, clientId: client.id, clientName: client.name }));
    setClientSearch(client.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('El monto debe ser un número positivo.');
      return;
    }
    
    onSave({
      ...formData,
      amount: parseFloat(formData.amount),
      client: { id: formData.clientId, name: formData.clientName },
      timestamp: new Date().toISOString(),
      type: 'income',
      origin: isManual ? 'Manual' : 'Cita',
      confirmed: true,
    });
  };

  const filteredClients = Array.isArray(clients) ? clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  ) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-background top-12 sm:left-[20%] left-[5%] xl:top-12 xl:left-[35%]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-text-dark-gray">
            <DollarSign className="w-6 h-6 text-active-dark-gray"/>
            {isManual ? 'Ingresar Cobro Manual' : 'Registrar Pago'}
          </DialogTitle>
          <DialogDescription>
            {isManual ? 'Añade un ingreso que no provenga de una cita.' : 'Confirma los detalles del pago para el servicio.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1 bg-white",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => handleChange('date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="service">Servicio</Label>
              <Select onValueChange={handleServiceChange} value={formData.serviceName}>
                <SelectTrigger id="service" className="mt-1 bg-white">
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.name}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Cliente</Label>
            {isManual ? (
              <div className="space-y-2 mt-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar cliente..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>
                {clientSearch && filteredClients.length > 0 && (
                  <div className="max-h-32 overflow-y-auto space-y-1 border border-border-gray rounded-lg p-2 bg-white">
                    {filteredClients.map(client => (
                      <button
                        key={client.id} type="button"
                        onClick={() => handleClientSelect(client)}
                        className="w-full text-left p-2 rounded hover:bg-hover-gray"
                      >
                        <div className="flex items-center space-x-2"><User className="w-4 h-4" /><span>{client.name}</span></div>
                      </button>
                    ))}
                  </div>
                )}
                <Input
                  placeholder="O escribir nombre manualmente..."
                  value={formData.clientName}
                  onChange={(e) => handleChange('clientName', e.target.value)}
                  className="bg-white"
                  disabled={!!formData.clientId && clientSearch === formData.clientName}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1 rounded-lg border bg-white p-3 text-foreground">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">{formData.clientName}</span>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Monto (€)</Label>
            <div className="relative mt-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="amount" type="number" step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  className="pl-10 font-bold bg-white"
                  placeholder="0.00" required
                />
            </div>
          </div>

          <div>
            <Label>Método de pago</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = formData.paymentMethod === method.value;
                return (
                  <button
                    key={method.value} type="button"
                    onClick={() => handleChange('paymentMethod', method.value)}
                    className={cn(
                      'flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200',
                      isSelected 
                        ? 'border-active-dark-gray bg-active-dark-gray/10 text-active-dark-gray font-bold' 
                        : 'border-border-gray bg-white text-muted-foreground hover:border-active-dark-gray/50 hover:text-text-dark-gray'
                    )}
                  >
                    <Icon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="comment">Comentario (opcional)</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => handleChange('comment', e.target.value)}
              placeholder="Añadir una nota sobre el pago..."
              className="mt-1 bg-white"
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary" className="w-full sm:w-auto">
                  Cancelar
                </Button>
            </DialogClose>
            <Button type="submit" className="w-full sm:w-auto bg-active-dark-gray hover:bg-active-dark-gray/90">
              <DollarSign className="w-4 h-4 mr-2" />
              Confirmar Pago
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;