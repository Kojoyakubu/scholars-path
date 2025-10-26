export const downloadAsPdf = (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found for PDF download.`);
    alert('PDF generation failed: Content to print was not found.');
    return;
  }

  if (!window.html2pdf) {
    console.error('html2pdf.js is not loaded.');
    alert('PDF generation library is not available. Please ensure it is included in your index.html.');
    return;
  }

  const safeFilename = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  // ✅ Inject temporary styling so everything is size 10 in the PDF
  const style = document.createElement('style');
  style.innerHTML = `
    #${elementId} {
      font-size: 10px !important;
      line-height: 1.4 !important;
    }
    #${elementId} table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px !important;
    }
    #${elementId} th,
    #${elementId} td {
      border: 1px solid #000;
      padding: 4px;
      text-align: left;
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
  `;
  document.head.appendChild(style);

  const options = {
    margin: 10,
    filename: safeFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
  };

  // ✅ Generate PDF and then clean up the injected CSS
  window.html2pdf()
    .set(options)
    .from(element)
    .save()
    .then(() => {
      document.head.removeChild(style);
    })
    .catch(() => {
      document.head.removeChild(style);
    });
};
