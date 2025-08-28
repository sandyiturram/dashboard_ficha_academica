import React, { useMemo, useRef, useState } from 'react';
import { AcademicData } from '../types';
import StatCard from './StatCard.tsx';
import GenderDistributionChart from './charts/GenderDistributionChart.tsx';
import DegreeDistributionChart from './charts/DegreeDistributionChart.tsx';
import PublicationsByYearChart from './charts/PublicationsByYearChart.tsx';
import ThesesByYearChart from './charts/ThesesByYearChart.tsx';
import PublicationTypeChart from './charts/PublicationTypeChart.tsx';
import CopyImageButton from './CopyImageButton.tsx';

declare const ExcelJS: any;

interface DashboardProps {
    data: AcademicData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
    const summaryRef = useRef<HTMLDivElement>(null);
    const [selectedIndexation, setSelectedIndexation] = useState<string>('Todos');
    
    const countBy = <T,>(arr: T[], key: keyof T): { name: string; value: number }[] => {
        const counts = arr.reduce((acc, item) => {
            const value = String(item[key] || 'N/A');
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    };

    const genderData = useMemo(() => countBy(data.academicMembers, 'sex'), [data.academicMembers]);
    const degreeData = useMemo(() => countBy(data.academicMembers, 'degree'), [data.academicMembers]);
    
    const publicationsByYearAndType = useMemo(() => {
        const allIndexationTypes = Array.from(new Set(data.publications.map(p => p.indexation || 'Otro')));

        const filteredPublications = selectedIndexation === 'Todos'
            ? data.publications
            : data.publications.filter(pub => (pub.indexation || 'Otro') === selectedIndexation);

        const yearlyData: { [year: string]: { [type: string]: number } } = {};
        const indexationTypesInFilteredData = new Set<string>();

        filteredPublications.forEach(pub => {
            const year = pub.year || 'N/A';
            if (year === 'N/A') return;
            const type = pub.indexation || 'Otro';

            if (!yearlyData[year]) {
                yearlyData[year] = {};
            }
            
            yearlyData[year][type] = (yearlyData[year][type] || 0) + 1;
            indexationTypesInFilteredData.add(type);
        });
        
        const typesForChart = Array.from(indexationTypesInFilteredData);
        const chartData = Object.entries(yearlyData).map(([year, counts]) => ({
            name: year,
            ...counts,
        }));

        chartData.forEach(d => {
            typesForChart.forEach(type => {
                if (!d[type]) {
                    d[type] = 0;
                }
            });
        });
        
        return {
            data: chartData.sort((a, b) => a.name.localeCompare(b.name)),
            types: typesForChart,
            allTypes: ['Todos', ...allIndexationTypes.sort()],
        };
    }, [data.publications, selectedIndexation]);

    const thesesByYear = useMemo(() => countBy(data.supervisedTheses, 'year').filter(d => d.name !== 'N/A').sort((a, b) => a.name.localeCompare(b.name)), [data.supervisedTheses]);
    const publicationTypes = useMemo(() => countBy(data.publications, 'type'), [data.publications]);

    const handleDownloadExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'DashboardApp';
            workbook.created = new Date();

            const sheetNameMapping: Record<keyof AcademicData, string> = {
                academicMembers: 'Miembros Académicos',
                publications: 'Publicaciones',
                supervisedTheses: 'Tesis Supervisadas',
                researchProjects: 'Proyectos de Inv.',
                patents: 'Patentes',
                educationalMaterials: 'Material Educacional',
                academicWorks: 'Trabajos Académicos',
                consultancies: 'Consultorías',
                centersGroupsNetworks: 'Redes y Centros',
            };

            for (const key in sheetNameMapping) {
                const dataKey = key as keyof AcademicData;
                const sheetData = data[dataKey];
                
                if (sheetData && sheetData.length > 0) {
                    const sheet = workbook.addWorksheet(sheetNameMapping[dataKey]);
                    const headers = Object.keys(sheetData[0]);
                    
                    sheet.columns = headers.map(h => ({ header: h, key: h, width: 25 }));
                    
                    // Style header
                    const headerRow = sheet.getRow(1);
                    headerRow.font = { bold: true, color: { argb: 'FF003C58' } };
                    headerRow.fill = {
                        type: 'pattern',
                        pattern:'solid',
                        fgColor:{ argb:'FFE6F0F4' }
                    };

                    sheet.addRows(sheetData);
                }
            }
            
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'reporte_academico_datos.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error("Error al generar el archivo Excel:", error);
            alert("Hubo un error al generar el archivo Excel. Revise la consola para más detalles.");
        }
    };

    const publicationFilterControl = (
        <div className="flex items-center space-x-2">
            <label htmlFor="indexation-filter" className="text-sm font-medium text-gray-700">Filtrar por:</label>
            <select
                id="indexation-filter"
                value={selectedIndexation}
                onChange={(e) => setSelectedIndexation(e.target.value)}
                className="block w-full pl-3 pr-10 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                aria-label="Filtrar publicaciones por tipo de indexación"
            >
                {publicationsByYearAndType.allTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
        </div>
    );

    return (
        <div>
            <div className="flex justify-end mb-6">
                <button
                    onClick={handleDownloadExcel}
                    className="bg-primary text-white hover:bg-primary-600 font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-300 flex items-center space-x-2"
                    aria-label="Exportar datos a Excel"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Exportar a Excel</span>
                </button>
            </div>
            <div className="space-y-6">
                <div ref={summaryRef} id="summary-stats" className="relative group bg-white p-6 rounded-lg shadow-md">
                    <CopyImageButton targetRef={summaryRef} />
                    <h3 className="text-lg font-semibold text-primary-800 mb-4">Resumen de Indicadores Clave</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <StatCard title="Académicos" value={data.academicMembers.length} />
                        <StatCard title="Publicaciones" value={data.publications.length} />
                        <StatCard title="Tesis Supervisadas" value={data.supervisedTheses.length} />
                        <StatCard title="Proyectos de Inv." value={data.researchProjects.length} />
                        <StatCard title="Patentes" value={data.patents.length} />
                        <StatCard title="Material Educacional" value={data.educationalMaterials.length} />
                        <StatCard title="Consultorías" value={data.consultancies.length} />
                        <StatCard title="Redes y Centros" value={data.centersGroupsNetworks.length} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-3">
                        <PublicationsByYearChart 
                            data={publicationsByYearAndType.data} 
                            types={publicationsByYearAndType.types}
                            controls={publicationFilterControl}
                        />
                    </div>
                    
                    <div className="lg:col-span-2">
                         <ThesesByYearChart data={thesesByYear} />
                    </div>
                    <GenderDistributionChart data={genderData} />

                    <div className="lg:col-span-2">
                         <DegreeDistributionChart data={degreeData} />
                    </div>
                    <PublicationTypeChart data={publicationTypes} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;