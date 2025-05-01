import express from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../db.js';

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// GET /products/register - Show registration form
router.get('/register', (req, res) => {
  res.render('product_register');
});

// POST /products/register - Submit registration form
router.post('/register', upload.single('product_image'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { product_name, product_description, price, quantity } = req.body;
    const image_name = req.file.filename;
    

    const sql = `
      INSERT INTO products (product_name, product_description, price, image_name, quantity)
      VALUES (?, ?, ?, ?, ?)
    `;
    await connection.execute(sql, [product_name, product_description, price, image_name, quantity]);

    await connection.commit();

    res.json({ message: 'Product registered successfully!' });
  } catch (err) {
    console.error(err);
    await connection.rollback();
    res.status(500).json({ message: 'Failed to register product' });
  } finally {
    connection.release();
  }
});

// GET /products/api - return all products
router.get('/api', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM products ORDER BY product_id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch products' });
  } finally {
    connection.release();
  }
});

// PUT /products/:id - Update product info
router.put('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { product_name, product_description, price, quantity } = req.body;
    const { id } = req.params;

    const updateQuery = `
      UPDATE products
      SET product_name = ?, product_description = ?, price = ?, quantity = ?
      WHERE product_id = ?
    `;

    await connection.execute(updateQuery, [
      product_name,
      product_description,
      price,
      quantity,
      id
    ]);

    await connection.commit();
    res.json({ message: 'Product updated successfully.' });
  } catch (err) {
    console.error(err);
    await connection.rollback();
    res.status(500).json({ message: 'Failed to update product' });
  } finally {
    connection.release();
  }
});


// DELETE /products/:id - Delete product
router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    await connection.execute('DELETE FROM products WHERE product_id = ?', [id]);

    await connection.commit();
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    console.error(err);
    await connection.rollback();
    res.status(500).json({ message: 'Failed to delete product' });
  } finally {
    connection.release();
  }
});


export default router;
