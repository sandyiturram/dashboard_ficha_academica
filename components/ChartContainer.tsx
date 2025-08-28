import React, { useRef } from 'react';
import CopyImageButton from './CopyImageButton.tsx';

interface ChartContainerProps {
    title: string;
    children: React.ReactNode;
    dataAvailable: boolean;
    controls?: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children, dataAvailable, controls }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={chartRef} className="relative bg-white p-6 rounded-lg shadow-md h-full flex flex-col group">
            <CopyImageButton targetRef={chartRef} />
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary-800">{title}</h3>
                {controls && <div>{controls}</div>}
            </div>
            {dataAvailable ? (
                 <div className="flex-grow w-full h-80">
                    {children}
                 </div>
            ) : (
                <div className="flex-grow flex items-center justify-center text-gray-500">
                    <p>No hay datos disponibles para este gráfico.</p>
                </div>
            )}
        </div>
    );
};

export default ChartContainer;