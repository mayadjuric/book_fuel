import { useEffect, useState, useCallback } from 'react';
import { MoodSelector } from '../components/MoodSelector';
import { FuelGauge } from '../components/FuelGauge';
import { TaskInput } from '../components/TaskInput';
import { type ITask } from '../components/Task';
import { TaskList } from '../components/TaskList';
import supabase, { type Session } from '../supabaseClient';
import { CalendarImportModal } from '../components/CalendarImportModal';

// const SERVER_IP = import.meta.env.VITE_SERVER_IP || 'localhost';
// const API_URL = `http://${SERVER_IP}:5100/api/`;

interface DashboardProps {
  tasks: ITask[];
  setTasks: React.Dispatch<React.SetStateAction<ITask[]>>;
}

/**
 * Dashboard component that displays the main user interface for task management and scheduling.
 * 
 * @component
 * @param {DashboardProps} props - The component props
 * @param {Task[]} props.tasks - Array of tasks to display
 * @param {(tasks: Task[]) => void} props.setTasks - Function to update tasks
 * 
 * @returns {JSX.Element} A dashboard layout containing:
 * - Welcome header with user display name and fuel gauge
 * - Mood selector widget
 * - Task input form and task list in a responsive grid
 * - Google Calendar integration
 * 
 * @example
 * const [tasks, setTasks] = useState([]);
 * <Dashboard tasks={tasks} setTasks={setTasks} />
 * 
 * @remarks
 * - Fetches user session on component mount from Supabase authentication
 * - Displays alert for high difficulty tasks (burnout_weight >= 4)
 * - Uses responsive grid layout with mobile-first approach
 * - Requires Supabase client configuration
 */
export function Dashboard({ tasks, setTasks }: DashboardProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [userId, setuserId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false)

  const handleAddTask = (newTask: ITask) => {
    // If it's a high difficulty task, we can show a rapid suggestion later
    if (newTask.difficulty >= 4) {
      alert("That looks like a tough one! Check out the Writing Center for help.");
    }
    setTasks([...tasks, newTask]);
  };

  

  const handleConnectGoogle = async () => {
    alert("This will open a new window to connect your Google Calendar. After connecting, you can import your events into BookFuel!");
    if (!session?.access_token) {
      alert('You must be logged in to connect Google Calendar.');
      return;
    }

    const res = await fetch(`http://localhost:5100/api/calendar/auth`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Failed to start Google Calendar OAuth:', text);
      alert('Failed to start Google Calendar connection. Check backend logs.');
      return;
    }

    const data = await res.json();
    // console.log('Received auth URL from backend:', data.auth_url);
    // window.open(data.auth_url, '_self');

    const width = 600;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    const popup = window.open(
      data.auth_url,
      'Google OAuth', // "Connect Google Calendar",
      `width=${width},height=${height},top=${top},left=${left}`
    )

    if (!popup) {
      alert('Failed to open popup window. Please allow popups for this site and try again.');
      return;
    }

    const messageListener = (ev: MessageEvent) => {
      console.log(`Origin: ${ev.origin}, Data: ${ev.data}, ACTUAL ORIGIN: ${window.location.origin}`)
      if (ev.origin !== window.location.origin) {
        console.warn('Received message from unknown origin:', ev.origin);
        return;
      }
      if (ev.data === 'oauth-success') {
        setConnected(true);
        window.removeEventListener('message', messageListener);
      }
    }

    window.addEventListener('message', messageListener)
    // Polling to check if the popup has been closed
    const popupInterval = setInterval(() => {
      if (popup.closed) {
        clearInterval(popupInterval);
        // After popup closes, check connection status
        checkCalendarConnection();
        // do not auto-fetch events; user can click Import
      }
    }, 1000);
  }

  const checkCalendarConnection = useCallback(async () => {
    if (!session?.access_token) {
      return;
    }

    const res = await fetch(`http://localhost:5100/api/calendar/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Failed to check calendar connection:', text);
      return;
    }

    const data = await res.json();
    setConnected(data.connected);
  }, [session]);

  useEffect(() => {
    if (session) checkCalendarConnection()
  }, [session, checkCalendarConnection])

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch('http://localhost:5100/api/evaluations/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });
      if (!res.ok) { const text = await res.text();
        console.error('Failed to fetch tasks:', text);
        alert('Failed to fetch tasks. Check backend logs.');
        return;
      }
      const data = await res.json();
      setTasks(data.data);
    }
    fetchTasks()
  }, [session, setTasks]);

  const fetchCalendarEvents = async () => {
    if (!session?.access_token) {
      alert('You must be logged in to fetch calendar events.');
      return;
    }

    const res = await fetch(`http://localhost:5100/api/calendar/events`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Failed to fetch calendar events:', text);
      alert('Failed to fetch calendar events. Check backend logs.');
      return;
    }

    const data = await res.json();
    console.log('Received calendar events:', data.events);
  };

  // const checkCalendarConnection = async () => {
  //   if (!session?.access_token) {
  //     alert('You must be logged in to check calendar connection.');
  //     return;
  //   }

  //   const res = await fetch(`http://localhost:5100/api/calendar/status`, {
  //     method: 'GET',
  //     headers: {
  //       'Authorization': `Bearer ${session.access_token}`,
  //     },
  //   });

  //   if (!res.ok) {
  //     const text = await res.text();
  //     console.error('Failed to check calendar connection:', text);
  //     alert('Failed to check calendar connection. Check backend logs.');
  //     return;
  //   }

  //   const data = await res.json();
  //   setConnected(data.connected);
  // };

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
      } else {
        setSession(session);
        if (session?.user) {
          // Fix: Extract a string (like email or name) instead of setting the whole user object
          const displayName = session.user.user_metadata?.full_name || session.user.email || 'Student';
          setuserId(displayName);
        } else
          console.warn('No user found in session');
      }
    };

    fetchSession();
  }, []);


  return (
    <main className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back {userId}</p>
        </div>
        <div className="w-[200px]">
          <FuelGauge />
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <MoodSelector />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow p-4">
          <TaskInput onAddTask={handleAddTask} />
        </div>
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow p-4">
          {showImportModal && (
            <CalendarImportModal 
              token={session!.access_token} 
              isOpen={showImportModal} 
              onClose={() => setShowImportModal(false)}
              onImport={(tasksToImport) => setTasks(prev => [...prev, ...tasksToImport])}
            />
          )}
          {connected ? (
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors mb-4"
              onClick={() => setShowImportModal(true)}>
              Import from Calendar
            </button>
          ) : (
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mb-4"
              onClick={handleConnectGoogle}>
            Connect Google Calendar
          </button>
          )}
          <TaskList tasks={tasks.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())} />
        </div>
      </div>
    </main>
  );
}
