import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const expenseCategories = ['Productos', 'Alquiler', 'Suministros', 'Marketing', 'Salarios', 'Mantenimiento', 'Otros'];
const paymentMethods = ['Todos', 'Efectivo', 'Tarjeta', 'Transferencia', 'Otro'];

const FilterBar = ({ onApplyFilters, onClearFilters }) => {
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [type, setType] = useState('Todos');
  const [category, setCategory] = useState('Todos');
  const [paymentMethod, setPaymentMethod] = useState('Todos');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [incomeServices, setIncomeServices] = useState([]);

  useEffect(() => {
    try {
      const storedServices = localStorage.getItem('nehue-services');
      if (storedServices) {
        const services = JSON.parse(storedServices);
        const serviceNames = services.map(s => s.name);
        setIncomeServices(serviceNames);
      }
    } catch (error) {
      console.error("Failed to load services from localStorage", error);
    }
  }, []);
  
  const categories = useMemo(() => {
    if (type === 'income') return ['Todos', ...incomeServices];
    if (type === 'expense') return ['Todos', ...expenseCategories];
    return ['Todos', ...new Set([...incomeServices, ...expenseCategories])];
  }, [type, incomeServices]);

  useEffect(() => {
    setCategory('Todos');
  }, [type]);

  const handleApply = () => {
    onApplyFilters({
      dateRange,
      type: type === 'Todos' ? null : type,
      category: category === 'Todos' ? null : category,
      paymentMethod: paymentMethod === 'Todos' ? null : paymentMethod,
      minAmount: minAmount ? parseFloat(minAmount) : null,
      maxAmount: maxAmount ? parseFloat(maxAmount) : null,
    });
  };

  const handleClear = () => {
    setDateRange({ from: subMonths(new Date(), 1), to: new Date() });
    setType('Todos');
    setCategory('Todos');
    setPaymentMethod('Todos');
    setMinAmount('');
    setMaxAmount('');
    onClearFilters();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 rounded-lg bg-card border mb-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
        <div className="sm:col-span-2 lg:col-span-1">
          <Label>Rango de Fechas</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal mt-1 bg-white",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                      {format(dateRange.to, "LLL dd, y", { locale: es })}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y", { locale: es })
                  )
                ) : (
                  <span>Elige un rango</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Tipo</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="mt-1 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="income">Ingresos</SelectItem>
              <SelectItem value="expense">Gastos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Categoría</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="mt-1 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Método de Pago</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger className="mt-1 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {paymentMethods.map(method => <SelectItem key={method} value={method}>{method}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Monto Mín.</Label>
            <Input type="number" placeholder="€" value={minAmount} onChange={e => setMinAmount(e.target.value)} className="mt-1 bg-white" />
          </div>
          <div>
            <Label>Monto Máx.</Label>
            <Input type="number" placeholder="€" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} className="mt-1 bg-white" />
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 pt-4 border-t">
        <Button variant="ghost" onClick={handleClear} className="w-full sm:w-auto">
          <X className="w-4 h-4 mr-2" />
          Limpiar
        </Button>
        <Button onClick={handleApply} className="w-full sm:w-auto bg-active-dark-gray hover:bg-active-dark-gray/90">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Aplicar Filtros
        </Button>
      </div>
    </motion.div>
  );
};

export default FilterBar;