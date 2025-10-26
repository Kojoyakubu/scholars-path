// /client/src/utils/downloadHelper.js

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import HTMLtoDOCX from "html-docx-js-typescript";

/**
 * ✅ AUTO-SCALING LANDSCAPE PDF DOWNLOAD
 * - Landscape layout
 * - Font size: 10px, all text left-aligned
 * - Automatically scales content to fit a single A4 landscape page
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

  // ✅ Inject styling for uniformity
  const style = document.createElement("style");
  style.innerHTML = `
    #${elementId} {
      font-size: 10px !important;
      line-height: 1.4 !important;
      text-align: left !important;
      width: 100% !important;
      max-width: 1123px !important; /* A4 landscape width */
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

  // ✅ A4 landscape dimensions in pixels (96 DPI)
  const A4_WIDTH_PX = 1123;
  const A4_HEIGHT_PX = 794;

  // Measure content dimensions
  const contentWidth = element.scrollWidth || element.offsetWidth || 1000;
  const contentHeight = element.scrollHeight || 1000;

  // ✅ Compute scaling ratio to fit content inside one landscape page
  const scaleX = A4_WIDTH_PX / contentWidth;
  const scaleY = A4_HEIGHT_PX / contentHeight;
  const fitScale = Math.min(scaleX, scaleY, 1);

  const options = {
    margin: [5, 8, 5, 8], // top, right, bottom, left
    filename: safeFilename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2 * fitScale, // ✅ apply dynamic scale
      useCORS: true,
      scrollY: 0,
      windowWidth: A4_WIDTH_PX,
      windowHeight: A4_HEIGHT_PX,
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
    .catch(() => document.head.removeChild(style));
};

/**
 * ✅ WORD DOWNLOAD
 * Matches PDF styling — 10px font, left-aligned,
 * Learning Phases column widths fixed at 180 / 360 / 180 px.
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

/**
 * ✅ ADVANCED PDF DOWNLOAD (Structured layout, optional)
 */
export const downloadLessonNoteAsPdf = (elementId, topic) => {
  try {
    const mainElement = document.getElementById(elementId);
    if (!mainElement)
      throw new Error(`Element with ID "${elementId}" not found.`);

    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const safeFilename = `${topic.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

    const extractHeaderData = (element) => {
      const headerData = [];
      const boldElements = element.querySelectorAll("strong");
      boldElements.forEach((strong) => {
        const label = strong.innerText.replace(":", "").trim();
        const parent = strong.parentElement;
        const value = parent.innerText.replace(strong.innerText, "").trim();
        if (label && value) headerData.push([label, value]);
      });
      return headerData;
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(
      "TEACHER INFORMATION",
      doc.internal.pageSize.width / 2,
      15,
      { align: "center" }
    );

    autoTable(doc, {
      startY: 20,
      body: extractHeaderData(mainElement),
      theme: "plain",
      styles: { fontSize: 9, cellPadding: { top: 1, right: 2, bottom: 1, left: 0 } },
      columnStyles: { 0: { fontStyle: "bold" } },
    });

    const tableElement = mainElement.querySelector("table");
    if (tableElement) {
      autoTable(doc, {
        html: tableElement,
        startY: doc.lastAutoTable.finalY + 5,
        theme: "grid",
        headStyles: {
          fontSize: 9,
          fillColor: [220, 220, 220],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          halign: "center",
        },
        styles: { fontSize: 9, halign: "left" },
      });
    }

    doc.save(safeFilename);
  } catch (error) {
    console.error("PDF generation error:", error);
    alert("An error occurred while generating the PDF.");
  }
};
