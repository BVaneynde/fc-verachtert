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

// GET /api/matches/head-to-head/all - Get head-to-head stats against opponents (ONLY PAST OFFICIAL MATCHES)
router.get('/head-to-head/all', async (req, res) => {
  try {
    const now = new Date()
    
    const { data: matches, error } = await req.supabase
      .from('matches')
      .select('id, opponent, date, score_home, score_away')
      .lte('date', now.toISOString())  // Only past matches
      .eq('is_official_match', true)    // Only official matches (wedstrijden)
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

    // Check if match already exists for this date and opponent
    const eventDate = new Date(date).toISOString().split('T')[0]
    const { data: existing } = await req.supabase
      .from('matches')
      .select('id')
      .ilike('opponent', opponent)
      .gte('date', `${eventDate}T00:00:00`)
      .lt('date', `${eventDate}T23:59:59`)
      .single()

    if (existing) {
      return res.status(409).json({ 
        error: 'Match already exists for this date and opponent',
        existingId: existing.id
      })
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

// POST /api/matches/create-or-skip - Create match only if it doesn't exist
router.post('/create-or-skip', async (req, res) => {
  try {
    const { date, opponent, location, notes, is_official_match } = req.body

    if (!date || !opponent) {
      return res.status(400).json({ error: 'Missing date or opponent' })
    }

    // Parse the date to match database format (YYYY-MM-DD)
    const eventDate = new Date(date).toISOString().split('T')[0]

    // Check if match already exists for this date and opponent
    const { data: existing, error: checkError } = await req.supabase
      .from('matches')
      .select('id')
      .ilike('opponent', opponent)
      .gte('date', `${eventDate}T00:00:00`)
      .lt('date', `${eventDate}T23:59:59`)
      .single()

    if (existing) {
      // Match already exists - return it without creating duplicate
      return res.json({ 
        message: 'Match already exists (duplicate prevented)', 
        id: existing.id,
        isDuplicate: true 
      })
    }

    // Create new match
    const { data, error } = await req.supabase
      .from('matches')
      .insert([{
        date: new Date(date).toISOString(),
        opponent: opponent,
        location: location || 'TBD',
        notes: notes || null,
        is_official_match: is_official_match || false
      }])
      .select()

    if (error) throw error

    res.json({ 
      message: 'Match created',
      data: data[0],
      isDuplicate: false
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/matches/by-event - Delete match by event date and opponent
router.delete('/by-event', async (req, res) => {
  try {
    const { event_date, opponent } = req.body

    if (!event_date || !opponent) {
      return res.status(400).json({ error: 'Missing event_date or opponent' })
    }

    // Parse the event_date to match database format
    const eventDate = new Date(event_date).toISOString().split('T')[0]

    const { data, error } = await req.supabase
      .from('matches')
      .delete()
      .ilike('opponent', opponent)
      .gte('date', `${eventDate}T00:00:00`)
      .lt('date', `${eventDate}T23:59:59`)
      .select()

    if (error) throw error

    res.json({ message: `Deleted ${data.length} match(es)`, count: data.length })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/matches/mark-unofficial-by-event - Mark matches as unofficial by event date and opponent
router.put('/mark-unofficial-by-event', async (req, res) => {
  try {
    const { event_date, opponent } = req.body

    if (!event_date || !opponent) {
      return res.status(400).json({ error: 'Missing event_date or opponent' })
    }

    // Parse the event_date to match database format (YYYY-MM-DD)
    const eventDate = new Date(event_date).toISOString().split('T')[0]

    console.log(`Marking as unofficial: ${opponent} on ${eventDate}`)

    const { data, error } = await req.supabase
      .from('matches')
      .update({ is_official_match: false })
      .ilike('opponent', opponent)
      .gte('date', `${eventDate}T00:00:00`)
      .lt('date', `${eventDate}T23:59:59`)
      .select()

    if (error) throw error

    console.log(`Updated ${data.length} matches`)

    res.json({ 
      message: `Marked ${data.length} match(es) as unofficial`, 
      count: data.length,
      data: data
    })
  } catch (error) {
    console.error('Error in mark-unofficial-by-event:', error)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/matches/mark-official-by-event - Mark matches as official by event date and opponent
router.put('/mark-official-by-event', async (req, res) => {
  try {
    const { event_date, opponent } = req.body

    if (!event_date || !opponent) {
      return res.status(400).json({ error: 'Missing event_date or opponent' })
    }

    // Parse the event_date to match database format (YYYY-MM-DD)
    const eventDate = new Date(event_date).toISOString().split('T')[0]

    console.log(`Marking as official: ${opponent} on ${eventDate}`)

    const { data, error } = await req.supabase
      .from('matches')
      .update({ is_official_match: true })
      .ilike('opponent', opponent)
      .gte('date', `${eventDate}T00:00:00`)
      .lt('date', `${eventDate}T23:59:59`)
      .select()

    if (error) throw error

    console.log(`Updated ${data.length} matches`)

    res.json({ 
      message: `Marked ${data.length} match(es) as official`, 
      count: data.length,
      data: data
    })
  } catch (error) {
    console.error('Error in mark-official-by-event:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
