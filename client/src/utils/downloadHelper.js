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

  // ✅ Temporarily apply PDF-only styling (font size 10)
  const originalFontSize = element.style.fontSize;
  const originalLineHeight = element.style.lineHeight;
  element.style.fontSize = '10px';
  element.style.lineHeight = '1.4';

  const options = {
    margin: 10,
    filename: safeFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }, // ✅ landscape mode
  };

  window.html2pdf()
    .set(options)
    .from(element)
    .save()
    .then(() => {
      // ✅ Restore the original styling after download
      element.style.fontSize = originalFontSize;
      element.style.lineHeight = originalLineHeight;
    });
};
