// /client/src/utils/downloadHelper.js
import jsPDF from "jspdf";
import HTMLtoDOCX from "html-docx-js-typescript";

/**
 * CLEAN LANDSCAPE PDF DOWNLOAD
 * 10px text, left-aligned, phase 2 column wider, no distortion.
 */
export const downloadAsPdf = (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert("PDF generation failed: content not found.");
    return;
  }
  if (!window.html2pdf) {
    alert("html2pdf.js is not loaded.");
    return;
  }

  const safeFilename = `${topic.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

  // Inject minimal but strict formatting
  const style = document.createElement("style");
  style.innerHTML = `
    #${elementId} {
      font-size: 10px !important;
      line-height: 1.4 !important;
      text-align: left !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    #${elementId} * {
      font-size: 10px !important;
      text-align: left !important;
      line-height: 1.4 !important;
    }
    #${elementId} table {
      width: 100% !important;
      border-collapse: collapse !important;
      table-layout: fixed !important;
    }
    #${elementId} th, #${elementId} td {
      border: 1px solid #000 !important;
      padding: 4px !important;
      vertical-align: top !important;
    }
    #${elementId} th {
      background: #f2f2f2 !important;
      font-weight: bold !important;
    }
    /* ✅ This CSS now correctly targets the table */
    #${elementId} table.learning-phases th:nth-of-type(1),
    #${elementId} table.learning-phases td:nth-of-type(1) {
      width: 25% !important;
    }
    #${elementId} table.learning-phases th:nth-of-type(2),
    #${elementId} table.learning-phases td:nth-of-type(2) {
      width: 50% !important;
    }
    #${elementId} table.learning-phases th:nth-of-type(3),
    #${elementId} table.learning-phases td:nth-of-type(3) {
      width: 25% !important;
    }
  `;
  document.head.appendChild(style);

  const options = {
    margin: [5, 5, 5, 5],
    filename: safeFilename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      scrollY: 0,
      windowWidth: element.scrollWidth || 1123,
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
  };

  window
    .html2pdf()
    .set(options)
    .from(element)
    .save()
    .then(() => document.head.removeChild(style))
    .catch((err) => {
      console.error("PDF error:", err);
      document.head.removeChild(style);
    });
};

/**
 * WORD DOWNLOAD — same look as PDF
 */
export const downloadAsWord = async (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert("An error occurred while generating the Word document.");
    return;
  }

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body { font-size: 10px; line-height: 1.4; text-align: left; }
      * { text-align: left; font-size: 10px; line-height: 1.4; }
      table { width: 100%; border-collapse: collapse; font-size: 10px; }
      th, td { border: 1px solid #000; padding: 4px; vertical-align: top; }
      th { background: #f2f2f2; font-weight: bold; }
      table.learning-phases { table-layout: fixed; width: 100%; }
      table.learning-phases th:nth-of-type(1),
      table.learning-phases td:nth-of-type(1) { width: 25%; }
      table.learning-phases th:nth-of-type(2),
      table.learning-phases td:nth-of-type(2) { width: 50%; }
      table.learning-phases th:nth-of-type(3),
      table.learning-phases td:nth-of-type(3) { width: 25%; }
    </style>
  </head>
  <body>${element.innerHTML}</body>
  </html>`;

  try {
    const fileBuffer = await HTMLtoDOCX(html);
    const blob = new Blob([fileBuffer], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const safeFilename = `${topic.replace(/[^a-zA-Z0-9]/g, "_")}.docx`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Word generation failed:", error);
    alert("An error occurred while generating the Word document.");
  }
};