export const downloadAsPdf = (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element || !window.html2pdf) return;

  window.html2pdf().set({
    margin: [10, 10, 10, 10],
    filename: `${topic.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(element).save();
};

// ================= WORD EXPORT =================
export const downloadAsWord = async (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 12pt;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #000;
            padding: 4pt;
            vertical-align: top;
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `;

  try {
    const fileBuffer = await HTMLtoDOCX(html);
    const blob = new Blob([fileBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
    link.click();
  } catch (error) {
    console.error(error);
  }
};
