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

async function fixMatchStatus() {
  console.log('🔧 Fixing match statuses...\n')
  
  // First, get all matches
  const { data: matches, error: fetchError } = await supabase
    .from('matches')
    .select('id, opponent, is_official_match')
  
  if (fetchError) {
    console.error('Error fetching matches:', fetchError)
    return
  }
  
  console.log(`Found ${matches.length} matches\n`)
  
  // Update all NULL values to true (assume all existing are official)
  const { error: updateError, data: updated } = await supabase
    .from('matches')
    .update({ is_official_match: true })
    .is('is_official_match', null)
  
  if (updateError) {
    console.error('Error updating:', updateError)
    return
  }
  
  console.log(`✅ Set NULL is_official_match to true`)
  
  // Now check status again
  const { data: updatedMatches } = await supabase
    .from('matches')
    .select('id, opponent, is_official_match')
  
  let officialCount = 0
  let unofficialCount = 0
  
  updatedMatches.forEach(m => {
    if (m.is_official_match === true) {
      officialCount++
    } else if (m.is_official_match === false) {
      unofficialCount++
    }
  })
  
  console.log(`\n📊 Final status:`)
  console.log(`  ✅ Official matches (true): ${officialCount}`)
  console.log(`  ❌ Unofficial matches (false): ${unofficialCount}`)
}

fixMatchStatus()
