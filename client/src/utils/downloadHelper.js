// /client/src/utils/downloadHelper.js

import HTMLtoDOCX from 'html-docx-js-typescript';

/**
 * ✅ THE ONLY PDF FUNCTION YOU NEED
 * Generates a PDF from any HTML element using the html2pdf.js library.
 * This function works for both the student and teacher dashboards.
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
    alert('PDF generation library is not available. Please refresh the page.');
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

  // This command does all the work of capturing the element and saving it as a PDF
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