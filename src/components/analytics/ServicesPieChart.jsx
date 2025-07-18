import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--info))', 'hsl(var(--success))', 'hsl(var(--warning))'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-2 border rounded-lg shadow-lg">
        <p className="font-bold">{`${payload[0].name}`}</p>
        <p className="text-sm text-muted-foreground">{`Ingresos: $${payload[0].value.toLocaleString()}`}</p>
        <p className="text-sm text-muted-foreground">{`Porcentaje: ${payload[0].payload.percentage}%`}</p>
      </div>
    );
  }
  return null;
};

const ServicesPieChart = ({ data }) => {
  const totalRevenue = data.reduce((sum, service) => sum + service.revenue, 0);
  const chartData = data.map(service => ({
    name: service.name,
    value: service.revenue,
    percentage: totalRevenue > 0 ? ((service.revenue / totalRevenue) * 100).toFixed(1) : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Tooltip content={<CustomTooltip />} />
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={110}
          innerRadius={60}
          fill="#8884d8"
          dataKey="value"
          paddingAngle={5}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ServicesPieChart;