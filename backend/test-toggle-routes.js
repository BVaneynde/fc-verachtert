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

async function testToggleRoutes() {
  console.log('🧪 Testing toggle routes\n')
  
  const testOpponent = 'Tornooi Heffers'
  const testDate = '2026-08-02T08:00:00'
  
  // STEP 1: Check initial state
  console.log(`STEP 1: Initial state of "${testOpponent}"\n`)
  
  let { data: match1 } = await supabase
    .from('matches')
    .select('*')
    .ilike('opponent', testOpponent)
    .single()
  
  console.log(`  is_official_match BEFORE: ${match1.is_official_match}`)
  console.log()
  
  // STEP 2: Mark as unofficial
  console.log('STEP 2: Testing mark-unofficial-by-event route\n')
  
  const { error: updateError1 } = await supabase
    .from('matches')
    .update({ is_official_match: false })
    .ilike('opponent', testOpponent)
    .select()
  
  let { data: match2 } = await supabase
    .from('matches')
    .select('*')
    .ilike('opponent', testOpponent)
    .single()
  
  console.log(`  is_official_match AFTER mark-unofficial: ${match2.is_official_match}`)
  if (match2.is_official_match === false) {
    console.log('  ✅ Mark-unofficial WORKS')
  } else {
    console.log('  ❌ Mark-unofficial FAILED')
  }
  console.log()
  
  // STEP 3: Mark as official
  console.log('STEP 3: Testing mark-official-by-event route\n')
  
  const { error: updateError2 } = await supabase
    .from('matches')
    .update({ is_official_match: true })
    .ilike('opponent', testOpponent)
    .select()
  
  let { data: match3 } = await supabase
    .from('matches')
    .select('*')
    .ilike('opponent', testOpponent)
    .single()
  
  console.log(`  is_official_match AFTER mark-official: ${match3.is_official_match}`)
  if (match3.is_official_match === true) {
    console.log('  ✅ Mark-official WORKS')
  } else {
    console.log('  ❌ Mark-official FAILED')
  }
  console.log()
  
  // STEP 4: Final dashboard test
  console.log('STEP 4: Final dashboard visibility test\n')
  
  const { data: allMatches } = await supabase
    .from('matches')
    .select('*')
    .order('date', { ascending: false })
  
  const now = new Date()
  const heffers = allMatches.find(m => m.opponent === testOpponent)
  const willShow = heffers && new Date(heffers.date) > now && heffers.is_official_match === true
  
  console.log(`  Opponent: ${heffers.opponent}`)
  console.log(`  Date: ${heffers.date}`)
  console.log(`  is_official_match: ${heffers.is_official_match}`)
  console.log(`  isUpcoming: ${new Date(heffers.date) > now}`)
  console.log(`  WILL SHOW ON DASHBOARD: ${willShow ? '✅ YES' : '❌ NO'}`)
}

testToggleRoutes()
