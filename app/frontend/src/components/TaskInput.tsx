import { useState } from 'react';

export function TaskInput({ onAddTask }: { onAddTask: (task: any) => void }) {
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [difficulty, setDifficulty] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask({ name: taskName, dueDate, difficulty });
    setTaskName('');
    setDueDate('');
    setDifficulty(1);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Add Assignment</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Name</label>
          <input 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            type="text" 
            value={taskName} 
            onChange={(e) => setTaskName(e.target.value)} 
            required 
            placeholder="Paper title, exam..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Due Date</label>
          <input 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            type="date" 
            value={dueDate} 
            onChange={(e) => setDueDate(e.target.value)} 
            required 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Difficulty (1-5)</label>
          <div className="flex items-center gap-4">
            <input 
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              type="range" 
              min="1" 
              max="5" 
              value={difficulty} 
              onChange={(e) => setDifficulty(Number(e.target.value))} 
            />
            <span className="font-bold w-4 text-center">{difficulty}</span>
          </div>
        </div>
        <button 
          type="submit" 
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
        >
          Add Task
        </button>
      </form>
    </div>
  );
}
