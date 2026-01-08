import React, { useEffect } from 'react';
import { Plus, Filter, Search, Home } from 'lucide-react';
import usePropertyStore from '../store/propertyStore';
import PropertyCard from '../components/properties/PropertyCard';
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
                    <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your property listings and inventory
                    </p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Property
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by city..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                            value={filters.city || ''}
                            onChange={handleSearch}
                        />
                    </div>

                    <select
                        className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
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
                        className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                        value={filters.status || ''}
                        onChange={handleStatusChange}
                    >
                        <option value="">All Statuses</option>
                        <option value="available">Available</option>
                        <option value="under_contract">Under Contract</option>
                        <option value="sold">Sold</option>
                        <option value="off_market">Off Market</option>
                    </select>

                    <Button variant="secondary" className="w-full">
                        <Filter className="w-4 h-4 mr-2" />
                        More Filters
                    </Button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : properties.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {properties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                            <span className="font-medium">{pagination.total}</span> results
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={pagination.page === 1}
                                onClick={() => setPage(pagination.page - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={pagination.page === pagination.totalPages}
                                onClick={() => setPage(pagination.page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <Home className="h-12 w-12" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No properties found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Get started by creating a new property listing.
                    </p>
                    <div className="mt-6">
                        <Button>
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
