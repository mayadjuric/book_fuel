import { useEffect, useState } from 'react'
import './App.css'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { Profile } from './pages/Profile'
import { Navbar } from './components/Navbar'
import supabase, { type Session } from './supabaseClient'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile'>('dashboard')

  // Lift tasks state up to App so it persists across view changes
  const [tasks, setTasks] = useState<any[]>([])

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
