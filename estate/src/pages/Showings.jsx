import React, { useEffect } from 'react';
import { Plus, Calendar, MapPin, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import useShowingStore from '../store/showingStore';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { formatDate } from '../utils/helpers';

const ShowingCard = ({ showing }) => {
    const statusColors = {
        scheduled: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        no_show: 'bg-gray-100 text-gray-800'
    };

    const statusIcons = {
        scheduled: AlertCircle,
        completed: CheckCircle,
        cancelled: XCircle,
        no_show: User
    };

    const StatusIcon = statusIcons[showing.status] || AlertCircle;

    return (
        <Card className="hover:shadow-md transition-shadow">
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-lg bg-primary-50 flex items-col flex-col items-center justify-center text-primary-700 border border-primary-100">
                                <span className="text-xs font-bold uppercase">{new Date(showing.scheduled_date).toLocaleString('default', { month: 'short' })}</span>
                                <span className="text-lg font-bold">{new Date(showing.scheduled_date).getDate()}</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">{showing.property_title}</h3>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                                <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {showing.property_address}
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                                <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                Client: {showing.client_first_name} {showing.client_last_name}
                            </div>
                        </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[showing.status]}`}>
                        {showing.status}
                    </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center text-sm text-gray-600">
                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {new Date(showing.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <span className="mx-2 text-gray-300">|</span>
                        {showing.duration_minutes} min
                    </div>

                    {showing.status === 'scheduled' && (
                        <div className="flex space-x-2">
                            <Button variant="secondary" size="sm">Reschedule</Button>
                            <Button variant="primary" size="sm">Complete</Button>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

const Showings = () => {
    const { showings, isLoading, error, fetchShowings } = useShowingStore();

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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Showings</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your property viewing schedule
                    </p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Showing
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Today's Showings */}
                    {groupedShowings.today.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                                Today
                            </h2>
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
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h2>
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
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-gray-500">Past</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
                                {groupedShowings.past.map(showing => (
                                    <ShowingCard key={showing.id} showing={showing} />
                                ))}
                            </div>
                        </section>
                    )}

                    {showings.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                            <div className="mx-auto h-12 w-12 text-gray-400">
                                <Calendar className="h-12 w-12" />
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No showings scheduled</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Schedule a new showing to get started.
                            </p>
                            <div className="mt-6">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Schedule Showing
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
