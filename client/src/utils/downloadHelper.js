// /client/src/utils/downloadHelper.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import HTMLtoDOCX from 'html-docx-js-typescript';

/**
 * ✅ PROFESSIONAL PDF EXPORT
 * - Matches Browser 'LessonNoteView' organization.
 * - Fixes Teacher Info column alignment.
 * - Corrects Learning Phases column proportions (15% / 70% / 15%).
 * - Forces 2-page fit by removing vertical gaps.
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

  const style = document.createElement('style');
  style.innerHTML = `
    #${elementId} {
      line-height: 1.15 !important;
      background: white !important;
      color: black !important;
      width: 100% !important;
      font-family: Arial, sans-serif !important;
    }
    
    /* Global Spacing Reduction */
    #${elementId} p, #${elementId} li {
      margin-top: 1px !important;
      margin-bottom: 2px !important;
    }
    #${elementId} h1, #${elementId} h2, #${elementId} h3 {
      margin-top: 4px !important;
      margin-bottom: 2px !important;
    }

    /* ALL TABLES: Force fixed layout so percentages are respected */
    #${elementId} table {
      width: 100% !important;
      border-collapse: collapse;
      table-layout: fixed !important;
      margin-bottom: 6pt !important;
    }

    /* 1. Teacher Information Table (4 columns) */
    #${elementId} table:first-of-type td:nth-child(1),
    #${elementId} table:first-of-type td:nth-child(3) {
      width: 15% !important; 
      font-weight: bold !important;
      white-space: nowrap !important;
    }
    #${elementId} table:first-of-type td:nth-child(2),
    #${elementId} table:first-of-type td:nth-child(4) {
      width: 35% !important;
    }

    /* 2. Learning Phases Table (3 columns) - THE FIX */
    /* We target the table that follows the 'Curriculum Standards' section */
    #${elementId} table:nth-of-type(2) th:nth-child(1),
    #${elementId} table:nth-of-type(2) td:nth-child(1) { width: 15% !important; } /* Phase/Time */
    
    #${elementId} table:nth-of-type(2) th:nth-child(2),
    #${elementId} table:nth-of-type(2) td:nth-child(2) { width: 70% !important; } /* Main Activity */
    
    #${elementId} table:nth-of-type(2) th:nth-child(3),
    #${elementId} table:nth-of-type(2) td:nth-child(3) { width: 15% !important; } /* Assessment */

    /* Cell Compression for 2-page fit */
    #${elementId} th, #${elementId} td {
      border: 1px solid #000;
      padding: 3px 5px !important;
      word-wrap: break-word;
      vertical-align: top;
      font-size: 11pt !important;
    }

    #${elementId} th {
      background-color: #f3f4f6 !important;
      font-weight: bold !important;
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

export const downloadAsWord = async (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8" /><style>body { font-family: Arial; font-size: 11pt; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #000; padding: 4pt; }</style></head><body>${element.innerHTML}</body></html>`;
  try {
    const fileBuffer = await HTMLtoDOCX(html);
    const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
    link.click();
  } catch (error) { console.error(error); }
};