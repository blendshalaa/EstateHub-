import React, { useEffect, useState } from 'react';
import { MessageSquare, Phone, Mail, User, Calendar, Plus, Search, Filter, ArrowRight, Clock, MoreHorizontal } from 'lucide-react';
import useCommunicationStore from '../store/communicationStore';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import CommunicationModal from '../components/communications/CommunicationModal';
import { getInitials } from '../utils/helpers';

const Communications = () => {
    const { communications, isLoading, fetchCommunications } = useCommunicationStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchCommunications();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'call': return Phone;
            case 'email': return Mail;
            case 'meeting': return User;
            default: return MessageSquare;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'call': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'email': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'meeting': return 'bg-green-500/20 text-green-400 border-green-500/30';
            default: return 'bg-primary-700/30 text-primary-300 border-primary-600/30';
        }
    };

    const filteredCommunications = filterType === 'all'
        ? communications
        : communications.filter(c => c.communication_type === filterType);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Communications</h1>
                    <p className="text-sm text-primary-400 mt-1 flex items-center">
                        Track all client interactions and touchpoints
                        <ArrowRight className="w-3 h-3 mx-2 text-primary-600" />
                        <span className="text-secondary-400 font-medium">{communications.length} Total Logs</span>
                    </p>
                </div>
                <Button
                    className="shadow-lg shadow-primary-900/50"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Log Communication
                </Button>
            </div>

            <CommunicationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            {/* Filters */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {['all', 'call', 'email', 'meeting', 'note'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${filterType === type
                            ? 'bg-primary-700 text-white border-primary-600 shadow-lg shadow-primary-900/50 scale-105'
                            : 'bg-primary-900/40 text-primary-400 border-primary-800 hover:bg-primary-800 hover:text-white'
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {isLoading && communications.length === 0 ? (
                <div className="flex justify-center py-24">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-800"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-secondary-500 absolute top-0 left-0"></div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredCommunications.map((comm) => {
                        const Icon = getIcon(comm.communication_type);
                        const typeColor = getTypeColor(comm.communication_type);
                        return (
                            <Card key={comm.id} className="hover:border-primary-600 transition-all duration-300 group overflow-hidden bg-primary-900/40 backdrop-blur-sm border-primary-800">
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${typeColor} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-sm font-bold text-white group-hover:text-secondary-400 transition-colors">
                                                    {comm.subject}
                                                </h3>
                                                <div className="flex items-center mt-1 space-x-3">
                                                    <div className="flex items-center text-[11px] text-primary-400 font-bold uppercase tracking-wider">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        {new Date(comm.communication_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    <div className="flex items-center text-[11px] text-primary-400 font-bold uppercase tracking-wider">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {new Date(comm.communication_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex -space-x-2">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 border-2 border-primary-800 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                                                {getInitials(comm.client_first_name, comm.client_last_name)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-primary-950/50 rounded-xl p-4 border border-primary-800/50 relative">
                                        <div className="absolute -top-2 left-4 px-2 bg-primary-950 text-[10px] font-black text-primary-500 uppercase tracking-widest rounded">
                                            Notes
                                        </div>
                                        <p className="text-sm text-primary-200 leading-relaxed italic">
                                            "{comm.content}"
                                        </p>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center text-xs text-primary-400">
                                            <span className="font-bold text-primary-500 uppercase tracking-tighter mr-2">With:</span>
                                            <span className="font-bold text-white bg-primary-800/50 px-2 py-0.5 rounded-md border border-primary-700/50">
                                                {comm.client_first_name} {comm.client_last_name}
                                            </span>
                                        </div>
                                        <button className="text-primary-500 hover:text-white transition-colors p-1 hover:bg-primary-800 rounded">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}

                    {filteredCommunications.length === 0 && (
                        <div className="col-span-full text-center py-24 bg-primary-900/20 rounded-3xl border-2 border-dashed border-primary-800">
                            <div className="mx-auto h-20 w-20 bg-primary-900/50 rounded-2xl shadow-sm flex items-center justify-center mb-6">
                                <MessageSquare className="h-10 w-10 text-primary-600" />
                            </div>
                            <h3 className="text-lg font-bold text-white">No logs found</h3>
                            <p className="mt-2 text-sm text-primary-400 max-w-xs mx-auto">
                                {filterType === 'all'
                                    ? "You haven't logged any communications yet. Keep track of your client interactions here."
                                    : `No ${filterType} logs found. Try changing the filter or log a new interaction.`}
                            </p>
                            {filterType === 'all' && (
                                <div className="mt-8">
                                    <Button
                                        className="shadow-lg shadow-primary-900/50"
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Log First Interaction
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

export default Communications;
