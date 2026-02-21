import { useEffect, useState } from 'react'
import './App.css'
import { createClient, type Session } from '@supabase/supabase-js'
import { Navbar } from './components/Navbar'

const supabaseUrl = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

function Login({ session }: { session: Session | null }) {
  // usf
  const handleLogin = async () => {
    const { error } = await supabaseUrl.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) {
      console.error('Error during login:', error.message)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  )
   
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  // const [count, setCount] = useState(0)


  useEffect(() => {
    const { data: authListener } = supabaseUrl.auth.onAuthStateChange((event, session) => {
      setSession(session)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, []);
  
  return (
    <>
      <Navbar />
      {session ? <div>Logged in as {session.user.email}</div> : <Login session={session} />}
    </>
  )
}

export default App
