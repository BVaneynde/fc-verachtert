import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import bcryptjs from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testPassword() {
  console.log('🔍 Checking password hash...\n')
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'benjamin@fcverachtert.be')
    .single()
  
  if (error) {
    console.error('❌ Error:', error.message)
    return
  }
  
  console.log('📋 User data:')
  console.log('  Email:', user.email)
  console.log('  Password Hash exists:', !!user.password_hash)
  console.log('  Hash:', user.password_hash?.substring(0, 50) + '...')
  console.log()
  
  // Test password verification
  const testPassword = 'FCV_Benjamin'
  console.log(`🔐 Testing password: "${testPassword}"`)
  
  try {
    const isValid = await bcryptjs.compare(testPassword, user.password_hash)
    console.log(`   Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`)
  } catch (err) {
    console.error('   Error:', err.message)
  }
}

testPassword()
