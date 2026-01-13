import React, { useEffect, useState } from 'react';
import { Plus, Filter, Search, Home, AlertCircle } from 'lucide-react';
import usePropertyStore from '../store/propertyStore';
import PropertyCard from '../components/properties/PropertyCard';
import PropertyModal from '../components/properties/PropertyModal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Properties = () => {
    const {
        properties,
        isLoading,
        error,
        fetchProperties,
        filters,
        setFilters,
        pagination,
        setPage
    } = usePropertyStore();

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleSearch = (e) => {
        setFilters({ city: e.target.value });
    };

    const handleTypeChange = (e) => {
        setFilters({ type: e.target.value });
    };

    const handleStatusChange = (e) => {
        setFilters({ status: e.target.value });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Properties</h1>
                    <p className="text-sm text-primary-400 mt-1">
                        Manage your property listings and inventory
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-primary-900/50">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Property
                </Button>
            </div>

            <PropertyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            {/* Filters */}
            <div className="bg-primary-900/40 backdrop-blur-sm border border-primary-800 rounded-2xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-primary-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by city..."
                            className="input pl-10 bg-primary-900/50 border-primary-700 focus:border-secondary-500 text-white placeholder-primary-500"
                            value={filters.city || ''}
                            onChange={handleSearch}
                        />
                    </div>

                    <select
                        className="input bg-primary-900/50 border-primary-700 focus:border-secondary-500 text-white"
                        value={filters.type || ''}
                        onChange={handleTypeChange}
                    >
                        <option value="">All Types</option>
                        <option value="house">House</option>
                        <option value="apartment">Apartment</option>
                        <option value="condo">Condo</option>
                        <option value="land">Land</option>
                        <option value="commercial">Commercial</option>
                    </select>

                    <select
                        className="input bg-primary-900/50 border-primary-700 focus:border-secondary-500 text-white"
                        value={filters.status || ''}
                        onChange={handleStatusChange}
                    >
                        <option value="">All Statuses</option>
                        <option value="available">Available</option>
                        <option value="under_contract">Under Contract</option>
                        <option value="sold">Sold</option>
                        <option value="off_market">Off Market</option>
                    </select>

                    <Button variant="secondary" className="w-full bg-primary-800/50 border-primary-700 text-primary-200 hover:text-white hover:bg-primary-700">
                        <Filter className="w-4 h-4 mr-2" />
                        More Filters
                    </Button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-800 border-t-secondary-500"></div>
                </div>
            ) : properties.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {properties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-primary-800/50 pt-4">
                        <div className="text-sm text-primary-400">
                            Showing <span className="font-bold text-white">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                            <span className="font-bold text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                            <span className="font-bold text-white">{pagination.total}</span> results
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={pagination.page === 1}
                                onClick={() => setPage(pagination.page - 1)}
                                className="bg-primary-800 border-primary-700 text-primary-200 hover:text-white"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={pagination.page === pagination.totalPages}
                                onClick={() => setPage(pagination.page + 1)}
                                className="bg-primary-800 border-primary-700 text-primary-200 hover:text-white"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-24 bg-primary-900/20 rounded-3xl border-2 border-dashed border-primary-800">
                    <div className="mx-auto h-20 w-20 bg-primary-900/50 rounded-2xl shadow-sm flex items-center justify-center mb-6">
                        <Home className="h-10 w-10 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white">No properties found</h3>
                    <p className="mt-2 text-sm text-primary-400 max-w-xs mx-auto">
                        Get started by creating a new property listing.
                    </p>
                    <div className="mt-8">
                        <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-primary-900/50">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Property
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Properties;
