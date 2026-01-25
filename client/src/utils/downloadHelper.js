// /client/src/utils/downloadHelper.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import HTMLtoDOCX from 'html-docx-js-typescript';

/**
 * ✅ 2-PAGE PROFESSIONAL PDF EXPORT
 * Matches the 'beautiful and organized' browser view.
 * Removes excess vertical padding to prevent 3-page overflow.
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

  // Style injection: Keeps font size original but tightens layout
  const style = document.createElement('style');
  style.innerHTML = `
    #${elementId} {
      line-height: 1.2 !important; 
      background: white !important;
      color: black !important;
      width: 100% !important;
    }
    
    /* Remove vertical 'bloat' between paragraphs and list items */
    #${elementId} p, #${elementId} li {
      margin-top: 1px !important;
      margin-bottom: 2px !important;
    }

    #${elementId} h1, #${elementId} h2, #${elementId} h3 {
      margin-top: 5px !important;
      margin-bottom: 2px !important;
    }

    /* Teacher Info Table: Organized 4-column layout */
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
      background-color: #f8f9fa !important; /* Subtle highlight for labels */
    }

    #${elementId} table:first-of-type td:nth-child(2),
    #${elementId} table:first-of-type td:nth-child(4) {
      width: 35% !important;
    }

    /* Learning Phases Table: Mirror browser proportions */
    #${elementId} table:nth-of-type(2) {
      width: 100% !important;
      border-collapse: collapse;
      table-layout: fixed !important;
    }
    #${elementId} table:nth-of-type(2) td:nth-child(1) { width: 15% !important; }
    #${elementId} table:nth-of-type(2) td:nth-child(2) { width: 65% !important; }
    #${elementId} table:nth-of-type(2) td:nth-child(3) { width: 20% !important; }

    /* Compact Cell Design to stay within 2 pages */
    #${elementId} th, #${elementId} td {
      border: 1px solid #000;
      padding: 3px 5px !important; /* Tight vertical, breathable horizontal */
      word-wrap: break-word;
      vertical-align: top;
    }
  `;
  document.head.appendChild(style);

  const options = {
    margin: [8, 10, 8, 10], // 8mm top/bottom to maximize 2-page space
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
        body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.2; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10pt; }
        th, td { border: 1px solid #000; padding: 4pt; vertical-align: top; }
        h1 { font-size: 18pt; margin-bottom: 5pt; }
        h2 { font-size: 14pt; margin-top: 10pt; }
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