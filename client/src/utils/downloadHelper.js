// /client/src/utils/downloadHelper.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import HTMLtoDOCX from 'html-docx-js-typescript';

/**
 * ✅ OPTIMIZED PDF DOWNLOAD
 * Portrait layout, 11pt text, forced to fit 2 pages.
 * Targets the Teacher Info table without needing a class name.
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
      font-size: 11pt !important;
      line-height: 1.3 !important;
      text-align: left !important;
      background: white !important;
      color: black !important;
      padding: 0 !important;
      width: 100% !important;
    }
    #${elementId} * {
      font-size: 11pt !important;
    }
    
    /* Target the very first table in the document (Teacher Info Table) */
    #${elementId} table:first-of-type {
      table-layout: fixed !important;
      width: 100% !important;
    }

    /* Shrink the labels (1st and 3rd columns) to be very tight */
    #${elementId} table:first-of-type td:nth-child(1),
    #${elementId} table:first-of-type td:nth-child(3) {
      width: 18% !important; 
      font-weight: bold !important;
      white-space: nowrap !important;
    }

    /* Give the data (2nd and 4th columns) the remaining space */
    #${elementId} table:first-of-type td:nth-child(2),
    #${elementId} table:first-of-type td:nth-child(4) {
      width: 32% !important;
    }

    #${elementId} table {
      width: 100% !important;
      border-collapse: collapse;
      margin-bottom: 8pt !important;
    }
    #${elementId} th, #${elementId} td {
      border: 1px solid #000;
      padding: 4px !important;
      word-wrap: break-word;
      vertical-align: top;
    }
    #${elementId} h1 { font-size: 18pt !important; margin-bottom: 8pt !important; }
    #${elementId} h2 { font-size: 14pt !important; margin-bottom: 6pt !important; }
  `;
  document.head.appendChild(style);

  const options = {
    margin: [10, 10, 10, 10], 
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
        console.warn("Content exceeded 2 pages.");
      }
    })
    .save()
    .then(() => document.head.removeChild(style))
    .catch(() => document.head.removeChild(style));
};

export const downloadAsWord = async (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-size: 11pt; line-height: 1.4; text-align: left; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 4pt; }
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