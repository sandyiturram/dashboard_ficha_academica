import React from 'react';
import ChartContainer from '../ChartContainer.tsx';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ChartData {
    name: string; // Year
    [type: string]: number | string;
}

interface PublicationsByYearChartProps {
    data: ChartData[];
    types: string[];
    controls?: React.ReactNode;
}

const COLORS = ['#003C58', '#3387A7', '#66A5BD', '#99C3D3', '#CCE1E9', '#002A3C'];

const renderCustomizedLabel = (props: any) => {
    const { x, y, width, height, value } = props;

    // Only render label if the value is not zero and the bar segment is tall enough
    if (value > 0 && height > 15) { 
        return (
            <text x={x + width / 2} y={y + height / 2} fill="#fff" textAnchor="middle" dominantBaseline="middle" fontSize={10}>
                {value}
            </text>
        );
    }
    return null;
};


const PublicationsByYearChart: React.FC<PublicationsByYearChartProps> = ({ data, types, controls }) => {
    const sortedData = [...data].sort((a, b) => String(a.name).localeCompare(String(b.name)));
    const dataAvailable = data && data.length > 0;

    return (
        <ChartContainer title="Publicaciones por Año e Indexación" dataAvailable={dataAvailable} controls={controls}>
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
                    {types.map((type, index) => (
                        <Bar 
                            key={type} 
                            dataKey={type} 
                            stackId="a" 
                            fill={COLORS[index % COLORS.length]} 
                            name={type}
                            label={renderCustomizedLabel}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
};

export default PublicationsByYearChart;