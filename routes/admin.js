// routes/admin.js

import express from 'express';
const router = express.Router();

// GET /admin/register - Product Registration page
router.get('/register', (req, res) => {
  res.render('admin/product_register', { layout: 'layouts/admin_dashboard' });
});

// Future Routes (Inventory, Update, Report, Sales etc.)
router.get('/inventory', (req, res) => {
  res.render('admin/inventory', {
    layout: 'layouts/admin_dashboard',
    pageScript: 'inventory_script.js'  // ✅ Only loads on this page
  });
});

router.get('/update', (req, res) => {
  res.render('admin/update_inventory', {
    layout: 'layouts/admin_dashboard',
    pageScript: 'update_inventory_script.js' // loads your JS dynamically
  });
});


router.get('/update', (req, res) => {
  res.render('admin/update_inventory', {
    layout: 'layouts/admin_dashboard',
    pageScript: 'update_inventory_script.js' // loads your JS dynamically
  });
});


router.get('/report', (req, res) => {
  res.render('admin/report', {
    layout: 'layouts/admin_dashboard',
    pageScript: 'report_script.js'
  });
});


router.get('/sales', (req, res) => {
  res.render('admin/sales_report', { layout: 'layouts/admin_dashboard' });
});

router.get('/inventory', (req, res) => {
  res.render('admin/inventory', { layout: 'layouts/admin_dashboard' });
});


export default router;
