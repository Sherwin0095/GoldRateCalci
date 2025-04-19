const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 3000;

// Setup DB connection with promise support
const db = mysql.createConnection({
  host: 'localhost',
  user: 'Richard',
  password: '123456',
  database: 'golddata'
}).promise();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

// Serve homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Get all unique product types
app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT DISTINCT product_type FROM gold_products");
    const types = rows.map(row => row.product_type);
    res.json(types);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get all subtypes of a product type with image and variant data (including model_number)
app.get("/api/products/:type", async (req, res) => {
  const type = req.params.type;

  try {
    const [subtypes] = await db.query(
      "SELECT * FROM gold_products WHERE product_type = ?",
      [type]
    );

    const result = await Promise.all(
      subtypes.map(async (row) => {
        const [variants] = await db.query(
          `SELECT gram, making_charge, wastage, tax, model_number
           FROM gold_product_variants
           WHERE product_id = ?`,
          [row.product_id]
        );

        return {
          key: row.subtype_key,
          name: row.subtype_name,
          image: row.image,
          variants: variants.map(v => ({
            gram: v.gram,
            making_charge: v.making_charge,
            wastage: v.wastage,
            tax: v.tax,
            model_number: v.model_number // ✅ Include model number
          }))
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
