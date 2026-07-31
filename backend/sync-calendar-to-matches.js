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

async function syncCalendarToMatches() {
  console.log('🔧 Syncing calendar_events is_match status to matches...\n')
  
  // Get all calendar events
  const { data: events } = await supabase
    .from('calendar_events')
    .select('title, event_date, is_match')
  
  // Get all matches
  const { data: matches } = await supabase
    .from('matches')
    .select('id, opponent, date, is_official_match')
  
  console.log(`Processing ${events.length} calendar events and ${matches.length} matches\n`)
  
  let updateCount = 0
  
  for (const event of events) {
    // Find matching match
    const eventDate = new Date(event.event_date).toISOString().split('T')[0]
    
    const matchingMatches = matches.filter(m => {
      const matchDate = new Date(m.date).toISOString().split('T')[0]
      return matchDate === eventDate && m.opponent.toLowerCase() === event.title.toLowerCase()
    })
    
    if (matchingMatches.length > 0) {
      const shouldBeOfficial = event.is_match === true
      
      for (const match of matchingMatches) {
        if (match.is_official_match !== shouldBeOfficial) {
          console.log(`Updating: ${event.title} (${eventDate})`)
          console.log(`  Calendar: is_match=${event.is_match}`)
          console.log(`  Match was: is_official_match=${match.is_official_match}`)
          console.log(`  Match now: is_official_match=${shouldBeOfficial}`)
          console.log()
          
          const { error } = await supabase
            .from('matches')
            .update({ is_official_match: shouldBeOfficial })
            .eq('id', match.id)
          
          if (!error) {
            updateCount++
          } else {
            console.error(`  ❌ Error:`, error)
          }
        }
      }
    }
  }
  
  console.log(`\n✅ Updated ${updateCount} matches`)
}

syncCalendarToMatches()
