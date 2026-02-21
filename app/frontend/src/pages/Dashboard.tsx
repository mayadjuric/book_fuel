import { useState } from 'react';
import { MoodSelector } from '../components/MoodSelector';
import { FuelGauge } from '../components/FuelGauge';
import { TaskInput } from '../components/TaskInput';
import { TaskList } from '../components/TaskList';
import { Navbar } from '../components/Navbar';

export function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);

  const handleAddTask = (newTask: any) => {
    // If it's a high difficulty task, we can show a rapid suggestion later
    if (newTask.difficulty >= 4) {
      alert("That looks like a tough one! Check out the Writing Center for help.");
    }
    setTasks([...tasks, newTask]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">Welcome back!</p>
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
    </div>
  );
}
