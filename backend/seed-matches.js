import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function seedMatches() {
  console.log('🏐 Adding sample matches...\n')
  
  const now = new Date()
  const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  const pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
  
  const matches = [
    {
      date: futureDate.toISOString(),
      opponent: 'FC De Toekomst',
      score_home: null,
      score_away: null,
      location: 'Thuisveld',
      notes: 'Komende wedstrijd',
      is_official_match: true
    },
    {
      date: new Date(futureDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      opponent: 'USV Elinkwijk',
      score_home: null,
      score_away: null,
      location: 'Uitveld',
      notes: 'Volgende week',
      is_official_match: true
    },
    {
      date: pastDate.toISOString(),
      opponent: 'Ajax Amateurs',
      score_home: 3,
      score_away: 2,
      location: 'Thuisveld',
      notes: 'Afgelopen wedstrijd',
      is_official_match: true
    }
  ]
  
  const { data, error } = await supabase
    .from('matches')
    .insert(matches)
    .select()
  
  if (error) {
    console.error('❌ Error:', error.message)
    return
  }
  
  console.log(`✅ Added ${data.length} matches:\n`)
  data.forEach((match, i) => {
    console.log(`${i + 1}. ${match.opponent} - ${new Date(match.date).toLocaleDateString('nl-NL')}`)
    if (match.score_home !== null) {
      console.log(`   Score: ${match.score_home} - ${match.score_away}`)
    }
  })
}

seedMatches()
