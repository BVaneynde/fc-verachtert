import express from 'express'

const router = express.Router()

// GET /api/matches - Get all matches
router.get('/', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('matches')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error

    res.json(data || [])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/matches/:id - Get single match with player stats
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data: match, error } = await req.supabase
      .from('matches')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !match) {
      return res.status(404).json({ error: 'Match not found' })
    }

    res.json(match)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/matches/:id/appearances - Get match player appearances
router.get('/:id/appearances', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await req.supabase
      .from('match_appearances')
      .select('*')
      .eq('match_id', id)

    if (error) throw error

    res.json(data || [])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/matches - Create new match (admin only)
router.post('/', async (req, res) => {
  try {
    const { date, opponent, score_home, score_away, location, notes } = req.body

    if (!date || !opponent) {
      return res.status(400).json({ error: 'Date and opponent required' })
    }

    const { data, error } = await req.supabase
      .from('matches')
      .insert([{
        date,
        opponent,
        score_home: score_home || null,
        score_away: score_away || null,
        location: location || null,
        notes: notes || null,
        is_official_match: true
      }])
      .select()

    if (error) throw error

    res.status(201).json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/matches/:id - Update match (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { score_home, score_away, location, notes } = req.body

    const { data, error } = await req.supabase
      .from('matches')
      .update({
        score_home: score_home || null,
        score_away: score_away || null,
        location: location || null,
        notes: notes || null,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()

    if (error) throw error

    res.json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/matches/:id/appearances - Save player appearance data
router.post('/:id/appearances', async (req, res) => {
  try {
    const { id } = req.params
    const appearances = req.body // Array of { player_id, was_present, goals, yellow_cards, red_cards }

    if (!Array.isArray(appearances)) {
      return res.status(400).json({ error: 'Expected array of appearances' })
    }

    // Prepare upsert data
    const upsertData = appearances.map(app => ({
      match_id: id,
      player_id: app.player_id,
      was_present: app.was_present || false,
      goals: app.goals || 0,
      yellow_cards: app.yellow_cards || 0,
      red_cards: app.red_cards || 0
    }))

    const { data, error } = await req.supabase
      .from('match_appearances')
      .upsert(upsertData, { onConflict: 'match_id,player_id' })
      .select()

    if (error) throw error

    res.json({ message: 'Appearances saved', count: data.length })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
