import { useState, useEffect } from 'react'
import apiClient from '../utils/api'
import { useNavigate, Link } from 'react-router-dom'
import { cleanOpponentName } from '../utils/helpers'

export default function MatchHistory({ isAuthenticated, currentUser }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('recent')
  const navigate = useNavigate()

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/api/matches')
      
      // Filter only past matches
      const now = new Date()
      const pastMatches = res.data.filter(m => new Date(m.date) < now)
      
      setMatches(pastMatches)
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const sortedMatches = () => {
    const sorted = [...matches]
    if (sortBy === 'recent') {
      return sorted.sort((a, b) => new Date(b.date) - new Date(a.date))
    } else if (sortBy === 'oldest') {
      return sorted.sort((a, b) => new Date(a.date) - new Date(b.date))
    } else if (sortBy === 'wins') {
      return sorted.sort((a, b) => {
        const aWin = (a.score_home ?? 0) > (a.score_away ?? 0) ? 1 : 0
        const bWin = (b.score_home ?? 0) > (b.score_away ?? 0) ? 1 : 0
        return bWin - aWin
      })
    }
    return sorted
  }

  const getResultBadge = (match) => {
    const isWin = (match.score_home ?? 0) > (match.score_away ?? 0)
    const isDraw = (match.score_home ?? 0) === (match.score_away ?? 0)
    
    if (isWin) return { text: 'Gewonnen', color: 'bg-green-100 text-green-800', icon: '✅' }
    if (isDraw) return { text: 'Gelijkspel', color: 'bg-yellow-100 text-yellow-800', icon: '🤝' }
    return { text: 'Verloren', color: 'bg-red-100 text-red-800', icon: '❌' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-fcred to-fcrefdark shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-white hover:text-red-100 text-lg font-semibold transition"
            >
              ← Terug
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">📜 Wedstrijdgeschiedenis</h1>
              <p className="text-red-100 text-sm mt-1">Alle afgelopen wedstrijden</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Gespeeld', value: matches.length, icon: '⚽' },
            { 
              label: 'Gewonnen', 
              value: matches.filter(m => (m.score_home ?? 0) > (m.score_away ?? 0)).length, 
              icon: '✅' 
            },
            { 
              label: 'Gelijkspel', 
              value: matches.filter(m => (m.score_home ?? 0) === (m.score_away ?? 0)).length, 
              icon: '🤝' 
            },
            { 
              label: 'Verloren', 
              value: matches.filter(m => (m.score_home ?? 0) < (m.score_away ?? 0)).length, 
              icon: '❌' 
            }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6 border-t-4 border-fcred hover:shadow-lg transition">
              <p className="text-gray-600 text-sm font-medium">{stat.icon} {stat.label}</p>
              <p className="text-3xl font-bold text-fcred mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-800">Sorteer op:</h2>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'recent', label: 'Recente' },
                { value: 'oldest', label: 'Oudste' },
                { value: 'wins', label: 'Gewonnen' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
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
        </div>

        {/* Matches List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">⏳ Laden...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">📭 Nog geen afgelopen wedstrijden</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedMatches().map(match => {
              const badge = getResultBadge(match)
              const matchDate = new Date(match.date)
              const isWin = (match.score_home ?? 0) > (match.score_away ?? 0)
              
              return (
                <Link
                  key={match.id}
                  to={`/match/${match.id}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-fcred group"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Date */}
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">📅 {matchDate.toLocaleDateString('nl-NL', { weekday: 'short' })}</p>
                      <p className="text-lg font-bold text-gray-800">{matchDate.toLocaleDateString('nl-NL', { day: '2-digit', month: 'short' })}</p>
                    </div>

                    {/* Match Info */}
                    <div className="md:col-span-5">
                      <p className="font-semibold text-gray-800 group-hover:text-fcred transition">
                        FCV vs {cleanOpponentName(match.opponent)}
                      </p>
                      {match.location && (
                        <p className="text-sm text-gray-600">📍 {match.location}</p>
                      )}
                    </div>

                    {/* Score */}
                    <div className="md:col-span-2 text-center">
                      <p className={`text-3xl font-bold ${
                        isWin ? 'text-green-600' : (match.score_home ?? 0) === (match.score_away ?? 0) ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {match.score_home ?? '-'} - {match.score_away ?? '-'}
                      </p>
                    </div>

                    {/* Result Badge */}
                    <div className="md:col-span-3">
                      <span className={`inline-block px-4 py-2 rounded-full font-semibold text-sm ${badge.color}`}>
                        {badge.icon} {badge.text}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
