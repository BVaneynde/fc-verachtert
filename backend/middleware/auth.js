import jwt from 'jsonwebtoken'

// Middleware to verify JWT token and check admin role
export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    req.userEmail = decoded.email
    req.userRole = decoded.role

    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Middleware to check if user is admin
export const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

export default {
  authMiddleware,
  adminOnly
}
