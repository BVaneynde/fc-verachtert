import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path'
import { fileURLToPath } from 'url'

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load env from parent directory (.env is in root, not backend folder)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

// Initialize Supabase with Service Role Key for server-side operations
// (Backend needs full access to bypass RLS policies for auth, admin operations)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// Make supabase available to routes
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend running', timestamp: new Date() });
});

// Routes
import matchesRouter from './routes/matches.js'
import playersRouter from './routes/players.js'
import calendarRouter from './routes/calendar.js'
import authRouter from './routes/auth.js'

app.use('/api/matches', matchesRouter)
app.use('/api/players', playersRouter)
app.use('/api/calendar', calendarRouter)
app.use('/api/auth', authRouter)

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
