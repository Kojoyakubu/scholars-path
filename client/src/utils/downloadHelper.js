// /client/src/utils/downloadHelper.js

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import HTMLtoDOCX from "html-docx-js-typescript";

/**
 * ✅ SMART LANDSCAPE PDF DOWNLOAD
 * Auto-scales OR splits across multiple pages if content is too tall.
 */
export const downloadAsPdf = async (elementId, topic) => {
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

  // ✅ Inject styling for consistent formatting
  const style = document.createElement("style");
  style.innerHTML = `
    #${elementId} {
      font-size: 10px !important;
      line-height: 1.4 !important;
      text-align: left !important;
      width: 100% !important;
      max-width: 1123px !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
    }
    #${elementId} * {
      text-align: left !important;
      font-size: 10px !important;
      line-height: 1.4 !important;
      box-sizing: border-box !important;
    }
    #${elementId} table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px !important;
    }
    #${elementId} th, #${elementId} td {
      border: 1px solid #000;
      padding: 4px;
      text-align: left !important;
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

    /* ✅ Learning Phases explicit pixel widths */
    #${elementId} table.learning-phases {
      width: 100% !important;
      table-layout: fixed !important;
    }
    #${elementId} table.learning-phases th:nth-of-type(1),
    #${elementId} table.learning-phases td:nth-of-type(1) {
      width: 180px !important;
    }
    #${elementId} table.learning-phases th:nth-of-type(2),
    #${elementId} table.learning-phases td:nth-of-type(2) {
      width: 360px !important;
    }
    #${elementId} table.learning-phases th:nth-of-type(3),
    #${elementId} table.learning-phases td:nth-of-type(3) {
      width: 180px !important;
    }
  `;
  document.head.appendChild(style);

  // ✅ PDF constants
  const A4_WIDTH_PX = 1123;
  const A4_HEIGHT_PX = 794;

  const contentHeight = element.scrollHeight;
  const contentWidth = element.scrollWidth || element.offsetWidth || 1000;

  // Compute scale ratio
  const scaleX = A4_WIDTH_PX / contentWidth;
  const scaleY = A4_HEIGHT_PX / contentHeight;
  const fitScale = Math.min(scaleX, scaleY);

  // Minimum readable font threshold — if scale would shrink below this, split pages
  const tooSmall = fitScale < 0.65;

  // Helper to render one or multiple pages
  const renderToPdf = (options) =>
    window.html2pdf().set(options).from(element).save().finally(() => {
      document.head.removeChild(style);
    });

  if (!tooSmall) {
    // ✅ Fit content on one page with scaling
    const options = {
      margin: [5, 8, 5, 8],
      filename: safeFilename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2 * fitScale,
        useCORS: true,
        scrollY: 0,
        windowWidth: A4_WIDTH_PX,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    };

    await renderToPdf(options);
  } else {
    // ✅ Split into multiple landscape pages
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      scrollY: 0,
    });
    const imgData = canvas.toDataURL("image/jpeg", 1.0);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(safeFilename);
    document.head.removeChild(style);
  }
};

/**
 * ✅ WORD DOWNLOAD
 * Matches PDF styling — 10px font, left-aligned
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
        body { font-size: 10px; line-height: 1.4; text-align: left; margin: 0; padding: 0; }
        * { text-align: left; font-size: 10px; line-height: 1.4; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 10px;
        }
        th, td {
          border: 1px solid #000;
          padding: 4px;
          text-align: left;
          vertical-align: top;
          font-size: 10px;
        }
        th { background: #f0f0f0; font-weight: bold; }
        p { margin-bottom: 0.5em; }

        /* ✅ Learning Phases explicit pixel widths */
        table.learning-phases {
          width: 100%;
          table-layout: fixed;
        }
        table.learning-phases th:nth-of-type(1),
        table.learning-phases td:nth-of-type(1) {
          width: 180px;
        }
        table.learning-phases th:nth-of-type(2),
        table.learning-phases td:nth-of-type(2) {
          width: 360px;
        }
        table.learning-phases th:nth-of-type(3),
        table.learning-phases td:nth-of-type(3) {
          width: 180px;
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
