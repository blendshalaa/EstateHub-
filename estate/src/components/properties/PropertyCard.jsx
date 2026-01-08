import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Home } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import Card from '../common/Card';

const PropertyCard = ({ property }) => {
    const {
        id,
        title,
        address,
        price,
        bedrooms,
        bathrooms,
        square_feet,
        property_type,
        status,
        photos
    } = property;

    // Use first photo or placeholder
    const coverImage = photos && photos.length > 0
        ? `http://localhost:5000${photos[0].photo_url}`
        : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80';

    const statusColors = {
        available: 'bg-green-100 text-green-800',
        under_contract: 'bg-yellow-100 text-yellow-800',
        sold: 'bg-blue-100 text-blue-800',
        off_market: 'bg-gray-100 text-gray-800'
    };

    return (
        <Link to={`/properties/${id}`} className="block group">
            <Card className="overflow-hidden transition-shadow hover:shadow-md h-full flex flex-col">
                <div className="relative h-48 w-full overflow-hidden">
                    <img
                        src={coverImage}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                            {status.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="absolute bottom-2 left-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-black/50 text-white backdrop-blur-sm capitalize">
                            <Home className="w-3 h-3 mr-1" />
                            {property_type}
                        </span>
                    </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                            {title}
                        </h3>
                    </div>

                    <p className="text-2xl font-bold text-primary-600 mb-2">
                        {formatCurrency(price)}
                    </p>

                    <div className="flex items-center text-gray-500 text-sm mb-4">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{address}</span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center justify-center">
                            <Bed className="w-4 h-4 mr-1.5 text-gray-400" />
                            <span>{bedrooms} Beds</span>
                        </div>
                        <div className="flex items-center justify-center border-l border-gray-200">
                            <Bath className="w-4 h-4 mr-1.5 text-gray-400" />
                            <span>{bathrooms} Baths</span>
                        </div>
                        <div className="flex items-center justify-center border-l border-gray-200">
                            <Square className="w-4 h-4 mr-1.5 text-gray-400" />
                            <span>{square_feet} sqft</span>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
};

export default PropertyCard;
