
import React from 'react';
import ChartContainer from '../ChartContainer.tsx';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface ChartData {
    name: string;
    value: number;
}

interface PublicationTypeChartProps {
    data: ChartData[];
}

const COLORS = ['#005474', '#66A5BD', '#99C3D3', '#E6F0F4'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent === 0) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
        <text x={x} y={y} fill="#002A3C" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};


const PublicationTypeChart: React.FC<PublicationTypeChartProps> = ({ data }) => {
    const dataAvailable = data && data.length > 0;
    return (
        <ChartContainer title="Distribución por Tipo de Publicación" dataAvailable={dataAvailable}>
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
                        label={renderCustomizedLabel}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [`${value} (${(value / data.reduce((s, p) => s + p.value, 0) * 100).toFixed(1)}%)`, name]} />
                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
};

export default PublicationTypeChart;