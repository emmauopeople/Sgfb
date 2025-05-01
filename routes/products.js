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


// GET /products/report?type=stock|low_stock|valuation
router.get('/report', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { type } = req.query;
    const [products] = await connection.query('SELECT product_id, product_name, price, quantity FROM products');

    if (type === 'stock') {
      res.json(products);
    } else if (type === 'low_stock') {
      const lowStock = products.filter(p => p.quantity <= 10);
      res.json(lowStock);
    } else if (type === 'valuation') {
      res.json(products.map(p => ({
        product_name: p.product_name,
        price: parseFloat(p.price),
        quantity: p.quantity
      })));
    } else {
      res.status(400).json({ message: 'Invalid report type' });
    }
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ message: 'Error generating report' });
  } finally {
    connection.release();
  }
});


// routes/products.js (add this route below the report API)

import PDFDocument from 'pdfkit';
import fs from 'fs';


router.get('/report/pdf', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { type } = req.query;
    const [products] = await connection.query('SELECT product_name, price, quantity FROM products');

    const doc = new PDFDocument({ margin: 40 });
    const fileName = `${type}_report.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');

    // Pipe to response
    doc.pipe(res);

    // Logo
    const logoPath = path.join('public', 'images', 'logo.jpg');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, { fit: [100, 100], align: 'left' });
    }

    doc.moveDown();
    doc.fontSize(18).text('Smells Good Feel Better', { align: 'left' });
    doc.fontSize(14).text(`${type.replace('_', ' ').toUpperCase()} REPORT`, { align: 'left' });
    doc.moveDown(1);

    // Table header
    doc.fontSize(12).text('Product', 50, doc.y, { continued: true })
      .text('Price ($)', 250, doc.y, { continued: true })
      .text('Qty', 350, doc.y, { continued: true })
      .text('Total ($)', 450, doc.y);
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    let total = 0;

    const rows =
      type === 'low_stock' ? products.filter(p => p.quantity <= 10) :
      type === 'valuation' ? products :
      products;

    rows.forEach(p => {
      const price = parseFloat(p.price);
      const quantity = parseInt(p.quantity, 10);
      const value = price * quantity;
      doc.text(p.product_name, 50, doc.y, { continued: true })
      .text(`$${price.toFixed(2)}`, 250, doc.y, { continued: true })
      .text(quantity.toString(), 350, doc.y, { continued: true })
      .text(`$${value.toFixed(2)}`, 450, doc.y);
    });

    if (type === 'valuation') {
      doc.moveDown(1);
      doc.font('Helvetica-Bold').text('Total Inventory Value:', 350, doc.y, { continued: true })
        .text(`$${total.toFixed(2)}`, 450, doc.y);
    }

    doc.end();
  } catch (err) {
    console.error('PDF report error:', err);
    res.status(500).send('Could not generate PDF');
  } finally {
    connection.release();
  }
});




export default router;
