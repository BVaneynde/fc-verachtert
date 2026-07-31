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

async function checkCalendarStatus() {
  console.log('🔍 Checking calendar event statuses...\n')
  
  const { data: events, error } = await supabase
    .from('calendar_events')
    .select('id, title, event_date, is_match')
    .order('event_date', { ascending: false })
  
  if (error) {
    console.error('Error fetching events:', error)
    return
  }
  
  console.log(`✅ Found ${events.length} calendar events\n`)
  
  let matchCount = 0
  let eventCount = 0
  
  events.forEach((evt, idx) => {
    const status = evt.is_match ? '✅ WEDSTRIJD' : '❌ EVENT/ANDER'
    console.log(`${idx + 1}. ${evt.title}`)
    console.log(`   Date: ${evt.event_date}`)
    console.log(`   is_match: ${evt.is_match} (${status})`)
    console.log()
    
    if (evt.is_match) {
      matchCount++
    } else {
      eventCount++
    }
  })
  
  console.log(`\n📊 Summary:`)
  console.log(`  ✅ Marked as match (is_match=true): ${matchCount}`)
  console.log(`  ❌ Marked as event (is_match=false): ${eventCount}`)
}

checkCalendarStatus()
