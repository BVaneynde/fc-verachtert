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
// MUST BE BEFORE /:id route!
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

// POST /api/matches/create-or-skip - Create match only if it doesn't exist
// MUST BE BEFORE /:id route!
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
