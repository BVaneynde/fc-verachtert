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

async function fullTest() {
  console.log('🧪 COMPLETE TEST: Match visibility in dashboard\n')
  
  // STEP 1: Check Heffers in both tables
  console.log('STEP 1: Checking Tornooi Heffers status\n')
  
  const { data: matchData } = await supabase
    .from('matches')
    .select('*')
    .ilike('opponent', '%heffers%')
  
  console.log('In matches table:')
  if (matchData.length === 0) {
    console.log('  ❌ NO MATCHES FOUND!')
  } else {
    matchData.forEach(m => {
      console.log(`  opponent: ${m.opponent}`)
      console.log(`  date: ${m.date}`)
      console.log(`  is_official_match: ${m.is_official_match}`)
      console.log(`  score_home: ${m.score_home}`)
      console.log(`  score_away: ${m.score_away}`)
    })
  }
  console.log()
  
  const { data: calData } = await supabase
    .from('calendar_events')
    .select('*')
    .ilike('title', '%heffers%')
  
  console.log('In calendar_events table:')
  if (calData.length === 0) {
    console.log('  ❌ NO CALENDAR EVENTS FOUND!')
  } else {
    calData.forEach(c => {
      console.log(`  title: ${c.title}`)
      console.log(`  event_date: ${c.event_date}`)
      console.log(`  is_match: ${c.is_match}`)
    })
  }
  console.log()
  
  // STEP 2: Simulate what API returns
  console.log('STEP 2: Simulating GET /api/matches (ALL matches)\n')
  
  const { data: allMatches } = await supabase
    .from('matches')
    .select('*')
    .order('date', { ascending: false })
  
  console.log(`Total matches in DB: ${allMatches.length}`)
  allMatches.forEach(m => {
    console.log(`  - ${m.opponent} (${m.date}) | is_official_match=${m.is_official_match}`)
  })
  console.log()
  
  // STEP 3: Simulate Dashboard filter
  console.log('STEP 3: Simulating Dashboard filter (upcoming + official only)\n')
  
  const now = new Date()
  const filtered = allMatches.filter(m => {
    const isUpcoming = new Date(m.date) > now
    const isOfficial = m.is_official_match === true
    const passes = isUpcoming && isOfficial
    
    if (m.opponent.toLowerCase().includes('heffers')) {
      console.log(`  ${m.opponent}:`)
      console.log(`    date: ${m.date} (now: ${now.toISOString()})`)
      console.log(`    isUpcoming: ${isUpcoming}`)
      console.log(`    isOfficial: ${isOfficial}`)
      console.log(`    PASSES FILTER: ${passes}`)
    }
    
    return passes
  })
  
  console.log(`\nFiltered results (should show on dashboard):`)
  filtered.forEach(m => {
    console.log(`  ✅ ${m.opponent} (${m.date})`)
  })
  console.log()
  
  // STEP 4: Check if Heffers passes
  console.log('STEP 4: Verdict\n')
  const heffersInDashboard = filtered.find(m => m.opponent.toLowerCase().includes('heffers'))
  
  if (heffersInDashboard) {
    console.log('✅ HEFFERS WOULD SHOW ON DASHBOARD')
  } else {
    console.log('❌ HEFFERS WOULD NOT SHOW - REASON:')
    const heffersMatch = allMatches.find(m => m.opponent.toLowerCase().includes('heffers'))
    if (!heffersMatch) {
      console.log('   - Match not found in database')
    } else if (heffersMatch.is_official_match !== true) {
      console.log(`   - is_official_match = ${heffersMatch.is_official_match} (needs to be true)`)
    } else if (new Date(heffersMatch.date) <= now) {
      console.log(`   - Date is in past (${heffersMatch.date} <= ${now.toISOString()})`)
    } else {
      console.log('   - Unknown reason')
    }
  }
}

fullTest()
