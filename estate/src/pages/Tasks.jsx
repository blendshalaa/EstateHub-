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
        urgent: 'text-red-400 bg-red-500/10 border-red-500/20 ring-red-500/30',
        high: 'text-orange-400 bg-orange-500/10 border-orange-500/20 ring-orange-500/30',
        medium: 'text-blue-400 bg-blue-500/10 border-blue-500/20 ring-blue-500/30',
        low: 'text-primary-300 bg-primary-800/50 border-primary-700/50 ring-primary-600/30'
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
                    <p className="text-sm text-primary-400 mt-1 flex items-center">
                        Manage your daily to-do list and follow-ups
                        <ArrowRight className="w-3 h-3 mx-2 text-primary-600" />
                        <span className="text-secondary-400 font-medium">{tasks.filter(t => t.status === 'pending').length} Pending</span>
                    </p>
                </div>
                <Button
                    className="shadow-lg shadow-primary-900/50"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary-900/40 backdrop-blur-sm border border-primary-800 rounded-2xl p-4">
                <div className="flex items-center space-x-2">
                    {['pending', 'completed', 'all'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${filterStatus === status
                                ? 'bg-primary-700 text-white shadow-lg shadow-primary-900/50 scale-105'
                                : 'bg-primary-900/40 text-primary-400 hover:bg-primary-800 hover:text-white'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest mr-2">Priority:</span>
                    {['all', 'urgent', 'high', 'medium', 'low'].map((priority) => (
                        <button
                            key={priority}
                            onClick={() => setFilterPriority(priority)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${filterPriority === priority
                                ? 'bg-primary-800 text-white border-primary-600 shadow-md'
                                : 'bg-primary-900/20 text-primary-500 border-primary-800/50 hover:border-primary-700 hover:text-primary-300'
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
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-800"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-secondary-500 absolute top-0 left-0"></div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredTasks.map((task) => (
                        <Card
                            key={task.id}
                            className={`group transition-all duration-300 border-primary-800 overflow-hidden bg-primary-900/40 backdrop-blur-sm ${task.status === 'completed' ? 'opacity-60 grayscale-[0.5] bg-primary-950/30' : 'hover:shadow-xl hover:border-primary-600 hover:-translate-y-0.5'
                                }`}
                        >
                            <div className="flex items-stretch">
                                <div className={`w-1.5 ${task.status === 'completed' ? 'bg-primary-800' :
                                    task.priority === 'urgent' ? 'bg-red-500' :
                                        task.priority === 'high' ? 'bg-orange-500' :
                                            task.priority === 'medium' ? 'bg-blue-500' : 'bg-primary-600'
                                    }`} />

                                <div className="flex-1 p-5 flex items-start space-x-4">
                                    <button
                                        onClick={() => task.status !== 'completed' && completeTask(task.id)}
                                        className={`mt-1 flex-shrink-0 transition-colors ${task.status === 'completed'
                                            ? 'text-green-500 cursor-default'
                                            : 'text-primary-600 hover:text-secondary-500'
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

                                        <p className={`text-sm line-clamp-2 mb-4 ${task.status === 'completed' ? 'text-primary-600' : 'text-primary-300'
                                            }`}>
                                            {task.description}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4">
                                            <div className={`flex items-center text-[11px] font-bold uppercase tracking-wider ${task.status !== 'completed' && isOverdue(task.due_date) ? 'text-red-400' : 'text-primary-500'
                                                }`}>
                                                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                                Due: {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                {task.status !== 'completed' && isOverdue(task.due_date) && (
                                                    <span className="ml-2 bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded text-[9px] border border-red-500/20">Overdue</span>
                                                )}
                                            </div>

                                            {task.related_to && (
                                                <div className="flex items-center text-[11px] font-bold text-primary-500 uppercase tracking-wider">
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
                                <CheckSquare className="h-10 w-10 text-primary-600" />
                            </div>
                            <h3 className="text-lg font-bold text-white">No tasks found</h3>
                            <p className="mt-2 text-sm text-primary-400 max-w-xs mx-auto">
                                {filterStatus === 'pending'
                                    ? "You're all caught up! No pending tasks to show."
                                    : "No tasks match your current filters."}
                            </p>
                            {filterStatus === 'pending' && filterPriority === 'all' && (
                                <div className="mt-8">
                                    <Button
                                        className="shadow-lg shadow-primary-900/50"
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
