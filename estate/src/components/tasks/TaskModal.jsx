import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import useTaskStore from '../../store/taskStore';
import useClientStore from '../../store/clientStore';
import usePropertyStore from '../../store/propertyStore';
import useDealStore from '../../store/dealStore';
import useAuthStore from '../../store/authStore';

const TaskModal = ({ isOpen, onClose }) => {
    const { createTask, isLoading } = useTaskStore();
    const { clients, fetchClients } = useClientStore();
    const { properties, fetchProperties } = usePropertyStore();
    const { deals, fetchDeals } = useDealStore();
    const { agent } = useAuthStore();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        related_to: 'none',
        related_id: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchClients();
            fetchProperties();
            fetchDeals();
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const taskData = {
            ...formData,
            agent_id: agent?.id,
            related_id: formData.related_id ? parseInt(formData.related_id) : null
        };

        if (formData.related_to === 'none') {
            delete taskData.related_to;
            delete taskData.related_id;
        }

        const success = await createTask(taskData);
        if (success) {
            onClose();
            setFormData({
                title: '',
                description: '',
                due_date: '',
                priority: 'medium',
                related_to: 'none',
                related_id: ''
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Task Title"
                    name="title"
                    placeholder="e.g. Call client about offer"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        rows="3"
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Add more details..."
                        value={formData.description}
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Due Date"
                        name="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={handleChange}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Priority
                        </label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Related To
                        </label>
                        <select
                            name="related_to"
                            value={formData.related_to}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        >
                            <option value="none">Nothing</option>
                            <option value="client">Client</option>
                            <option value="property">Property</option>
                            <option value="deal">Deal</option>
                        </select>
                    </div>

                    {formData.related_to !== 'none' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select {formData.related_to}
                            </label>
                            <select
                                name="related_id"
                                value={formData.related_id}
                                onChange={handleChange}
                                required
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            >
                                <option value="">Select...</option>
                                {formData.related_to === 'client' && clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                                ))}
                                {formData.related_to === 'property' && properties.map(p => (
                                    <option key={p.id} value={p.id}>{p.address}</option>
                                ))}
                                {formData.related_to === 'deal' && deals.map(d => (
                                    <option key={d.id} value={d.id}>{d.deal_name}</option>
                                ))}
                            </select>
                        </div>
                    )}
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
                        Create Task
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TaskModal;
