import request from 'supertest';
import express from 'express';
import adminRouter from '../routes/admin.js';
import pool from '../db.js';

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/admin', adminRouter);

describe('Admin Routes', () => {
  
  test('GET /admin/register should return product registration page', async () => {
    const response = await request(app).get('/admin/register');
    expect(response.status).toBe(200);
  });

  test('GET /admin/inventory should return inventory page', async () => {
    const response = await request(app).get('/admin/inventory');
    expect(response.status).toBe(200);
  });

  test('GET /admin/report should return report page', async () => {
    const response = await request(app).get('/admin/report');
    expect(response.status).toBe(200);
  });

  test('GET /admin/sales should return sales report page', async () => {
    const response = await request(app).get('/admin/sales');
    expect(response.status).toBe(200);
  });

});

// Close database connection after tests
afterAll(async () => {
  await pool.end();
});
