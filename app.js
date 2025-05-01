import express from 'express';
import dotenv from 'dotenv';
import productsRouter from './routes/products.js';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRouter from './routes/admin.js';
dotenv.config();
import expressLayouts from 'express-ejs-layouts';
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for serving images, css, js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));


// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



app.use(expressLayouts);

app.set('layout', 'layouts/admin_dashboard'); // default layout


// Routes
app.use('/products', productsRouter);

// Root route (home page for now)
app.get('/', (req, res) => {
  res.render('index'); // We will create views/index.ejs later
});

//Admin dashboard route


// Admin Dashboard Routes
app.use('/admin', adminRouter);


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
