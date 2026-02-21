// import { useState } from 'react';

export function TaskList({ tasks }: { tasks: any[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Upcoming Tasks</h3>
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks yet. Add one!</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task, index) => (
            <li key={index} className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-accent/50 transition-colors">
              <div>
                <div className="font-medium">{task.name}</div>
                <div className="text-xs text-muted-foreground">Due: {task.dueDate}</div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-semibold ${task.difficulty > 3 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
                Diff: {task.difficulty}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
