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

async function fixMatches() {
  console.log('🔧 Fixing match official status to sync with calendar\n')
  
  // Get all matches
  const { data: matches } = await supabase
    .from('matches')
    .select('id, opponent, date')
  
  // Get all calendar events that are marked as matches
  const { data: calendarMatches } = await supabase
    .from('calendar_events')
    .select('title, event_date')
    .eq('is_match', true)
  
  console.log(`Processing ${matches.length} matches against ${calendarMatches.length} calendar matches\n`)
  
  // Update each match that has a corresponding calendar event
  let updateCount = 0
  for (const match of matches) {
    const hasCalendarEntry = calendarMatches.some(cm => {
      const calDate = new Date(cm.event_date).toISOString().split('T')[0]
      const matchDate = new Date(match.date).toISOString().split('T')[0]
      return calDate === matchDate && 
             cm.title.toLowerCase().trim() === match.opponent.toLowerCase().trim()
    })
    
    const shouldBeOfficial = hasCalendarEntry
    
    // Update if needed
    const { error } = await supabase
      .from('matches')
      .update({ is_official_match: shouldBeOfficial })
      .eq('id', match.id)
    
    if (!error) {
      console.log(`✅ ${match.opponent} (${match.date}) → is_official_match=${shouldBeOfficial}`)
      updateCount++
    } else {
      console.log(`❌ ${match.opponent} → ERROR: ${error}`)
    }
  }
  
  console.log(`\n✅ Updated ${updateCount} matches`)
}

fixMatches()
