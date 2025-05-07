import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';



const router = express.Router();

// POST /admin-auth/register
router.post('/register', async (req, res) => {
  const { full_name, username, email, password } = req.body;

  if (!full_name || !username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const connection = await pool.getConnection();

  try {
    // Check for existing user
    const [rows] = await connection.execute(
      'SELECT id FROM staff WHERE username = ? OR email = ?',
      [username, email]
    );

    if (rows.length > 0) {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }

    // Hash and salt password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new staff record
    await connection.execute(
      `INSERT INTO staff (full_name, username, email, password_hash, role)
       VALUES (?, ?, ?, ?, 'staff')`,
      [full_name, username, email, hashedPassword]
    );

    res.json({ message: 'Registration successful. Please log in.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  } finally {
    connection.release();
  }
});


//login router
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
  
    const connection = await pool.getConnection();
  
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM staff WHERE username = ?',
        [username]
      );
  
      if (rows.length === 0) {
        await connection.execute(
          `INSERT INTO login_logs (username, success, user_category, ip_address, user_agent)
           VALUES (?, false, 'staff', ?, ?)`,
          [username, ip, userAgent]
        );
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const user = rows[0];
  
      if (user.login_attempts >= 5) {
        const [result] = await connection.execute(
          'SELECT TIMESTAMPDIFF(MINUTE, last_failed_login, NOW()) AS minutes FROM staff WHERE username = ?',
          [username]
        );
  
        const minutesSinceLastAttempt = result[0].minutes;
  
        if (minutesSinceLastAttempt < 15) {
          return res.status(403).json({ message: 'Account locked. Try again in 15 minutes.' });
        } else {
          await connection.execute(
            'UPDATE staff SET login_attempts = 0 WHERE username = ?',
            [username]
          );
        }
      }
  
      const valid = await bcrypt.compare(password, user.password_hash);
  
      if (valid) {
        await connection.execute(
          'UPDATE staff SET login_attempts = 0 WHERE username = ?',
          [username]
        );
        await connection.execute(
          `INSERT INTO login_logs (username, success, user_category, ip_address, user_agent)
           VALUES (?, true, 'staff', ?, ?)`,
          [username, ip, userAgent]
        );
        return res.json({ success: true, message: 'Login successful' });
      } else {
        await connection.execute(
          `UPDATE staff SET login_attempts = login_attempts + 1, last_failed_login = NOW() WHERE username = ?`,
          [username]
        );
        await connection.execute(
          `INSERT INTO login_logs (username, success, user_category, ip_address, user_agent)
           VALUES (?, false, 'staff', ?, ?)`,
          [username, ip, userAgent]
        );
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Internal server error' });
    } finally {
      connection.release();
    }
  });
  
  // logout route
  router.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).send('Logout failed.');
      }
      res.redirect('/'); // go back to login page
    });
  });
  
  

export default router;
