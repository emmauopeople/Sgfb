import express from "express";
import path from "path";
import fs from "fs/promises";
import multer from "multer";
import authToken from "../middleware/authToken.js";
// Adjust this import to match your db export. If your db file exports `pool`:
import  pool  from "../db.js"; // If default export, use: import pool from "../db.js";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Absolute path to images dir: /sgfb/public/images
const IMAGES_DIR = path.join(__dirname, "..", "public", "images");

// Multer storage identical to your working route
const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, IMAGES_DIR);
  },
  filename(_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, "product_image-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter(_req, file, cb) {
    const ok = ["image/jpeg", "image/png"].includes(file.mimetype);
    cb(ok ? null : new Error("Only JPEG/PNG allowed"), ok);
  },
});

// POST https://admin.smellsgoodfeelbeter.com/api/mobile/products
// multipart/form-data: product_name, product_description?, price, quantity, product_image(file)
router.post("/products", authToken, upload.single("product_image"), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { product_name, product_description, price, quantity } = req.body;
    if (!product_name || !price || !quantity || !req.file) {
      if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    await connection.beginTransaction();

    const image_name = req.file.filename;

    const sql = `
      INSERT INTO products (product_name, product_description, price, image_name, quantity)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await connection.execute(sql, [
      String(product_name),
      product_description ? String(product_description) : "",
      Number(price),
      image_name,
      Number(quantity),
    ]);

    await connection.commit();

    const base = process.env.PUBLIC_BASE_URL || "";
    const image_url = base ? `${base}/images/${image_name}` : `/images/${image_name}`;

    return res.status(201).json({
      success: true,
      product: {
        id: result.insertId,
        product_name,
        image_name,
        image_url,
      },
    });
  } catch (err) {
    console.error(err);
    await connection.rollback().catch(() => {});
    if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
    return res.status(500).json({ success: false, message: "Upload failed" });
  } finally {
    connection.release();
  }
});

router.get('/products', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ message: 'Server error fetching products' });
  } finally {
    connection.release();
  }
});

router.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { product_name, product_description, price, quantity, image } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE products 
       SET product_name = ?, 
           product_description = ?, 
           price = ?, 
           quantity = ?, 
           image_name = ? 
       WHERE id = ?`,
      [product_name, product_description, price, quantity, image?.uri || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



export default router;
