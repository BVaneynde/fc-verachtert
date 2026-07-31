import express from 'express'

const router = express.Router()

// GET /api/players - Get all active players
router.get('/', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('players')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    res.json(data || [])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/players/stats - Get player statistics (goals, cards, appearances)
router.get('/stats', async (req, res) => {
  try {
    // Helper function to calculate season (August = start year)
    const getSeason = (dateString) => {
      const date = new Date(dateString)
      return date.getMonth() >= 7 ? date.getFullYear() : date.getFullYear() - 1
    }

    // Get all players with aggregated stats
    const { data: players, error: playersError } = await req.supabase
      .from('players')
      .select('*')
      .eq('is_active', true)

    if (playersError) throw playersError

    // Get all matches to calculate seasons
    const { data: matches, error: matchError } = await req.supabase
      .from('matches')
      .select('id, date')

    if (matchError) throw matchError

    // Build a map of match_id -> season
    const matchSeasons = {}
    matches.forEach(match => {
      matchSeasons[match.id] = getSeason(match.date)
    })

    // For each player, get stats organized by season
    const statsData = await Promise.all(
      players.map(async (player) => {
        const { data: appearances, error } = await req.supabase
          .from('match_appearances')
          .select(`
            goals,
            yellow_cards,
            red_cards,
            was_present,
            match_id
          `)
          .eq('player_id', player.id)

        if (error) {
          console.error(`Error fetching stats for ${player.name}:`, error)
          return []
        }

        // Group stats by season
        const statsBySeason = {}
        
        appearances.forEach(a => {
          const season = matchSeasons[a.match_id]
          if (!season) return
          
          if (!statsBySeason[season]) {
            statsBySeason[season] = {
              player_id: player.id,
              player_name: player.name,
              season: season,
              appearances: new Set(),
              goals: 0,
              yellow_cards: 0,
              red_cards: 0
            }
          }
          
          if (a.was_present) {
            statsBySeason[season].appearances.add(a.match_id)
          }
          statsBySeason[season].goals += a.goals || 0
          statsBySeason[season].yellow_cards += a.yellow_cards || 0
          statsBySeason[season].red_cards += a.red_cards || 0
        })

        // Convert sets to numbers and return array
        return Object.values(statsBySeason).map(s => ({
          ...s,
          appearances: s.appearances.size
        }))
      })
    )

    // Flatten array and return
    const allStats = statsData.flat()
    res.json(allStats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/players - Add new player (admin only)
router.post('/', async (req, res) => {
  try {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Player name required' })
    }

    const { data, error } = await req.supabase
      .from('players')
      .insert([{ name, is_active: true }])
      .select()

    if (error) throw error

    res.status(201).json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/players/:id - Update player (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, is_active } = req.body

    const { data, error } = await req.supabase
      .from('players')
      .update({ name, is_active, updated_at: new Date() })
      .eq('id', id)
      .select()

    if (error) throw error

    res.json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
