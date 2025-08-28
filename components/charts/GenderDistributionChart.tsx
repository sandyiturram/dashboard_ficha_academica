
import React from 'react';
import ChartContainer from '../ChartContainer.tsx';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface ChartData {
    name: string;
    value: number;
}

interface GenderDistributionChartProps {
    data: ChartData[];
}

const COLORS = ['#003C58', '#3387A7', '#99C3D3', '#CCE1E9'];

const GenderDistributionChart: React.FC<GenderDistributionChartProps> = ({ data }) => {
    const dataAvailable = data && data.length > 0;
    return (
        <ChartContainer title="Distribución por Género" dataAvailable={dataAvailable}>
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                            return (
                                <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                            );
                        }}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value, 'Total']} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
};

export default GenderDistributionChart;