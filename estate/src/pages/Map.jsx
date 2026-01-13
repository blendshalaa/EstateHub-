import React, { useEffect, useMemo, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import usePropertyStore from '../store/propertyStore';
import { Map as MapIcon, Loader2, Home, Bed, Bath, Ruler, Navigation } from 'lucide-react';

// Component to handle map fly-to animation
const MapController = ({ selectedProperty }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedProperty) {
            map.flyTo([selectedProperty.lat, selectedProperty.lng], 16, {
                duration: 1.5,
                easeLinearity: 0.25
            });
        }
    }, [selectedProperty, map]);

    return null;
};

const Map = () => {
    const { properties, fetchProperties, isLoading } = usePropertyStore();
    const [selectedPropertyId, setSelectedPropertyId] = useState(null);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        fetchProperties();
    }, []);

    // Generate consistent random coordinates for demo purposes
    // Centered around Prishtina, Kosovo (42.6629, 21.1655)
    const mapProperties = useMemo(() => {
        return properties.map((prop, index) => {
            const lat = 42.6629 + (Math.sin(index * 123) * 0.02);
            const lng = 21.1655 + (Math.cos(index * 321) * 0.03);
            return { ...prop, lat, lng };
        });
    }, [properties]);

    const selectedProperty = useMemo(() =>
        mapProperties.find(p => p.id === selectedPropertyId),
        [selectedPropertyId, mapProperties]);

    // Custom Price Marker
    const createCustomIcon = (price, isSelected) => {
        const formattedPrice = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumSignificantDigits: 3,
            notation: "compact",
            compactDisplay: "short"
        }).format(price);

        return L.divIcon({
            className: 'custom-marker',
            html: `
                <div class="relative group">
                    <div class="${isSelected
                    ? 'bg-secondary-500 text-primary-950 scale-110 z-50 ring-4 ring-secondary-500/30'
                    : 'bg-primary-900/90 text-white hover:bg-primary-800 hover:scale-105'} 
                        transition-all duration-300 px-3 py-1.5 rounded-full shadow-lg border border-white/10 font-bold text-xs whitespace-nowrap flex items-center gap-1 backdrop-blur-md">
                        <span>${formattedPrice}</span>
                        <div class="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                    </div>
                    <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] ${isSelected ? 'border-t-secondary-500' : 'border-t-primary-900/90'}"></div>
                </div>
            `,
            iconSize: [60, 40],
            iconAnchor: [30, 40],
        });
    };

    const handleCardClick = (property) => {
        setSelectedPropertyId(property.id);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col space-y-4 relative">
            {/* Header Overlay */}
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
                <div className="bg-primary-950/80 backdrop-blur-md p-4 rounded-2xl border border-primary-800 shadow-2xl pointer-events-auto">
                    <h1 className="text-xl font-bold text-white flex items-center">
                        <MapIcon className="mr-2 h-6 w-6 text-secondary-500" />
                        Prishtina Prime
                    </h1>
                    <p className="text-xs text-primary-300 mt-1">
                        {properties.length} premium listings found
                    </p>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 rounded-3xl overflow-hidden border border-primary-800 shadow-2xl relative z-0 min-h-[500px] group">
                <MapContainer
                    center={[42.6629, 21.1655]}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0 bg-primary-950"
                    zoomControl={false}
                >
                    <MapController selectedProperty={selectedProperty} />

                    {/* Dark Mode Map Tiles */}
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {mapProperties.map((property) => (
                        <Marker
                            key={property.id}
                            position={[property.lat, property.lng]}
                            icon={createCustomIcon(property.price, selectedPropertyId === property.id)}
                            eventHandlers={{
                                click: () => {
                                    setSelectedPropertyId(property.id);
                                    // Scroll card into view
                                    const card = document.getElementById(`card-${property.id}`);
                                    if (card && scrollContainerRef.current) {
                                        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                                    }
                                },
                            }}
                        />
                    ))}
                </MapContainer>

                {/* Vignette Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,7,18,0.4)_100%)] z-[400]"></div>

                {/* Bottom Property Carousel */}
                <div className="absolute bottom-6 left-0 right-0 z-[500] px-6">
                    <div
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {mapProperties.map((property) => (
                            <div
                                id={`card-${property.id}`}
                                key={property.id}
                                onClick={() => handleCardClick(property)}
                                className={`flex-shrink-0 w-72 snap-center cursor-pointer transition-all duration-300 transform ${selectedPropertyId === property.id
                                        ? 'scale-105 ring-2 ring-secondary-500 shadow-secondary-500/20'
                                        : 'hover:scale-102 hover:bg-primary-800/80'
                                    } bg-primary-900/90 backdrop-blur-xl border border-primary-700/50 rounded-2xl shadow-2xl overflow-hidden group/card`}
                            >
                                <div className="relative h-40">
                                    {property.images && property.images.length > 0 ? (
                                        <img
                                            src={property.images[0].url}
                                            alt={property.address}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-primary-800 text-primary-600">
                                            <Home className="h-10 w-10" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-white border border-white/10">
                                        {property.status.replace('_', ' ')}
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                        <p className="text-white font-bold text-lg">
                                            ${Number(property.price).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h3 className="font-bold text-white text-sm truncate mb-2">{property.address}</h3>
                                    <div className="flex items-center justify-between text-xs text-primary-300">
                                        <div className="flex items-center gap-1">
                                            <Bed className="w-3 h-3" />
                                            <span>{property.bedrooms}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Bath className="w-3 h-3" />
                                            <span>{property.bathrooms}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Ruler className="w-3 h-3" />
                                            <span>{property.square_feet}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Map;
