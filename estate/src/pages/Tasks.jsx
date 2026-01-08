import React, { useEffect } from 'react';
import { CheckSquare, Calendar, AlertCircle } from 'lucide-react';
import useTaskStore from '../store/taskStore';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Tasks = () => {
    const { tasks, isLoading, fetchTasks, completeTask } = useTaskStore();

    useEffect(() => {
        fetchTasks();
    }, []);

    const priorityColors = {
        high: 'text-red-600 bg-red-50 border-red-200',
        medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        low: 'text-blue-600 bg-blue-50 border-blue-200'
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                <Button>New Task</Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="space-y-3">
                    {tasks.map((task) => (
                        <Card key={task.id} className={`p-4 transition-all ${task.status === 'completed' ? 'opacity-60 bg-gray-50' : 'hover:shadow-md'}`}>
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 pt-1">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
                                        checked={task.status === 'completed'}
                                        onChange={() => completeTask(task.id)}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                            {task.title}
                                        </p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {task.description}
                                    </p>
                                    <div className="flex items-center mt-2 text-xs text-gray-500 space-x-4">
                                        <div className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            Due: {new Date(task.due_date).toLocaleDateString()}
                                        </div>
                                        {task.related_to && (
                                            <div className="flex items-center">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                {task.related_to}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {tasks.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No tasks found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Tasks;
