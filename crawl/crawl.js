const express = require("express");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const ExcelJS = require("exceljs");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post("/crawlAndSave", async (req, res) => {
  try {
    const { url, classNames, fileName } = req.body;
    if (
      !url ||
      !classNames ||
      !Array.isArray(classNames) ||
      classNames.length === 0 ||
      !fileName
    ) {
      return res.status(400).json({ error: "Thiếu thông tin đầu vào." });
    }

    const products = await crawlData(url, classNames);
    const filePath = await saveToExcel(products, fileName);

    const fileContent = fs.readFileSync(filePath, { encoding: "base64" });
    fs.unlinkSync(filePath); // Xóa tệp Excel trên máy chủ sau khi chuyển đổi thành base64

    res.json({
      message: `Dữ liệu Excel đã được chuyển đổi thành công.`,
      status: true,
      file: fileContent,
    });
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).json({ error: "Lỗi Nội bộ của máy chủ", status: false });
  }
});

async function crawlData(url, classNames) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);
  const htmlContent = await page.content();
  const $ = cheerio.load(htmlContent);

  const products = [];
  $(".product").each((index, element) => {
    const productData = {};

    classNames.forEach((className) => {
      productData[className] = $(element).find(`.${className}`).text();
    });

    products.push(productData);
  });

  await browser.close();

  return products;
}

async function saveToExcel(products, fileName) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sản phẩm");

  const headerRow = {};
  products.forEach((product) => {
    Object.keys(product).forEach((key) => {
      headerRow[key] = true;
    });
  });

  worksheet.columns = Object.keys(headerRow).map((header) => ({
    header,
    key: header,
    width: 30,
  }));

  products.forEach((product) => {
    worksheet.addRow(product);
  });

  const outputPath = path.join(__dirname, fileName);
  try {
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Tệp Excel "${outputPath}" đã được tạo thành công.`);
    return outputPath;
  } catch (error) {
    console.error("Lỗi khi tạo tệp Excel:", error);
    throw error;
  }
}

app.listen(port, () => {
  console.log(`Máy chủ đang chạy tại http://localhost:${port}`);
});
