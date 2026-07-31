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

async function checkMatchStatus() {
  console.log('🔍 Checking match statuses...\n')
  
  const { data: matches, error } = await supabase
    .from('matches')
    .select('id, opponent, date, is_official_match')
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error fetching matches:', error)
    return
  }
  
  console.log(`✅ Found ${matches.length} total matches\n`)
  
  let officialCount = 0
  let unofficialCount = 0
  
  matches.forEach((match, idx) => {
    const status = match.is_official_match === true ? '✅ WEDSTRIJD' : '❌ EVENT/ANDER'
    console.log(`${idx + 1}. ${match.opponent}`)
    console.log(`   Date: ${match.date}`)
    console.log(`   Status: ${status}`)
    console.log(`   is_official_match: ${match.is_official_match}`)
    console.log()
    
    if (match.is_official_match === true) {
      officialCount++
    } else {
      unofficialCount++
    }
  })
  
  console.log(`\n📊 Summary:`)
  console.log(`  ✅ Official matches (wedstrijden): ${officialCount}`)
  console.log(`  ❌ Unofficial matches (events): ${unofficialCount}`)
}

checkMatchStatus()
