import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter } from 'lucide-react';

const dayOptions = [
  { id: 1, label: 'Lunes' },
  { id: 2, label: 'Martes' },
  { id: 3, label: 'Miércoles' },
  { id: 4, label: 'Jueves' },
  { id: 5, label: 'Viernes' },
  { id: 6, label: 'Sábado' },
  { id: 0, label: 'Domingo' },
];

const DayFilterDropdown = ({ selectedDays, setSelectedDays }) => {
  const handleDayToggle = (dayId) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((id) => id !== dayId) : [...prev, dayId]
    );
  };

  const handleSelectAll = () => {
    setSelectedDays(dayOptions.map(d => d.id));
  };

  const handleClearAll = () => {
    setSelectedDays([]);
  };

  const selectedCount = selectedDays.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">
          <Filter className="w-4 h-4 mr-2" />
          Filtrar Días {selectedCount > 0 && `(${selectedCount})`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {dayOptions.map((day) => (
          <DropdownMenuItem
            key={day.id}
            onSelect={(e) => e.preventDefault()}
            onClick={() => handleDayToggle(day.id)}
            className="flex items-center justify-between"
          >
            <span>{day.label}</span>
            <Checkbox checked={selectedDays.includes(day.id)} />
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSelectAll}>
          Seleccionar Todos
        </DropdownMenuItem>
        {/*
        <DropdownMenuItem onSelect={handleClearAll}>
          Limpiar Selección
        </DropdownMenuItem>
        */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DayFilterDropdown;