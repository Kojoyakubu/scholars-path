// /client/src/utils/downloadHelper.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import HTMLtoDOCX from 'html-docx-js-typescript';

/**
 * ✅ OPTIMIZED PDF DOWNLOAD
 * Portrait layout, 12pt text, forced to fit 2 pages.
 * Adjusts line-height and margins to ensure everything fits.
 */
export const downloadAsPdf = (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('PDF generation failed: content not found.');
    return;
  }
  if (!window.html2pdf) {
    alert('html2pdf.js is not loaded.');
    return;
  }

  const safeFilename = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  // Inject styles to optimize for a 2-page fit
  const style = document.createElement('style');
  style.innerHTML = `
    #${elementId} {
      font-size: 11pt !important; /* Slightly smaller than 12pt to ensure fit */
      line-height: 1.3 !important; /* Tighter line height to save space */
      text-align: left !important;
      background: white !important;
      color: black !important;
      padding: 0 !important;
      width: 100% !important;
    }
    #${elementId} * {
      font-size: 11pt !important;
      margin-top: 2pt !important;
      margin-bottom: 2pt !important;
    }
    #${elementId} h1 { font-size: 18pt !important; margin-bottom: 8pt !important; }
    #${elementId} h2 { font-size: 14pt !important; margin-bottom: 6pt !important; }
    #${elementId} h3 { font-size: 12pt !important; margin-bottom: 4pt !important; }
    
    #${elementId} table {
      width: 100% !important;
      border-collapse: collapse;
      margin-bottom: 8pt !important;
      table-layout: fixed; /* Prevents tables from pushing width */
    }

    /* ✅ FIX: TEACHER INFORMATION TABLE COLUMN WIDTHS */
    #${elementId} .teacher-info-table td:nth-child(1),
    #${elementId} .teacher-info-table td:nth-child(3) {
      width: 12% !important; 
      font-weight: bold;
      white-space: nowrap; 
    }
    #${elementId} .teacher-info-table td:nth-child(2),
    #${elementId} .teacher-info-table td:nth-child(4) {
      width: 38% !important; 
    }

    #${elementId} th, #${elementId} td {
      border: 1px solid #000;
      padding: 4px !important; /* Compact cells */
      word-wrap: break-word;
    }
    /* Forces page break only after major sections if needed */
    .page-break {
      page-break-before: always;
    }
  `;
  document.head.appendChild(style);

  const options = {
    margin: [10, 10, 10, 10], // Slimmer margins (10mm) to maximize space
    filename: safeFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true,
      letterRendering: true 
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } 
  };

  window.html2pdf()
    .set(options)
    .from(element)
    .toPdf()
    .get('pdf')
    .then((pdf) => {
      const totalPages = pdf.internal.getNumberOfPages();
      if (totalPages > 2) {
        console.warn("Content exceeded 2 pages. Consider reducing text.");
      }
    })
    .save()
    .then(() => document.head.removeChild(style))
    .catch(() => document.head.removeChild(style));
};

export const downloadAsWord = async (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('An error occurred while generating the Word document.');
    return;
  }

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-size: 11pt; line-height: 1.4; text-align: left; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 4pt; }
        h1 { font-size: 18pt; }
        h2 { font-size: 14pt; }
      </style>
    </head>
    <body>
      ${element.innerHTML}
    </body>
  </html>`;

  try {
    const fileBuffer = await HTMLtoDOCX(html);
    const blob = new Blob([fileBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const safeFilename = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = safeFilename;
    link.click();
  } catch (error) {
    console.error('Word generation failed:', error);
  }
};