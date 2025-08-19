import request from 'supertest';
import express from 'express';
import router from '../routes/customer/index.js';
import pool from '../db.js';

const app = express();

// explicitly configure view engine and views directory
app.set("view engine", "ejs");
app.set("views", "views"); // adjust if your views directory is structured differently

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', router);

describe('Customer Routes', () => {
    test('GET / should return products page', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
    });

    test('GET /products/:id should return product data', async () => {
        const response = await request(app).get('/products/1');
        if (response.status === 200) {
            expect(response.body).toHaveProperty('product_id');
        } else {
            expect(response.status).toBe(404);
        }
    });

    test('GET /customer_products should return products view', async () => {
        const response = await request(app).get('/customer_products');
        expect(response.status).toBe(200);
    });

    test('POST /sendmail should send email when correct data is provided', async () => {
        const response = await request(app).post('/sendmail').send({
            customerEmail: "test@example.com",
            subject: "Inquiry",
            text: "Hello, I have a question."
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Message sent to store owner!");
    });

    test('POST /sendmail should return 400 if missing required fields', async () => {
        const response = await request(app).post('/sendmail').send({});
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Missing required fields");
    });
});



// After all tests finish
afterAll(async () => {
  await pool.end(); // explicitly close mysql2 connection pool
});
