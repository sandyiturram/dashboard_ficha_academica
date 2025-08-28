
import React from 'react';
import ChartContainer from '../ChartContainer.tsx';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList } from 'recharts';

interface ChartData {
    name: string;
    value: number;
}

interface DegreeDistributionChartProps {
    data: ChartData[];
}

const DegreeDistributionChart: React.FC<DegreeDistributionChartProps> = ({ data }) => {
    const dataAvailable = data && data.length > 0;
    return (
        <ChartContainer title="Distribución por Grado Académico" dataAvailable={dataAvailable}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 40, left: 30, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value: number) => [value, 'Total']} />
                    <Bar dataKey="value" fill="#003C58" name="Nº de Académicos">
                         <LabelList dataKey="value" position="right" style={{ fill: '#002A3C', fontSize: 12 }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
};

export default DegreeDistributionChart;