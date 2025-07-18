import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const MonthNavigation = ({ currentDate, onPreviousMonth, onNextMonth }) => {
  return (
    <div className="flex items-center justify-center space-x-4 mb-6">
      <Button
        variant="outline"
        size="sm"
        onClick={onPreviousMonth}
        className="px-4 py-2 rounded-full"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Mes anterior
      </Button>
      
      <div className="text-center">
        <h2 className="text-2xl font-bold text-card-foreground">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onNextMonth}
        className="px-4 py-2 rounded-full"
      >
        Próximo mes
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

export default MonthNavigation;