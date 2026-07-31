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

// GET /api/matches/head-to-head/all - Get head-to-head stats against opponents (ONLY PAST MATCHES)
router.get('/head-to-head/all', async (req, res) => {
  try {
    const now = new Date()
    
    const { data: matches, error } = await req.supabase
      .from('matches')
      .select('id, opponent, date, score_home, score_away')
      .lte('date', now.toISOString())  // Only past matches
      .order('date', { ascending: false })

    if (error) throw error

    // Group by opponent and calculate stats
    const headToHead = {}

    matches.forEach(match => {
      const opponent = match.opponent || 'Unknown'
      
      if (!headToHead[opponent]) {
        headToHead[opponent] = {
          opponent: opponent,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goals_for: 0,
          goals_against: 0,
          last_match: null
        }
      }

      headToHead[opponent].played += 1
      headToHead[opponent].goals_for += match.score_home || 0
      headToHead[opponent].goals_against += match.score_away || 0
      headToHead[opponent].last_match = match.date

      const diff = (match.score_home || 0) - (match.score_away || 0)
      if (diff > 0) headToHead[opponent].won += 1
      else if (diff < 0) headToHead[opponent].lost += 1
      else headToHead[opponent].drawn += 1
    })

    // Convert to array and sort by most played
    const results = Object.values(headToHead)
      .sort((a, b) => b.played - a.played)

    res.json(results)
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
