import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Clock, Edit, Star, MoreVertical, Trash2, Tag, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const ServiceCard = ({ service, index, onEdit, onTogglePopular, onDelete }) => {

  const getBadgeClass = (badge) => {
    switch (badge) {
      case 'NUEVO':
        return 'bg-success/20 text-success border-success/30';
      case 'MEJOR VALOR':
        return 'bg-info/20 text-info border-info/30';
      case 'OFERTA':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      transition={{ duration: 0.4, delay: index * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
      className="bg-card text-card-foreground rounded-2xl border shadow-sm transition-all duration-300 relative group flex flex-col overflow-hidden hover:shadow-primary/20 hover:border-primary/50"
    >
      <div className="relative">
        <div className="absolute top-3 right-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-card/50 backdrop-blur-sm text-muted-foreground hover:bg-card hover:text-primary opacity-80 group-hover:opacity-100 transition-all duration-200"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(service)} className="cursor-pointer">
                <Edit className="w-4 h-4 mr-2" />
                Editar servicio
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTogglePopular(service.id)} className="cursor-pointer">
                <Star className={cn("w-4 h-4 mr-2", service.popular && 'fill-yellow-400 text-yellow-500')} />
                {service.popular ? 'Quitar de populares' : 'Marcar como popular'}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Tag className="w-4 h-4 mr-2" />
                Aplicar descuento
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(service.id)} className="cursor-pointer text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar servicio
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {service.popular && (
            <div className="text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-card bg-primary text-primary-foreground">
              POPULAR
            </div>
          )}
          {service.badge && (
             <div className={cn("text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-card", getBadgeClass(service.badge))}>
              {service.badge}
            </div>
          )}
        </div>

        <div className="aspect-video bg-muted/50 flex items-center justify-center overflow-hidden">
          {service.imageUrl ? (
            <img  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={service.name} src="https://images.unsplash.com/photo-1690721606848-ac5bdcde45ea" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <ImageOff className="w-12 h-12 text-muted-foreground/50" />
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
          <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 font-semibold">
            {service.category}
          </span>
          <h3 className="font-bold text-foreground text-xl tracking-tight mt-3 mb-2">{service.name}</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed min-h-[40px]">{service.description}</p>
        </div>

        <div className="flex items-center justify-between mt-auto mb-5">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="text-3xl font-bold text-primary">${service.price}</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{service.duration} min</span>
          </div>
        </div>
        
        <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Veces reservado</span>
                <span className="font-bold text-foreground">{service.timesBooked || 0}</span>
            </div>
             <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Ingresos generados</span>
                <span className="font-bold text-success">${service.revenueGenerated || 0}</span>
            </div>
        </div>

      </div>
       <div className="p-5 pt-0">
         <Button
            onClick={() => onEdit(service)}
            variant="secondary"
            className="w-full"
          >
            <Edit className="w-4 h-4 mr-2" />
            Gestionar Servicio
          </Button>
       </div>
    </motion.div>
  );
};

export default ServiceCard;