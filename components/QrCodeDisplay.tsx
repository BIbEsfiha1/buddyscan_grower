
import React, { useState } from 'react';
import { Plant } from '../types';
import ClipboardIcon from './icons/ClipboardIcon';
import DownloadIcon from './icons/DownloadIcon';
import { QRCodeSVG } from 'qrcode.react'; // For on-screen display
import QRCode from 'qrcode'; // For generating SVG string for download

interface QrCodeDisplayProps {
  plant: Plant;
}

const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({ plant }) => {
  const [copied, setCopied] = useState(false);
  const qrSize = 128; // Size for on-screen display

  const handleCopy = () => {
    navigator.clipboard.writeText(plant.qrCodeValue).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadSVG = async () => {
    const svgWidth = 220; 
    const svgHeight = 280; 
    const qrDisplaySize = 140; 
    const textFont = "Inter, sans-serif";

    const birthDateFormatted = new Date(plant.birthDate).toLocaleDateString('pt-BR');

    const truncateText = (text: string, maxLength: number) => {
        return text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
    }
    
    const plantNameSVG = truncateText(plant.name, 22); // Adjusted max length
    const strainSVG = truncateText(plant.strain, 28); // Adjusted max length

    try {
      const qrSvgStringGenerated = await QRCode.toString(plant.qrCodeValue, {
        type: 'svg',
        errorCorrectionLevel: 'Q', // Good error correction
        margin: 1, // Minimal margin for the QR code itself
        width: qrDisplaySize,
        color: {
          dark: "#000000FF", // Black dots
          light: "#FFFFFFFF"  // Transparent background for the QR code module, main SVG rect handles white
        }
      });

      // Clean the generated SVG string: remove XML declaration and DOCTYPE if present
      // and ensure it's just the core SVG content for embedding.
      const cleanQrSvgString = qrSvgStringGenerated
        .replace(/<\?xml.*?\?>\s*/, '')
        .replace(/<!DOCTYPE.*?>\s*/, '');
        // The qrcode library's toString typically returns a full <svg> element.

      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
          <rect width="100%" height="100%" fill="white"/>
          <style>
            .label-text { font-family: ${textFont}; fill: black; }
            .name { font-size: 18px; font-weight: bold; }
            .detail { font-size: 12px; }
            .qr-value { font-size: 9px; font-family: monospace; }
          </style>
          <text x="${svgWidth / 2}" y="30" text-anchor="middle" class="label-text name">${plantNameSVG}</text>
          <text x="${svgWidth / 2}" y="50" text-anchor="middle" class="label-text detail">Strain: ${strainSVG}</text>
          <text x="${svgWidth / 2}" y="70" text-anchor="middle" class="label-text detail">Plantio: ${birthDateFormatted}</text>
          
          <!-- Embed the QR Code SVG -->
          <g transform="translate(${(svgWidth - qrDisplaySize) / 2}, 85)">
            ${cleanQrSvgString} 
          </g>
          
          <text x="${svgWidth / 2}" y="${85 + qrDisplaySize + 20}" text-anchor="middle" class="label-text qr-value">${plant.qrCodeValue}</text>
          <text x="${svgWidth / 2}" y="${85 + qrDisplaySize + 35}" text-anchor="middle" class="label-text qr-value" style="font-size:8px;">BuddyScan</text>
        </svg>
      `;

      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `buddyscan_label_${plant.name.replace(/\s+/g, '_')}_${plant.strain.replace(/\s+/g, '_')}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Falha ao gerar QR code SVG para download:", err);
      alert("Erro ao gerar QR code para download. Verifique o console.");
    }
  };

  return (
    <div className="flex flex-col items-center p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-md w-full max-w-[220px] mx-auto text-center transition-colors duration-300 space-y-3">
      <div className="font-bold text-lg text-[#7AC943] break-words w-full leading-tight">{plant.name}</div>
      <div className="text-sm text-gray-600 dark:text-slate-300 w-full truncate">Strain: {plant.strain}</div>
      <div className="text-xs text-gray-500 dark:text-slate-400">
        Plantio: {new Date(plant.birthDate).toLocaleDateString('pt-BR')}
      </div>
      
      <div className="w-full flex items-center justify-center p-1 bg-white rounded-sm" style={{ maxWidth: qrSize + 8, maxHeight: qrSize + 8 }}> {/* Ensure white background for QR code */}
        <QRCodeSVG
          value={plant.qrCodeValue}
          size={qrSize}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"Q"} // Error correction level: L, M, Q, H
          includeMargin={false} // Margin is handled by padding on parent div
        />
      </div>
      
      <button 
        onClick={handleCopy} 
        className="text-xs text-[#7AC943] hover:text-green-500 flex items-center justify-center gap-1.5 transition-colors duration-150 font-medium py-1 px-2 rounded-md hover:bg-green-50 dark:hover:bg-slate-700 w-full max-w-[150px]"
      >
        <ClipboardIcon className="w-3.5 h-3.5" />
        {copied ? 'ID Copiado!' : 'Copiar ID'}
      </button>
      <p className="text-[10px] text-gray-400 dark:text-slate-500 break-all leading-tight w-full px-1">{plant.qrCodeValue}</p>

      <button
        onClick={handleDownloadSVG}
        className="w-full max-w-[180px] mt-2 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow hover:shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75"
      >
        <DownloadIcon className="w-4 h-4" />
        Baixar Etiqueta (SVG)
      </button>
    </div>
  );
};

export default QrCodeDisplay;