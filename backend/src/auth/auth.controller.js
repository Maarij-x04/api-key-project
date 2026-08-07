const bcrypt = require('bcrypt');
const userModel = require('../users/user.model');
const { signToken } = require('../common/jwt');
const auditService = require('../audit/audit.service');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userModel.createUser({ name, email, passwordHash });
    

    await auditService.logAction({
      userId: user.id,
      entityType: 'user',
      entityId: user.id,
      action: 'registered',
      ipAddress: req.ip,
    });

    //const token = signToken({ id: user.id, email: user.email });
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await auditService.logAction({
      userId: user.id,
      entityType: 'user',
      entityId: user.id,
      action: 'logged_in',
      ipAddress: req.ip,
    });

    //const token = signToken({ id: user.id, email: user.email });
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) {
    next(err);
  }
}

// Logout is stateless here (JWT has no server-side session to destroy),
// so this endpoint mainly exists for audit logging + a clean client-side contract.
async function logout(req, res, next) {
  try {
    await auditService.logAction({
      userId: req.user.id,
      entityType: 'user',
      entityId: req.user.id,
      action: 'logged_out',
      ipAddress: req.ip,
    });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }

    const user = await userModel.findByEmail(req.user.email);
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(user.id, newHash);

    await auditService.logAction({
      userId: user.id,
      entityType: 'user',
      entityId: user.id,
      action: 'changed_password',
      ipAddress: req.ip,
    });

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me, changePassword };