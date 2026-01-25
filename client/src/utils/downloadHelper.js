export const downloadAsPdf = (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element || !window.html2pdf) return;

  window.html2pdf().set({
    margin: [15, 15, 15, 15],
    filename: `${topic.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(element).save();
};
