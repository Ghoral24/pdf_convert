const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const path = require("path");

/**
 * Generates a PDF from provided HTML content.
 * @param {string} htmlContent - The full HTML string to render
 * @param {string} [outputPath] - Optional path to save the PDF file
 * @returns {Promise<Buffer>} - The generated PDF buffer
 */
async function generateInvoicePdf(htmlContent, outputPath = null) {
  const browser = await puppeteer.launch({
    headless: "shell", // Updated for newer Puppeteer versions
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage", // Critical for Docker
      "--allow-file-access-from-files",
    ],
  });

  try {
    const page = await browser.newPage();

    // We use networkidle0 to ensure images and external fonts are loaded
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    });

    if (outputPath) {
      await fs.outputFile(outputPath, pdfBuffer);
      console.log(`PDF successfully saved to: ${outputPath}`);
    }

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = { generateInvoicePdf };
