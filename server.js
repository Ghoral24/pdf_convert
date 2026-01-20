const express = require("express");
const cors = require("cors");
const { generateInvoicePdf } = require("./utils/pdfGenerator");

const app = express();
const PORT = process.env.PORT || 3001;

// Increase limit to handle large HTML templates
app.use(express.json({ limit: "50mb" }));
app.use(cors());

// Health check / Root
app.get("/", (req, res) => {
  res.send(
    "PDF Conversion Service is running. Use /generate-pdf to create PDFs.",
  );
});

app.post("/generate-pdf", async (req, res) => {
  const { html, filename } = req.body;

  if (!html) {
    return res.status(400).json({ error: "HTML content is required" });
  }

  console.log(
    `[${new Date().toISOString()}] Incoming PDF generation request for: ${filename || "unnamed"}`,
  );

  try {
    const pdfBuffer = await generateInvoicePdf(html);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${filename || "invoice"}.pdf`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res
      .status(500)
      .json({ error: "Error generating PDF", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
