import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import MatchDetail from './pages/MatchDetail'
import Statistics from './pages/Statistics'
import HeadToHead from './pages/HeadToHead'
import MatchHistory from './pages/MatchHistory'
import AdminPanel from './pages/AdminPanel'
import Login from './pages/Login'
import { useEffect, useState } from 'react'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const token = localStorage.getItem('auth_token')
    const user = localStorage.getItem('current_user')
    if (token && user) {
      setIsAuthenticated(true)
      setCurrentUser(JSON.parse(user))
    }
    setLoading(false)
  }, [])

  const handleLogin = (user, token) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('current_user', JSON.stringify(user))
    setCurrentUser(user)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('current_user')
    setCurrentUser(null)
    setIsAuthenticated(false)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Dashboard isAuthenticated={isAuthenticated} currentUser={currentUser} />} />
        <Route path="/match/:id" element={<MatchDetail isAuthenticated={isAuthenticated} currentUser={currentUser} />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/head-to-head" element={<HeadToHead />} />
        <Route path="/match-history" element={<MatchHistory isAuthenticated={isAuthenticated} currentUser={currentUser} />} />
        {isAuthenticated && currentUser?.role === 'admin' && (
          <Route path="/admin" element={<AdminPanel currentUser={currentUser} onLogout={handleLogout} />} />
        )}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
      </Routes>
    </div>
  )
}

export default App
