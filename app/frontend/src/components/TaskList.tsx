import { Task, type ITask } from './Task';

export function TaskList({ tasks }: { tasks: ITask[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Upcoming Tasks</h3>
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks yet. Add one!</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task, index) => (
            <li key={index} className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-accent/50 transition-colors">
              <Task task={task} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
