// routes/customer/index.js

import express from 'express';
import pool from '../../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products');
        res.render('customer/index', { products });
      } catch (err) {
        console.error(err);
        res.status(500).send('Failed to load products.');
      }
    });

    router.get('/products/:id', async (req, res) => {
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

      //route for customer product view
      router.get('/customer_products', async (req, res) => {
        const connection = await pool.getConnection();
        try {
          const [products] = await connection.query('SELECT * FROM products');
          res.render('customer/products', { products });
        } catch (err) {
          console.error('Failed to load products:', err);
          res.status(500).send('Server error');
        } finally {
          connection.release();
        }
      });
      
      

export default router;
