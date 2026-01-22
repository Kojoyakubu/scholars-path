// /client/src/utils/downloadHelper.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import HTMLtoDOCX from 'html-docx-js-typescript';

/**
 * ✅ OPTIMIZED PDF DOWNLOAD
 * Portrait A4, 11pt text.
 * Fixed column widths for Teacher Information Table and Learning Phases.
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

  // Inject styles to tighten column widths and force 2-page layout
  const style = document.createElement('style');
  style.innerHTML = `
    #${elementId} {
      font-size: 11pt !important;
      line-height: 1.3 !important;
      background: white !important;
      color: black !important;
    }

    /* Target ALL tables to be compact */
    #${elementId} table {
      width: 100% !important;
      border-collapse: collapse;
      table-layout: fixed; 
      margin-bottom: 8pt !important;
    }

    /* ✅ FIX: TEACHER INFORMATION TABLE (4 Columns) */
    /* Shrinks the "Labels" (Col 1 & 3) and expands "Data" (Col 2 & 4) */
    #${elementId} .teacher-info-table th, 
    #${elementId} .teacher-info-table td:nth-child(1),
    #${elementId} .teacher-info-table td:nth-child(3) {
      width: 18% !important; /* Smaller label columns */
      font-weight: bold;
      background-color: #f9fafb;
    }

    #${elementId} .teacher-info-table td:nth-child(2),
    #${elementId} .teacher-info-table td:nth-child(4) {
      width: 32% !important; /* Larger data columns */
    }

    /* ✅ LEARNING PHASES TABLE (3 Columns) */
    #${elementId} .learning-phases td:nth-child(1) { width: 12% !important; } /* Phase/Time */
    #${elementId} .learning-phases td:nth-child(2) { width: 73% !important; } /* Main Activity */
    #${elementId} .learning-phases td:nth-child(3) { width: 15% !important; } /* Assessment */

    #${elementId} th, #${elementId} td {
      border: 1px solid #000;
      padding: 4px !important;
      word-wrap: break-word;
      vertical-align: top;
    }

    #${elementId} h1 { font-size: 18pt !important; margin-bottom: 4pt !important; }
    #${elementId} h2 { font-size: 14pt !important; margin-top: 8pt !important; }
    #${elementId} p, #${elementId} li { margin-bottom: 3pt !important; }
  `;
  document.head.appendChild(style);

  const options = {
    margin: [10, 10, 10, 10], 
    filename: safeFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  window.html2pdf()
    .set(options)
    .from(element)
    .save()
    .then(() => document.head.removeChild(style))
    .catch(() => document.head.removeChild(style));
};