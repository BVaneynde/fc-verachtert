import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../utils/api'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await apiClient.post('/api/auth/login', { email, password })
      onLogin(res.data.user, res.data.token)
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Login mislukt. Controleer je gegevens.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md border-t-4 border-fcred">
        <h1 className="text-4xl font-bold text-fcred mb-1 text-center">⚽ FC Verachtert</h1>
        <p className="text-gray-600 text-center mb-2 font-semibold">Transport Verachtert</p>
        <p className="text-gray-500 text-center mb-8 text-sm">Admin Login</p>

        {error && (
          <div className="bg-red-50 border-l-4 border-fcred text-fcred px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-fcred focus:border-transparent"
              placeholder="benjamin@fcverachtert.be"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Wachtwoord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-fcred focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-fcred text-white font-semibold py-2 rounded hover:bg-fcrefdark transition disabled:bg-gray-400"
          >
            {loading ? 'Inloggen...' : 'Inloggen'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Eerste keer? Contact benjamin@fcverachtert.be
        </p>
      </div>
    </div>
  )
}
