import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Plant } from '../types'; // Assuming Plant type is available

// Helper to get Data URL using 'qrcode' library
async function getQRCodeDataURL(qrValue: string, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    // The canvas element needs to be added to the document to be able to use toDataURL
    // but it can be hidden
    canvas.style.display = 'none';
    document.body.appendChild(canvas);

    QRCode.toCanvas(canvas, qrValue, {
      width: size,
      margin: 4, // ensure proper quiet zone for reliable scanning
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }, (error) => {
      document.body.removeChild(canvas); // Clean up: remove canvas from document
      if (error) {
        console.error('QRCode generation error:', error);
        return reject(error);
      }
      resolve(canvas.toDataURL('image/png'));
    });
  });
}

export const generateQRCodesPDF = async (plants: Plant[], cultivoName: string) => {
  console.log('[generateQRCodesPDF] Received plants data:', JSON.stringify(plants, null, 2)); // Log received plant data

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageMargin = 10; // mm
  const pageWidth = pdf.internal.pageSize.getWidth() - 2 * pageMargin;
  const pageHeight = pdf.internal.pageSize.getHeight() - 2 * pageMargin;

  // Label dimensions (approximated from cm to mm)
  const labelWidth = 35; // mm (3.5cm)
  const labelHeight = 50; // mm (5.0cm)
  const qrCodeSizeMm = 25; // mm (2.5cm) - visual size on paper
  const textLineHeightMm = 4; // mm for text lines
  const textOffsetY = qrCodeSizeMm + 5; // Start text below QR code + small padding

  const labelsPerRow = Math.floor(pageWidth / labelWidth);
  const labelsPerCol = Math.floor(pageHeight / labelHeight);
  const maxLabelsPerPage = labelsPerRow * labelsPerCol;

  let currentLabel = 0;
  let pageNumber = 1;

  pdf.setFontSize(12);
  pdf.text(`Etiquetas QR - Cultivo: ${cultivoName}`, pageMargin, pageMargin - 4); // Adjusted Y for title
  pdf.setFontSize(8);

  for (let i = 0; i < plants.length; i++) {
    const plant = plants[i];
    if (currentLabel >= maxLabelsPerPage) {
      pdf.addPage();
      pageNumber++;
      currentLabel = 0;
      pdf.setFontSize(12);
      pdf.text(`Etiquetas QR - Cultivo: ${cultivoName} (Pág. ${pageNumber})`, pageMargin, pageMargin - 4); // Adjusted Y
      pdf.setFontSize(8);
    }

    const rowIndex = Math.floor(currentLabel / labelsPerRow);
    const colIndex = currentLabel % labelsPerRow;

    const x = pageMargin + colIndex * labelWidth;
    const y = pageMargin + rowIndex * labelHeight;

    // Draw border for the label (optional, for visualization)
    // pdf.rect(x, y, labelWidth, labelHeight);

    const qrValue = plant.qrCodeValue || plant.id; // Ensure there's a value for QR
    if (!qrValue) {
      console.warn(`Plant ${plant.id} has no qrCodeValue or id for QR generation.`);
      // Optionally draw a placeholder if no QR value
      pdf.text('No QR Value', x + (labelWidth - qrCodeSizeMm) / 2, y + qrCodeSizeMm / 2 + 2, { align: 'center' });
    } else {
      try {
        // Use a larger canvas to keep sharpness when scaled down in the PDF
        const qrDataURL = await getQRCodeDataURL(qrValue, 512);
        if (qrDataURL) {
          pdf.addImage(qrDataURL, 'PNG', x + (labelWidth - qrCodeSizeMm) / 2, y + 2, qrCodeSizeMm, qrCodeSizeMm);
        }
      } catch (error) {
        console.error("Error generating QR code for plant:", plant.id, error);
        pdf.text('QR Error', x + (labelWidth - qrCodeSizeMm) / 2, y + qrCodeSizeMm / 2 + 2, { align: 'center'});
      }
    }

    // Add Text (centered under QR code)
    const textBlockWidth = labelWidth - 2; // Small padding for text within label
    const textX = x + labelWidth / 2; // Center align for text

    // Plant Name - potentially split if too long
    const plantNameLines = pdf.splitTextToSize(plant.name || 'Nome Desconhecido', textBlockWidth);
    pdf.text(plantNameLines, textX, y + textOffsetY, { align: 'center', maxWidth: textBlockWidth });
    let currentTextY = y + textOffsetY + (plantNameLines.length * textLineHeightMm);

    // Plant ID (shortened)
    pdf.text(`ID: ${plant.id.substring(0, 8)}...`, textX, currentTextY, { align: 'center', maxWidth: textBlockWidth });
    currentTextY += textLineHeightMm;

    // Strain Name - potentially split if too long
    const strainLines = pdf.splitTextToSize(plant.strain || 'Strain N/A', textBlockWidth);
    pdf.text(strainLines, textX, currentTextY, { align: 'center', maxWidth: textBlockWidth });
    currentTextY += strainLines.length * textLineHeightMm;

    // Birth date for reference
    if (plant.birthDate) {
      const birth = new Date(plant.birthDate).toLocaleDateString('pt-BR');
      pdf.text(`Plantio: ${birth}`, textX, currentTextY, { align: 'center', maxWidth: textBlockWidth });
      currentTextY += textLineHeightMm;
    }

    currentLabel++;
  }

  pdf.save(`qr_codes_${cultivoName.replace(/\s+/g, '_')}.pdf`);
};
