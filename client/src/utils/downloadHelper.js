// /client/src/utils/downloadHelper.js

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import HTMLtoDOCX from 'html-docx-js-typescript/dist/html-docx';

/**
 * ✅ SIMPLE PDF DOWNLOAD (for Students)
 * Generates a PDF from an HTML element using the html2pdf.js library.
 * This is used on the student dashboard for learner notes.
 */
export const downloadAsPdf = (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found for PDF download.`);
    alert('PDF generation failed: Content to print was not found.');
    return;
  }
  // This library must be loaded in your main index.html file
  if (!window.html2pdf) {
    console.error('html2pdf.js is not loaded.');
    alert('PDF generation library is not available. Please ensure it is included in your index.html.');
    return;
  }
  
  const safeFilename = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  const options = {
    margin: 10,
    filename: safeFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  window.html2pdf().set(options).from(element).save();
};

/**
 * Generates and downloads a Word (.docx) document from an HTML element.
 */
export const downloadAsWord = async (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found for Word download.`);
    alert('An error occurred while generating the Word document.');
    return;
  }

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-size: 10px; line-height: 1.4; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #000; padding: 4px; text-align: left; vertical-align: top; }
        th { background: #f0f0f0; font-weight: bold; }
      </style>
    </head>
    <body>
      ${element.innerHTML}
    </body>
  </html>`;

  try {
    // ✅ Proper usage of the library
    const fileBuffer = await HTMLtoDOCX(html, null, { table: { row: { cantSplit: true } } });
    const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

    const safeFilename = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Word generation failed:', error);
    alert('An error occurred while generating the Word document.');
  }
};