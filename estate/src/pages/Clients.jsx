import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Phone, Mail, MoreHorizontal, User } from 'lucide-react';
import useClientStore from '../store/clientStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { formatCurrency, formatDate, getInitials } from '../utils/helpers';

const Clients = () => {
    const {
        clients,
        isLoading,
        fetchClients,
        createClient,
        filters,
        setFilters,
        pagination,
        setPage
    } = useClientStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        status: 'lead',
        budget: ''
    });

    useEffect(() => {
        fetchClients();
    }, []);

    const handleSearch = (e) => {
        setFilters({ search: e.target.value });
    };

    const handleStatusChange = (e) => {
        setFilters({ status: e.target.value });
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await createClient(formData);
        if (success) {
            setIsModalOpen(false);
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                status: 'lead',
                budget: ''
            });
        }
    };

    const statusColors = {
        active: 'bg-green-500/20 text-green-400 border-green-500/30',
        lead: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        closed: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
        inactive: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Clients</h1>
                    <p className="text-sm text-primary-400 mt-1">
                        Manage your client relationships and leads
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-primary-900/40 backdrop-blur-sm border border-primary-800 rounded-2xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-primary-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search clients..."
                            className="input pl-10 bg-primary-900/50 border-primary-700 focus:border-secondary-500 text-white placeholder-primary-500"
                            value={filters.search || ''}
                            onChange={handleSearch}
                        />
                    </div>

                    <select
                        className="input bg-primary-900/50 border-primary-700 focus:border-secondary-500 text-white"
                        value={filters.status || ''}
                        onChange={handleStatusChange}
                    >
                        <option value="">All Statuses</option>
                        <option value="lead">Lead</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <Button variant="secondary" className="w-full bg-primary-800/50 border-primary-700 text-primary-200 hover:text-white hover:bg-primary-700">
                        <Filter className="w-4 h-4 mr-2" />
                        More Filters
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-primary-900/40 backdrop-blur-sm border border-primary-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-primary-800">
                        <thead className="bg-primary-900/80">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-primary-300 uppercase tracking-wider">
                                    Client
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-primary-300 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-primary-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-primary-300 uppercase tracking-wider">
                                    Budget
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-primary-300 uppercase tracking-wider">
                                    Lead Score
                                </th>
                                <th scope="col" className="relative px-6 py-4">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary-800/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : clients.length > 0 ? (
                                clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-primary-800/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-700 to-primary-800 border border-primary-600 flex items-center justify-center text-white font-bold shadow-lg">
                                                        {getInitials(client.first_name, client.last_name)}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-white group-hover:text-secondary-400 transition-colors">
                                                        {client.first_name} {client.last_name}
                                                    </div>
                                                    <div className="text-xs text-primary-400">
                                                        Added {formatDate(client.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center text-sm text-primary-300">
                                                    <Mail className="w-3 h-3 mr-2 text-primary-500" />
                                                    {client.email}
                                                </div>
                                                <div className="flex items-center text-sm text-primary-300">
                                                    <Phone className="w-3 h-3 mr-2 text-primary-500" />
                                                    {client.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${statusColors[client.status]}`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                            {formatCurrency(client.budget)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-1 h-1.5 w-24 bg-primary-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${client.lead_score >= 80 ? 'bg-green-500' :
                                                            client.lead_score >= 50 ? 'bg-yellow-500' :
                                                                'bg-red-500'
                                                            }`}
                                                        style={{ width: `${client.lead_score}%` }}
                                                    />
                                                </div>
                                                <span className="ml-2 text-xs font-bold text-primary-300">{client.lead_score}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-primary-400 hover:text-white transition-colors p-2 hover:bg-primary-700/50 rounded-lg">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-primary-800/50 p-4 rounded-full mb-3">
                                                <User className="h-8 w-8 text-primary-400" />
                                            </div>
                                            <p className="text-primary-300 font-medium">No clients found</p>
                                            <p className="text-primary-500 text-sm mt-1">Try adjusting your filters or add a new client.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {clients.length > 0 && (
                    <div className="bg-primary-900/80 px-4 py-3 border-t border-primary-800 flex items-center justify-between sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-primary-400">
                                    Showing <span className="font-bold text-white">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                                    <span className="font-bold text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                                    <span className="font-bold text-white">{pagination.total}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="rounded-l-lg rounded-r-none border-primary-700 bg-primary-800 text-primary-200 hover:bg-primary-700 hover:text-white"
                                        disabled={pagination.page === 1}
                                        onClick={() => setPage(pagination.page - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="rounded-l-none rounded-r-lg border-primary-700 bg-primary-800 text-primary-200 hover:bg-primary-700 hover:text-white"
                                        disabled={pagination.page === pagination.totalPages}
                                        onClick={() => setPage(pagination.page + 1)}
                                    >
                                        Next
                                    </Button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Client Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Client"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            name="first_name"
                            required
                            value={formData.first_name}
                            onChange={handleInputChange}
                        />
                        <Input
                            label="Last Name"
                            name="last_name"
                            required
                            value={formData.last_name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                    />
                    <Input
                        label="Phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="input"
                            >
                                <option value="lead">Lead</option>
                                <option value="active">Active</option>
                                <option value="closed">Closed</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <Input
                            label="Budget"
                            type="number"
                            name="budget"
                            value={formData.budget}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isLoading}
                        >
                            Add Client
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Clients;
