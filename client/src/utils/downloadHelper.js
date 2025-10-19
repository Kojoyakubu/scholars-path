// /client/src/utils/downloadHelper.js

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import HTMLtoDOCX from 'html-docx-js-typescript';

/**
 * ✅ SIMPLE PDF DOWNLOAD (for Students)
 * Generates a PDF from an HTML element using the html2pdf.js library.
 * This is used on the student dashboard for learner notes.
 */
export const downloadAsPdf = (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found for PDF download.`);
    alert('PDF generation failed: Content not found.');
    return;
  }
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
 * ✅ ADVANCED PDF DOWNLOAD (for Teachers)
 * Generates a highly structured PDF for a teacher's lesson note by reading rendered HTML.
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