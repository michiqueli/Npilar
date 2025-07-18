import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CalendarHeader = ({ 
  currentDate, 
  viewMode, 
  dateRangeTitle, 
  onDateChange, 
  onViewChange, 
  onPrev, 
  onNext, 
  onNewAppointment 
}) => {
  const today = new Date();
  const isToday = format(currentDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

  return (
    <>
      <motion.div
        className="flex flex-wrap items-center justify-between gap-4"
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-white capitalize">{dateRangeTitle}</h1>
          <p className="text-gray-400">Gestiona tu agenda de citas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onNewAppointment} className="premium-button">
            <Plus className="w-4 h-4 mr-2" /> Nueva Cita
          </Button>
        </div>
      </motion.div>

      {/* Rediseño completo de controles */}
      <div className="space-y-6">
        {/* Botón HOY prominente */}
        <div className="flex justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => onDateChange(new Date())} 
              className={`premium-gradient text-gray-900 font-bold text-lg px-8 py-4 rounded-2xl shadow-2xl hover:shadow-orange-400/25 transition-all duration-300 ${
                isToday ? 'ring-4 ring-orange-400/30' : ''
              }`}
            >
              <MapPin className="w-6 h-6 mr-3" />
              📍 HOY
            </Button>
          </motion.div>
        </div>

        {/* Navegación de semana mejorada */}
        <div className="flex items-center justify-center space-x-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={onPrev} 
              className="bg-gray-800/80 border-2 border-orange-400/50 text-orange-400 hover:bg-orange-400/10 hover:border-orange-400 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg"
            >
              <ChevronLeft className="w-6 h-6 mr-2" />
              ⏪ {viewMode === 'week' ? 'Semana anterior' : 'Mes anterior'}
            </Button>
          </motion.div>

          <div className="mx-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-2 border-gray-600 text-gray-300 hover:bg-white/5 hover:border-orange-400/50 px-6 py-3 rounded-xl font-medium transition-all duration-300"
                >
                  <CalendarIcon className="mr-3 h-5 w-5" />
                  {format(currentDate, 'PPP', { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar mode="single" selected={currentDate} onSelect={onDateChange} />
              </PopoverContent>
            </Popover>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={onNext} 
              className="bg-gray-800/80 border-2 border-orange-400/50 text-orange-400 hover:bg-orange-400/10 hover:border-orange-400 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg"
            >
              ⏩ {viewMode === 'week' ? 'Próxima semana' : 'Próximo mes'}
              <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          </motion.div>
        </div>

        {/* Botones de vista tipo pestaña mejorados */}
        <div className="flex items-center justify-center">
          <div className="bg-gray-800/50 p-2 rounded-2xl border border-gray-700/50 shadow-xl backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={() => onViewChange('week')} 
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                    viewMode === 'week' 
                      ? 'premium-gradient text-gray-900 shadow-2xl shadow-orange-400/25 ring-2 ring-orange-400/30' 
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white border border-gray-600/50'
                  }`}
                >
                  <CalendarIcon className="w-5 h-5 mr-3" />
                  📆 Semana
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={() => onViewChange('month')} 
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                    viewMode === 'month' 
                      ? 'premium-gradient text-gray-900 shadow-2xl shadow-orange-400/25 ring-2 ring-orange-400/30' 
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white border border-gray-600/50'
                  }`}
                >
                  <CalendarIcon className="w-5 h-5 mr-3" />
                  🗓️ Mes
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarHeader;