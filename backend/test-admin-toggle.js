import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const API_URL = 'http://localhost:5000'

const apiCall = async (method, endpoint, body = null) => {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  }
  if (body) options.body = JSON.stringify(body)
  
  const res = await fetch(`${API_URL}${endpoint}`, options)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text}`)
  }
  return res.json()
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🧪 SIMULATE ADMIN PANEL TOGGLE\n')

// Get a specific event (Tornooi Heffers)
const { data: events } = await supabase
  .from('calendar_events')
  .select('*')
  .ilike('title', '%Heffers%')
  .single()

if (!events) {
  console.log('❌ Event not found')
  process.exit(1)
}

console.log(`📌 Target: "${events.title}" (ID: ${events.id})`)
console.log(`📅 Date: ${events.event_date}`)
console.log(`Current status: is_match = ${events.is_match}\n`)

// Check current match status
const { data: matchesBefore } = await supabase
  .from('matches')
  .select('*')
  .ilike('opponent', '%Heffers%')
  .single()

console.log(`Current match status: is_official_match = ${matchesBefore?.is_official_match || 'N/A'}\n`)

// Step 1: Toggle calendar event
console.log(`\n⏳ STEP 1: Toggling calendar event (is_match: ${events.is_match} → ${!events.is_match})`)
try {
  const calRes = await apiCall('PUT', `/api/calendar/${events.id}/mark-as-match`, {
    is_match: !events.is_match
  })
  console.log(`✅ Calendar updated: is_match = ${calRes.is_match}`)
} catch (error) {
  console.error(`❌ Error:`, error.message)
}

// Step 2: Mark as official
console.log(`\n⏳ STEP 2: Marking match as official`)
try {
  const markRes = await apiCall('PUT', `/api/matches/mark-official-by-event`, {
    event_date: events.event_date,
    opponent: events.title
  })
  console.log(`✅ Match marked official: ${markRes.message}`)
} catch (error) {
  console.error(`❌ Error:`, error.message)
}

// Check final state
console.log(`\n✅ FINAL STATE CHECK:\n`)

const { data: eventAfter } = await supabase
  .from('calendar_events')
  .select('*')
  .eq('id', events.id)
  .single()

const { data: matchAfter } = await supabase
  .from('matches')
  .select('*')
  .ilike('opponent', '%Heffers%')
  .single()

console.log(`📋 calendar_events.is_match = ${eventAfter.is_match} (expected: true)`)
console.log(`⚽ matches.is_official_match = ${matchAfter.is_official_match} (expected: true)`)

if (eventAfter.is_match && matchAfter.is_official_match) {
  console.log(`\n✅ BOTH IN SYNC - Everything works!`)
} else {
  console.log(`\n❌ OUT OF SYNC - Something's wrong!`)
  if (!eventAfter.is_match) {
    console.log(`   - calendar_events.is_match is still FALSE (should be TRUE)`)
  }
  if (!matchAfter.is_official_match) {
    console.log(`   - matches.is_official_match is still FALSE (should be TRUE)`)
  }
}
