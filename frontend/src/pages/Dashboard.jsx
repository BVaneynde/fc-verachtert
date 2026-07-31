import { useState, useEffect } from 'react'
import apiClient from '../utils/api'
import { Link } from 'react-router-dom'

export default function Dashboard({ isAuthenticated, currentUser }) {
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [recentMatches, setRecentMatches] = useState([])
  const [topScorers, setTopScorers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API calls
      const matchesRes = await apiClient.get('/api/matches')
      const statsRes = await apiClient.get('/api/players/stats')
      
      // Separate upcoming and recent
      const now = new Date()
      setUpcomingMatches(matchesRes.data.filter(m => new Date(m.date) > now).slice(0, 5))
      setRecentMatches(matchesRes.data.filter(m => new Date(m.date) <= now).slice(0, 5))
      setTopScorers(statsRes.data.sort((a, b) => b.goals - a.goals).slice(0, 10))
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Header */}
      <header className="bg-fcred shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">⚽ FC Verachtert</h1>
          <nav className="flex gap-6 items-center">
            <Link to="/statistics" className="text-white hover:text-red-100 font-semibold transition">
              📊 Statistieken
            </Link>
            <Link to="/head-to-head" className="text-white hover:text-red-100 font-semibold transition">
              🏆 Head-to-Head
            </Link>
            {isAuthenticated && currentUser?.role === 'admin' && (
              <Link to="/admin" className="text-white hover:text-red-100 font-semibold transition">
                ⚙️ Admin
              </Link>
            )}
            {!isAuthenticated && (
              <Link to="/login" className="bg-white text-fcred px-4 py-2 rounded font-semibold hover:bg-red-50 transition">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Laden...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Upcoming Matches */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-t-4 border-fcred flex flex-col h-auto md:h-96">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📅 Komende Wedstrijden</h2>
                {upcomingMatches.length > 0 ? (
                  <div className="space-y-2 overflow-y-auto pr-2">
                    {upcomingMatches.map(match => {
                      const daysUntil = Math.ceil((new Date(match.date) - new Date()) / (1000 * 60 * 60 * 24))
                      return (
                        <Link
                          key={match.id}
                          to={`/match/${match.id}`}
                          className="block p-3 md:p-4 border-l-4 border-fcred hover:bg-red-50 rounded cursor-pointer transition flex-shrink-0"
                        >
                          <div className="flex justify-between items-start gap-2 md:gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 text-sm md:text-base truncate">
                                FC Verachtert vs {match.opponent}
                              </p>
                              <p className="text-xs md:text-sm text-gray-600 mt-1">
                                🕐 {new Date(match.date).toLocaleDateString('nl-NL', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {match.location && (
                                <p className="text-xs md:text-sm text-gray-600">📍 {match.location}</p>
                              )}
                            </div>
                            <div className="text-right ml-2 flex-shrink-0">
                              <span className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold whitespace-nowrap ${
                                daysUntil === 0 ? 'bg-fcred text-white' : 'bg-red-100 text-fcred'
                              }`}>
                                {daysUntil === 0 ? 'VANDAAG!' : `${daysUntil}d`}
                              </span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">📭 Geen komende wedstrijden</p>
                )}
              </div>

              {/* Recent Results */}
              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-fcred flex flex-col h-auto md:h-96">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🏁 Recente Resultaten</h2>
                {recentMatches.length > 0 ? (
                  <div className="space-y-2 overflow-y-auto pr-2">
                    {recentMatches.map(match => {
                      const isWin = (match.score_home ?? 0) > (match.score_away ?? 0)
                      const isDraw = (match.score_home ?? 0) === (match.score_away ?? 0)
                      return (
                        <Link
                          key={match.id}
                          to={`/match/${match.id}`}
                          className="block p-3 md:p-4 border-l-4 border-fcred hover:bg-red-50 rounded cursor-pointer transition flex-shrink-0"
                        >
                          <div className="flex justify-between items-center gap-2 md:gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 text-sm md:text-base truncate">
                                FC Verachtert vs {match.opponent}
                              </p>
                              <p className="text-xs md:text-sm text-gray-600">
                                📅 {new Date(match.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: '2-digit' })}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className={`text-lg md:text-2xl font-bold ${
                                isWin ? 'text-green-600' : isDraw ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {match.score_home ?? '-'}-{match.score_away ?? '-'}
                              </span>
                              <p className="text-xs font-semibold text-gray-600 mt-1">
                                {isWin ? '✅ Win' : isDraw ? '🤝 Draw' : '❌ Loss'}
                              </p>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">📭 Geen recente wedstrijden</p>
                )}
              </div>
            </div>

            {/* Top Scorers */}
            <div className="bg-white rounded-lg shadow-md p-6 h-fit border-t-4 border-fcred">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 Top Scorers</h2>
              {topScorers.length > 0 ? (
                <div className="space-y-3">
                  {topScorers.map((player, idx) => (
                    <div key={player.player_id} className="flex justify-between items-center p-3 bg-red-50 rounded border-l-4 border-fcred">
                      <div>
                        <p className="font-semibold text-gray-800">
                          🥇 {player.player_name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {player.appearances} matchen
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-fcred">{player.goals}⚽</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Geen statistieken beschikbaar</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
