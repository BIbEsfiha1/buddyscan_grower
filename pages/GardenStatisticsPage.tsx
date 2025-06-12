import { useEffect, useState } from 'react';
import useToast from '../hooks/useToast';
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode.react';
import Button from '../components/Button';
import Toast from '../components/Toast';
import { Plant } from '../types';
import { useTranslation } from 'react-i18next';
import { getPlantsByCultivo } from '../services/cultivoService';

export default function CultivoEtiquetasPage() {
  const { cultivoId } = useParams<{ cultivoId: string }>();
  const [plants, setPlants] = useState<Plant[]>([]);
  const { t } = useTranslation();
  const [toast, showToast] = useToast();

  useEffect(() => {
    if (cultivoId) {
      getPlantsByCultivo(cultivoId)
        .then(setPlants)
        .catch((err) => {
          setPlants([]);
          showToast({
            message: t('cultivoEtiquetasPage.error_loading_plants', { error: err.message || err }),
            type: 'error'
          });
        });
    }
  }, [cultivoId, showToast, t]);

  return (
    <div className="p-4">
      {toast && <Toast toast={toast} />}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('cultivoEtiquetasPage.title')}</h1>
        <Button onClick={() => window.print()}>{t('cultivoEtiquetasPage.print')}</Button>
      </div>
      <div className="a4-print-grid">
        {plants.map((plant) => (
          <div key={plant.id} className="etiqueta-qr border border-gray-300 rounded p-2 flex flex-col items-center mb-4">
            <QRCode value={plant.qrCodeValue || plant.id} size={80} />
            <div className="text-xs mt-2 text-center">
              <div><b>{plant.name}</b></div>
              <div>{plant.strain}</div>
              <div>{t('cultivoEtiquetasPage.id_label')}: {plant.id}</div>
              <div>{t('cultivoEtiquetasPage.birth_label')}: {plant.birthDate}</div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media print {
          body { background: white; }
          .a4-print-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-auto-rows: 110px;
            gap: 0;
            page-break-inside: avoid;
          }
          .etiqueta-qr {
            width: 6.5cm;
            height: 3.5cm;
            margin: 0;
            box-sizing: border-box;
            page-break-inside: avoid;
          }
          button, .no-print { display: none !important; }
        }
        .a4-print-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .etiqueta-qr {
          background: white;
          width: 200px;
          min-height: 90px;
          margin: 0 auto 8px auto;
        }
      `}</style>
    </div>
  );
}