import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const ProfitMarginTable = ({ data }) => {
  const getMarginColor = (margin) => {
    if (margin < 40) return 'bg-destructive';
    if (margin > 60) return 'bg-success';
    return 'bg-primary';
  };

  return (
    <div className="premium-card p-6">
      <h3 className="text-xl font-bold mb-4">Margen de Ganancia por Servicio</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Servicio</TableHead>
            <TableHead>Ingresos</TableHead>
            <TableHead>Costos</TableHead>
            <TableHead className="text-right">Margen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((service) => (
            <TableRow key={service.name}>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell>${service.revenue.toLocaleString()}</TableCell>
              <TableCell>${service.costs.toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="font-bold w-12">{service.margin.toFixed(1)}%</span>
                  <Progress value={service.margin} className="w-24 h-2 [&>*]:bg-primary" indicatorClassName={getMarginColor(service.margin)} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProfitMarginTable;