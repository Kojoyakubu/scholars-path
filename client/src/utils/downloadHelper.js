// /client/src/utils/downloadHelper.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import HTMLtoDOCX from 'html-docx-js-typescript';

/**
 * ✅ UPDATED PDF DOWNLOAD
 * Portrait layout, 12pt text (approx 16px), left-aligned.
 * Standard A4 margins.
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

  // Inject consistent styles for A4 Portrait 12pt
  const style = document.createElement('style');
  style.innerHTML = `
    #${elementId} {
      font-size: 12pt !important;
      line-height: 1.6 !important;
      text-align: left !important;
      background: white !important;
      color: black !important;
    }
    #${elementId} * {
      font-size: 12pt !important;
    }
    #${elementId} h1 { font-size: 24pt !important; margin-bottom: 12pt; }
    #${elementId} h2 { font-size: 18pt !important; margin-bottom: 10pt; }
    #${elementId} h3 { font-size: 14pt !important; margin-bottom: 8pt; }
    
    #${elementId} table {
      width: 100% !important;
      border-collapse: collapse;
      margin-bottom: 1rem;
    }
    #${elementId} th, #${elementId} td {
      border: 1px solid #000;
      padding: 8px;
      vertical-align: top;
    }
    #${elementId} p, #${elementId} li {
      margin-bottom: 0.8em;
    }
  `;
  document.head.appendChild(style);

  const options = {
    margin: [15, 15], // 15mm margins
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
      orientation: 'portrait' // ✅ Changed to Portrait
    },
  };

  window.html2pdf()
    .set(options)
    .from(element)
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
        body { font-size: 12pt; line-height: 1.6; text-align: left; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 5pt; }
        h1 { font-size: 20pt; }
        h2 { font-size: 16pt; }
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