import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { getPlants } from '../services/plantService';
import { Plant } from '../types';
import { Box, Button, TextField, Typography } from '@mui/material';


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
      // Busca todas as plantas e procura primeiro pelo qrCodeValue
      const plants = await getPlants();
      let plant = plants.find(p => p.qrCodeValue === result);
      if (!plant) {
        // Se não encontrado pelo QR, tenta buscar por id
        plant = plants.find(p => p.id === result);
      }
      if (plant) {
        onScanSuccess(plant);
      } else {
        const msg = 'Nenhuma planta encontrada com este QR code ou ID.';
        setScanError(msg);
        onScanError(msg);
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
      // Busca todas as plantas e procura primeiro pelo qrCodeValue
      const plants = await getPlants();
      let plant = plants.find(p => p.qrCodeValue === qrValue);
      if (!plant) {
        // Se não encontrado pelo QR, tenta buscar por id
        plant = plants.find(p => p.id === qrValue);
      }
      if (plant) {
        onScanSuccess(plant);
      } else {
        onScanError('Nenhuma planta encontrada com este QR code ou ID.');
      }
    } catch (error) {
      onScanError('Erro ao processar o QR code.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      {!showManualInput ? (
        <Box display="flex" flexDirection="column" alignItems="center" width="100%" maxWidth={300}>
          <Box
            position="relative"
            width="100%"
            sx={{ aspectRatio: '1 / 1' }}
            mb={2}
            border={2}
            borderColor="success.main"
            borderRadius={2}
            overflow="hidden"
            bgcolor="black"
          >
            <Scanner onScan={handleQrScan} onError={handleQrError} constraints={{ facingMode: 'environment' }} />
            <Box className="animate-scanline" sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4 }} />
            <Box className="scanner-frame" />
          </Box>
          {scanError && (
            <Typography color="error" align="center" sx={{ mb: 1 }}>
              {scanError}
            </Typography>
          )}
          <Button variant="text" onClick={() => { setShowManualInput(true); setScanError(null); }}>
            Digitar código manualmente
          </Button>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={2} width="100%" maxWidth={300}>
          <Typography align="center" color="text.secondary">
            Digite o valor do QR code da planta:
          </Typography>
          <TextField
            value={qrValue}
            onChange={(e) => setQrValue(e.target.value)}
            placeholder="Ex: PLANT-ABC123XYZ"
            size="small"
            fullWidth
          />
          {scanError && (
            <Typography color="error" align="center">
              {scanError}
            </Typography>
          )}
          <Box display="flex" flexDirection="column" gap={1}>
            <Button variant="contained" color="success" onClick={handleManualScan} disabled={isScanning}>
              {isScanning ? 'Processando...' : 'Buscar Planta'}
            </Button>
            <Button variant="text" onClick={() => { setShowManualInput(false); setQrValue(''); setScanError(null); }}>
              Voltar para câmera
            </Button>
          </Box>
        </Box>
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
    </Box>
  );
};

export default QrCodeScanner;
