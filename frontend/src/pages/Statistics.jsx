import { useState, useEffect } from 'react'
import apiClient from '../utils/api'
import { Link } from 'react-router-dom'

export default function Statistics() {
  const [stats, setStats] = useState([])
  const [matches, setMatches] = useState([])
  const [sortBy, setSortBy] = useState('goals')
  const [selectedSeason, setSelectedSeason] = useState('current')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const statsRes = await apiClient.get('/api/players/stats')
      const matchesRes = await apiClient.get('/api/matches')
      setStats(statsRes.data)
      setMatches(matchesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate seasons based on August-July
  const getSeasonYear = (date) => {
    const d = new Date(date)
    return d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1
  }

  // Get available seasons from matches
  const seasons = Array.from(new Set(matches.map(m => getSeasonYear(m.date))))
    .sort((a, b) => b - a)
  
  const currentSeason = getSeasonYear(new Date())
  
  // Filter stats by season
  const filteredStats = stats.filter(player => {
    if (selectedSeason === 'current') {
      return player.season === currentSeason
    }
    return player.season === parseInt(selectedSeason)
  })

  const sortedStats = [...filteredStats].sort((a, b) => {
    if (sortBy === 'goals') return b.goals - a.goals
    if (sortBy === 'yellow') return b.yellow_cards - a.yellow_cards
    if (sortBy === 'red') return b.red_cards - a.red_cards
    if (sortBy === 'matches') return b.appearances - a.appearances
    return 0
  })

  // Calculate total matches for selected season
  const totalSeasonMatches = matches.filter(m => {
    const matchSeason = getSeasonYear(m.date)
    const isSameSeason = selectedSeason === 'current' 
      ? matchSeason === currentSeason 
      : matchSeason === parseInt(selectedSeason)
    return isSameSeason && new Date(m.date) < new Date()
  }).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-fcred shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-white hover:text-red-100 text-lg font-semibold transition">
            ← Terug naar home
          </Link>
          <h1 className="text-2xl font-bold text-white">📊 Seizoen Statistieken</h1>
          <div></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Season Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <p className="text-gray-700 font-semibold mb-3">Seizoen:</p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setSelectedSeason('current')}
              className={`px-4 py-2 rounded transition font-semibold ${
                selectedSeason === 'current'
                  ? 'bg-fcred text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🏆 Huidig seizoen ({currentSeason}/{currentSeason + 1})
            </button>
            {seasons.map(season => (
              season !== currentSeason && (
                <button
                  key={season}
                  onClick={() => setSelectedSeason(season.toString())}
                  className={`px-4 py-2 rounded transition font-semibold ${
                    selectedSeason === season.toString()
                      ? 'bg-fcred text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {season}/{season + 1}
                </button>
              )
            ))}
          </div>
        </div>

        {/* Total Matches Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">📊 Totaal matchen dit seizoen</p>
              <p className="text-3xl font-bold text-fcred mt-2">{totalSeasonMatches}</p>
            </div>
            <div className="text-5xl">⚽</div>
          </div>
        </div>

        {/* Sort Buttons */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <p className="text-gray-700 font-semibold mb-3">Sorteren op:</p>
          <div className="flex gap-3 flex-wrap">
            {[
              { value: 'goals', label: '⚽ Doelpunten' },
              { value: 'yellow', label: '🟨 Gele kaarten' },
              { value: 'red', label: '🔴 Rode kaarten' },
              { value: 'matches', label: '🎮 Aantal matchen' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`px-4 py-2 rounded transition ${
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
                    <th className="text-center px-6 py-4 text-gray-700 font-semibold">🟨 Gele kaarten</th>
                    <th className="text-center px-6 py-4 text-gray-700 font-semibold">🔴 Rode kaarten</th>
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
                      <td className="text-center px-6 py-4 text-lg font-bold text-red-600">
                        {player.red_cards || 0}
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
