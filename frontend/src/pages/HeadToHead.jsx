import { useState, useEffect } from 'react'
import apiClient from '../utils/api'
import { Link } from 'react-router-dom'

export default function HeadToHead() {
  const [stats, setStats] = useState([])
  const [sortBy, setSortBy] = useState('played')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHeadToHead()
  }, [])

  const fetchHeadToHead = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/api/matches/head-to-head/all')
      setStats(res.data)
    } catch (error) {
      console.error('Error fetching head-to-head:', error)
    } finally {
      setLoading(false)
    }
  }

  const sortedStats = [...stats].sort((a, b) => {
    if (sortBy === 'played') return b.played - a.played
    if (sortBy === 'won') return b.won - a.won
    if (sortBy === 'goals') return b.goals_for - a.goals_for
    return 0
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-fcred shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-white hover:text-red-100 text-lg font-semibold transition">
            ← Terug naar home
          </Link>
          <h1 className="text-2xl font-bold text-white">🏆 Head-to-Head Statistieken</h1>
          <div></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Sort Buttons */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <p className="text-gray-700 font-semibold mb-3">Sorteren op:</p>
          <div className="flex gap-3 flex-wrap">
            {[
              { value: 'played', label: '🎮 Aantal matchen' },
              { value: 'won', label: '🏅 Gewonnen' },
              { value: 'goals', label: '⚽ Doelpunten voor' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`px-4 py-2 rounded transition font-semibold ${
                  sortBy === option.value
                    ? 'bg-fcred text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Head-to-Head Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Laden...</div>
          ) : sortedStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-gray-700 font-semibold">Tegenstander</th>
                    <th className="text-center px-6 py-4 text-gray-700 font-semibold">🎮 Matchen</th>
                    <th className="text-center px-6 py-4 text-gray-700 font-semibold">🏅 Gewonnen</th>
                    <th className="text-center px-6 py-4 text-gray-700 font-semibold">🤝 Gelijkspel</th>
                    <th className="text-center px-6 py-4 text-gray-700 font-semibold">❌ Verloren</th>
                    <th className="text-center px-6 py-4 text-gray-700 font-semibold">⚽ Voor/Tegen</th>
                    <th className="text-center px-6 py-4 text-gray-700 font-semibold">📅 Laatste match</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStats.map((opponent, idx) => (
                    <tr key={opponent.opponent} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-800">{opponent.opponent}</td>
                      <td className="text-center px-6 py-4 font-bold text-blue-600">
                        {opponent.played}
                      </td>
                      <td className="text-center px-6 py-4 font-bold text-green-600">
                        {opponent.won}
                      </td>
                      <td className="text-center px-6 py-4 font-bold text-yellow-600">
                        {opponent.drawn}
                      </td>
                      <td className="text-center px-6 py-4 font-bold text-red-600">
                        {opponent.lost}
                      </td>
                      <td className="text-center px-6 py-4 font-bold text-fcred">
                        {opponent.goals_for} - {opponent.goals_against}
                      </td>
                      <td className="text-center px-6 py-4 text-sm text-gray-600">
                        {opponent.last_match ? new Date(opponent.last_match).toLocaleDateString('nl-NL') : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">Geen head-to-head data beschikbaar</div>
          )}
        </div>

        {/* Stats Summary */}
        {sortedStats.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm font-semibold mb-2">TOTAAL TEGENSTANDERS</p>
              <p className="text-3xl font-bold text-gray-800">{sortedStats.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm font-semibold mb-2">TOTAAL MATCHEN</p>
              <p className="text-3xl font-bold text-gray-800">
                {sortedStats.reduce((sum, o) => sum + o.played, 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm font-semibold mb-2">TOTAAL GEWONNEN</p>
              <p className="text-3xl font-bold text-green-600">
                {sortedStats.reduce((sum, o) => sum + o.won, 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm font-semibold mb-2">TOTAAL DOELPUNTEN</p>
              <p className="text-3xl font-bold text-fcred">
                {sortedStats.reduce((sum, o) => sum + o.goals_for, 0)}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
