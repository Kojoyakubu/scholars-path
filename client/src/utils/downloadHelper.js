const sanitizeFileName = (topic, fallbackExtension) => {
  const baseName = String(topic || 'document')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return `${baseName || 'document'}.${fallbackExtension}`;
};

const normalizeMargins = (margin) => {
  if (Array.isArray(margin) && margin.length === 4) {
    return {
      top: margin[0],
      left: margin[1],
      bottom: margin[2],
      right: margin[3],
    };
  }

  const numericMargin = typeof margin === 'number' ? margin : 10;

  return {
    top: numericMargin,
    left: numericMargin,
    bottom: numericMargin,
    right: numericMargin,
  };
};

const triggerDownload = (blob, fileName) => {
  const link = document.createElement('a');
  const objectUrl = URL.createObjectURL(blob);

  link.href = objectUrl;
  link.download = fileName;
  link.click();

  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 0);
};

export const downloadAsPdf = async (elementId, topic, options = {}) => {
  const element = document.getElementById(elementId);
  if (!element) return null;

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const defaultOptions = {
    margin: [10, 10, 10, 10],
    filename: sanitizeFileName(topic, 'pdf'),
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    image: {
      ...defaultOptions.image,
      ...(options.image || {}),
    },
    html2canvas: {
      ...defaultOptions.html2canvas,
      ...(options.html2canvas || {}),
    },
    jsPDF: {
      ...defaultOptions.jsPDF,
      ...(options.jsPDF || {}),
    },
  };

  const canvas = await html2canvas(element, mergedOptions.html2canvas);
  const pdf = new jsPDF(mergedOptions.jsPDF);
  const margins = normalizeMargins(mergedOptions.margin);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const printableWidth = pageWidth - margins.left - margins.right;
  const printableHeight = pageHeight - margins.top - margins.bottom;
  const imageType = (mergedOptions.image.type || 'jpeg').toUpperCase();
  const imageData = canvas.toDataURL(`image/${mergedOptions.image.type || 'jpeg'}`, mergedOptions.image.quality);
  const renderedHeight = (canvas.height * printableWidth) / canvas.width;

  const requestedMaxPages = Number(mergedOptions.maxPages);
  const maxPages = Number.isFinite(requestedMaxPages) && requestedMaxPages > 0
    ? Math.floor(requestedMaxPages)
    : null;

  let drawWidth = printableWidth;
  let drawHeight = renderedHeight;

  if (maxPages) {
    const maxRenderableHeight = printableHeight * maxPages;
    if (drawHeight > maxRenderableHeight) {
      const fitScale = maxRenderableHeight / drawHeight;
      drawWidth *= fitScale;
      drawHeight *= fitScale;
    }
  }

  const drawX = margins.left + (printableWidth - drawWidth) / 2;

  const pageEpsilon = 0.01;
  let remainingHeight = drawHeight;
  let currentPage = 1;
  let offsetY = margins.top;

  pdf.addImage(imageData, imageType, drawX, offsetY, drawWidth, drawHeight);
  remainingHeight -= printableHeight;

  while (remainingHeight > pageEpsilon) {
    if (maxPages && currentPage >= maxPages) {
      break;
    }

    offsetY = remainingHeight - drawHeight + margins.top;
    pdf.addPage();
    pdf.addImage(imageData, imageType, drawX, offsetY, drawWidth, drawHeight);
    remainingHeight -= printableHeight;
    currentPage += 1;
  }

  pdf.save(mergedOptions.filename);
  return pdf;
};

export const downloadAsWord = async (elementId, topic) => {
  const element = document.getElementById(elementId);
  if (!element) return null;

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
          img {
            max-width: 100%;
            height: auto;
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `;

  const blob = new Blob([html], {
    type: 'application/msword;charset=utf-8',
  });
  const fileName = sanitizeFileName(topic, 'doc');

  triggerDownload(blob, fileName);
  return blob;
};
