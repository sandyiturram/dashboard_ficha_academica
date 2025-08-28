// Fix: Declare global libraries to resolve 'Cannot find name' errors.
declare var ExcelJS: any;
declare var Chart: any;
declare var ChartDataLabels: any;
declare var html2canvas: any;

/**
 * @author Sandy Iturra - Universidad de Valparaíso
 * @copyright Copyright (c) 2025 Sandy Iturra - Universidad de Valparaíso. Todos los derechos reservados.
 *
 * Este software fue desarrollado por Sandy Iturra - Universidad de Valparaíso y está protegido por
 * las leyes de derechos de autor. La reproducción o distribución no autorizada de este
 * programa, o cualquier parte de él, puede resultar en severas sanciones civiles y penales,
 * y será perseguida con el máximo rigor posible bajo la ley.
 */

// --- Global State ---
let state: {
    data: any | null,
    error: string | null,
    isLoading: boolean,
} = {
    data: null,
    error: null,
    isLoading: false,
};

// --- DOM References ---
const mainContent = document.getElementById('main-content')!;
const headerActions = document.getElementById('header-actions')!;

// --- Chart Color Palettes ---
const CHART_COLORS = {
    blue: ['#003C58', '#3387A7', '#66A5BD', '#99C3D3', '#CCE1E9'],
    teal: ['#005474', '#66A5BD', '#99C3D3', '#E6F0F4'],
};

// --- HTML Templates ---
const getLoadingHTML = () => `
    <div class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        <p class="ml-4 text-lg text-primary-800">Procesando datos...</p>
    </div>
`;

const getInstructionsHTML = () => `
    <div class="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto border-t-4 border-primary-400 mb-8">
        <div class="flex items-start space-x-4">
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div>
                <h2 class="text-2xl font-bold text-primary mb-3">Dashboard de Datos Académicos</h2>
                <p class="text-gray-700 mb-6">Una aplicación web para cargar y visualizar datos académicos desde un archivo Excel. Genera automáticamente gráficos e indicadores clave de rendimiento relacionados con publicaciones, tesis y perfiles académicos.</p>

                <h3 class="text-xl font-semibold text-primary-800 mb-4">✨ Características</h3>
                <ul class="list-disc list-inside space-y-2 text-gray-700 mb-8">
                    <li><strong>Carga Fácil de Archivos:</strong> Arrastra y suelta o selecciona un archivo Excel (.xlsx, .xls) para procesar los datos.</li>
                    <li><strong>Validación Automática:</strong> La aplicación verifica que el archivo contenga la columna <code class="bg-primary-50 text-primary-800 font-mono p-1 rounded">DatosCompletos_JSON</code> y maneja errores de formato.</li>
                    <li><strong>Visualización de Datos:</strong> Genera automáticamente un dashboard con indicadores clave y gráficos interactivos sobre distribución de género, grados académicos, publicaciones por año, y más.</li>
                    <li><strong>Exportación a Excel:</strong> Descarga un reporte completo con todos los datos procesados, organizados en hojas de cálculo separadas por categoría.</li>
                    <li><strong>Copia de Gráficos:</strong> Copia cualquier gráfico o el resumen de indicadores como una imagen directamente a tu portapapeles.</li>
                </ul>

                <h3 class="text-xl font-semibold text-primary-800 mb-4">Instrucciones de Uso</h3>
                <div class="space-y-4 text-gray-700">
                    <div>
                        <h4 class="font-semibold text-primary-800">1. Preparación del Archivo Excel</h4>
                        <ul class="list-disc list-inside mt-1 space-y-1">
                            <li>Asegúrese de que su archivo esté en formato <strong>.xlsx</strong> o <strong>.xls</strong>.</li>
                            <li>El archivo debe contener una columna con el encabezado exacto: <code class="bg-primary-50 text-primary-800 font-mono p-1 rounded">DatosCompletos_JSON</code>.</li>
                            <li>Cada celda en esta columna debe contener la información académica completa en un formato JSON válido.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold text-primary-800">2. Carga y Visualización</h4>
                        <p class="mt-1">
                            Una vez que cargue el archivo, la aplicación generará automáticamente un panel con gráficos y estadísticas.
                        </p>
                    </div>
                    <div>
                        <h4 class="font-semibold text-primary-800">3. Exportar y Copiar</h4>
                        <p class="mt-1">
                            Use el botón <strong>"Exportar a Excel"</strong> para descargar un reporte completo. Puede copiar cualquier gráfico como imagen usando el botón de recorte que aparece al pasar el cursor sobre él.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

const getFileUploadHTML = () => `
    <div class="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto text-center border-t-4 border-primary">
        <h2 class="text-2xl font-bold text-primary mb-2">Cargar archivo de datos</h2>
        <p class="text-gray-600 mb-6">Arrastre y suelte su archivo Excel (.xlsx) o haga clic para seleccionarlo.</p>
        ${state.error ? `
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded text-left" role="alert">
                <p class="font-bold">Error</p>
                <p>${state.error}</p>
            </div>` : ''
        }
        <div id="drop-zone" class="relative border-2 border-dashed rounded-lg p-12 transition-all duration-300 border-gray-300">
            <input type="file" id="file-upload" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".xlsx, .xls" />
            <label for="file-upload" class="flex flex-col items-center justify-center space-y-4 cursor-pointer">
                <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <p class="text-lg font-semibold text-primary">Arrastre su archivo aquí</p>
                <p class="text-gray-500">o haga clic para buscar</p>
            </label>
        </div>
        <p class="text-xs text-gray-500 mt-4">Solo se aceptan archivos .xlsx y .xls.</p>
    </div>
`;

const getStatCardHTML = (title: string, value: number | string) => `
    <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-400">
        <h3 class="text-sm font-medium text-gray-500 truncate">${title}</h3>
        <p class="mt-1 text-4xl font-semibold text-primary">${value}</p>
    </div>
`;

const getCopyButtonHTML = (isCopied = false) => {
    const iconClass = "w-5 h-5";
    const title = isCopied ? "¡Copiado!" : "Recortar y copiar imagen";
    const ariaLabel = isCopied ? "Imagen copiada al portapapeles" : "Recortar y copiar imagen del gráfico al portapapeles";
    const icon = isCopied
        ? `<svg xmlns="http://www.w3.org/2000/svg" class="${iconClass}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" class="${iconClass}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>`;

    return `<button class="copy-image-btn absolute top-3 right-3 z-10 p-2 bg-primary-50 rounded-full text-primary-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-300 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500" title="${title}" aria-label="${ariaLabel}">${icon}</button>`;
};


const getChartContainerHTML = (id: string, title: string, controls = '', dataAvailable = true) => `
    <div id="${id}-container" class="chart-container relative bg-white p-6 rounded-lg shadow-md h-full flex flex-col group">
        ${getCopyButtonHTML()}
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-primary-800">${title}</h3>
            ${controls ? `<div>${controls}</div>` : ''}
        </div>
        <div class="flex-grow w-full h-80">
            ${dataAvailable ? `<canvas id="${id}"></canvas>` : `<div class="flex items-center justify-center h-full text-gray-500"><p>No hay datos disponibles para este gráfico.</p></div>`}
        </div>
    </div>
`;


// --- State Management ---
const setState = (newState: Partial<typeof state>) => {
    state = { ...state, ...newState };
    render();
};

const resetState = () => {
    setState({ data: null, error: null, isLoading: false });
};


// --- File Processing ---
const processFile = (file: File) => {
    setState({ isLoading: true, error: null });

    if (!file) {
        return setState({ isLoading: false, error: 'No se seleccionó ningún archivo.' });
    }
    if (!file.name.match(/\.(xlsx|xls)$/)) {
        return setState({ isLoading: false, error: 'Formato de archivo no válido. Por favor, suba un archivo .xlsx o .xls.' });
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = e.target?.result;
            if (!data) throw new Error("No se pudo leer el contenido del archivo.");

            // Fix: Cannot find name 'ExcelJS'.
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(data);
            
            const worksheet = workbook.worksheets[0];
            if (!worksheet) throw new Error("El archivo Excel no contiene ninguna hoja de cálculo.");

            let jsonColIndex = -1;
            worksheet.getRow(1).eachCell((cell: any, colNumber: number) => {
                if (cell.value === 'DatosCompletos_JSON') {
                    jsonColIndex = colNumber;
                }
            });

            if (jsonColIndex === -1) throw new Error('No se encontró la columna "DatosCompletos_JSON".');

            const aggregatedData: { [key: string]: any[] } = {
                academicMembers: [], supervisedTheses: [], publications: [], patents: [],
                researchProjects: [], educationalMaterials: [], academicWorks: [],
                consultancies: [], centersGroupsNetworks: [],
            };

            let processedRows = 0;
            worksheet.eachRow((row: any, rowNumber: number) => {
                if (rowNumber > 1) {
                    const jsonDataString = row.getCell(jsonColIndex).value;
                    if (jsonDataString && typeof jsonDataString === 'string') {
                        try {
                            const parsed = JSON.parse(jsonDataString);
                            for (const key of Object.keys(aggregatedData)) {
                                if (parsed[key] && Array.isArray(parsed[key])) {
                                    aggregatedData[key].push(...parsed[key]);
                                }
                            }
                            processedRows++;
                        } catch (parseError) {
                            console.warn(`Error al parsear JSON en la fila ${rowNumber}:`, parseError);
                        }
                    }
                }
            });

            if (processedRows === 0) throw new Error('No se encontraron datos JSON válidos en la columna "DatosCompletos_JSON".');
            
            setState({ data: aggregatedData, isLoading: false });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Un error desconocido ocurrió.';
            setState({ error: `Error al procesar el archivo: ${errorMessage}`, isLoading: false });
        }
    };
    reader.onerror = () => setState({ error: 'Error al leer el archivo.', isLoading: false });
    reader.readAsArrayBuffer(file);
};

// --- Data Analysis Utilities ---
const countBy = (arr: any[], key: string) => {
    const counts = arr.reduce((acc: Record<string, number>, item) => {
        const value = String(item[key] || 'N/A');
        acc[value] = (acc[value] || 0) + 1;
        return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};


// --- Chart Rendering ---
// Fix: Property 'destroy' does not exist on type 'unknown'.
let chartInstances: { [key: string]: any } = {};
const destroyCharts = () => {
    // Fix: Property 'destroy' does not exist on type 'unknown'.
    Object.values(chartInstances).forEach(chart => chart.destroy());
    chartInstances = {};
};

const renderGenderDistributionChart = (data: any) => {
    const chartData = countBy(data.academicMembers, 'sex');
    // Fix: Property 'getContext' does not exist on type 'HTMLElement'.
    const ctx = (document.getElementById('gender-chart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;
    
    // Fix: Cannot find name 'Chart'.
    chartInstances['gender-chart'] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: chartData.map(d => d.name),
            datasets: [{
                data: chartData.map(d => d.value),
                backgroundColor: CHART_COLORS.blue,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                datalabels: {
                    formatter: (value: number, ctx: any) => {
                        const dataArr = ctx.chart.data.datasets[0].data;
                        // Fix: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
                        const sum = (dataArr as number[]).reduce((a, b) => a + b, 0);
                        // Fix: Explicitly cast value to Number to prevent TypeScript type error.
                        const percentage = (Number(value) * 100 / sum).toFixed(0) + '%';
                        return percentage;
                    },
                    color: '#fff',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        },
    });
};

const renderDegreeDistributionChart = (data: any) => {
    const chartData = countBy(data.academicMembers, 'degree');
    // Fix: Property 'getContext' does not exist on type 'HTMLElement'.
    const ctx = (document.getElementById('degree-chart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    // Fix: Cannot find name 'Chart'.
    chartInstances['degree-chart'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.map(d => d.name),
            datasets: [{
                label: 'Nº de Académicos',
                data: chartData.map(d => d.value),
                backgroundColor: CHART_COLORS.blue[0],
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: {
                    anchor: 'center',
                    align: 'center',
                    color: 'white',
                    font: { weight: 'bold' },
                    formatter: (value: number) => value > 0 ? value : null,
                }
            },
            scales: { x: { ticks: { precision: 0 } } }
        },
    });
};

const renderThesesByYearChart = (data: any) => {
    const chartData = countBy(data.supervisedTheses, 'year')
        .filter(d => d.name !== 'N/A')
        .sort((a, b) => a.name.localeCompare(b.name));
    // Fix: Property 'getContext' does not exist on type 'HTMLElement'.
    const ctx = (document.getElementById('theses-chart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    // Fix: Cannot find name 'Chart'.
    chartInstances['theses-chart'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.map(d => d.name),
            datasets: [{
                label: 'Nº de Tesis',
                data: chartData.map(d => d.value),
                backgroundColor: CHART_COLORS.blue[1],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true },
                datalabels: {
                    anchor: 'center',
                    align: 'center',
                    color: 'white',
                    font: { weight: 'bold' },
                    formatter: (value: number) => value > 0 ? value : null,
                }
            },
            scales: { y: { ticks: { precision: 0 } } }
        },
    });
};

const renderPublicationTypeChart = (data: any) => {
    const chartData = countBy(data.publications, 'type');
    // Fix: Property 'getContext' does not exist on type 'HTMLElement'.
    const ctx = (document.getElementById('pub-type-chart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    // Fix: Cannot find name 'Chart'.
    chartInstances['pub-type-chart'] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartData.map(d => d.name),
            datasets: [{
                data: chartData.map(d => d.value),
                backgroundColor: CHART_COLORS.teal,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' },
                datalabels: {
                    formatter: (value: number, ctx: any) => {
                        const dataArr = ctx.chart.data.datasets[0].data;
                        // Fix: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
                        const sum = (dataArr as number[]).reduce((a, b) => a + b, 0);
                        // Fix: Explicitly cast value to Number to prevent TypeScript type error.
                        const percentage = (Number(value) * 100 / sum).toFixed(0) + '%';
                        return percentage;
                    },
                    color: '#fff',
                    font: { weight: 'bold' }
                }
            }
        },
    });
};

const renderPublicationsByYearChart = (publications: any[], selectedIndexation = 'Todos') => {
    const filteredPublications = selectedIndexation === 'Todos'
        ? publications
        : publications.filter(pub => (pub.indexation || 'Otro') === selectedIndexation);

    // Fix: Type 'unknown' cannot be used as an index type.
    const yearlyData = filteredPublications.reduce((acc: any, pub: any) => {
        const year = pub.year || 'N/A';
        if (year === 'N/A') return acc;
        const type = pub.indexation || 'Otro';
        acc[year] = acc[year] || {};
        acc[year][type] = (acc[year][type] || 0) + 1;
        return acc;
    }, {});

    const years = Object.keys(yearlyData).sort();
    const types = Array.from(new Set(filteredPublications.map(p => p.indexation || 'Otro')));
    
    const datasets = types.map((type: string, i: number) => ({
        label: type,
        data: years.map(year => yearlyData[year][type] || 0),
        backgroundColor: CHART_COLORS.blue[i % CHART_COLORS.blue.length],
    }));

    // Fix: Property 'getContext' does not exist on type 'HTMLElement'.
    const ctx = (document.getElementById('pubs-by-year-chart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    if (chartInstances['pubs-by-year-chart']) {
        chartInstances['pubs-by-year-chart'].destroy();
    }

    // Fix: Cannot find name 'Chart'.
    chartInstances['pubs-by-year-chart'] = new Chart(ctx, {
        type: 'bar',
        data: { labels: years, datasets: datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                datalabels: {
                    color: 'white',
                    font: { weight: 'bold' },
                    formatter: (value: number) => value > 0 ? value : null,
                }
            },
            scales: {
                x: { stacked: true },
                y: { stacked: true, ticks: { precision: 0 } },
            },
        },
    });
};

// --- Main Render Functions ---
const renderDashboard = (data: any) => {
    destroyCharts();
    const { publications } = data;
    const allIndexationTypes = ['Todos', ...Array.from(new Set(publications.map((p: any) => p.indexation || 'Otro'))).sort()];
    const publicationFilterControl = `
        <div class="flex items-center space-x-2">
            <label for="indexation-filter" class="text-sm font-medium text-gray-700">Filtrar por:</label>
            <select id="indexation-filter" class="block w-full pl-3 pr-10 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md" aria-label="Filtrar publicaciones por tipo de indexación">
                ${allIndexationTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
            </select>
        </div>`;

    const dashboardHTML = `
        <div class="flex justify-end mb-6">
            <button id="export-excel-btn" class="bg-primary text-white hover:bg-primary-600 font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-300 flex items-center space-x-2" aria-label="Exportar datos a Excel">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>Exportar a Excel</span>
            </button>
        </div>
        <div class="space-y-6">
            <div id="summary-container" class="chart-container relative group bg-white p-6 rounded-lg shadow-md">
                ${getCopyButtonHTML()}
                <h3 class="text-lg font-semibold text-primary-800 mb-4">Resumen de Indicadores Clave</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    ${getStatCardHTML("Académicos", data.academicMembers.length)}
                    ${getStatCardHTML("Publicaciones", data.publications.length)}
                    ${getStatCardHTML("Tesis Supervisadas", data.supervisedTheses.length)}
                    ${getStatCardHTML("Proyectos de Inv.", data.researchProjects.length)}
                    ${getStatCardHTML("Patentes", data.patents.length)}
                    ${getStatCardHTML("Material Educacional", data.educationalMaterials.length)}
                    ${getStatCardHTML("Consultorías", data.consultancies.length)}
                    ${getStatCardHTML("Redes y Centros", data.centersGroupsNetworks.length)}
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-3">${getChartContainerHTML('pubs-by-year-chart', 'Publicaciones por Año e Indexación', publicationFilterControl, data.publications.length > 0)}</div>
                <div class="lg:col-span-2">${getChartContainerHTML('theses-chart', 'Tesis Supervisadas por Año', '', data.supervisedTheses.length > 0)}</div>
                <div>${getChartContainerHTML('gender-chart', 'Distribución por Género', '', data.academicMembers.length > 0)}</div>
                <div class="lg:col-span-2">${getChartContainerHTML('degree-chart', 'Distribución por Grado Académico', '', data.academicMembers.length > 0)}</div>
                <div>${getChartContainerHTML('pub-type-chart', 'Distribución por Tipo de Publicación', '', data.publications.length > 0)}</div>
            </div>
        </div>
    `;
    mainContent.innerHTML = dashboardHTML;

    // Render charts
    if (data.publications.length > 0) renderPublicationsByYearChart(publications);
    if (data.supervisedTheses.length > 0) renderThesesByYearChart(data);
    if (data.academicMembers.length > 0) {
        renderGenderDistributionChart(data);
        renderDegreeDistributionChart(data);
    }
    if (data.publications.length > 0) renderPublicationTypeChart(data);

    // Attach dashboard-specific event listeners
    attachDashboardListeners(data);
};

const renderFileUpload = () => {
    destroyCharts();
    mainContent.innerHTML = getInstructionsHTML() + getFileUploadHTML();
    attachFileUploadListeners();
};

const render = () => {
    headerActions.innerHTML = state.data 
        ? `<button id="reset-btn" class="bg-white text-primary hover:bg-primary-100 font-semibold py-2 px-4 border border-primary-200 rounded-lg shadow-sm transition duration-300">Cargar otro archivo</button>`
        : '';
    
    if (state.data) {
        document.getElementById('reset-btn')?.addEventListener('click', resetState);
    }

    if (state.isLoading) {
        mainContent.innerHTML = getLoadingHTML();
    } else if (state.data) {
        renderDashboard(state.data);
    } else {
        renderFileUpload();
    }
};

// --- Event Handlers ---
const handleDragEnter = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); (e.currentTarget as HTMLElement).classList.add('border-primary', 'bg-primary-50'); };
const handleDragLeave = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); (e.currentTarget as HTMLElement).classList.remove('border-primary', 'bg-primary-50'); };
const handleDragOver = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).classList.remove('border-primary', 'bg-primary-50');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFile(e.dataTransfer.files[0]);
    }
};

const handleCopyImage = async (event: MouseEvent) => {
    const button = event.currentTarget as HTMLButtonElement;
    const container = button.closest('.chart-container');
    if (!container) return;

    try {
        // Fix: Cannot find name 'html2canvas'.
        const canvas = await html2canvas(container, {
            useCORS: true, backgroundColor: '#ffffff', scale: 2, logging: false,
            width: container.scrollWidth, height: container.scrollHeight,
        });
        canvas.toBlob(async (blob: Blob | null) => {
            if (blob) {
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                const match = getCopyButtonHTML(true).match(/<svg.*<\/svg>/);
                if (match) button.innerHTML = match[0]; // Just update the icon
                setTimeout(() => {
                    const match = getCopyButtonHTML(false).match(/<svg.*<\/svg>/);
                    if (match) button.innerHTML = match[0];
                }, 2000);
            }
        }, 'image/png');
    } catch (error) {
        console.error("Error al generar la imagen:", error);
        alert("Ocurrió un error al generar la imagen.");
    }
};

const handleDownloadExcel = async (data: any) => {
    try {
        // Fix: Cannot find name 'ExcelJS'.
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'DashboardApp';
        workbook.created = new Date();
        const sheetNameMapping: { [key: string]: string } = {
            academicMembers: 'Miembros Académicos', publications: 'Publicaciones',
            supervisedTheses: 'Tesis Supervisadas', researchProjects: 'Proyectos de Inv.',
            patents: 'Patentes', educationalMaterials: 'Material Educacional',
            academicWorks: 'Trabajos Académicos', consultancies: 'Consultorías',
            centersGroupsNetworks: 'Redes y Centros',
        };

        for (const key in sheetNameMapping) {
            if (Object.prototype.hasOwnProperty.call(sheetNameMapping, key)) {
                const sheetData = data[key];
                if (sheetData?.length > 0) {
                    const sheet = workbook.addWorksheet(sheetNameMapping[key]);
                    const headers = Object.keys(sheetData[0]);
                    sheet.columns = headers.map(h => ({ header: h, key: h, width: 25 }));
                    const headerRow = sheet.getRow(1);
                    headerRow.font = { bold: true, color: { argb: 'FF003C58' } };
                    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F0F4' } };
                    sheet.addRows(sheetData);
                }
            }
        }
        
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte_academico_datos.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error al generar el archivo Excel:", error);
    }
};

function attachFileUploadListeners() {
    const dropZone = document.getElementById('drop-zone');
    const fileUpload = document.getElementById('file-upload');
    if (!dropZone || !fileUpload) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => dropZone.addEventListener(eventName, e => e.preventDefault()));
    dropZone.addEventListener('dragenter', handleDragEnter as EventListener);
    dropZone.addEventListener('dragleave', handleDragLeave as EventListener);
    dropZone.addEventListener('dragover', handleDragOver as EventListener);
    dropZone.addEventListener('drop', handleDrop as EventListener);
    fileUpload.addEventListener('change', (e) => {
        // Fix: Property 'files' does not exist on type 'EventTarget'.
        const target = e.target as HTMLInputElement;
        if (target.files?.length) processFile(target.files[0]);
    });
}

function attachDashboardListeners(data: any) {
    document.getElementById('export-excel-btn')?.addEventListener('click', () => handleDownloadExcel(data));
    document.querySelectorAll('.copy-image-btn').forEach(btn => btn.addEventListener('click', handleCopyImage as EventListener));
    document.getElementById('indexation-filter')?.addEventListener('change', (e) => {
        // Fix: Property 'value' does not exist on type 'EventTarget'.
        const target = e.target as HTMLSelectElement;
        renderPublicationsByYearChart(data.publications, target.value);
    });
}

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Fix: Cannot find name 'ChartDataLabels'.
    if (typeof ChartDataLabels !== 'undefined') {
        // Fix: Cannot find name 'Chart'.
        Chart.register(ChartDataLabels);
    }
    render();
});
