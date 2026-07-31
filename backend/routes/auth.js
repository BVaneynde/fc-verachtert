import express from 'express'
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'

const router = express.Router()

// POST /api/auth/register - Create admin account (one-time setup)
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)

    // Insert into Supabase
    const { data, error } = await req.supabase
      .from('users')
      .insert([{ email, password_hash: hashedPassword, role: 'admin' }])
      .select()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.status(201).json({ message: 'Admin account created', email })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    // Query Supabase for user
    const { data: user, error } = await req.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Compare password
    const passwordMatch = await bcryptjs.compare(password, user.password_hash)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, role: user.role }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/auth/me - Get current user (optional, requires auth header)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    res.json({ user: { id: decoded.userId, email: decoded.email, role: decoded.role } })
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
