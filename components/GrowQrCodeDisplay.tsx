import React, { useState } from 'react';
import { Grow } from '../types';
import ClipboardIcon from './icons/ClipboardIcon';
import DownloadIcon from './icons/DownloadIcon';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';

interface GrowQrCodeDisplayProps {
  grow: Grow;
}

const GrowQrCodeDisplay: React.FC<GrowQrCodeDisplayProps> = ({ grow }) => {
  const [copied, setCopied] = useState(false);
  const qrSize = 128;
  const qrValue = grow.qrCodeValue || grow.id;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrValue).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadSVG = async () => {
    const svgWidth = 220;
    const svgHeight = 220;
    const qrDisplaySize = 140;
    const textFont = 'Inter, sans-serif';
    const nameSVG = grow.name.length > 25 ? grow.name.substring(0,22) + '...' : grow.name;

    try {
      const qrSvgStringGenerated = await QRCode.toString(qrValue, {
        type: 'svg',
        errorCorrectionLevel: 'Q',
        margin: 1,
        width: qrDisplaySize,
        color: { dark: '#000000FF', light: '#FFFFFFFF' },
      });
      const cleanQrSvgString = qrSvgStringGenerated
        .replace(/<\?xml.*?\?>\s*/, '')
        .replace(/<!DOCTYPE.*?>\s*/, '');

      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
          <rect width="100%" height="100%" fill="white"/>
          <style>
            .label-text { font-family: ${textFont}; fill: black; }
            .name { font-size: 18px; font-weight: bold; }
            .qr-value { font-size: 9px; font-family: monospace; }
          </style>
          <text x="${svgWidth / 2}" y="30" text-anchor="middle" class="label-text name">${nameSVG}</text>
          <g transform="translate(${(svgWidth - qrDisplaySize) / 2}, 40)">
            ${cleanQrSvgString}
          </g>
          <text x="${svgWidth / 2}" y="${40 + qrDisplaySize + 20}" text-anchor="middle" class="label-text qr-value">${qrValue}</text>
          <text x="${svgWidth / 2}" y="${40 + qrDisplaySize + 35}" text-anchor="middle" class="label-text qr-value" style="font-size:8px;">BuddyScan</text>
        </svg>
      `;

      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `buddyscan_grow_${grow.name.replace(/\s+/g, '_')}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Falha ao gerar QR code SVG para download:', err);
      alert('Erro ao gerar QR code para download. Verifique o console.');
    }
  };

  return (
    <div className="flex flex-col items-center p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-md w-full max-w-[220px] mx-auto text-center transition-colors duration-300 space-y-3">
      <div className="font-bold text-lg text-[#7AC943] break-words w-full leading-tight">{grow.name}</div>
      {grow.location && (
        <div className="text-sm text-gray-600 dark:text-slate-300 w-full truncate">{grow.location}</div>
      )}
      <div className="w-full flex items-center justify-center p-1 bg-white rounded-sm" style={{ maxWidth: qrSize + 8, maxHeight: qrSize + 8 }}>
        <QRCodeSVG value={qrValue} size={qrSize} bgColor="#ffffff" fgColor="#000000" level="Q" includeMargin={false} />
      </div>
      <button
        onClick={handleCopy}
        className="text-xs text-[#7AC943] hover:text-green-500 flex items-center justify-center gap-1.5 transition-colors duration-150 font-medium py-1 px-2 rounded-md hover:bg-green-50 dark:hover:bg-slate-700 w-full max-w-[150px]"
      >
        <ClipboardIcon className="w-3.5 h-3.5" />
        {copied ? 'ID Copiado!' : 'Copiar ID'}
      </button>
      <p className="text-[10px] text-gray-400 dark:text-slate-500 break-all leading-tight w-full px-1">{qrValue}</p>
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

export default GrowQrCodeDisplay;
