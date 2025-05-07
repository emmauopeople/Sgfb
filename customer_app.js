// customer_app.js

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import customerRouter from './routes/customer/index.js';
//import expressLayouts from 'express-ejs-layouts';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
//app.use(expressLayouts);

// EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views', 'customer'));
app.set('views', path.join(__dirname, 'views'));
//app.set('layout', 'layouts/customer_layout');


// Routes
app.use('/', customerRouter);


// testing route
app.get('/products/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query('SELECT * FROM products WHERE product_id = ?', [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    } finally {
      connection.release();
    }
  });

// Start Server
const PORT = process.env.CUSTOMER_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🛍️ Customer app running at http://localhost:${PORT}`);
});
