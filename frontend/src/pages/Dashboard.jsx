import { useState, useEffect } from 'react'
import axios from 'axios'
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
      const matchesRes = await axios.get('/api/matches')
      const statsRes = await axios.get('/api/players/stats')
      
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600">⚽ FC Verachtert</h1>
          <nav className="flex gap-4 items-center">
            <Link to="/statistics" className="text-gray-600 hover:text-blue-600">
              📊 Statistieken
            </Link>
            {isAuthenticated && currentUser?.role === 'admin' && (
              <Link to="/admin" className="text-gray-600 hover:text-blue-600">
                ⚙️ Admin
              </Link>
            )}
            {!isAuthenticated && (
              <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded">
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
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📅 Komende Wedstrijden</h2>
                {upcomingMatches.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingMatches.map(match => (
                      <Link
                        key={match.id}
                        to={`/match/${match.id}`}
                        className="block p-4 border-l-4 border-blue-500 hover:bg-gray-50 rounded cursor-pointer transition"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">
                              FC Verachtert - {match.opponent}
                            </p>
                            <p className="text-sm text-gray-600">
                              🕐 {new Date(match.date).toLocaleDateString('nl-NL', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {match.location && (
                              <p className="text-sm text-gray-600">📍 {match.location}</p>
                            )}
                          </div>
                          <span className="text-blue-600 font-semibold">→</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Geen komende wedstrijden</p>
                )}
              </div>

              {/* Recent Results */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🏁 Recente Resultaten</h2>
                {recentMatches.length > 0 ? (
                  <div className="space-y-4">
                    {recentMatches.map(match => (
                      <Link
                        key={match.id}
                        to={`/match/${match.id}`}
                        className="block p-4 border-l-4 border-green-500 hover:bg-gray-50 rounded cursor-pointer transition"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-800">
                              FC Verachtert - {match.opponent}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(match.date).toLocaleDateString('nl-NL')}
                            </p>
                          </div>
                          <span className="text-2xl font-bold text-green-600">
                            {match.score_home ?? '-'} - {match.score_away ?? '-'}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Geen recente wedstrijden</p>
                )}
              </div>
            </div>

            {/* Top Scorers */}
            <div className="bg-white rounded-lg shadow-md p-6 h-fit">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 Top Scorers</h2>
              {topScorers.length > 0 ? (
                <div className="space-y-3">
                  {topScorers.map((player, idx) => (
                    <div key={player.player_id} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-semibold text-gray-800">
                          #{idx + 1} {player.player_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {player.goals} doelpunten | {player.appearances} matchen
                        </p>
                      </div>
                      <span className="text-xl font-bold text-orange-500">{player.goals}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Geen statistieken beschikbaar</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
