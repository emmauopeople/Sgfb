import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import adminAuthRouter from '../routes/admin_auth.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/admin-auth', adminAuthRouter);

describe('Admin Authentication Routes', () => {

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    await pool.execute(
      'INSERT INTO staff (full_name, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      ['Test User', 'testadmin', 'testadmin@example.com', hashedPassword, 'staff']
    );
  });

  afterAll(async () => {
    await pool.execute('DELETE FROM staff WHERE username IN (?, ?)', ['testadmin', 'janedoe']);
    await pool.end(); // Explicitly close the DB connection
  });

  test('POST /admin-auth/register should successfully register a new admin', async () => {
    const response = await request(app)
      .post('/admin-auth/register')
      .send({
        full_name: "Jane Doe",
        username: "janedoe",
        email: "janedoe@example.com",
        password: "Secure@123"
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Registration successful. Please log in.");
  });

  test('POST /admin-auth/register should fail if username/email already exists', async () => {
    const response = await request(app)
      .post('/admin-auth/register')
      .send({
        full_name: "Duplicate User",
        username: "testadmin",
        email: "testadmin@example.com",
        password: "Secure@123"
      });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("message", "Username or email already exists.");
  });

  test('POST /admin-auth/login should login with correct credentials', async () => {
    const response = await request(app)
      .post('/admin-auth/login')
      .send({
        username: "testadmin",
        password: "Test@123"
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Login successful");
  });

  test('POST /admin-auth/login should fail with incorrect credentials', async () => {
    const response = await request(app)
      .post('/admin-auth/login')
      .send({
        username: "testadmin",
        password: "wrongpassword"
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid credentials");
  });

  test('GET /admin-auth/logout should redirect to home page', async () => {
    const response = await request(app).get('/admin-auth/logout');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/');
  });

});
