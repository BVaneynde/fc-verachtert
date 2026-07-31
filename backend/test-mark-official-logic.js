import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const opponent = 'KWB punt - FCV'
const event_date = '2026-08-07T17:00:00'
const eventDate = new Date(event_date).toISOString().split('T')[0]

console.log('🧪 TESTING mark-official-by-event LOGIC:\n')

console.log(`Input: opponent="${opponent}" event_date="${event_date}"`)
console.log(`Query date range: ${eventDate}T00:00:00 to ${eventDate}T23:59:59\n`)

// STEP 1: UPDATE MATCHES (like the route does)
console.log('STEP 1: Updating MATCHES table...')
const { data: matches, error: matchError } = await supabase
  .from('matches')
  .update({ is_official_match: true })
  .ilike('opponent', opponent)
  .gte('date', `${eventDate}T00:00:00`)
  .lt('date', `${eventDate}T23:59:59`)
  .select()

if (matchError) {
  console.error('❌ Matches error:', matchError)
} else {
  console.log(`✅ Updated ${matches.length} matches`)
  matches.forEach(m => console.log(`   - ${m.opponent}`))
}

// STEP 2: UPDATE CALENDAR_EVENTS (like the route does)
console.log('\nSTEP 2: Updating CALENDAR_EVENTS table...')
const { data: calEvents, error: calError } = await supabase
  .from('calendar_events')
  .update({ is_match: true })
  .ilike('title', opponent)
  .gte('event_date', `${eventDate}T00:00:00`)
  .lt('event_date', `${eventDate}T23:59:59`)
  .select()

if (calError) {
  console.error('❌ Calendar error:', calError)
} else {
  console.log(`✅ Updated ${calEvents.length} calendar events`)
  calEvents.forEach(e => console.log(`   - ${e.title}`))
}

// CHECK FINAL STATE
console.log('\n📊 FINAL STATE:')
const { data: matchCheck } = await supabase
  .from('matches')
  .select('opponent, is_official_match')
  .ilike('opponent', opponent)

matchCheck.forEach(m => console.log(`MATCH: ${m.opponent} | is_official_match: ${m.is_official_match}`))

const { data: calCheck } = await supabase
  .from('calendar_events')
  .select('title, is_match, event_date')
  .ilike('title', opponent)
  .lte('event_date', '2026-08-08T00:00:00')

calCheck.forEach(e => {
  const isTarget = e.event_date.substring(0, 10) === '2026-08-07'
  console.log(`CALENDAR: ${e.title} (${e.event_date.substring(0, 10)}) | is_match: ${e.is_match} ${isTarget ? '← TARGET' : ''}`)
})
