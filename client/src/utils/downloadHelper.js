// /client/src/utils/downloadHelper.js

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import HTMLtoDOCX from "html-docx-js-typescript";

/**
 * ✅ SMART AUTO-SCALING PDF DOWNLOAD
 * - Automatically fits the content onto one A4 landscape page.
 * - Preserves 10px text, left alignment, and correct proportions.
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

  // Inject global print styling
  const style = document.createElement("style");
  style.innerHTML = `
    #${elementId} {
      box-sizing: border-box !important;
      width: 100% !important;
      max-width: 1123px !important; /* A4 landscape width in px */
      font-size: 10px !important;
      line-height: 1.4 !important;
      text-align: left !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    #${elementId} * {
      box-sizing: border-box !important;
      text-align: left !important;
      font-size: 10px !important;
      line-height: 1.4 !important;
    }
    #${elementId} table {
      width: 100% !important;
      border-collapse: collapse !important;
    }
    #${elementId} th, #${elementId} td {
      border: 1px solid #000 !important;
      padding: 4px !important;
      text-align: left !important;
      vertical-align: top !important;
    }
    #${elementId} th {
      background-color: #f2f2f2 !important;
      font-weight: bold !important;
    }
    #${elementId} p {
      margin-bottom: 0.5em !important;
    }

    /* ✅ Learning Phases width fix */
    #${elementId} table.learning-phases {
      width: 100% !important;
      table-layout: fixed !important;
    }
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

  // A4 landscape in pixels (96 DPI)
  const A4_WIDTH_PX = 1123;
  const A4_HEIGHT_PX = 794;

  // Calculate the actual content height
  const contentHeight = element.scrollHeight;
  const contentWidth = element.scrollWidth || element.offsetWidth || 1000;

  // ✅ Calculate dynamic scale to fit content into A4 landscape
  const scaleX = A4_WIDTH_PX / contentWidth;
  const scaleY = A4_HEIGHT_PX / contentHeight;
  const scale = Math.min(scaleX, scaleY, 1); // don't upscale, only downscale

  const options = {
    margin: 5,
    filename: safeFilename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2 * scale, // scale down proportionally
      useCORS: true,
      scrollY: 0,
      windowWidth: contentWidth,
      windowHeight: contentHeight,
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  window
    .html2pdf()
    .set(options)
    .from(element)
    .save()
    .then(() => document.head.removeChild(style))
    .catch((err) => {
      console.error("html2pdf error:", err);
      document.head.removeChild(style);
    });
};

/**
 * ✅ WORD DOWNLOAD
 * Matches PDF layout, left-aligned and 10px text
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
        body {
          margin: 0;
          padding: 0;
          font-size: 10px;
          line-height: 1.4;
          text-align: left;
        }
        * {
          text-align: left;
          font-size: 10px;
          line-height: 1.4;
        }
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

        /* Learning Phases width fix */
        table.learning-phases {
          width: 100%;
          table-layout: fixed;
        }
        table.learning-phases th:nth-of-type(1),
        table.learning-phases td:nth-of-type(1) {
          width: 25%;
        }
        table.learning-phases th:nth-of-type(2),
        table.learning-phases td:nth-of-type(2) {
          width: 50%;
        }
        table.learning-phases th:nth-of-type(3),
        table.learning-phases td:nth-of-type(3) {
          width: 25%;
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
