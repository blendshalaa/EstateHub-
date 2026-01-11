import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import usePropertyStore from '../../store/propertyStore';
import useClientStore from '../../store/clientStore';
import useAuthStore from '../../store/authStore';
import useShowingStore from '../../store/showingStore';

const ShowingModal = ({ isOpen, onClose }) => {
    const { properties, fetchProperties } = usePropertyStore();
    const { clients, fetchClients } = useClientStore();
    const { agent } = useAuthStore();
    const { createShowing, isLoading } = useShowingStore();

    const [formData, setFormData] = useState({
        property_id: '',
        client_id: '',
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: '30',
        showing_type: 'private',
        notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchProperties();
            fetchClients();
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Combine date and time
        const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);

        const showingData = {
            property_id: parseInt(formData.property_id),
            client_id: formData.client_id ? parseInt(formData.client_id) : null,
            agent_id: agent?.id,
            scheduled_date: scheduledDateTime.toISOString(),
            duration_minutes: parseInt(formData.duration_minutes),
            showing_type: formData.showing_type,
            notes: formData.notes
        };

        const success = await createShowing(showingData);
        if (success) {
            onClose();
            setFormData({
                property_id: '',
                client_id: '',
                scheduled_date: '',
                scheduled_time: '',
                duration_minutes: '30',
                showing_type: 'private',
                notes: ''
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Schedule New Showing">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Property
                    </label>
                    <select
                        name="property_id"
                        value={formData.property_id}
                        onChange={handleChange}
                        required
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                        <option value="">Select a property</option>
                        {properties.map(property => (
                            <option key={property.id} value={property.id}>
                                {property.address}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client (Optional)
                    </label>
                    <select
                        name="client_id"
                        value={formData.client_id}
                        onChange={handleChange}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Date"
                        name="scheduled_date"
                        type="date"
                        value={formData.scheduled_date}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Time"
                        name="scheduled_time"
                        type="time"
                        value={formData.scheduled_time}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration (minutes)
                        </label>
                        <select
                            name="duration_minutes"
                            value={formData.duration_minutes}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        >
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="45">45 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="90">1.5 hours</option>
                            <option value="120">2 hours</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Showing Type
                        </label>
                        <select
                            name="showing_type"
                            value={formData.showing_type}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        >
                            <option value="private">Private Showing</option>
                            <option value="open_house">Open House</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                    </label>
                    <textarea
                        name="notes"
                        rows="3"
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Add any relevant notes..."
                        value={formData.notes}
                        onChange={handleChange}
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
                        Schedule Showing
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ShowingModal;
