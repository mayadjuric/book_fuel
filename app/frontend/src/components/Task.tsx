type TaskType = 'Assignment' | 'Exam' | 'Project' | 'Reading';

export interface ITask {
	id: number;
	name: string; // rename to 'title'
	description?: string;
	due_date: Date;
	type: TaskType;
	difficulty: number;
}

export function Task({ task }: { task: ITask }) {

	return (
		<>
			<div className="font-medium">{task.name}</div>
			<div className="text-xs text-muted-foreground">Due: {new Date(task.due_date).toLocaleDateString()}</div>
			<div className={`px-2 py-1 rounded text-xs font-semibold ${task.difficulty > 3 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
				Diff: {task.difficulty}
			</div>
			<hr />
			{/* Future: Add buttons for editing/deleting tasks */}
		</>
	)
}