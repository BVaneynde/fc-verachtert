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

async function deleteAllMatches() {
  console.log('🗑️  Deleting all matches...\n')
  
  // Get all matches
  const { data: allMatches, error: fetchError } = await supabase
    .from('matches')
    .select('id')
  
  if (fetchError || !allMatches?.length) {
    console.log('✅ No matches to delete')
    return
  }
  
  // Delete all appearances first
  await supabase
    .from('match_appearances')
    .delete()
    .gt('id', '0')
  
  // Delete all matches
  const { error } = await supabase
    .from('matches')
    .delete()
    .gt('id', '0')
  
  if (error) {
    console.error('❌ Error:', error.message)
    return
  }
  
  console.log(`✅ Deleted ${allMatches.length} matches and all appearances!`)
  console.log('🆕 Ready for fresh import from Google Calendar')
}

deleteAllMatches()
