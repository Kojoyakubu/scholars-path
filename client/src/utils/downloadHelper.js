// /client/src/utils/downloadHelper.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import HTMLtoDOCX from 'html-docx-js-typescript';

/**
 * ✅ SIMPLE PDF DOWNLOAD
 * Landscape layout, 11px text, left-aligned,
 * Learning Phases column widths fixed at 150 / 450 / 150 px.
 * Reduced page margins for better fit.
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

  // Inject temporary styling for uniform text and column widths
  const style = document.createElement('style');
  style.innerHTML = `
    #${elementId} {
      font-size: 11px !important;
      line-height: 1.45 !important;
      text-align: left !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    #${elementId} * {
      text-align: left !important;
      font-size: 11px !important;
      line-height: 1.45 !important;
    }
    #${elementId} table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px !important;
    }
    #${elementId} th, #${elementId} td {
      border: 1px solid #000;
      padding: 3px;
      text-align: left !important;
      vertical-align: top;
      font-size: 11px !important;
    }
    #${elementId} th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    #${elementId} p {
      margin-bottom: 0.5em;
    }

    /* ✅ Learning Phases explicit pixel widths (20% / 60% / 20%) */
    #${elementId} table.learning-phases {
      width: 100% !important;
      table-layout: fixed !important;
    }
    #${elementId} table.learning-phases th:nth-of-type(1),
    #${elementId} table.learning-phases td:nth-of-type(1) {
      width: 150px !important;
    }
    #${elementId} table.learning-phases th:nth-of-type(2),
    #${elementId} table.learning-phases td:nth-of-type(2) {
      width: 450px !important;
    }
    #${elementId} table.learning-phases th:nth-of-type(3),
    #${elementId} table.learning-phases td:nth-of-type(3) {
      width: 150px !important;
    }
  `;
  document.head.appendChild(style);

  // ✅ Reduced margins (5mm)
  const options = {
    margin: 5,
    filename: safeFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
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
 * Matches PDF styling — 11px font, left-aligned,
 * Learning Phases column widths fixed at 150 / 450 / 150 px.
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
        body { font-size: 11px; line-height: 1.45; text-align: left; margin: 0; padding: 0; }
        * { text-align: left; font-size: 11px; line-height: 1.45; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 8px 0;
          font-size: 11px;
        }
        th, td {
          border: 1px solid #000;
          padding: 3px;
          text-align: left;
          vertical-align: top;
          font-size: 11px;
        }
        th { background: #f0f0f0; font-weight: bold; }
        p { margin-bottom: 0.5em; }

        /* ✅ Learning Phases explicit pixel widths (20% / 60% / 20%) */
        table.learning-phases {
          width: 100%;
          table-layout: fixed;
        }
        table.learning-phases th:nth-of-type(1),
        table.learning-phases td:nth-of-type(1) {
          width: 150px;
        }
        table.learning-phases th:nth-of-type(2),
        table.learning-phases td:nth-of-type(2) {
          width: 450px;
        }
        table.learning-phases th:nth-of-type(3),
        table.learning-phases td:nth-of-type(3) {
          width: 150px;
        }
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
 * ✅ ADVANCED PDF DOWNLOAD (Structured layout, optional)
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
    doc.setFontSize(11);
    doc.text('TEACHER INFORMATION', doc.internal.pageSize.width / 2, 15, { align: 'center' });

    autoTable(doc, {
      startY: 20,
      body: extractHeaderData(mainElement),
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: { top: 1, right: 2, bottom: 1, left: 0 } },
      columnStyles: { 0: { fontStyle: 'bold' } },
    });

    const tableElement = mainElement.querySelector('table');
    if (tableElement) {
      autoTable(doc, {
        html: tableElement,
        startY: doc.lastAutoTable.finalY + 5,
        theme: 'grid',
        headStyles: {
          fontSize: 10,
          fillColor: [220, 220, 220],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
        },
        styles: { fontSize: 10, halign: 'left' },
      });
    }

    doc.save(safeFilename);
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('An error occurred while generating the PDF.');
  }
};
