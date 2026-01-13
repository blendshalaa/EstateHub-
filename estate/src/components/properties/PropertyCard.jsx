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
        available: 'bg-green-500/20 text-green-400 border-green-500/30',
        under_contract: 'bg-secondary-500/20 text-secondary-400 border-secondary-500/30',
        sold: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        off_market: 'bg-primary-500/20 text-primary-400 border-primary-500/30'
    };

    return (
        <Link to={`/properties/${id}`} className="block group">
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary-600 hover:-translate-y-1 h-full flex flex-col bg-primary-900/40 backdrop-blur-sm border-primary-800">
                <div className="relative h-48 w-full overflow-hidden">
                    <img
                        src={coverImage}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute top-2 right-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border backdrop-blur-md ${statusColors[status] || 'bg-primary-500/20 text-primary-400 border-primary-500/30'}`}>
                            {status.replace('_', ' ')}
                        </span>
                    </div>
                    <div className="absolute bottom-2 left-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-primary-950/80 text-white backdrop-blur-md border border-primary-700/50 capitalize">
                            <Home className="w-3 h-3 mr-1 text-secondary-500" />
                            {property_type}
                        </span>
                    </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-secondary-400 transition-colors">
                            {title}
                        </h3>
                    </div>

                    <p className="text-2xl font-black text-secondary-400 mb-2">
                        {formatCurrency(price)}
                    </p>

                    <div className="flex items-center text-primary-400 text-sm mb-4">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0 text-primary-500" />
                        <span className="line-clamp-1">{address}</span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-primary-800/50 grid grid-cols-3 gap-2 text-sm text-primary-300">
                        <div className="flex items-center justify-center">
                            <Bed className="w-4 h-4 mr-1.5 text-primary-500" />
                            <span className="font-medium">{bedrooms} Beds</span>
                        </div>
                        <div className="flex items-center justify-center border-l border-primary-800/50">
                            <Bath className="w-4 h-4 mr-1.5 text-primary-500" />
                            <span className="font-medium">{bathrooms} Baths</span>
                        </div>
                        <div className="flex items-center justify-center border-l border-primary-800/50">
                            <Square className="w-4 h-4 mr-1.5 text-primary-500" />
                            <span className="font-medium">{square_feet} sqft</span>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
};

export default PropertyCard;
