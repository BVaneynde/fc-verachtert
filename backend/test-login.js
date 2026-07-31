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

async function testLogin() {
  console.log('🧪 Testing login...\n')

  const testEmail = 'benjamin@fcverachtert.be'
  const testPassword = 'FCV_Benjamin'

  try {
    // Get user from DB
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single()

    if (error || !user) {
      console.log(`❌ User not found: ${error?.message}`)
      process.exit(1)
    }

    console.log(`✅ User found: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Password hash exists: ${!!user.password_hash}`)
    console.log(`   Password hash length: ${user.password_hash?.length || 0}`)

    // Test password comparison
    const passwordMatch = await bcryptjs.compare(testPassword, user.password_hash)
    console.log(`\n🔐 Password test (${testPassword}):`)
    console.log(`   Match result: ${passwordMatch}`)

    if (!passwordMatch) {
      console.log(`\n❌ Password mismatch! Hash may be corrupted.`)
      
      // Try to fix by rehashing
      console.log(`\n🔧 Attempting to fix...`)
      const salt = await bcryptjs.genSalt(10)
      const newHash = await bcryptjs.hash(testPassword, salt)
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: newHash })
        .eq('email', testEmail)
      
      if (updateError) {
        console.log(`❌ Update failed: ${updateError.message}`)
      } else {
        console.log(`✅ Password updated! Try login again.`)
      }
    } else {
      console.log(`✅ Password verified successfully!`)
    }

  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
  }

  process.exit(0)
}

testLogin()
