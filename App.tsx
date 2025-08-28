/**
 * @author Sandy Iturra - Universidad de Valparaíso
 * @copyright Copyright (c) 2024 Sandy Iturra - Universidad de Valparaíso. Todos los derechos reservados.
 *
 * Este software fue desarrollado por Sandy Iturra - Universidad de Valparaíso y está protegido por
 * las leyes de derechos de autor. La reproducción o distribución no autorizada de este
 * programa, o cualquier parte de él, puede resultar en severas sanciones civiles y penales,
 * y será perseguida con el máximo rigor posible bajo la ley.
 */

import React, { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload.tsx';
import Dashboard from './components/Dashboard.tsx';
import Instructions from './components/Instructions.tsx';
import { AcademicData } from './types';

const App: React.FC = () => {
    const [data, setData] = useState<AcademicData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleDataLoaded = useCallback((loadedData: AcademicData) => {
        setData(loadedData);
        setError(null);
        setIsLoading(false);
    }, []);

    const handleLoading = useCallback((loading: boolean) => {
        setIsLoading(loading);
    }, []);

    const handleError = useCallback((errorMessage: string) => {
        setError(errorMessage);
        setData(null);
        setIsLoading(false);
    }, []);
    
    const handleReset = useCallback(() => {
        setData(null);
        setError(null);
        setIsLoading(false);
    }, []);

    return (
        <div className="min-h-screen bg-primary-50 text-gray-800 font-sans">
            <header className="bg-primary shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        {/* Logo de la institución */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-label="Logo de la aplicación">
                          <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 .5.707A9.735 9.735 0 0 0 6 21a9.707 9.707 0 0 0 5.25-1.533.75.75 0 0 0 0-1.321v-13.5a.75.75 0 0 0 0-1.321Z" />
                          <path d="M12.75 4.533A9.707 9.707 0 0 1 18 3a9.735 9.735 0 0 1 3.25.555.75.75 0 0 1 .5.707v14.25a.75.75 0 0 1-.5.707A9.735 9.735 0 0 1 18 21a9.707 9.707 0 0 1-5.25-1.533.75.75 0 0 1 0-1.321v-13.5a.75.75 0 0 1 0-1.321Z" />
                        </svg>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard de Datos Académicos</h1>
                    </div>
                    {data && (
                         <button
                            onClick={handleReset}
                            className="bg-white text-primary hover:bg-primary-100 font-semibold py-2 px-4 border border-primary-200 rounded-lg shadow-sm transition duration-300"
                        >
                            Cargar otro archivo
                        </button>
                    )}
                </div>
            </header>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
                        <p className="ml-4 text-lg text-primary-800">Procesando datos...</p>
                    </div>
                ) : !data ? (
                    <div>
                        <Instructions />
                        <FileUpload 
                            onDataLoaded={handleDataLoaded} 
                            onError={handleError} 
                            onLoading={handleLoading}
                            initialError={error}
                        />
                    </div>
                ) : (
                    <Dashboard data={data} />
                )}
            </main>
            <footer className="text-center py-4 text-primary-600 text-sm">
                <p>Copyright &copy; {new Date().getFullYear()} <strong>Sandy Iturra - Universidad de Valparaíso</strong>. Todos los derechos reservados.</p>
                <p className="text-xs mt-1">Una aplicación para la visualización de datos académicos.</p>
            </footer>
        </div>
    );
};

export default App;