import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import usePropertyStore from '../../store/propertyStore';
import useClientStore from '../../store/clientStore';
import useAuthStore from '../../store/authStore';
import useDealStore from '../../store/dealStore';

const DealModal = ({ isOpen, onClose }) => {
    const { properties, fetchProperties } = usePropertyStore();
    const { clients, fetchClients } = useClientStore();
    const { agent } = useAuthStore();
    const { createDeal, isLoading } = useDealStore();

    const [formData, setFormData] = useState({
        deal_name: '',
        property_id: '',
        client_id: '',
        deal_type: 'sale',
        stage: 'lead',
        offer_amount: '',
        expected_close_date: '',
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

        const dealData = {
            ...formData,
            agent_id: agent?.id,
            property_id: formData.property_id ? parseInt(formData.property_id) : null,
            client_id: parseInt(formData.client_id),
            offer_amount: formData.offer_amount ? parseFloat(formData.offer_amount) : null
        };

        const success = await createDeal(dealData);
        if (success) {
            onClose();
            setFormData({
                deal_name: '',
                property_id: '',
                client_id: '',
                deal_type: 'sale',
                stage: 'lead',
                offer_amount: '',
                expected_close_date: '',
                notes: ''
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Deal">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Deal Name"
                    name="deal_name"
                    placeholder="e.g. Smith - 123 Main St Purchase"
                    value={formData.deal_name}
                    onChange={handleChange}
                    required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Property (Optional)
                        </label>
                        <select
                            name="property_id"
                            value={formData.property_id}
                            onChange={handleChange}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Deal Type
                        </label>
                        <select
                            name="deal_type"
                            value={formData.deal_type}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        >
                            <option value="purchase">Purchase</option>
                            <option value="sale">Sale</option>
                            <option value="rental">Rental</option>
                            <option value="lease">Lease</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Initial Stage
                        </label>
                        <select
                            name="stage"
                            value={formData.stage}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        >
                            <option value="lead">Lead</option>
                            <option value="viewing">Viewing</option>
                            <option value="offer_made">Offer Made</option>
                            <option value="negotiation">Negotiation</option>
                            <option value="under_contract">Under Contract</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Offer Amount"
                        name="offer_amount"
                        type="number"
                        placeholder="0.00"
                        value={formData.offer_amount}
                        onChange={handleChange}
                    />

                    <Input
                        label="Expected Close Date"
                        name="expected_close_date"
                        type="date"
                        value={formData.expected_close_date}
                        onChange={handleChange}
                    />
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
                        Create Deal
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default DealModal;
