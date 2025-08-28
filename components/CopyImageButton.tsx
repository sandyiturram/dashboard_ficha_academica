import React, { useState, RefObject } from 'react';

declare const html2canvas: any;

interface CopyImageButtonProps {
    targetRef: RefObject<HTMLElement>;
}

const CopyImageButton: React.FC<CopyImageButtonProps> = ({ targetRef }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyClick = async () => {
        if (!targetRef.current) {
            console.error("El elemento de destino para la captura no existe.");
            return;
        }

        try {
            const element = targetRef.current;
            const canvas = await html2canvas(element, {
                useCORS: true,
                backgroundColor: '#ffffff', // Forza un fondo blanco, solucionando el problema del fondo gris.
                scale: 2, // Aumenta la resolución para una imagen más nítida.
                logging: false,
                // Utiliza scrollWidth/scrollHeight para asegurar que todo el contenido, incluido el padding, sea capturado.
                // Esto soluciona el problema de que el contenido se corte.
                width: element.scrollWidth,
                height: element.scrollHeight,
            });
            
            canvas.toBlob(async (blob) => {
                if (blob) {
                    try {
                        await navigator.clipboard.write([
                            new ClipboardItem({ 'image/png': blob })
                        ]);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
                    } catch (err) {
                        console.error('Error al copiar la imagen al portapapeles:', err);
                        alert('Error al copiar la imagen. Es posible que su navegador no admita esta función o que se hayan denegado los permisos.');
                    }
                }
            }, 'image/png');

        } catch (error) {
            console.error("Error al usar html2canvas:", error);
            alert("Ocurrió un error al generar la imagen del gráfico.");
        }
    };

    const iconClass = "w-5 h-5";

    return (
        <button
            onClick={handleCopyClick}
            className="absolute top-3 right-3 z-10 p-2 bg-primary-50 rounded-full text-primary-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-300 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            title={isCopied ? "¡Copiado!" : "Recortar y copiar imagen"}
            aria-label={isCopied ? "Imagen copiada al portapapeles" : "Recortar y copiar imagen del gráfico al portapapeles"}
        >
            {isCopied ? (
                <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
            )}
        </button>
    );
};

export default CopyImageButton;