import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const event_date = '2026-08-07T17:00:00'
const eventDate = new Date(event_date).toISOString().split('T')[0]

console.log('🔍 DEBUG DATE FILTERING:\n')
console.log(`Input event_date: ${event_date}`)
console.log(`Parsed eventDate (DATE ONLY): ${eventDate}`)
console.log(`Query range: ${eventDate}T00:00:00 to ${eventDate}T23:59:59\n`)

console.log('📅 CALENDAR EVENTS:')
const { data: calEvents } = await supabase
  .from('calendar_events')
  .select('title, event_date, is_match')
  .ilike('title', 'KWB punt%')

calEvents.forEach(e => {
  const matches = e.event_date >= `${eventDate}T00:00:00` && e.event_date < `${eventDate}T23:59:59`
  console.log(`  title: "${e.title}"`)
  console.log(`  event_date: "${e.event_date}"`)
  console.log(`  DATE part: ${e.event_date.substring(0, 10)}`)
  console.log(`  Matches range? ${matches}\n`)
})

console.log('⚽ MATCHES:')
const { data: matches } = await supabase
  .from('matches')
  .select('opponent, date, is_official_match')
  .ilike('opponent', 'KWB punt%')

matches.forEach(m => {
  const inRange = m.date >= `${eventDate}T00:00:00` && m.date < `${eventDate}T23:59:59`
  console.log(`  opponent: "${m.opponent}"`)
  console.log(`  date: "${m.date}"`)
  console.log(`  DATE part: ${m.date.substring(0, 10)}`)
  console.log(`  Matches range? ${inRange}\n`)
})
