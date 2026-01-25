// /client/src/utils/downloadHelper.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import HTMLtoDOCX from 'html-docx-js-typescript';

export const downloadAsPdf = (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element || !window.html2pdf) return;

  const safeFilename = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  const style = document.createElement('style');
  style.innerHTML = `
    #${elementId} {
      line-height: 1.15 !important; /* Tightens text globally */
      background: white !important;
      color: black !important;
      width: 100% !important;
    }
    
    /* Remove the 'bloat' between paragraphs and list items */
    #${elementId} p, #${elementId} li {
      margin-top: 1px !important;
      margin-bottom: 2px !important;
    }

    #${elementId} h1, #${elementId} h2, #${elementId} h3 {
      margin-top: 6px !important;
      margin-bottom: 2px !important;
    }

    #${elementId} table {
      width: 100% !important;
      border-collapse: collapse;
      table-layout: fixed !important; /* Forces columns to stay in place */
      margin-bottom: 6px !important;
    }

    /* Target Teacher Info Table (Table 1) */
    #${elementId} table:first-of-type td:nth-child(1),
    #${elementId} table:first-of-type td:nth-child(3) {
      width: 15% !important; 
      font-weight: bold !important;
      white-space: nowrap !important;
    }

    /* Target Learning Phases Table (Table 2) */
    /* Adjust these % if you want the first/third columns even smaller */
    #${elementId} table:nth-of-type(2) td:nth-child(1) { width: 15% !important; }
    #${elementId} table:nth-of-type(2) td:nth-child(2) { width: 65% !important; }
    #${elementId} table:nth-of-type(2) td:nth-child(3) { width: 20% !important; }

    /* The "Beauty" Fix: Remove cell padding that causes 3-page overflow */
    #${elementId} th, #${elementId} td {
      border: 1px solid #000;
      padding: 2px 4px !important; /* Minimal vertical padding */
      word-wrap: break-word;
      vertical-align: top;
    }
  `;
  document.head.appendChild(style);

  const options = {
    margin: [8, 10, 8, 10], // Slimmer top/bottom margins to gain vertical space
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

// ... keep downloadAsWord as it is