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
 * This is a more robust method.
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
        // The AI prompt creates bolded labels. We find them.
        const boldElements = element.querySelectorAll('strong');
        boldElements.forEach(strong => {
            const label = strong.innerText.replace(':', '').trim();
            const parent = strong.parentElement;
            // Get the text of the parent element and remove the label part to get the value
            const value = parent.innerText.replace(strong.innerText, '').trim();
            headerData.push([label, value]);
        });
        return headerData;
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TEACHER INFORMATION', doc.internal.pageSize.width / 2, 15, { align: 'center' });

    autoTable(doc, {
      startY: 20,
      body: extractHeaderData(mainElement),
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: { top: 1, right: 2, bottom: 1, left: 0 } },
      columnStyles: { 0: { fontStyle: 'bold' } },
    });

    // Find the rendered table element on the page
    const tableElement = mainElement.querySelector('table');
    
    if (tableElement) {
        autoTable(doc, {
            html: tableElement,
            startY: doc.lastAutoTable.finalY + 5,
            theme: 'grid',
            headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
        });
    }
    
    doc.save(safeFilename);
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('An error occurred while generating the PDF. Check the console for details.');
  }
};