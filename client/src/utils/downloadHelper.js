// /client/src/utils/downloadHelper.js

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import HTMLtoDOCX from 'html-docx-js-typescript';

/**
 * ✅ SIMPLE PDF DOWNLOAD (for Teachers)
 * Generates a PDF from an HTML element using html2pdf.js with uniform 10px text.
 */
export const downloadAsPdf = (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found for PDF download.`);
    alert('PDF generation failed: Content to print was not found.');
    return;
  }

  if (!window.html2pdf) {
    console.error('html2pdf.js is not loaded.');
    alert('PDF generation library is not available. Please ensure it is included in your index.html.');
    return;
  }

  const safeFilename = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  // ✅ Inject temporary styling so everything is 10px in the PDF
  const style = document.createElement('style');
  style.innerHTML = `
    #${elementId} {
      font-size: 10px !important;
      line-height: 1.4 !important;
    }
    #${elementId} table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px !important;
    }
    #${elementId} th,
    #${elementId} td {
      border: 1px solid #000;
      padding: 4px;
      text-align: left;
      vertical-align: top;
      font-size: 10px !important;
    }
    #${elementId} th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    #${elementId} p {
      margin-bottom: 0.5em;
    }
  `;
  document.head.appendChild(style);

  const options = {
    margin: 10,
    filename: safeFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }, // 👈 landscape mode
  };

  window.html2pdf()
    .set(options)
    .from(element)
    .save()
    .then(() => document.head.removeChild(style))
    .catch(() => document.head.removeChild(style));
};

/**
 * ✅ WORD DOWNLOAD
 * Generates and downloads a .docx document from an HTML element (font size 10px).
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
        table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10px; }
        th, td { border: 1px solid #000; padding: 4px; text-align: left; vertical-align: top; font-size: 10px; }
        th { background: #f0f0f0; font-weight: bold; }
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
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Word generation failed:', error);
    alert('An error occurred while generating the Word document.');
  }
};

/**
 * ✅ ADVANCED PDF DOWNLOAD (Structured format, optional)
 */
export const downloadLessonNoteAsPdf = (elementId, topic) => {
  try {
    const mainElement = document.getElementById(elementId);
    if (!mainElement) throw new Error(`Element with ID "${elementId}" not found.`);

    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const safeFilename = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    const extractHeaderData = (element) => {
      const headerData = [];
      const boldElements = element.querySelectorAll('strong');
      boldElements.forEach((strong) => {
        const label = strong.innerText.replace(':', '').trim();
        const parent = strong.parentElement;
        const value = parent.innerText.replace(strong.innerText, '').trim();
        if (label && value) headerData.push([label, value]);
      });
      return headerData;
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TEACHER INFORMATION', doc.internal.pageSize.width / 2, 15, { align: 'center' });

    autoTable(doc, {
      startY: 20,
      body: extractHeaderData(mainElement),
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: { top: 1, right: 2, bottom: 1, left: 0 } },
      columnStyles: { 0: { fontStyle: 'bold' } },
    });

    const tableElement = mainElement.querySelector('table');
    if (tableElement) {
      autoTable(doc, {
        html: tableElement,
        startY: doc.lastAutoTable.finalY + 5,
        theme: 'grid',
        headStyles: {
          fontSize: 9,
          fillColor: [220, 220, 220],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
        },
        styles: { fontSize: 9 },
      });
    }

    doc.save(safeFilename);
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('An error occurred while generating the PDF.');
  }
};
