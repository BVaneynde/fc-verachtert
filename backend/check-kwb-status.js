import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

console.log('📅 Calendar events on 2026-08-07:')
const { data: events } = await supabase
  .from('calendar_events')
  .select('id, title, event_date, is_match')
  .gte('event_date', '2026-08-07T00:00:00')
  .lt('event_date', '2026-08-07T23:59:59')

events.forEach(e => {
  console.log(`  "${e.title}" | is_match: ${e.is_match}`)
})

console.log('\n⚽ Matches on 2026-08-07:')
const { data: matches } = await supabase
  .from('matches')
  .select('id, opponent, date, is_official_match')
  .gte('date', '2026-08-07T00:00:00')
  .lt('date', '2026-08-07T23:59:59')

matches.forEach(m => {
  console.log(`  "${m.opponent}" | is_official_match: ${m.is_official_match}`)
})

console.log('\n🔍 Need to find: Which calendar event matches "KWB punt - FCV"?')
