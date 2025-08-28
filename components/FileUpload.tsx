
import React, { useState, useCallback } from 'react';
import { AcademicData } from '../types';

declare const ExcelJS: any;

interface FileUploadProps {
    onDataLoaded: (data: AcademicData) => void;
    onError: (message: string) => void;
    onLoading: (loading: boolean) => void;
    initialError: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, onError, onLoading, initialError }) => {
    const [isDragging, setIsDragging] = useState(false);

    const processFile = useCallback((file: File) => {
        onLoading(true);
        if (!file) {
            onError('No se seleccionó ningún archivo.');
            return;
        }

        if (!file.name.match(/\.(xlsx|xls)$/)) {
            onError('Formato de archivo no válido. Por favor, suba un archivo .xlsx o .xls.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                if (!data) {
                    throw new Error("No se pudo leer el contenido del archivo.");
                }

                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(data);
                
                const worksheet = workbook.worksheets[0];
                if (!worksheet) {
                     throw new Error("El archivo Excel no contiene ninguna hoja de cálculo.");
                }

                const headers: string[] = [];
                const headerRow = worksheet.getRow(1);
                // Asegurarse de que headerRow no sea nulo antes de iterar
                if (headerRow.values) {
                    headerRow.eachCell((cell) => {
                        headers.push(cell.value ? cell.value.toString() : '');
                    });
                }
                
                const json: any[] = [];
                worksheet.eachRow((row, rowNumber) => {
                    if (rowNumber > 1) { // Omitir la fila de encabezado
                        const rowData: any = {};
                        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                            const header = headers[colNumber - 1];
                            if (header) {
                                rowData[header] = cell.value;
                            }
                        });
                        json.push(rowData);
                    }
                });

                const aggregatedData: AcademicData = {
                    academicMembers: [],
                    supervisedTheses: [],
                    publications: [],
                    patents: [],
                    researchProjects: [],
                    educationalMaterials: [],
                    academicWorks: [],
                    consultancies: [],
                    centersGroupsNetworks: [],
                };

                let processedRows = 0;
                json.forEach((row, index) => {
                    const jsonDataString = row['DatosCompletos_JSON'];
                    if (jsonDataString && typeof jsonDataString === 'string') {
                        try {
                            const parsed = JSON.parse(jsonDataString);
                            for (const key in aggregatedData) {
                                if (parsed[key] && Array.isArray(parsed[key])) {
                                    (aggregatedData as any)[key].push(...parsed[key]);
                                }
                            }
                            processedRows++;
                        } catch (parseError) {
                            console.warn(`Error al parsear JSON en la fila ${index + 2}:`, parseError);
                        }
                    }
                });

                if (processedRows === 0) {
                    throw new Error('No se encontraron datos JSON válidos en la columna "DatosCompletos_JSON".');
                }

                onDataLoaded(aggregatedData);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Un error desconocido ocurrió al procesar el archivo.';
                onError(`Error al procesar el archivo: ${errorMessage}`);
            }
        };

        reader.onerror = () => {
             onError('Error al leer el archivo.');
        };

        reader.readAsArrayBuffer(file);
    }, [onDataLoaded, onError, onLoading]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            processFile(event.target.files[0]);
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto text-center border-t-4 border-primary">
            <h2 className="text-2xl font-bold text-primary mb-2">Cargar archivo de datos</h2>
            <p className="text-gray-600 mb-6">Arrastre y suelte su archivo Excel (.xlsx) o haga clic para seleccionarlo.</p>

            {initialError && (
                 <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{initialError}</p>
                </div>
            )}

            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-12 transition-all duration-300 ${isDragging ? 'border-primary bg-primary-50' : 'border-gray-300'}`}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept=".xlsx, .xls"
                />
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
                     <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                     <p className="text-lg font-semibold text-primary">Arrastre su archivo aquí</p>
                     <p className="text-gray-500">o haga clic para buscar</p>
                </label>
            </div>
            <p className="text-xs text-gray-500 mt-4">Solo se aceptan archivos .xlsx y .xls.</p>
        </div>
    );
};

export default FileUpload;