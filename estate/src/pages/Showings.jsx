import React, { useEffect, useState } from 'react';
import { Plus, Calendar, MapPin, User, Clock, CheckCircle, XCircle, AlertCircle, MoreHorizontal, ArrowRight } from 'lucide-react';
import useShowingStore from '../store/showingStore';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ShowingModal from '../components/showings/ShowingModal';
import { formatDate } from '../utils/helpers';

const ShowingCard = ({ showing }) => {
    const statusColors = {
        scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        completed: 'bg-green-500/20 text-green-400 border-green-500/30',
        cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
        no_show: 'bg-primary-500/20 text-primary-300 border-primary-500/30'
    };

    const statusIcons = {
        scheduled: AlertCircle,
        completed: CheckCircle,
        cancelled: XCircle,
        no_show: User
    };

    const StatusIcon = statusIcons[showing.status] || AlertCircle;

    return (
        <Card className="hover:border-primary-600 transition-all duration-300 group overflow-hidden bg-primary-900/40 backdrop-blur-sm border-primary-800">
            <div className="relative h-32 w-full overflow-hidden bg-primary-950">
                <img
                    src={`https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`}
                    alt="Property"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950 to-transparent opacity-60"></div>
                <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${statusColors[showing.status]}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {showing.status.replace('_', ' ')}
                    </span>
                </div>
                <div className="absolute bottom-3 left-3">
                    <div className="flex items-center space-x-2 bg-primary-950/80 backdrop-blur-md px-2 py-1 rounded-lg shadow-lg border border-primary-700/50">
                        <div className="flex flex-col items-center leading-none">
                            <span className="text-[10px] font-bold text-secondary-500 uppercase">{new Date(showing.scheduled_date).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-sm font-black text-white">{new Date(showing.scheduled_date).getDate()}</span>
                        </div>
                        <div className="h-6 w-px bg-primary-700" />
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] font-bold text-primary-400 uppercase">Time</span>
                            <span className="text-xs font-bold text-white">{new Date(showing.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4">
                <div className="mb-4">
                    <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-secondary-400 transition-colors">
                        {showing.property_address}
                    </h3>
                    <div className="mt-1 flex items-center text-[11px] text-primary-400">
                        <MapPin className="flex-shrink-0 mr-1 h-3 w-3 text-primary-500" />
                        {showing.property_city || 'New York, NY'}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4 bg-primary-950/30 p-2 rounded-lg border border-primary-800/30">
                    <div className="flex items-center">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary-700 to-primary-800 flex items-center justify-center text-white font-bold text-[10px] border border-primary-600 shadow-sm">
                            {showing.client_first_name ? showing.client_first_name[0] : 'C'}
                        </div>
                        <div className="ml-2">
                            <p className="text-[10px] font-bold text-primary-500 uppercase leading-none mb-0.5">Client</p>
                            <p className="text-xs font-bold text-primary-200 leading-none">
                                {showing.client_first_name} {showing.client_last_name}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-primary-500 uppercase leading-none mb-0.5">Duration</p>
                        <p className="text-xs font-bold text-primary-200 leading-none flex items-center justify-end">
                            <Clock className="w-3 h-3 mr-1 text-primary-500" />
                            {showing.duration_minutes}m
                        </p>
                    </div>
                </div>

                {showing.status === 'scheduled' && (
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="secondary" size="sm" className="text-[11px] py-1.5 h-auto font-bold bg-primary-800 border-primary-700 text-primary-300 hover:text-white">
                            Cancel
                        </Button>
                        <Button variant="primary" size="sm" className="text-[11px] py-1.5 h-auto font-bold shadow-lg shadow-primary-900/50">
                            Complete
                        </Button>
                    </div>
                )}

                {showing.status !== 'scheduled' && (
                    <Button variant="secondary" size="sm" className="w-full text-[11px] py-1.5 h-auto font-bold opacity-50 cursor-not-allowed bg-primary-800 border-primary-700 text-primary-400">
                        View Details
                    </Button>
                )}
            </div>
        </Card>
    );
};

const Showings = () => {
    const { showings, isLoading, error, fetchShowings } = useShowingStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchShowings();
    }, []);

    // Group showings by date (Today, Upcoming, Past)
    const groupedShowings = {
        today: [],
        upcoming: [],
        past: []
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    showings.forEach(showing => {
        const showingDate = new Date(showing.scheduled_date);
        showingDate.setHours(0, 0, 0, 0);

        if (showingDate.getTime() === today.getTime()) {
            groupedShowings.today.push(showing);
        } else if (showingDate > today) {
            groupedShowings.upcoming.push(showing);
        } else {
            groupedShowings.past.push(showing);
        }
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Showings</h1>
                    <p className="text-sm text-primary-400 mt-1 flex items-center">
                        Manage your property viewing schedule
                        <ArrowRight className="w-3 h-3 mx-2 text-primary-600" />
                        <span className="text-secondary-400 font-medium">{showings.filter(s => s.status === 'scheduled').length} Scheduled</span>
                    </p>
                </div>
                <Button
                    className="shadow-lg shadow-primary-900/50"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Showing
                </Button>
            </div>

            <ShowingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            {isLoading && showings.length === 0 ? (
                <div className="flex justify-center py-24">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-800"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-secondary-500 absolute top-0 left-0"></div>
                    </div>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Today's Showings */}
                    {groupedShowings.today.length > 0 && (
                        <section>
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-secondary-500/20 rounded-lg border border-secondary-500/30">
                                    <Calendar className="w-5 h-5 text-secondary-500" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Today's Schedule</h2>
                                <span className="bg-primary-800 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-primary-700">
                                    {groupedShowings.today.length} Events
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {groupedShowings.today.map(showing => (
                                    <ShowingCard key={showing.id} showing={showing} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Upcoming Showings */}
                    {groupedShowings.upcoming.length > 0 && (
                        <section>
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                                    <Clock className="w-5 h-5 text-blue-500" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Upcoming Showings</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {groupedShowings.upcoming.map(showing => (
                                    <ShowingCard key={showing.id} showing={showing} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Past Showings */}
                    {groupedShowings.past.length > 0 && (
                        <section>
                            <div className="flex items-center space-x-3 mb-6 opacity-60">
                                <div className="p-2 bg-primary-800 rounded-lg border border-primary-700">
                                    <CheckCircle className="w-5 h-5 text-primary-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Past Events</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60 grayscale-[0.5]">
                                {groupedShowings.past.map(showing => (
                                    <ShowingCard key={showing.id} showing={showing} />
                                ))}
                            </div>
                        </section>
                    )}

                    {showings.length === 0 && (
                        <div className="text-center py-24 bg-primary-900/20 rounded-3xl border-2 border-dashed border-primary-800">
                            <div className="mx-auto h-20 w-20 bg-primary-900/50 rounded-2xl shadow-sm flex items-center justify-center mb-6">
                                <Calendar className="h-10 w-10 text-primary-600" />
                            </div>
                            <h3 className="text-lg font-bold text-white">No showings scheduled</h3>
                            <p className="mt-2 text-sm text-primary-400 max-w-xs mx-auto">
                                Your schedule is currently empty. Start by scheduling a property viewing for your clients.
                            </p>
                            <div className="mt-8">
                                <Button
                                    className="shadow-lg shadow-primary-900/50"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Schedule First Showing
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Showings;
