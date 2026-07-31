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

async function deleteTestMatches() {
  console.log('🗑️  Deleting test matches...\n')
  
  const testOpponents = ['Ajax Amateurs', 'FC De Toekomst', 'USV Elinkwijk']
  
  for (const opponent of testOpponents) {
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select('id')
      .eq('opponent', opponent)
      .single()
    
    if (match && !fetchError) {
      // Delete appearances first (foreign key constraint)
      await supabase
        .from('match_appearances')
        .delete()
        .eq('match_id', match.id)
      
      // Then delete match
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', match.id)
      
      if (!error) {
        console.log(`✅ Deleted: ${opponent}`)
      }
    }
  }
  
  console.log('\n✅ Test matches cleaned up!')
}

deleteTestMatches()
