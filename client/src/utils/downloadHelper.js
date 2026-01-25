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

  /* ================= PDF STYLES ================= */
  const style = document.createElement('style');
  style.innerHTML = `
    #${elementId} {
      font-family: Arial, sans-serif !important;
      font-size: 12pt !important;
      line-height: 1.25 !important;
      background: white !important;
      color: black !important;
      max-width: 190mm !important;
      margin: 0 auto !important;
    }

    /* Paragraphs & Lists */
    #${elementId} p {
      margin: 4pt 0 !important;
    }

    #${elementId} li {
      margin-bottom: 3pt !important;
    }

    /* Headings */
    #${elementId} h1,
    #${elementId} h2,
    #${elementId} h3 {
      margin-top: 6pt !important;
      margin-bottom: 4pt !important;
      font-weight: bold !important;
      page-break-after: avoid !important;
      page-break-inside: avoid !important;
    }

    /* Tables */
    #${elementId} table {
      width: 100% !important;
      border-collapse: collapse !important;
      table-layout: fixed !important;
      margin-bottom: 6pt !important;
    }

    #${elementId} th,
    #${elementId} td {
      border: 1px solid #000 !important;
      padding: 4pt !important;
      vertical-align: top !important;
      word-wrap: break-word !important;
    }

    #${elementId} th {
      background: #f3f4f6 !important;
      font-weight: bold !important;
    }

    /* Teacher Information Table (1st table) */
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

    /* Learning Phases Table (2nd table) */
    #${elementId} table:nth-of-type(2) th:nth-child(1),
    #${elementId} table:nth-of-type(2) td:nth-child(1) {
      width: 15% !important;
    }

    #${elementId} table:nth-of-type(2) th:nth-child(2),
    #${elementId} table:nth-of-type(2) td:nth-child(2) {
      width: 70% !important;
    }

    #${elementId} table:nth-of-type(2) th:nth-child(3),
    #${elementId} table:nth-of-type(2) td:nth-child(3) {
      width: 15% !important;
    }
  `;
  document.head.appendChild(style);

  /* ================= PDF OPTIONS ================= */
  const options = {
    margin: [12, 10, 12, 10], // top, left, bottom, right (mm)
    filename: safeFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
    pagebreak: {
      mode: ['avoid-all', 'css'],
    },
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

/* ================= WORD EXPORT ================= */
export const downloadAsWord = async (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 12pt;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #000;
            padding: 4pt;
            vertical-align: top;
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `;

  try {
    const fileBuffer = await HTMLtoDOCX(html);
    const blob = new Blob([fileBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
    link.click();
  } catch (error) {
    console.error(error);
  }
};
