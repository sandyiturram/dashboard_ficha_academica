
import React from 'react';
import ChartContainer from '../ChartContainer.tsx';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from 'recharts';

interface ChartData {
    name: string;
    value: number;
}

interface ThesesByYearChartProps {
    data: ChartData[];
}

const ThesesByYearChart: React.FC<ThesesByYearChartProps> = ({ data }) => {
    const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
    const dataAvailable = data && data.length > 0;
    return (
        <ChartContainer title="Tesis Supervisadas por Año" dataAvailable={dataAvailable}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={sortedData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Nº de Tesis" fill="#3387A7">
                        <LabelList dataKey="value" position="top" style={{ fill: '#003C58', fontSize: 12 }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
};

export default ThesesByYearChart;