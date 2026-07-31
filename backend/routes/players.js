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
    // Get all players with aggregated stats
    const { data: players, error: playersError } = await req.supabase
      .from('players')
      .select('*')
      .eq('is_active', true)

    if (playersError) throw playersError

    // For each player, get stats
    const stats = await Promise.all(
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
          return {
            player_id: player.id,
            player_name: player.name,
            appearances: 0,
            goals: 0,
            yellow_cards: 0,
            red_cards: 0
          }
        }

        const presentAppearances = appearances.filter(a => a.was_present)
        return {
          player_id: player.id,
          player_name: player.name,
          appearances: new Set(presentAppearances.map(a => a.match_id)).size,
          goals: appearances.reduce((sum, a) => sum + (a.goals || 0), 0),
          yellow_cards: appearances.reduce((sum, a) => sum + (a.yellow_cards || 0), 0),
          red_cards: appearances.reduce((sum, a) => sum + (a.red_cards || 0), 0)
        }
      })
    )

    res.json(stats)
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
