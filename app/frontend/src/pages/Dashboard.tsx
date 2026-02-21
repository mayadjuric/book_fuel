import { useEffect, useState } from 'react';
import { MoodSelector } from '../components/MoodSelector';
import { FuelGauge } from '../components/FuelGauge';
import { TaskInput } from '../components/TaskInput';
import { TaskList } from '../components/TaskList';
import supabase, { type Session } from '../supabaseClient';

interface DashboardProps {
  tasks: any[];
  setTasks: React.Dispatch<React.SetStateAction<any[]>>;
}

export function Dashboard({ tasks, setTasks }: DashboardProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [userId, setuserId] = useState<string | null>(null);

  const handleAddTask = (newTask: any) => {
    // If it's a high difficulty task, we can show a rapid suggestion later
    if (newTask.burnout_weight >= 4) {
      alert("That looks like a tough one! Check out the Writing Center for help.");
    }
    setTasks([...tasks, newTask]);
  };

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
          <TaskList tasks={tasks} />
        </div>
      </div>
    </main>
  );
}
