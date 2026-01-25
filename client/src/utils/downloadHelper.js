// /client/src/utils/downloadHelper.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import HTMLtoDOCX from 'html-docx-js-typescript';

/**
 * ✅ FINAL OPTIMIZED PDF EXPORT
 * - Matches Browser 'LessonNoteView' organization.
 * - Fixes Teacher Info column alignment.
 * - Forces 2-page fit by removing vertical 'air' gaps.
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

  // Style injection to tighten everything vertically and fix horizontal widths
  const style = document.createElement('style');
  style.innerHTML = `
    #${elementId} {
      line-height: 1.15 !important; /* Tightens text globally */
      background: white !important;
      color: black !important;
      width: 100% !important;
      font-family: Arial, sans-serif !important;
    }
    
    /* 1. Global Spacing Reduction */
    #${elementId} p, #${elementId} li {
      margin-top: 1px !important;
      margin-bottom: 2px !important;
    }
    #${elementId} h1, #${elementId} h2, #${elementId} h3 {
      margin-top: 4px !important;
      margin-bottom: 2px !important;
      padding: 0 !important;
    }

    /* 2. Teacher Information Table Fix */
    /* Target the table using the structure found in your LessonNoteView */
    #${elementId} table:first-of-type {
      width: 100% !important;
      border-collapse: collapse;
      table-layout: fixed !important;
      margin-bottom: 8pt !important;
    }
    #${elementId} table:first-of-type td:nth-child(1),
    #${elementId} table:first-of-type td:nth-child(3) {
      width: 15% !important; 
      font-weight: bold !important;
      white-space: nowrap !important;
      background-color: #f9fafb !important;
    }
    #${elementId} table:first-of-type td:nth-child(2),
    #${elementId} table:first-of-type td:nth-child(4) {
      width: 35% !important;
    }

    /* 3. Learning Phases Table Fix */
    #${elementId} table:nth-of-type(2) {
      width: 100% !important;
      border-collapse: collapse;
      table-layout: fixed !important;
      margin-top: 5pt !important;
    }
    #${elementId} table:nth-of-type(2) td:nth-child(1) { width: 14% !important; }
    #${elementId} table:nth-of-type(2) td:nth-child(2) { width: 68% !important; }
    #${elementId} table:nth-of-type(2) td:nth-child(3) { width: 18% !important; }

    /* 4. Cell Compression (Crucial for 2-page fit) */
    #${elementId} th, #${elementId} td {
      border: 1px solid #000;
      padding: 2px 4px !important; /* Minimal padding to prevent height bloat */
      word-wrap: break-word;
      vertical-align: top;
      font-size: 11pt !important;
    }

    /* 5. List Spacing */
    #${elementId} ul, #${elementId} ol {
      margin-bottom: 4pt !important;
      padding-left: 20px !important;
    }
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
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } 
  };

  window.html2pdf()
    .set(options)
    .from(element)
    .toPdf()
    .get('pdf')
    .save()
    .then(() => document.head.removeChild(style))
    .catch(() => document.head.removeChild(style));
};

/**
 * ✅ WORD EXPORT
 */
export const downloadAsWord = async (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: Arial; font-size: 11pt; line-height: 1.2; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 4pt; vertical-align: top; }
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