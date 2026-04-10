const axios = require("axios");
const pdfParse = require("pdf-parse");

async function extractTextFromPDF(url) {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        Accept: "application/pdf",
      },
    });

    // PARSE PDF
    const data = await pdfParse(response.data);

    //  CLEAN TEXT
    const cleanedText = data.text
      .replace(/\n\s*\n/g, "\n")
      .replace(/\s+/g, " ")
      .trim();

    // DEBUG LOG
    console.log("TEXT LENGTH:", cleanedText.length);

    return cleanedText;
  } catch (err) {
    console.log("PDF Parsing Error:", err.message);
    return null;
  }
}

module.exports = extractTextFromPDF;
