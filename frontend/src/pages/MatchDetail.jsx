import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '../utils/api'

export default function MatchDetail({ isAuthenticated, currentUser }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [match, setMatch] = useState(null)
  const [players, setPlayers] = useState([])
  const [appearances, setAppearances] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [scoreHome, setScoreHome] = useState(0)
  const [scoreAway, setScoreAway] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const isAdmin = isAuthenticated && currentUser?.role === 'admin'

  useEffect(() => {
    fetchMatchData()
  }, [id])

  const fetchMatchData = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API calls
      const matchRes = await apiClient.get(`/api/matches/${id}`)
      const playersRes = await apiClient.get('/api/players')
      const appearancesRes = await apiClient.get(`/api/matches/${id}/appearances`)

      setMatch(matchRes.data)
      setPlayers(playersRes.data)
      setScoreHome(matchRes.data.score_home || 0)
      setScoreAway(matchRes.data.score_away || 0)

      // Organize appearances by player
      const app = {}
      appearancesRes.data.forEach(a => {
        app[a.player_id] = a
      })
      setAppearances(app)
    } catch (error) {
      console.error('Error fetching match data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAppearance = (playerId, field, value) => {
    setAppearances(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      // Save match score
      await apiClient.put(`/api/matches/${id}`, { score_home: scoreHome, score_away: scoreAway })
      
      // Prepare appearances array - all players who were present or have stats
      const appearancesArray = Object.entries(appearances).map(([playerId, data]) => ({
        player_id: playerId,
        was_present: data.was_present || false,
        goals: data.goals || 0,
        yellow_cards: data.yellow_cards || 0,
        red_cards: data.red_cards || 0
      }))
      
      // Save all player appearances at once
      if (appearancesArray.length > 0) {
        await apiClient.post(`/api/matches/${id}/appearances`, appearancesArray)
      }
      
      alert('✅ Wedstrijd opgeslagen!')
      setIsEditing(false)
      // Refresh data
      await fetchMatchData()
    } catch (error) {
      console.error('Error saving match:', error)
      alert('❌ Fout bij opslaan: ' + (error.response?.data?.error || error.message))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Laden...</div>
  }

  if (!match) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Wedstrijd niet gevonden</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Terug naar home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-fcred shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="text-white hover:text-red-100 text-lg font-semibold transition"
          >
            ← Terug
          </button>
          <h1 className="text-2xl font-bold text-white">Wedstrijddetails</h1>
          {isAdmin && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded transition font-semibold ${
                isEditing
                  ? 'bg-white text-fcred hover:bg-red-50'
                  : 'bg-white text-fcred hover:bg-red-50'
              }`}
            >
              {isEditing ? 'Annuleren' : '✏️ Bewerken'}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Match Score */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <p className="text-gray-600 mb-2 font-bold">FCV</p>
              {isEditing ? (
                <input
                  type="number"
                  value={scoreHome}
                  onChange={(e) => setScoreHome(parseInt(e.target.value) || 0)}
                  className="text-5xl font-bold text-center w-24 border-2 border-blue-600 rounded p-2 mx-auto"
                />
              ) : (
                <p className="text-5xl font-bold text-blue-600">{scoreHome}</p>
              )}
            </div>
            <p className="text-4xl font-light text-gray-400 mx-8">-</p>
            <div className="text-center flex-1">
              <p className="text-gray-600 mb-2">{match.opponent}</p>
              {isEditing ? (
                <input
                  type="number"
                  value={scoreAway}
                  onChange={(e) => setScoreAway(parseInt(e.target.value) || 0)}
                  className="text-5xl font-bold text-center w-24 border-2 border-blue-600 rounded p-2 mx-auto"
                />
              ) : (
                <p className="text-5xl font-bold text-gray-800">{scoreAway}</p>
              )}
            </div>
          </div>
          <p className="text-center text-gray-600 mt-4">
            📅 {new Date(match.date).toLocaleDateString('nl-NL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>

        {/* Players & Appearances */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">👥 Spelers</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-700 font-semibold">Naam</th>
                  <th className="text-center px-4 py-3 text-gray-700 font-semibold">Aanwezig</th>
                  <th className="text-center px-4 py-3 text-gray-700 font-semibold">Doelpunten</th>
                  <th className="text-center px-4 py-3 text-gray-700 font-semibold">🟨 Gele</th>
                  <th className="text-center px-4 py-3 text-gray-700 font-semibold">🟥 Rode</th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => {
                  const app = appearances[player.id] || {}
                  return (
                    <tr key={player.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">{player.name}</td>
                      <td className="text-center px-4 py-3">
                        {isEditing ? (
                          <input
                            type="checkbox"
                            checked={app.was_present || false}
                            onChange={(e) =>
                              handleUpdateAppearance(player.id, 'was_present', e.target.checked)
                            }
                            className="w-5 h-5 cursor-pointer"
                          />
                        ) : (
                          <span className={app.was_present ? '✅' : '❌'} />
                        )}
                      </td>
                      <td className="text-center px-4 py-3">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={app.goals || 0}
                            onChange={(e) =>
                              handleUpdateAppearance(player.id, 'goals', parseInt(e.target.value) || 0)
                            }
                            className="w-12 text-center border border-gray-300 rounded p-1"
                          />
                        ) : (
                          app.goals || 0
                        )}
                      </td>
                      <td className="text-center px-4 py-3">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={app.yellow_cards || 0}
                            onChange={(e) =>
                              handleUpdateAppearance(player.id, 'yellow_cards', parseInt(e.target.value) || 0)
                            }
                            className="w-12 text-center border border-gray-300 rounded p-1"
                          />
                        ) : (
                          app.yellow_cards || 0
                        )}
                      </td>
                      <td className="text-center px-4 py-3">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={app.red_cards || 0}
                            onChange={(e) =>
                              handleUpdateAppearance(player.id, 'red_cards', parseInt(e.target.value) || 0)
                            }
                            className="w-12 text-center border border-gray-300 rounded p-1"
                          />
                        ) : (
                          app.red_cards || 0
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {isEditing && (
            <div className="flex gap-4 mt-8 justify-end">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Annuleren
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {saving ? 'Opslaan...' : '💾 Opslaan'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
