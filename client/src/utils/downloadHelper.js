// /client/src/utils/downloadHelper.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import HTMLtoDOCX from 'html-docx-js-typescript';

/**
 * Generates and downloads a PDF from an HTML element.
 * Relies on the html2pdf.js library being loaded (either globally or imported).
 */
export const downloadAsPdf = (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found for PDF download.`);
    return;
  }
  if (!window.html2pdf) {
    console.error('html2pdf.js is not loaded.');
    alert('PDF generation library is not available.');
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
 * Generates a highly structured PDF for a teacher's lesson note.
 * This is more advanced than a simple HTML-to-PDF conversion.
 */
export const downloadLessonNoteAsPdf = (markdownContent, topic) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const finalY = 15;
    const safeFilename = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    // Helper to extract key-value pairs from the header markdown
    const extractHeaderData = (content) => {
      const lines = content.split('\n');
      const headerLines = [];
      for (const line of lines) {
        if (line.includes(':') && !line.trim().startsWith('|')) {
          const [label, ...valueParts] = line.split(':');
          headerLines.push([label.replace(/[\*\#]/g, '').trim(), valueParts.join(':').trim()]);
        }
      }
      return headerLines;
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TEACHER INFORMATION', doc.internal.pageSize.width / 2, finalY, { align: 'center' });

    autoTable(doc, {
      startY: finalY + 2,
      body: extractHeaderData(markdownContent),
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: { top: 0, right: 2, bottom: 1, left: 0 } },
      columnStyles: { 0: { fontStyle: 'bold' } },
    });

    // We need to render the markdown table to an invisible element to use autoTable's HTML plugin
    const tableContainer = document.createElement('div');
    tableContainer.style.display = 'none';
    // A simple regex to find the markdown table
    const tableMatch = markdownContent.match(/\|[\s\S]*\|/);
    if (tableMatch) {
        const tableMarkdown = tableMatch[0];
        const tableHtml = `<table>${tableMarkdown.replace(/\|([^\|]+)\|/g, '<td>$1</td>').replace(/\n/g, '</tr><tr>')}</tr></table>`;
        tableContainer.innerHTML = tableHtml;
        document.body.appendChild(tableContainer);

        autoTable(doc, {
            html: tableContainer,
            startY: doc.lastAutoTable.finalY + 5,
            theme: 'grid',
            headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
        });
        document.body.removeChild(tableContainer);
    }
    
    doc.save(safeFilename);
  } catch (error) {
    console.error('Advanced PDF generation error:', error);
    alert('An error occurred while generating the PDF.');
  }
};