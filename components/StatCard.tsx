
import React from 'react';

interface StatCardProps {
    title: string;
    value: number | string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-400">
            <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
            <p className="mt-1 text-4xl font-semibold text-primary">{value}</p>
        </div>
    );
};

export default StatCard;
