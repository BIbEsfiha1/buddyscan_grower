import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { getPlants } from '../services/plantService';
import { Plant } from '../types';


interface QrCodeScannerProps {
  onScanSuccess: (plant: Plant) => void;
  onScanError: (error: string) => void;
}

const QrCodeScanner: React.FC<QrCodeScannerProps> = ({ onScanSuccess, onScanError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [qrValue, setQrValue] = useState('');

  // Handler para leitura real do QR code pela câmera
  const handleQrScan = async (codes: any) => {
    if (!codes || codes.length === 0) return;
    const result = codes[0].rawValue;
    setIsScanning(true);
    setScanError(null);
    try {
      // Busca todas as plantas e procura pelo qrCodeValue
      const plants = await getPlants();
      console.log('[QrCodeScanner] Plants received in handleQrScan:', JSON.stringify(plants, null, 2));
      console.log('[QrCodeScanner] QR code value read (result):', result);
      const plant = plants.find(p => p.qrCodeValue === result);
      console.log('[QrCodeScanner] Plant found in handleQrScan:', plant ? JSON.stringify(plant, null, 2) : 'Not found');
      if (plant) {
        onScanSuccess(plant);
      } else {
        setScanError('Nenhuma planta encontrada com este QR code.');
        onScanError('Nenhuma planta encontrada com este QR code.');
      }
    } catch (error) {
      setScanError('Erro ao processar o QR code.');
      onScanError('Erro ao processar o QR code.');
    } finally {
      setIsScanning(false);
    }
  };

  // Handler para erro do Scanner
  const handleQrError = (error: any) => {
    setScanError('Erro ao acessar a câmera ou ler o QR code.');
    onScanError('Erro ao acessar a câmera ou ler o QR code.');
    console.error("QR Scan Error:", error);
  };



  const handleManualScan = async () => {
    if (!qrValue.trim()) {
      onScanError('Por favor, insira um valor de QR code.');
      return;
    }

    setIsScanning(true);
    try {
      // Busca todas as plantas e procura pelo qrCodeValue
      const plants = await getPlants();
      console.log('[QrCodeScanner] Plants received in handleManualScan:', JSON.stringify(plants, null, 2));
      console.log('[QrCodeScanner] Manual QR code value (qrValue):', qrValue);
      const plant = plants.find(p => p.qrCodeValue === qrValue);
      console.log('[QrCodeScanner] Plant found in handleManualScan:', plant ? JSON.stringify(plant, null, 2) : 'Not found');
      if (plant) {
        onScanSuccess(plant);
      } else {
        onScanError('Nenhuma planta encontrada com este QR code.');
      }
    } catch (error) {
      onScanError('Erro ao processar o QR code.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {!showManualInput ? (
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-xs aspect-square mb-4 border-2 border-[#7AC943] rounded-lg overflow-hidden bg-black">
            <Scanner
              onScan={handleQrScan}
              onError={handleQrError}
              constraints={{ facingMode: 'environment' }}

            />
            <div className="absolute top-0 left-0 w-full h-1 bg-[#7AC943] animate-scanline"></div>
            <div className="scanner-frame"></div>
          </div>
          {scanError && <div className="text-red-600 text-center mb-2">{scanError}</div>}
          <button
            onClick={() => {
              setShowManualInput(true);
              setScanError(null);
            }}
            className="text-[#7AC943] hover:text-green-600 font-medium py-2 transition-colors"
          >
            Digitar código manualmente
          </button>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          <div className="text-center mb-2">
            <p className="text-gray-600 dark:text-slate-300">
              Digite o valor do QR code da planta:
            </p>
          </div>
          <input
            type="text"
            value={qrValue}
            onChange={(e) => setQrValue(e.target.value)}
            placeholder="Ex: PLANT-ABC123XYZ"
            className="border border-gray-300 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7AC943]"
          />
          {scanError && <div className="text-red-600 text-center mb-2">{scanError}</div>}
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleManualScan}
              disabled={isScanning}
              className={`bg-[#7AC943] hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-lg shadow transition-colors ${isScanning ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isScanning ? 'Processando...' : 'Buscar Planta'}
            </button>
            <button
              onClick={() => {
                setShowManualInput(false);
                setQrValue('');
                setScanError(null);
              }}
              className="text-[#7AC943] hover:text-green-600 font-medium py-2 transition-colors"
            >
              Voltar para câmera
            </button>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(calc(100% - 4px)); }
        }
        .animate-scanline {
          position: absolute;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, rgba(122,201,67,0.1) 0%, #7AC943 40%, #fff 60%, #7AC943 100%, rgba(122,201,67,0.1) 100%);
          box-shadow: 0 0 16px 4px #7AC943, 0 0 32px 8px #fff;
          border-radius: 2px;
          filter: blur(0.5px);
          animation: scanline 2s linear infinite;
          z-index: 10;
        }
        .scanner-frame {
          position: absolute;
          inset: 0;
          border: 2px solid #7AC943;
          box-shadow: 0 0 16px 2px #7AC94399, 0 0 32px 8px #7AC94344;
          border-radius: 12px;
          pointer-events: none;
          z-index: 9;
        }
      `}} />
    </div>
  );
};

export default QrCodeScanner;
