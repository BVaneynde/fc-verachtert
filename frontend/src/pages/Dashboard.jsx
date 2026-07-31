import { useState, useEffect } from 'react'
import apiClient from '../utils/api'
import { Link } from 'react-router-dom'
import { cleanOpponentName } from '../utils/helpers'

export default function Dashboard({ isAuthenticated, currentUser }) {
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [recentMatches, setRecentMatches] = useState([])
  const [topScorers, setTopScorers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const matchesRes = await apiClient.get('/api/matches')
      const statsRes = await apiClient.get('/api/players/stats')
      
      // Separate upcoming and recent
      const now = new Date()
      
      // Deduplicate matches by ID
      const uniqueMatches = Array.from(new Map(matchesRes.data.map(m => [m.id, m])).values())
      
      // Filter: only include official matches (marked as wedstrijd/match in admin)
      const officialMatches = uniqueMatches.filter(m => m.is_official_match === true)
      
      // Get upcoming matches, sort by date (earliest first), take 3
      const upcoming = officialMatches
        .filter(m => new Date(m.date) > now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3)
      
      // Get recent matches, sort by date (latest first), take 1
      const recent = officialMatches
        .filter(m => new Date(m.date) <= now)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 1)
      
      setUpcomingMatches(upcoming)
      setRecentMatches(recent)
      setTopScorers(statsRes.data.sort((a, b) => b.goals - a.goals).slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-fcred to-fcrefdark shadow-2xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white">⚽ FCV</h1>
              <p className="text-red-100 text-sm mt-1">FC Verachtert Dashboard</p>
            </div>
            <nav className="flex flex-wrap gap-2 md:gap-4 items-center">
              <button
                onClick={fetchDashboardData}
                className="text-white hover:text-red-100 font-semibold transition text-sm md:text-base p-2 hover:bg-white/10 rounded-lg"
                title="Vernieuw gegevens"
              >
                🔄 Vernieuwen
              </button>
              <Link to="/statistics" className="text-white hover:text-red-100 font-semibold transition text-sm md:text-base">
                📊 Stats
              </Link>
              <Link to="/head-to-head" className="text-white hover:text-red-100 font-semibold transition text-sm md:text-base">
                🏆 H2H
              </Link>
              <Link to="/match-history" className="text-white hover:text-red-100 font-semibold transition text-sm md:text-base">
                📜 Historie
              </Link>
              {isAuthenticated && currentUser?.role === 'admin' && (
                <Link to="/admin" className="text-white hover:text-red-100 font-semibold transition text-sm md:text-base">
                  ⚙️ Admin
                </Link>
              )}
              {!isAuthenticated && (
                <Link to="/login" className="bg-white text-fcred px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition text-sm md:text-base shadow-md">
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Laden...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Matches */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border-t-4 border-fcred hover:shadow-2xl transition">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900">📅 Komende</h2>
                  <span className="bg-fcred text-white px-3 py-1 rounded-full text-sm font-bold">
                    {upcomingMatches.length}
                  </span>
                </div>
                {upcomingMatches.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingMatches.map((match, idx) => {
                      const daysUntil = Math.ceil((new Date(match.date) - new Date()) / (1000 * 60 * 60 * 24))
                      return (
                        <Link
                          key={match.id}
                          to={`/match/${match.id}`}
                          className="block p-4 md:p-5 bg-gradient-to-r from-red-50 to-white border-l-4 border-fcred hover:from-red-100 rounded-lg cursor-pointer transition-all group"
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-sm md:text-base group-hover:text-fcred transition truncate">
                                FCV vs {cleanOpponentName(match.opponent)}
                              </p>
                              <p className="text-xs md:text-sm text-gray-600 mt-2">
                                🕐 {new Date(match.date).toLocaleDateString('nl-NL', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {match.location && (
                                <p className="text-xs md:text-sm text-gray-600 mt-1">📍 {match.location}</p>
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs md:text-sm font-bold whitespace-nowrap ${
                                daysUntil <= 1 ? 'bg-fcred text-white animate-pulse' : 'bg-red-100 text-fcred'
                              }`}>
                                {daysUntil === 0 ? '🔥 VANDAAG' : `${daysUntil}d`}
                              </span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">📭 Geen komende wedstrijden</p>
                )}
              </div>

              {/* Recent Results */}
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border-t-4 border-fcred hover:shadow-2xl transition">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900">🏁 Vorige</h2>
                  <Link 
                    to="/match-history"
                    className="text-sm font-semibold text-fcred hover:text-fcrefdark transition"
                  >
                    Zie alles →
                  </Link>
                </div>
                {recentMatches.length > 0 ? (
                  <div className="space-y-3">
                    {recentMatches.map(match => {
                      const isWin = (match.score_home ?? 0) > (match.score_away ?? 0)
                      const isDraw = (match.score_home ?? 0) === (match.score_away ?? 0)
                      return (
                        <Link
                          key={match.id}
                          to={`/match/${match.id}`}
                          className={`block p-4 md:p-5 border-l-4 border-fcred rounded-lg cursor-pointer transition-all group ${
                            isWin ? 'bg-gradient-to-r from-green-50 to-white hover:from-green-100' :
                            isDraw ? 'bg-gradient-to-r from-yellow-50 to-white hover:from-yellow-100' :
                            'bg-gradient-to-r from-red-50 to-white hover:from-red-100'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-sm md:text-base group-hover:text-fcred transition truncate">
                                FCV vs {cleanOpponentName(match.opponent)}
                              </p>
                              <p className="text-xs md:text-sm text-gray-600 mt-2">
                                📅 {new Date(match.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <span className={`block text-lg md:text-2xl font-black ${
                                isWin ? 'text-green-600' : isDraw ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {match.score_home ?? '-'}-{match.score_away ?? '-'}
                              </span>
                              <p className="text-xs font-bold text-gray-600 mt-1">
                                {isWin ? '✅ Win' : isDraw ? '🤝 Draw' : '❌ Loss'}
                              </p>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">📭 Geen wedstrijden</p>
                )}
              </div>
            </div>

            {/* Top Scorers */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 h-fit border-t-4 border-fcred hover:shadow-2xl transition">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">🏆 Top Scorers</h2>
              {topScorers.length > 0 ? (
                <div className="space-y-3">
                  {topScorers.map((player, idx) => (
                    <div 
                      key={player.player_id} 
                      className="flex items-center justify-between p-4 bg-white rounded-lg border-t-4 border-yellow-400 hover:shadow-lg transition group shadow-sm"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-fcred min-w-[2.5rem]">#{idx + 1}</span>
                          <p className="font-bold text-gray-900 group-hover:text-fcred transition">
                            {player.player_name}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 font-semibold">
                          {player.appearances} matchen
                        </p>
                      </div>
                      <div className="text-center flex-shrink-0 ml-4">
                        <span className="block text-3xl font-black text-fcred">⚽</span>
                        <span className="block text-2xl font-black text-yellow-600">{player.goals}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Geen statistieken</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
