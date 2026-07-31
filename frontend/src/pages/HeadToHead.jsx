import { useState, useEffect } from 'react'
import apiClient from '../utils/api'
import { Link } from 'react-router-dom'
import { cleanOpponentName } from '../utils/helpers'

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-fcred to-fcrefdark shadow-2xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-white hover:text-red-100 text-lg font-semibold transition">
              ← Terug
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white">🏆 Head-to-Head</h1>
              <p className="text-red-100 text-sm mt-1">Statistieken tegen tegenstanders</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Sort Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <p className="text-gray-900 font-black text-lg mb-4">Sorteren op:</p>
          <div className="flex gap-3 flex-wrap">
            {[
              { value: 'played', label: '🎮 Matchen' },
              { value: 'won', label: '🏅 Wins' },
              { value: 'goals', label: '⚽ Doelpunten' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`px-4 py-2 rounded-lg transition font-bold ${
                  sortBy === option.value
                    ? 'bg-fcred text-white shadow-md'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Head-to-Head Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-fcred">
          {loading ? (
            <div className="p-12 text-center text-gray-500">⏳ Laden...</div>
          ) : sortedStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                  <tr>
                    <th className="text-left px-4 md:px-6 py-4 text-gray-900 font-black">Tegenstander</th>
                    <th className="text-center px-3 md:px-6 py-4 text-gray-900 font-black text-sm md:text-base">🎮</th>
                    <th className="text-center px-3 md:px-6 py-4 text-gray-900 font-black text-sm md:text-base">🏅</th>
                    <th className="text-center px-3 md:px-6 py-4 text-gray-900 font-black text-sm md:text-base">🤝</th>
                    <th className="text-center px-3 md:px-6 py-4 text-gray-900 font-black text-sm md:text-base">❌</th>
                    <th className="text-center px-3 md:px-6 py-4 text-gray-900 font-black text-sm md:text-base">⚽</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStats.map((opponent) => (
                    <tr key={opponent.opponent} className="border-b border-gray-100 hover:bg-red-50 transition">
                      <td className="px-4 md:px-6 py-4 font-bold text-gray-900 text-sm md:text-base">{cleanOpponentName(opponent.opponent)}</td>
                      <td className="text-center px-3 md:px-6 py-4 font-bold text-blue-600">{opponent.played}</td>
                      <td className="text-center px-3 md:px-6 py-4 font-bold text-green-600">{opponent.won}</td>
                      <td className="text-center px-3 md:px-6 py-4 font-bold text-yellow-600">{opponent.drawn}</td>
                      <td className="text-center px-3 md:px-6 py-4 font-bold text-red-600">{opponent.lost}</td>
                      <td className="text-center px-3 md:px-6 py-4 font-bold text-fcred">{opponent.goals_for}-{opponent.goals_against}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">📭 Geen data beschikbaar (toekomstige matchen tellen niet mee)</div>
          )}
        </div>

        {/* Stats Summary */}
        {sortedStats.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-fcred hover:shadow-xl transition">
              <p className="text-gray-600 text-xs font-bold mb-2">TEGENSTANDERS</p>
              <p className="text-3xl md:text-4xl font-black text-fcred">{sortedStats.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition">
              <p className="text-gray-600 text-xs font-bold mb-2">TOTAAL MATCHEN</p>
              <p className="text-3xl md:text-4xl font-black text-blue-600">
                {sortedStats.reduce((sum, o) => sum + o.played, 0)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl transition">
              <p className="text-gray-600 text-xs font-bold mb-2">GEWONNEN</p>
              <p className="text-3xl md:text-4xl font-black text-green-600">
                {sortedStats.reduce((sum, o) => sum + o.won, 0)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500 hover:shadow-xl transition">
              <p className="text-gray-600 text-xs font-bold mb-2">DOELPUNTEN VOOR</p>
              <p className="text-3xl md:text-4xl font-black text-fcred">
                {sortedStats.reduce((sum, o) => sum + o.goals_for, 0)}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
