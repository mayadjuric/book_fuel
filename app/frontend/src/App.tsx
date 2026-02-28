import { useEffect, useState } from 'react'
import './App.css'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { Profile } from './pages/Profile'
import { OAuthSuccess } from './pages/OAuthSuccess'
import { Navbar } from './components/Navbar'
import supabase, { type Session } from './supabaseClient'
import type { ITask } from './components/Task'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile'>('dashboard')

  // Lift tasks state up to App so it persists across view changes
  const [tasks, setTasks] = useState<ITask[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSession(session)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])
  
  // If OAuth popup redirects back to /oauth-success, render that page
  // directly so the popup can postMessage the opener and close itself.
  if (window.location.pathname === '/oauth-success') {
    return <OAuthSuccess />
  }

  if (!session) {
    return <Login />
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      {currentView === 'dashboard' ? (
        <Dashboard tasks={tasks} setTasks={setTasks} />
      ) : (
        <Profile />
      )}
    </div>
  )
}

export default App
