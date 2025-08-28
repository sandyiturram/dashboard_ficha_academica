
import React from 'react';

const Instructions: React.FC = () => {
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto border-t-4 border-primary-400 mb-8">
            <div className="flex items-start space-x-4">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-primary mb-3">Instrucciones de Uso</h2>
                    <div className="space-y-4 text-gray-700">
                        <div>
                            <h3 className="font-semibold text-primary-800">1. Preparación del Archivo Excel</h3>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>Asegúrese de que su archivo esté en formato <strong>.xlsx</strong> o <strong>.xls</strong>.</li>
                                <li>El archivo debe contener una columna con el encabezado exacto: <code className="bg-primary-50 text-primary-800 font-mono p-1 rounded">DatosCompletos_JSON</code>.</li>
                                <li>Cada celda en esta columna debe contener la información académica completa en un formato JSON válido.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-primary-800">2. Carga y Visualización</h3>
                             <p className="mt-1">
                                Una vez que cargue el archivo, la aplicación procesará los datos y generará automáticamente un panel con gráficos y estadísticas clave sobre la información académica.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-primary-800">3. Exportar Reporte Completo</h3>
                            <p className="mt-1">
                                El botón <strong>"Exportar a Excel"</strong> le permite descargar un reporte detallado. Este archivo contendrá todos los datos procesados, organizados en hojas de cálculo separadas para cada categoría (Publicaciones, Tesis, Patentes, etc.).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Instructions;
