import React, { useEffect } from 'react';
import { MessageSquare, Phone, Mail, User, Calendar } from 'lucide-react';
import useCommunicationStore from '../store/communicationStore';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Communications = () => {
    const { communications, isLoading, fetchCommunications } = useCommunicationStore();

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
                <Button>Log Communication</Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {communications.map((comm) => {
                        const Icon = getIcon(comm.type);
                        return (
                            <Card key={comm.id} className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                            <Icon className="h-5 w-5 text-gray-500" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-gray-900">
                                                {comm.subject}
                                            </p>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {new Date(comm.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            With: <span className="font-medium text-gray-900">{comm.client_name}</span>
                                        </p>
                                        <p className="text-sm text-gray-600 mt-2">
                                            {comm.notes}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}

                    {communications.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No communications logged yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Communications;
