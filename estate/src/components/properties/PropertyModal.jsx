import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { Camera, X } from 'lucide-react';
import usePropertyStore from '../../store/propertyStore';

const PropertyModal = ({ isOpen, onClose }) => {
    const { createProperty, addPropertyPhoto, isLoading } = usePropertyStore();
    const [formData, setFormData] = useState({
        address: '',
        city: '',
        state: '',
        zip_code: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        square_feet: '',
        property_type: 'house',
        listing_type: 'sale',
        description: '',
        status: 'available'
    });
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        setPhoto(null);
        setPhotoPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const property = await createProperty({
            ...formData,
            price: parseFloat(formData.price),
            bedrooms: parseInt(formData.bedrooms) || null,
            bathrooms: parseFloat(formData.bathrooms) || null,
            square_feet: parseInt(formData.square_feet) || null,
            listing_date: new Date().toISOString().split('T')[0]
        });

        if (property && photo) {
            await addPropertyPhoto(property.id, {
                file: photo,
                is_primary: true
            });
        }

        if (property) {
            onClose();
            // Reset form
            setFormData({
                address: '',
                city: '',
                state: '',
                zip_code: '',
                price: '',
                bedrooms: '',
                bathrooms: '',
                square_feet: '',
                property_type: 'house',
                listing_type: 'sale',
                description: '',
                status: 'available'
            });
            setPhoto(null);
            setPhotoPreview(null);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Property" className="sm:max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Input
                            label="Address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="123 Main St"
                            required
                        />
                    </div>
                    <Input
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="New York"
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="State"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="NY"
                            required
                        />
                        <Input
                            label="Zip Code"
                            name="zip_code"
                            value={formData.zip_code}
                            onChange={handleChange}
                            placeholder="10001"
                            required
                        />
                    </div>
                    <Input
                        label="Price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="500000"
                        required
                    />
                    <div className="grid grid-cols-3 gap-2">
                        <Input
                            label="Beds"
                            name="bedrooms"
                            type="number"
                            value={formData.bedrooms}
                            onChange={handleChange}
                            placeholder="3"
                        />
                        <Input
                            label="Baths"
                            name="bathrooms"
                            type="number"
                            step="0.5"
                            value={formData.bathrooms}
                            onChange={handleChange}
                            placeholder="2"
                        />
                        <Input
                            label="Sq Ft"
                            name="square_feet"
                            type="number"
                            value={formData.square_feet}
                            onChange={handleChange}
                            placeholder="1500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Property Type
                        </label>
                        <select
                            name="property_type"
                            value={formData.property_type}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        >
                            <option value="house">House</option>
                            <option value="apartment">Apartment</option>
                            <option value="condo">Condo</option>
                            <option value="land">Land</option>
                            <option value="commercial">Commercial</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Listing Type
                        </label>
                        <select
                            name="listing_type"
                            value={formData.listing_type}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        >
                            <option value="sale">For Sale</option>
                            <option value="rent">For Rent</option>
                            <option value="lease">Lease</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Describe the property..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Property Photo
                    </label>
                    {photoPreview ? (
                        <div className="relative inline-block">
                            <img
                                src={photoPreview}
                                alt="Preview"
                                className="h-32 w-48 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                                type="button"
                                onClick={removePhoto}
                                className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">Click to upload photo</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />
                            </label>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
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
                        Create Property
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default PropertyModal;
