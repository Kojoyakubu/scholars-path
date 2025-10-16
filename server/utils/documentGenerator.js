// backend/utils/documentGenerator.js

const puppeteer = require('puppeteer');
const { marked } = require('marked');

/**
 * @desc    Generates a PDF buffer from Markdown content.
 * @param   {string} markdownContent - The markdown string from the database.
 * @returns {Promise<Buffer>} A promise that resolves with the PDF buffer.
 */
async function generatePdf(markdownContent) {
  // Convert Markdown to HTML
  const htmlContent = marked.parse(markdownContent);

  // Styling to make the PDF look good
  const styledHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 10pt; line-height: 1.5; }
          h3 { font-size: 12pt; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #999; padding: 8px; text-align: left; vertical-align: top; }
          th { background-color: #f2f2f2; font-weight: bold; }
          br { display: block; margin: 8px 0; content: ""; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;

  let browser;
  try {
    // Launch a headless browser instance
    browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for running in many server environments
    });
    const page = await browser.newPage();

    // Set the HTML content of the page
    await page.setContent(styledHtml, { waitUntil: 'networkidle0' });

    // Generate the PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });

    return pdfBuffer;
  } finally {
    // Ensure the browser is closed
    if (browser) {
      await browser.close();
    }
  }
}

// You can add a generateDocx function here in the future using a library like 'docx'
// async function generateDocx(markdownContent) { /* ... */ }

module.exports = { generatePdf };