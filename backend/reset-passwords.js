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

async function resetPasswords() {
  console.log('🔐 Resetting admin passwords...\n')

  const admins = [
    { email: 'benjamin@fcverachtert.be', password: 'FCV_Benjamin' },
    { email: 'lander@fcverachtert.be', password: 'FCV_Lander' }
  ]

  for (const admin of admins) {
    try {
      const salt = await bcryptjs.genSalt(10)
      const hashedPassword = await bcryptjs.hash(admin.password, salt)

      const { error } = await supabase
        .from('users')
        .update({ password_hash: hashedPassword })
        .eq('email', admin.email)

      if (error) {
        console.log(`❌ ${admin.email}: ${error.message}`)
      } else {
        console.log(`✅ ${admin.email}: Password reset successfully`)
      }
    } catch (error) {
      console.log(`❌ ${admin.email}: ${error.message}`)
    }
  }

  console.log('\n✅ Done!')
  process.exit(0)
}

resetPasswords()
