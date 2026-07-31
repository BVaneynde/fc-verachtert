import { useState, useEffect } from 'react'
import apiClient from '../utils/api'
import { Link } from 'react-router-dom'

export default function Statistics() {
  const [stats, setStats] = useState([])
  const [sortBy, setSortBy] = useState('goals')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      const res = await apiClient.get('/api/players/stats')
      setStats(res.data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const sortedStats = [...stats].sort((a, b) => {
    if (sortBy === 'goals') return b.goals - a.goals
    if (sortBy === 'cards') return b.yellow_cards - a.yellow_cards
    if (sortBy === 'matches') return b.appearances - a.appearances
    return 0
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-blue-600 hover:text-blue-800 text-lg">
            ← Terug naar home
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">📊 Seizoen Statistieken</h1>
          <div></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Sort Buttons */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <p className="text-gray-700 font-semibold mb-3">Sorteren op:</p>
          <div className="flex gap-3 flex-wrap">
            {[
              { value: 'goals', label: '⚽ Doelpunten' },
              { value: 'cards', label: '🟨 Gele kaarten' },
              { value: 'matches', label: '🎮 Aantal matchen' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`px-4 py-2 rounded transition ${
                  sortBy === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Statistics Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Laden...</div>
          ) : sortedStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-gray-700 font-semibold">#</th>
                    <th className="text-left px-6 py-4 text-gray-700 font-semibold">Speler</th>
                    <th className="text-center px-6 py-4 text-gray-700 font-semibold">⚽ Doelpunten</th>
                    <th className="text-center px-6 py-4 text-gray-700 font-semibold">🟨 Kaarten</th>
                    <th className="text-center px-6 py-4 text-gray-700 font-semibold">🎮 Matchen</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStats.map((player, idx) => (
                    <tr key={player.player_id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-bold text-gray-700">#{idx + 1}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">{player.player_name}</td>
                      <td className="text-center px-6 py-4 text-lg font-bold text-orange-500">
                        {player.goals}
                      </td>
                      <td className="text-center px-6 py-4 text-lg font-bold text-yellow-500">
                        {player.yellow_cards}
                      </td>
                      <td className="text-center px-6 py-4 text-lg font-bold text-blue-600">
                        {player.appearances}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">Geen statistieken beschikbaar</div>
          )}
        </div>
      </main>
    </div>
  )
}
