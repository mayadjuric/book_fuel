import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';

const SLINKY_MAN_ID = 24
const API_URL = 'http://localhost:5100/api/'

interface evalDetails {
  user_id: number,
  assignment_id: number,
  start_date: string,
  due_date: string,
  name: string,
  type: string,
  difficulty?: number
}

export function TaskInput({ onAddTask }: { onAddTask: (task: evalDetails) => void }) {
  const [taskName, setTaskName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [type, setType] = useState('Assignment');
  const [burnoutWeight, setBurnoutWeight] = useState(1);

  const getRandomArbitrary = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min) + min);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      console.error('Error getting session or no session:', error?.message);
      return;
    }

    const user = session.user;
    const userToken = session.access_token;

    // In a real app we would get this from the user's profile table
    const userId = SLINKY_MAN_ID;

    try {
      const payload = {
        user_id: userId,
        assignment_id: getRandomArbitrary(1, 10000),
        start_date: new Date(startDate).toISOString(),
        due_date: new Date(dueDate).toISOString(),
        name: taskName,
        type: type,
        burnout_weight: burnoutWeight
      };

      console.log('Sending evaluation details to API:', payload);
      const response = await fetch(`${API_URL}evaluations/${payload.assignment_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('API response:', responseData);
        // Update parent state
        onAddTask(payload as any);

        // Reset form
        setTaskName('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setDueDate('');
        setType('Assignment');
        setBurnoutWeight(1);
      } else {
        console.error('Failed to save evaluation');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Add Evaluation</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Name</label>
          <input 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            type="text" 
            value={taskName} 
            onChange={(e) => setTaskName(e.target.value)} 
            required 
            placeholder="e.g. Calculus Midterm"
          />
        </div>

        <div className="flex gap-4">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Start Date</label>
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Due Date</label>
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Type</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="Assignment">Assignment</option>
            <option value="Exam">Exam</option>
            <option value="Project">Project</option>
            <option value="Reading">Reading</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Burnout Weight (Stress Level)</label>
            <span className={`font-bold ${burnoutWeight > 3 ? 'text-red-500' : 'text-green-600'}`}>{burnoutWeight}</span>
          </div>
          <input 
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            type="range"
            min="1"
            max="5" 
            step="0.5"
            value={burnoutWeight}
            onChange={(e) => setBurnoutWeight(parseFloat(e.target.value))}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Easy (1)</span>
            <span>Heavy (5)</span>
          </div>
        </div>

        <button 
          type="submit" 
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
        >
          Add to Plan
        </button>
      </form>
    </div>
  );
}
