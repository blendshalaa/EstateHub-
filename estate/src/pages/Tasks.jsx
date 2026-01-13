import React, { useEffect, useState } from 'react';
import { CheckSquare, Calendar, AlertCircle, Plus, Filter, Search, ArrowRight, Clock, CheckCircle2, Circle } from 'lucide-react';
import useTaskStore from '../store/taskStore';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import TaskModal from '../components/tasks/TaskModal';
import { formatDate } from '../utils/helpers';

const Tasks = () => {
    const { tasks, isLoading, fetchTasks, completeTask } = useTaskStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('pending');
    const [filterPriority, setFilterPriority] = useState('all');

    useEffect(() => {
        fetchTasks();
    }, []);

    const priorityStyles = {
        urgent: 'text-red-700 bg-red-50 border-red-100 ring-red-500',
        high: 'text-orange-700 bg-orange-50 border-orange-100 ring-orange-500',
        medium: 'text-blue-700 bg-blue-50 border-blue-100 ring-blue-500',
        low: 'text-primary-300 bg-primary-900/50 border-primary-800 ring-primary-700'
    };

    const isOverdue = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(date) < today;
    };

    const filteredTasks = tasks.filter(task => {
        const statusMatch = filterStatus === 'all' || task.status === filterStatus;
        const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
        return statusMatch && priorityMatch;
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Tasks</h1>
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                        Manage your daily to-do list and follow-ups
                        <ArrowRight className="w-3 h-3 mx-2 text-gray-300" />
                        <span className="text-primary-600 font-medium">{tasks.filter(t => t.status === 'pending').length} Pending</span>
                    </p>
                </div>
                <Button
                    className="shadow-lg shadow-primary-200"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Task
                </Button>
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-4">
                <div className="flex items-center space-x-2">
                    {['pending', 'completed', 'all'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${filterStatus === status
                                ? 'bg-gray-900 text-white shadow-md'
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Priority:</span>
                    {['all', 'urgent', 'high', 'medium', 'low'].map((priority) => (
                        <button
                            key={priority}
                            onClick={() => setFilterPriority(priority)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${filterPriority === priority
                                ? 'bg-primary-50 text-primary-700 border-primary-200'
                                : 'bg-primary-900/50 text-primary-400 border-primary-800 hover:border-primary-700'
                                }`}
                        >
                            {priority}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading && tasks.length === 0 ? (
                <div className="flex justify-center py-24">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-100"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600 absolute top-0 left-0"></div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredTasks.map((task) => (
                        <Card
                            key={task.id}
                            className={`group transition-all duration-300 border-gray-100 overflow-hidden ${task.status === 'completed' ? 'opacity-60 grayscale-[0.5]' : 'hover:shadow-xl hover:-translate-y-0.5'
                                }`}
                        >
                            <div className="flex items-stretch">
                                <div className={`w-1.5 ${task.status === 'completed' ? 'bg-gray-300' :
                                    task.priority === 'urgent' ? 'bg-red-500' :
                                        task.priority === 'high' ? 'bg-orange-500' :
                                            task.priority === 'medium' ? 'bg-blue-500' : 'bg-gray-400'
                                    }`} />

                                <div className="flex-1 p-5 flex items-start space-x-4">
                                    <button
                                        onClick={() => task.status !== 'completed' && completeTask(task.id)}
                                        className={`mt-1 flex-shrink-0 transition-colors ${task.status === 'completed'
                                            ? 'text-green-500 cursor-default'
                                            : 'text-gray-300 hover:text-primary-600'
                                            }`}
                                    >
                                        {task.status === 'completed' ? (
                                            <CheckCircle2 className="h-6 w-6" />
                                        ) : (
                                            <Circle className="h-6 w-6" />
                                        )}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`text-base font-bold truncate ${task.status === 'completed' ? 'text-primary-500 line-through' : 'text-white'
                                                }`}>
                                                {task.title}
                                            </h3>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${priorityStyles[task.priority]}`}>
                                                {task.priority}
                                            </span>
                                        </div>

                                        <p className={`text-sm line-clamp-2 mb-4 ${task.status === 'completed' ? 'text-primary-500' : 'text-primary-300'
                                            }`}>
                                            {task.description}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className={`flex items-center text-[11px] font-bold uppercase tracking-wider ${task.status !== 'completed' && isOverdue(task.due_date) ? 'text-red-600' : 'text-gray-400'
                                                }`}>
                                                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                                Due: {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                {task.status !== 'completed' && isOverdue(task.due_date) && (
                                                    <span className="ml-2 bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[9px]">Overdue</span>
                                                )}
                                            </div>

                                            {task.related_to && (
                                                <div className="flex items-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                                    <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                                                    {task.related_to}: <span className="ml-1 text-primary-300">
                                                        {task.related_to === 'client' ? `${task.client_first_name} ${task.client_last_name}` :
                                                            task.related_to === 'property' ? task.property_address :
                                                                task.related_to === 'deal' ? task.deal_name : 'N/A'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {filteredTasks.length === 0 && (
                        <div className="text-center py-24 bg-primary-900/20 rounded-3xl border-2 border-dashed border-primary-800">
                            <div className="mx-auto h-20 w-20 bg-primary-900/50 rounded-2xl shadow-sm flex items-center justify-center mb-6">
                                <CheckSquare className="h-10 w-10 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-white">No tasks found</h3>
                            <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
                                {filterStatus === 'pending'
                                    ? "You're all caught up! No pending tasks to show."
                                    : "No tasks match your current filters."}
                            </p>
                            {filterStatus === 'pending' && filterPriority === 'all' && (
                                <div className="mt-8">
                                    <Button
                                        className="shadow-lg shadow-primary-200"
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create New Task
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Tasks;
