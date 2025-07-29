
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, DollarSign, CreditCard, Send, HelpCircle, Tag, MinusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/components/ui/use-toast';

const expenseCategories = [
  'Productos',
  'Alquiler',
  'Suministros',
  'Marketing',
  'Salarios',
  'Mantenimiento',
  'Otros',
];

const paymentMethods = [
  { value: 'Efectivo', label: 'Efectivo', icon: DollarSign },
  { value: 'Tarjeta', label: 'Tarjeta', icon: CreditCard },
  { value: 'Transferencia', label: 'Transferencia', icon: Send },
  { value: 'Otro', label: 'Otro', icon: HelpCircle },
];

const ExpenseForm = ({ onSave, onClose, transaction }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: new Date(),
    category: 'Productos',
    amount: '',
    paymentMethod: 'Efectivo',
    description: '',
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: new Date(transaction.date),
        category: transaction.category || 'Productos',
        amount: transaction.amount.toString() || '',
        paymentMethod: transaction.paymentMethod || 'Efectivo',
        description: transaction.description || '',
      });
    } else {
      setFormData({
        date: new Date(),
        category: 'Productos',
        amount: '',
        paymentMethod: 'Efectivo',
        description: '',
      });
    }
  }, [transaction]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Monto inválido',
        description: 'El monto del gasto debe ser un número positivo.',
      });
      return;
    }
    
    onSave({
      ...formData,
      id: transaction?.id || Date.now(),
      amount: parseFloat(formData.amount),
      type: 'expense',
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <DialogContent className="sm:max-w-lg top-12 sm:left-[20%] left-[5%] fixed xl:top-12 xl:left-[35%]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3 text-text-dark-gray">
          <MinusCircle className="w-6 h-6 text-destructive"/>
          {transaction ? 'Editar Gasto' : 'Registrar Gasto'}
        </DialogTitle>
        <DialogDescription>
          Añade un gasto para mantener tu contabilidad al día.
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
            <Label htmlFor="category">Categoría</Label>
            <Select onValueChange={(value) => handleChange('category', value)} value={formData.category}>
              <SelectTrigger id="category" className="mt-1 bg-white">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          <Label htmlFor="description">Descripción del gasto (opcional)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Ej: Compra de tijeras, pago de luz..."
            className="mt-1 bg-white"
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
                Cancelar
              </Button>
          </DialogClose>
          <Button type="submit" className="w-full sm:w-auto bg-active-dark-gray hover:bg-active-dark-gray/90">
            <MinusCircle className="w-4 h-4 mr-2" />
            Confirmar Gasto
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default ExpenseForm;
