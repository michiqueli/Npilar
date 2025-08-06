import React from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowDown, ArrowUp, MoreHorizontal, Edit, Copy, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const TransactionTable = ({ transactions, onEdit, onDuplicate, onDelete }) => {
    const getTransactionDetails = (t) => {
        if (t.type === 'income') {
            return {
                title: t.clientName,
                subtitle: t.service,
                icon: <ArrowUp className="w-4 h-4 text-success" />,
                amountClass: 'text-success',
            };
        }
        return {
            title: t.description,
            subtitle: t.category,
            icon: <ArrowDown className="w-4 h-4 text-destructive" />,
            amountClass: 'text-destructive',
        };
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-lg border"
        >
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="p-4 text-left font-semibold text-muted-foreground">Transacción</th>
                            <th className="p-4 text-left font-semibold text-muted-foreground hidden md:table-cell">Fecha</th>
                            <th className="p-4 text-left font-semibold text-muted-foreground hidden sm:table-cell">Método</th>
                            <th className="p-4 text-right font-semibold text-muted-foreground">Monto</th>
                            <th className="p-4 text-center font-semibold text-muted-foreground">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((t, index) => {
                            const details = getTransactionDetails(t);
                            return (
                                <motion.tr
                                    key={t.id || index}
                                    className="border-b last:border-b-0"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                                {details.icon}
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">{details.title}</p>
                                                <p className="text-muted-foreground text-xs">{details.subtitle}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-muted-foreground hidden md:table-cell">
                                        {format(parseISO(t.date), 'dd MMM, yyyy', { locale: es })}
                                    </td>
                                    <td className="p-4 hidden sm:table-cell">
                                        <Badge variant="secondary">{t.paymentMethod}</Badge>
                                    </td>
                                    <td className={`p-4 text-right font-bold ${details.amountClass}`}>
                                        {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                                    </td>
                                    <td className="p-4 text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(t)}>
                                                    <Edit className="w-4 h-4 mr-2" /> Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onDuplicate(t)}>
                                                    <Copy className="w-4 h-4 mr-2" /> Duplicar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onDelete(t)} className="text-destructive focus:text-destructive">
                                                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default TransactionTable;