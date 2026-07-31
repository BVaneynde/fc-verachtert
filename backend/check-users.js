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

async function checkUsers() {
  console.log('🔍 Checking users table...\n')
  
  const { data, error } = await supabase
    .from('users')
    .select('id, email, role, created_at')
  
  if (error) {
    console.error('❌ Error:', error.message)
    return
  }
  
  if (data.length === 0) {
    console.log('⚠️  No users found in database!')
    return
  }
  
  console.log(`✅ Found ${data.length} user(s):\n`)
  data.forEach(user => {
    console.log(`  Email: ${user.email}`)
    console.log(`  Role: ${user.role}`)
    console.log(`  Created: ${user.created_at}\n`)
  })
}

checkUsers()
