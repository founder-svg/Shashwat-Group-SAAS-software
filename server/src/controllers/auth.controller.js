const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { initDatabase, mockData } = require('../../../database/connection');

const db = initDatabase();

async function register(req, res, next) {
  try {
    const { firstName, lastName, email, password, organizationName, phone } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide firstName, email, and password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (db.isMock) {
      const newUser = {
        id: `mock-user-${Date.now()}`,
        first_name: firstName,
        last_name: lastName || '',
        email,
        role: 'admin',
        phone: phone || ''
      };
      mockData.users.push(newUser);

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      return res.status(201).json({
        success: true,
        message: 'User registered successfully (Demo Mode)',
        token,
        user: newUser
      });
    }

    // Production Postgres Query
    const checkUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // Create or find organization
    const orgResult = await db.query(
      'INSERT INTO organizations (name, slug) VALUES ($1, $2) RETURNING id',
      [organizationName || 'Shashwat Group', (organizationName || 'shashwat-group').toLowerCase().replace(/\s+/g, '-')]
    );
    const orgId = orgResult.rows[0].id;

    const userResult = await db.query(
      `INSERT INTO users (organization_id, first_name, last_name, email, password_hash, role, phone)
       VALUES ($1, $2, $3, $4, $5, 'admin', $6)
       RETURNING id, first_name, last_name, email, role`,
      [orgId, firstName, lastName, email, passwordHash, phone]
    );

    const createdUser = userResult.rows[0];
    const token = jwt.sign(
      { id: createdUser.id, email: createdUser.email, role: createdUser.role, orgId },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: createdUser
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (db.isMock) {
      const user = mockData.users.find(u => u.email === email) || mockData.users[0];
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );
      return res.json({
        success: true,
        message: 'Login successful (Demo Mode)',
        token,
        user
      });
    }

    const result = await db.query(
      'SELECT id, organization_id, first_name, last_name, email, password_hash, role, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, orgId: user.organization_id },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    delete user.password_hash;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getProfile
};
