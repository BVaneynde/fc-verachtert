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

async function checkDuplicates() {
  console.log('🔍 Checking for duplicate matches...\n')
  
  const { data: matches, error } = await supabase
    .from('matches')
    .select('id, opponent, date, score_home, score_away')
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error fetching matches:', error)
    return
  }
  
  console.log(`✅ Found ${matches.length} total matches\n`)
  
  // Group by date and opponent to find duplicates
  const grouped = {}
  matches.forEach(match => {
    const key = `${match.date}|${match.opponent}`
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(match)
  })
  
  // Show duplicates
  let duplicateCount = 0
  Object.entries(grouped).forEach(([key, matches]) => {
    if (matches.length > 1) {
      console.log(`⚠️  DUPLICATE FOUND: ${matches.length}x`)
      console.log(`  Date: ${key}`)
      matches.forEach((m, idx) => {
        console.log(`    ${idx + 1}. ID: ${m.id}, Score: ${m.score_home}-${m.score_away}`)
      })
      duplicateCount += matches.length - 1
      console.log()
    }
  })
  
  if (duplicateCount === 0) {
    console.log('✅ No duplicates found!')
    return
  }
  
  console.log(`Found ${duplicateCount} duplicate entries\n`)
  
  // Delete duplicates - keep first, delete rest
  console.log('🗑️  Removing duplicates...\n')
  let deleted = 0
  
  for (const [key, matchList] of Object.entries(grouped)) {
    if (matchList.length > 1) {
      // Keep first, delete rest
      for (let i = 1; i < matchList.length; i++) {
        const { error } = await supabase
          .from('matches')
          .delete()
          .eq('id', matchList[i].id)
        
        if (error) {
          console.error(`❌ Failed to delete ${matchList[i].id}:`, error)
        } else {
          console.log(`✅ Deleted duplicate: ${matchList[i].id}`)
          deleted++
        }
      }
    }
  }
  
  console.log(`\n✅ Deleted ${deleted} duplicate matches`)
}

checkDuplicates()
