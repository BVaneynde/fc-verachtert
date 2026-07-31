import { useState, useEffect } from 'react'
import apiClient from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { cleanOpponentName } from '../utils/helpers'

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
      
      // Update the calendar event
      await apiClient.put(`/api/calendar/${eventId}/mark-as-match`, { is_match: newIsMatch })
      
      // If marking as match, create/mark match as official
      if (newIsMatch && !isMatch) {
        // Create match from calendar event (with duplicate prevention)
        await apiClient.post('/api/matches/create-or-skip', {
          date: eventDate,
          opponent: eventTitle,
          location: 'TBD',
          notes: 'Uit Google Calendar',
          is_official_match: true
        })
        
        // Also mark any existing match as official
        await apiClient.put('/api/matches/mark-official-by-event', {
          event_date: eventDate, 
          opponent: eventTitle 
        })
      }
      
      // If unmarking as match, mark match as unofficial
      if (!newIsMatch && isMatch) {
        // Mark match as unofficial
        await apiClient.put('/api/matches/mark-unofficial-by-event', {
          event_date: eventDate, 
          opponent: eventTitle 
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-fcred to-fcrefdark shadow-2xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-white hover:text-red-100 text-lg font-semibold transition"
              >
                ← Terug
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white">⚙️ Admin</h1>
                <p className="text-red-100 text-sm mt-1">FC Verachtert Beheer</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="text-right">
                <p className="text-white font-bold text-sm md:text-base">{currentUser?.email}</p>
                <p className="text-red-100 text-xs md:text-sm">Admin Account</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-white text-fcred rounded-lg hover:bg-red-50 transition font-bold shadow-md w-full md:w-auto"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border-t-4 border-fcred">
          <div className="flex border-b">
            {[
              { id: 'players', label: '👥 Spelers' },
              { id: 'calendar', label: '📅 Kalender' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 md:px-6 py-4 font-bold transition text-sm md:text-base ${
                  activeTab === tab.id
                    ? 'border-b-4 border-fcred text-fcred bg-red-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Players Tab */}
          {activeTab === 'players' && (
            <div className="p-6 md:p-8">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">➕ Speler Toevoegen</h2>
                <form onSubmit={handleAddPlayer} className="flex flex-col md:flex-row gap-3">
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-fcred focus:border-fcred transition text-sm md:text-base"
                    placeholder="Voer spelernaam in..."
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-fcred text-white rounded-lg hover:bg-fcrefdark transition font-bold shadow-md text-sm md:text-base whitespace-nowrap"
                  >
                    Toevoegen
                  </button>
                </form>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">👥 Huidige Spelers ({players.length})</h2>
                {players.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Geen spelers gevonden</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {players.map(player => (
                      <div
                        key={player.id}
                        className="flex justify-between items-center p-4 bg-white rounded-lg border-l-4 border-fcred hover:shadow-md transition"
                      >
                        <span className="font-bold text-gray-900 text-sm md:text-base">{player.name}</span>
                        <span
                          className={`text-xs md:text-sm px-3 py-1 rounded-full font-bold whitespace-nowrap ml-2 ${
                            player.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          {player.is_active ? '✓ Actief' : '○ Inactief'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="p-6 md:p-8">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">📅 Google Calendar Sync</h2>
                <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-5 mb-6">
                  <p className="text-sm font-bold text-blue-900 mb-3">
                    ℹ️ Hoe werkt de synchronisatie?
                  </p>
                  <ul className="text-sm text-blue-800 space-y-2 ml-4 list-disc">
                    <li>Haalt <strong>alleen toekomstige</strong> evenementen op uit Google Calendar</li>
                    <li>Oude/afgelopen evenementen worden automatisch genegeerd</li>
                    <li>Alle opgehaalde events krijgen default status <span className="bg-fcred text-white px-2 py-0.5 rounded text-xs font-bold">⚽ Wedstrijd</span></li>
                    <li>Wijzig naar <span className="bg-gray-400 text-white px-2 py-0.5 rounded text-xs font-bold">📢 Event/Ander</span> voor trainingen, BBQ's, etc.</li>
                  </ul>
                </div>
                <button
                  onClick={handleSyncCalendar}
                  disabled={syncing}
                  className="w-full md:w-auto px-6 py-3 bg-fcred text-white rounded-lg hover:bg-fcrefdark disabled:bg-gray-400 transition font-bold shadow-md text-sm md:text-base"
                >
                  {syncing ? '⏳ Synchroniseren...' : '🔄 Google Calendar Sync'}
                </button>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">📋 Calendar Evenementen</h2>
                <p className="text-sm font-semibold text-amber-900 bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 mb-6">
                  💡 Klik op de rode/grijze knop om te bepalen of het een wedstrijd is. <strong>Rood</strong> = zichtbaar op Dashboard, <strong>Grijs</strong> = verborgen.
                </p>
                {calendarEvents.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
                    <p className="text-gray-600 text-sm md:text-base">📭 Geen evenementen gevonden</p>
                    <p className="text-gray-500 text-xs md:text-sm mt-2">Klik "Google Calendar Sync" om evenementen op te halen</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {calendarEvents.map(event => (
                      <div
                        key={event.id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-white rounded-lg border-l-4 border-fcred hover:shadow-md transition"
                      >
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-sm md:text-base">{event.title}</p>
                          <p className="text-xs md:text-sm text-gray-600 mt-1">
                            📅 {new Date(event.event_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleToggleCalendarEvent(event.id, event.is_match, event.title, event.event_date)}
                          className={`px-4 py-2 rounded-lg transition font-bold text-sm whitespace-nowrap ${
                            event.is_match
                              ? 'bg-fcred text-white hover:bg-fcredfar shadow-md'
                              : 'bg-gray-400 text-white hover:bg-gray-500 shadow-md'
                          }`}
                        >
                          {event.is_match ? '⚽ Wedstrijd' : '📢 Event/Ander'}
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
