// /client/src/utils/downloadHelper.js

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import HTMLtoDOCX from 'html-docx-js-typescript';

/**
 * Generates and downloads a Word (.docx) document from an HTML element.
 */
export const downloadAsWord = (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found for Word download.`);
    alert('An error occurred while generating the Word document.');
    return;
  }

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${element.innerHTML}</body></html>`;
  const blob = HTMLtoDOCX(html);
  const safeFilename = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = safeFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generates a structured PDF for a teacher's lesson note by reading rendered HTML.
 */
export const downloadLessonNoteAsPdf = (elementId, topic) => {
  try {
    const mainElement = document.getElementById(elementId);
    if (!mainElement) {
        throw new Error(`Element with ID "${elementId}" not found.`);
    }

    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const safeFilename = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    // Helper to extract header data from the rendered HTML
    const extractHeaderData = (element) => {
        const headerData = [];
        const boldElements = element.querySelectorAll('strong');
        boldElements.forEach(strong => {
            const label = strong.innerText.replace(':', '').trim();
            const parent = strong.parentElement;
            const value = parent.innerText.replace(strong.innerText, '').trim();
            if (label && value) { // Only add if both label and value exist
              headerData.push([label, value]);
            }
        });
        return headerData;
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10); // ✅ CHANGED: Title font size from 12 to 10
    doc.text('TEACHER INFORMATION', doc.internal.pageSize.width / 2, 15, { align: 'center' });

    autoTable(doc, {
      startY: 20,
      body: extractHeaderData(mainElement),
      theme: 'plain',
      // ✅ CHANGED: Table font size from 9 to 9 (already good, but confirming)
      styles: { fontSize: 9, cellPadding: { top: 1, right: 2, bottom: 1, left: 0 } },
      columnStyles: { 0: { fontStyle: 'bold' } },
    });

    const tableElement = mainElement.querySelector('table');
    
    if (tableElement) {
        autoTable(doc, {
            html: tableElement,
            startY: doc.lastAutoTable.finalY + 5,
            theme: 'grid',
            // ✅ CHANGED: Main table head font size
            headStyles: { fontSize: 9, fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
            // ✅ CHANGED: Main table body font size
            styles: { fontSize: 9 },
        });
    }
    
    doc.save(safeFilename);
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('An error occurred while generating the PDF. Check the console for details.');
  }
};