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

async function cleanCalendarEvents() {
  console.log('🗑️  Cleaning calendar_events table...\n')
  
  // First get all events to delete
  const { data: allEvents, error: fetchError } = await supabase
    .from('calendar_events')
    .select('id')
  
  if (fetchError) {
    console.error('❌ Error fetching events:', fetchError.message)
    return
  }
  
  if (allEvents.length === 0) {
    console.log('✅ Calendar events table is already empty!')
    return
  }
  
  // Delete all events
  const ids = allEvents.map(e => e.id)
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .in('id', ids)
  
  if (error) {
    console.error('❌ Error:', error.message)
    return
  }
  
  console.log(`✅ Deleted ${ids.length} calendar events!`)
  console.log('📅 Je kunt nu opnieuw synchen met enkel toekomstige events')
}

cleanCalendarEvents()
