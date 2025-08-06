import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Clock, Edit, Star, MoreVertical, Trash2, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const ServiceListRow = ({ service, onEdit, onTogglePopular, onDeactivate, onReactivate, onDelete }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center p-4 bg-card rounded-lg border hover:bg-accent"
        >
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                <div className="sm:col-span-2">
                    <p className="font-bold text-foreground">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.category}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span>${service.sale_price}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration_min} min</span>
                </div>
            </div>
            <div className="ml-4 flex items-center gap-2">
                {service.popular && (
                    <Tooltip>
                        <TooltipTrigger>
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Servicio Popular</p>
                        </TooltipContent>
                    </Tooltip>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {service.active ? (
                            <>
                                <DropdownMenuItem onClick={() => onEdit(service)}>
                                    <Edit className="w-4 h-4 mr-2" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onTogglePopular(service.id)}>
                                    <Star className={cn("w-4 h-4 mr-2", service.popular && 'fill-yellow-400 text-yellow-500')} />
                                    {service.popular ? 'Quitar de populares' : 'Marcar como popular'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onDeactivate(service.id)} className="text-destructive focus:text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" /> Desactivar
                                </DropdownMenuItem>
                            </>
                        ) : (
                            <>
                                <DropdownMenuItem onClick={() => onReactivate(service.id)}>
                                    <RotateCw className="w-4 h-4 mr-2" /> Reactivar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onDelete(service)} className="text-destructive focus:text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar Permanentemente
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.div>
    );
};

export default ServiceListRow;