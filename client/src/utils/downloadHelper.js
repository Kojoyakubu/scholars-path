// /client/src/utils/downloadHelper.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import HTMLtoDOCX from 'html-docx-js-typescript';


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

  const style = document.createElement('style');
  style.innerHTML = `
    #${elementId} {
      line-height: 1.1 !important; /* Tightens space between lines */
      background: white !important;
      color: black !important;
    }
    
    /* Remove margins from all elements to save vertical space */
    #${elementId} p, #${elementId} ul, #${elementId} ol, #${elementId} li {
      margin-top: 1px !important;
      margin-bottom: 1px !important;
    }

    #${elementId} h1, #${elementId} h2, #${elementId} h3 {
      margin-top: 4px !important;
      margin-bottom: 2px !important;
      line-height: 1.0 !important;
    }

    #${elementId} table {
      width: 100% !important;
      border-collapse: collapse;
      table-layout: fixed !important;
      margin-bottom: 4px !important;
    }

    /* Teacher Info Table Sizing */
    #${elementId} table:first-of-type td:nth-child(1),
    #${elementId} table:first-of-type td:nth-child(3) {
      width: 15% !important;
      font-weight: bold;
    }

    /* Learning Phases Table - Aggressive Spacing Reduction */
    #${elementId} .learning-phases td {
      padding: 1px 3px !important; /* Minimal padding */
      line-height: 1.0 !important; /* Absolute tightest line height */
      vertical-align: top;
    }

    #${elementId} th, #${elementId} td {
      border: 1px solid #000;
      word-wrap: break-word;
    }
  `;
  document.head.appendChild(style);

  const options = {
    margin: [7, 10, 7, 10], // Reduced top/bottom margins to 7mm
    filename: safeFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
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

export const downloadAsWord = async (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8" /><style>body { font-size: 11pt; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #000; padding: 2pt; }</style></head><body>${element.innerHTML}</body></html>`;
  try {
    const fileBuffer = await HTMLtoDOCX(html);
    const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${topic}.docx`;
    link.click();
  } catch (error) { console.error(error); }
};