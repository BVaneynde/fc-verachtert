import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import bcryptjs from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load env from parent directory
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

// Use SERVICE_ROLE_KEY for admin setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function registerAdmin(email, password) {
  try {
    console.log(`\n📝 Registering ${email}...`)
    
    // Hash password
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)

    // Insert directly via SERVICE_ROLE_KEY
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        email, 
        password_hash: hashedPassword, 
        role: 'admin' 
      }])
      .select()

    if (error) {
      console.error(`❌ Failed: ${error.message}`)
      return false
    }

    console.log(`✅ Success: ${email} registered`)
    console.log(`   Password: ${password}`)
    return true
  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
    return false
  }
}

async function setupAdminAccounts() {
  console.log('🚀 FC Verachtert - Admin Account Setup')
  console.log('=====================================\n')

  const admins = [
    { email: 'benjamin@fcverachtert.be', password: 'FCV_Benjamin' },
    { email: 'lander@fcverachtert.be', password: 'FCV_Lander' }
  ]

  let successCount = 0
  for (const admin of admins) {
    const success = await registerAdmin(admin.email, admin.password)
    if (success) successCount++
  }

  console.log('\n=====================================')
  console.log(`\n✅ Setup complete! ${successCount}/${admins.length} accounts created.\n`)
  console.log('📝 Login credentials:')
  admins.forEach(admin => {
    console.log(`   Email: ${admin.email}`)
    console.log(`   Password: ${admin.password}`)
    console.log()
  })
  console.log('🔗 Go to: http://localhost:5173/login')
}

setupAdminAccounts()
