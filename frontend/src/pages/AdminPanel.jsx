import { useState, useEffect } from 'react'
import apiClient from '../utils/api'
import { useNavigate } from 'react-router-dom'

export default function AdminPanel({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('players')
  const [players, setPlayers] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])
  const [newPlayerName, setNewPlayerName] = useState('')
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/')
      return
    }
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API calls
      const playersRes = await apiClient.get('/api/players')
      const eventsRes = await apiClient.get('/api/calendar/events')
      setPlayers(playersRes.data)
      setCalendarEvents(eventsRes.data)
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPlayer = async (e) => {
    e.preventDefault()
    if (!newPlayerName.trim()) return

    try {
      await apiClient.post('/api/players', { name: newPlayerName })
      alert('✅ Speler toegevoegd!')
      setNewPlayerName('')
      fetchAdminData()
    } catch (error) {
      console.error('Error adding player:', error)
      alert('❌ Fout: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleToggleCalendarEvent = async (eventId, isMatch, eventTitle, eventDate) => {
    try {
      const newIsMatch = !isMatch
      
      // Update the event
      await apiClient.put(`/api/calendar/${eventId}/mark-as-match`, { is_match: newIsMatch })
      
      // If marking as match and not already marked, create a match entry
      if (newIsMatch && !isMatch) {
        // Create match from calendar event
        await apiClient.post('/api/matches', {
          date: eventDate,
          opponent: eventTitle,
          location: 'TBD',
          notes: 'Uit Google Calendar',
          is_official_match: true
        })
      }
      
      alert(`✅ Event ${newIsMatch ? 'als wedstrijd gemarkeerd' : 'uit wedstrijdlijst verwijderd'}`)
      fetchAdminData()
    } catch (error) {
      console.error('Error toggling event:', error)
      alert('❌ Fout: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleSyncCalendar = async () => {
    try {
      setSyncing(true)
      const res = await apiClient.post('/api/calendar/sync')
      alert(`✅ ${res.data.eventsCount} nieuwe evenementen opgehaald!`)
      fetchAdminData()
    } catch (error) {
      console.error('Error syncing calendar:', error)
      alert('❌ Fout: ' + (error.response?.data?.error || error.message))
    } finally {
      setSyncing(false)
    }
  }

  const handleLogout = async () => {
    onLogout()
    // Redirect to home after logout
    setTimeout(() => navigate('/'), 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-fcred shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-white hover:text-red-100 text-lg font-semibold transition"
            >
              ← Terug naar Dashboard
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">⚙️ Admin Panel</h1>
              <p className="text-red-100 text-sm">FC Verachtert Beheer</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white font-semibold">{currentUser?.email}</p>
              <p className="text-red-100 text-sm">Admin</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-white text-fcred rounded-lg hover:bg-red-50 transition font-semibold shadow-md"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            {[
              { id: 'players', label: '👥 Spelers' },
              { id: 'calendar', label: '📅 Kalender' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Players Tab */}
          {activeTab === 'players' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Speler Toevoegen</h2>
                <form onSubmit={handleAddPlayer} className="flex gap-3">
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-fcred"
                    placeholder="Voer spelernaam in"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-fcred text-white rounded hover:bg-fcrefdark transition font-semibold"
                  >
                    Toevoegen
                  </button>
                </form>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Huidige Spelers</h2>
                <div className="space-y-2">
                  {players.map(player => (
                    <div
                      key={player.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <span className="text-gray-800">{player.name}</span>
                      <span
                        className={`text-sm px-3 py-1 rounded ${
                          player.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {player.is_active ? 'Actief' : 'Inactief'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">📅 Google Calendar Sync</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Haalt automatisch alle <strong>toekomstige</strong> evenementen uit je Google Calendar. 
                  Alle events worden standaard als "Wedstrijd" ingesteld. 
                  Klik op een event om het uit te sluiten als het geen wedstrijd is (bijv. BBQ).
                </p>
                <button
                  onClick={handleSyncCalendar}
                  disabled={syncing}
                  className="px-6 py-2 bg-fcred text-white rounded hover:bg-fcrefdark transition disabled:bg-gray-400 font-semibold"
                >
                  {syncing ? '⏳ Synchroniseren...' : '🔄 Google Calendar Sync'}
                </button>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Google Calendar Evenementen</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Markeer welke evenementen wedstrijden zijn (BBQ/events kunnen ook weggelaten worden)
                </p>
                {calendarEvents.length === 0 ? (
                  <p className="text-gray-600">Geen evenementen gevonden. Klik "Google Calendar Sync" om op te halen.</p>
                ) : (
                  <div className="space-y-3">
                    {calendarEvents.map(event => (
                      <div
                        key={event.id}
                        className="flex justify-between items-center p-4 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-semibold text-gray-800">{event.title}</p>
                          <p className="text-sm text-gray-600">
                            📅 {new Date(event.event_date).toLocaleDateString('nl-NL')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleToggleCalendarEvent(event.id, event.is_match, event.title, event.event_date)}
                          className={`px-4 py-2 rounded transition font-semibold ${
                            event.is_match
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-yellow-600 text-white hover:bg-yellow-700'
                          }`}
                        >
                          {event.is_match ? '✓ Wedstrijd' : '⚠️ Geen wedstrijd'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
