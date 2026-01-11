import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import useClientStore from '../../store/clientStore';
import useCommunicationStore from '../../store/communicationStore';
import useAuthStore from '../../store/authStore';
import { Phone, Mail, User, MessageSquare } from 'lucide-react';

const CommunicationModal = ({ isOpen, onClose }) => {
    const { clients, fetchClients } = useClientStore();
    const { logCommunication, isLoading } = useCommunicationStore();
    const { agent } = useAuthStore();

    const [formData, setFormData] = useState({
        client_id: '',
        type: 'call',
        subject: '',
        notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchClients();
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const success = await logCommunication({
            client_id: parseInt(formData.client_id),
            agent_id: agent?.id,
            communication_type: formData.type,
            subject: formData.subject,
            content: formData.notes,
            direction: 'outbound'
        });

        if (success) {
            onClose();
            setFormData({
                client_id: '',
                type: 'call',
                subject: '',
                notes: ''
            });
        }
    };

    const types = [
        { id: 'call', label: 'Phone Call', icon: Phone },
        { id: 'email', label: 'Email', icon: Mail },
        { id: 'meeting', label: 'Meeting', icon: User },
        { id: 'note', label: 'Note', icon: MessageSquare }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Log Communication">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client
                    </label>
                    <select
                        name="client_id"
                        value={formData.client_id}
                        onChange={handleChange}
                        required
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                        <option value="">Select a client</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>
                                {client.first_name} {client.last_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Communication Type
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {types.map((type) => {
                            const Icon = type.icon;
                            return (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: type.id })}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${formData.type === type.id
                                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                                        : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 mb-1" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{type.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <Input
                    label="Subject"
                    name="subject"
                    placeholder="e.g. Follow up on 123 Main St"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                    </label>
                    <textarea
                        name="notes"
                        rows="4"
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="What did you discuss?"
                        value={formData.notes}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isLoading}
                    >
                        Log Communication
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CommunicationModal;
