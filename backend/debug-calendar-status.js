import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🧪 DEBUG: Checking calendar events and matches status\n')

const now = new Date()
const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // Next 30 days

console.log(`📅 Date range: ${now.toISOString()} to ${futureDate.toISOString()}\n`)

// Get calendar events
const { data: calendarEvents, error: calError } = await supabase
  .from('calendar_events')
  .select('id, title, event_date, is_match')
  .gte('event_date', now.toISOString())
  .lte('event_date', futureDate.toISOString())
  .order('event_date', { ascending: true })

if (calError) {
  console.error('❌ Error fetching calendar events:', calError)
  process.exit(1)
}

console.log(`📋 CALENDAR EVENTS (${calendarEvents.length} found):\n`)
calendarEvents.forEach((event, idx) => {
  const eventDate = new Date(event.event_date)
  console.log(`${idx + 1}. ${event.title}`)
  console.log(`   Date: ${eventDate.toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`)
  console.log(`   is_match in calendar: ${event.is_match ? '✅ TRUE (Should be wedstrijd)' : '❌ FALSE (Event/Ander)'}`)
  console.log()
})

// Get matches
const { data: matches, error: matchError } = await supabase
  .from('matches')
  .select('id, opponent, date, is_official_match')
  .gte('date', now.toISOString())
  .lte('date', futureDate.toISOString())
  .order('date', { ascending: true })

if (matchError) {
  console.error('❌ Error fetching matches:', matchError)
  process.exit(1)
}

console.log(`⚽ MATCHES TABLE (${matches.length} found):\n`)
matches.forEach((match, idx) => {
  const matchDate = new Date(match.date)
  console.log(`${idx + 1}. ${match.opponent}`)
  console.log(`   Date: ${matchDate.toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`)
  console.log(`   is_official_match: ${match.is_official_match ? '✅ TRUE' : '❌ FALSE'}`)
  console.log()
})

// Check for mismatches
console.log('\n🔍 SYNC CHECK:\n')

calendarEvents.forEach(event => {
  const matchedInMatches = matches.find(m => 
    m.opponent.includes(event.title.split('(')[0].trim()) || 
    event.title.includes(m.opponent)
  )
  
  if (!matchedInMatches && event.is_match) {
    console.log(`⚠️  MISSING: "${event.title}" is marked as match in calendar but NOT in matches table!`)
  }
})

matches.forEach(match => {
  const eventTitle = match.opponent
  const eventInCalendar = calendarEvents.find(e => 
    e.title.includes(eventTitle) || 
    eventTitle.includes(e.title.split('(')[0].trim())
  )
  
  if (eventInCalendar && eventInCalendar.is_match !== match.is_official_match) {
    console.log(`❌ MISMATCH: "${match.opponent}"`)
    console.log(`   calendar_events.is_match = ${eventInCalendar.is_match}`)
    console.log(`   matches.is_official_match = ${match.is_official_match}`)
  }
})

console.log('\n✅ Sync check complete!')
