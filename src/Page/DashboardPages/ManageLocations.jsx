import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, Edit2, Trash2, Search, X, Check, AlertCircle, Navigation, Loader2 } from 'lucide-react';
import { bangladeshData } from '../../data/bangladeshData';
import usePublicAxios from '../../Hooks/usePublicAxios';
import Swal from 'sweetalert2';

const ManageLocations = () => {
    const axiosPublic = usePublicAxios();
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [mapSearchQuery, setMapSearchQuery] = useState('');
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const mapRef = useRef(null);
    const searchInputRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerInstanceRef = useRef(null);
    const autocompleteInstanceRef = useRef(null);
    const searchContainerRef = useRef(null);

    const [formData, setFormData] = useState({
        division: '',
        district: '',
        thana: '',
        union: '',
        area: '',
        coordinates: { lat: 23.8103, lng: 90.4125 },
        googleMapsUrl: ''
    });

    // Load Google Maps Script
    useEffect(() => {
        if (window.google && window.google.maps) {
            setMapLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            setMapLoaded(true);
        };
        script.onerror = (error) => {
            console.error('Failed to load Google Maps:', error);
            setMapError('Failed to load Google Maps. Please check your API key configuration.');
        };
        document.head.appendChild(script);

        return () => { };
    }, []);

    // Initialize Map
    useEffect(() => {
        if (!mapLoaded || !mapRef.current || (!showAddModal && !showEditModal)) {
            return;
        }

        const timer = setTimeout(() => {
            try {
                const map = new window.google.maps.Map(mapRef.current, {
                    center: formData.coordinates,
                    zoom: 13,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                    zoomControl: true
                });

                const marker = new window.google.maps.Marker({
                    position: formData.coordinates,
                    map: map,
                    draggable: true,
                    title: 'Selected Location',
                    animation: window.google.maps.Animation.DROP
                });

                map.addListener('click', (e) => {
                    const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                    marker.setPosition(newPos);
                    setFormData(prev => ({ ...prev, coordinates: newPos }));
                });

                marker.addListener('dragend', (e) => {
                    const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                    setFormData(prev => ({ ...prev, coordinates: newPos }));
                    map.panTo(newPos);
                });

                if (searchInputRef.current) {
                    const autocomplete = new window.google.maps.places.Autocomplete(
                        searchInputRef.current,
                        {
                            componentRestrictions: { country: 'bd' },
                            fields: ['geometry', 'formatted_address', 'name'],
                            types: ['geocode', 'establishment']
                        }
                    );

                    autocomplete.addListener('place_changed', () => {
                        const place = autocomplete.getPlace();
                        if (place.geometry && place.geometry.location) {
                            const newPos = {
                                lat: place.geometry.location.lat(),
                                lng: place.geometry.location.lng()
                            };
                            map.setCenter(newPos);
                            map.setZoom(15);

                            if (marker && marker.setPosition) {
                                marker.setPosition(newPos);
                            }

                            setFormData(prev => ({ ...prev, coordinates: newPos }));
                            setMapSearchQuery(place.formatted_address || place.name || '');
                        }
                    });

                    autocompleteInstanceRef.current = autocomplete;
                }

                mapInstanceRef.current = map;
                markerInstanceRef.current = marker;

            } catch (error) {
                console.error('Map initialization error:', error);
                setMapError('Failed to initialize map. Please check console for details.');
            }
        }, 100);

        return () => {
            clearTimeout(timer);
            if (markerInstanceRef.current) {
                markerInstanceRef.current.setMap(null);
                markerInstanceRef.current = null;
            }
            if (mapInstanceRef.current) {
                mapInstanceRef.current = null;
            }
            if (autocompleteInstanceRef.current && autocompleteInstanceRef.current.remove) {
                autocompleteInstanceRef.current.remove();
            }
        };
    }, [mapLoaded, showAddModal, showEditModal]);

    // Update map center
    useEffect(() => {
        if (mapInstanceRef.current && markerInstanceRef.current) {
            const pos = formData.coordinates;
            mapInstanceRef.current.panTo(pos);
            if (markerInstanceRef.current.setPosition) {
                markerInstanceRef.current.setPosition(pos);
            }
        }
    }, [formData.coordinates]);

    // Fetch locations
    const fetchLocations = async () => {
        try {
            const response = await axiosPublic.get('/api/locations');
            setLocations(response.data.data || []);
        } catch (error) {
            console.error('Error fetching locations:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load locations'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const handleDivisionChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            division: value,
            district: '',
            thana: ''
        }));
    };

    const handleDistrictChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            district: value,
            thana: ''
        }));
    };

    const handleThanaChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            thana: value
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            division: '',
            district: '',
            thana: '',
            union: '',
            area: '',
            coordinates: { lat: 23.8103, lng: 90.4125 },
            googleMapsUrl: ''
        });
        setMapSearchQuery('');
    };

    const handleAddLocation = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await axiosPublic.post('/api/locations', formData);

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Location added successfully!',
                timer: 2000,
                showConfirmButton: false
            });
            setShowAddModal(false);
            resetForm();
            fetchLocations();
        } catch (error) {
            console.error('Error adding location:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error.response?.data?.message || 'Failed to add location'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditLocation = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await axiosPublic.put(`/api/locations/${selectedLocation._id}`, formData);

            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: 'Location updated successfully!',
                timer: 2000,
                showConfirmButton: false
            });
            setShowEditModal(false);
            setSelectedLocation(null);
            resetForm();
            fetchLocations();
        } catch (error) {
            console.error('Error updating location:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to update location'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteLocation = async (locationId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        setIsSubmitting(true);
        try {
            await axiosPublic.delete(`/api/locations/${locationId}`);

            Swal.fire('Deleted!', 'Location has been deleted.', 'success');
            fetchLocations();
        } catch (error) {
            console.error('Error deleting location:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete location'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (location) => {
        setSelectedLocation(location);
        setFormData({
            division: location.division,
            district: location.district,
            thana: location.thana,
            union: location.union || '',
            area: location.area || '',
            coordinates: location.coordinates,
            googleMapsUrl: location.googleMapsUrl || ''
        });
        setShowEditModal(true);
    };

    const filteredLocations = locations.filter(loc =>
        loc.division.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loc.thana.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (loc.union && loc.union.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (loc.area && loc.area.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getSelectionKey = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

    const availableDistricts = formData.division ? bangladeshData.divisions[getSelectionKey(formData.division)]?.districts || {} : {};
    const availableThanas = formData.district ? availableDistricts[getSelectionKey(formData.district)]?.thanas || [] : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="w-full sm:w-auto">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg">
                                    <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                    Manage Locations
                                </span>
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-2 ml-0 sm:ml-12">
                                Add and manage locations for wallate shop
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="font-semibold">Add Location</span>
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search locations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow bg-white"
                        />
                    </div>
                </div>

                {/* Locations Display */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {loading ? (
                        <div className="p-12 sm:p-16 text-center">
                            <Loader2 className="inline-block animate-spin h-12 w-12 text-indigo-600 mb-4" />
                            <p className="text-gray-600 font-medium">Loading locations...</p>
                        </div>
                    ) : filteredLocations.length === 0 ? (
                        <div className="p-12 sm:p-16 text-center">
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600" />
                            </div>
                            <p className="text-gray-900 text-lg sm:text-xl font-semibold mb-2">No locations found</p>
                            <p className="text-gray-500 text-sm sm:text-base">
                                {searchTerm ? 'Try adjusting your search' : 'Add your first location to get started'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Division</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">District</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Thana</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Union</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Area</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Coordinates</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredLocations.map((location) => (
                                            <tr key={location._id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{location.division}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{location.district}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{location.thana}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{location.union || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{location.area || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                                                    {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => openEditModal(location)}
                                                            className="text-blue-600 hover:text-blue-800 p-2.5 hover:bg-blue-100 rounded-lg transition-all duration-200"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteLocation(location._id)}
                                                            className="text-red-600 hover:text-red-800 p-2.5 hover:bg-red-100 rounded-lg transition-all duration-200"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="lg:hidden divide-y divide-gray-100">
                                {filteredLocations.map((location) => (
                                    <div key={location._id} className="p-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 text-base mb-1">{location.division}</h3>
                                                <p className="text-sm text-gray-600">{location.district}, {location.thana}</p>
                                            </div>
                                            <div className="flex items-center gap-1 ml-2">
                                                <button
                                                    onClick={() => openEditModal(location)}
                                                    className="text-blue-600 hover:text-blue-800 p-2.5 hover:bg-blue-100 rounded-lg transition-all duration-200"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteLocation(location._id)}
                                                    className="text-red-600 hover:text-red-800 p-2.5 hover:bg-red-100 rounded-lg transition-all duration-200"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            {location.union && (
                                                <div>
                                                    <span className="text-gray-500 text-xs">Union:</span>
                                                    <p className="text-gray-700 font-medium">{location.union}</p>
                                                </div>
                                            )}
                                            {location.area && (
                                                <div>
                                                    <span className="text-gray-500 text-xs">Area:</span>
                                                    <p className="text-gray-700 font-medium">{location.area}</p>
                                                </div>
                                            )}
                                            <div className="col-span-2">
                                                <span className="text-gray-500 text-xs">Coordinates:</span>
                                                <p className="text-gray-700 font-mono text-xs mt-0.5">
                                                    {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-end z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                            <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                {showAddModal ? 'Add New Location' : 'Edit Location'}
                            </h2>
                            <button
                                onClick={() => {
                                    showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                                    resetForm();
                                    setSelectedLocation(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={showAddModal ? handleAddLocation : handleEditLocation} className="p-4 sm:p-6">
                            {/* Form Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Division <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="division"
                                        value={formData.division}
                                        onChange={handleDivisionChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <option value="">Select Division</option>
                                        {Object.entries(bangladeshData.divisions).map(([key, data]) => (
                                            <option key={key} value={data.name}>{data.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        District <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="district"
                                        value={formData.district}
                                        onChange={handleDistrictChange}
                                        required
                                        disabled={!formData.division}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white disabled:bg-gray-50 disabled:text-gray-500 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <option value="">Select District</option>
                                        {Object.entries(availableDistricts).map(([key, data]) => (
                                            <option key={key} value={data.name}>{data.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Thana <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="thana"
                                        value={formData.thana}
                                        onChange={handleThanaChange}
                                        required
                                        disabled={!formData.district}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white disabled:bg-gray-50 disabled:text-gray-500 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <option value="">Select Thana</option>
                                        {availableThanas.map((thana, index) => (
                                            <option key={index} value={thana}>{thana}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Union (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="union"
                                        value={formData.union}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow"
                                        placeholder="e.g., Ward 5"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Area (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="area"
                                        value={formData.area}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow"
                                        placeholder="e.g., Mirpur 1"
                                    />
                                </div>
                            </div>

                            {/* Map Section */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Navigation className="w-4 h-4 text-indigo-600" />
                                        Select Location on Map <span className="text-red-500">*</span>
                                    </div>
                                </label>
                                <p className="text-sm text-gray-600 mb-3">Search or click/drag the marker on the map to set coordinates</p>

                                {mapError && (
                                    <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-semibold text-red-800">{mapError}</p>
                                                <p className="text-xs text-red-600 mt-1">
                                                    Please add <strong>localhost:5173</strong> to your Google Cloud Console API restrictions
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={searchContainerRef} className="mb-4">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            placeholder="Search for a location (e.g. Dhaka, Bangladesh)..."
                                            value={mapSearchQuery}
                                            onChange={(e) => setMapSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow"
                                        />
                                    </div>
                                </div>

                                <div
                                    ref={mapRef}
                                    className="w-full h-64 sm:h-80 md:h-96 rounded-xl border-2 border-gray-200 overflow-hidden bg-gray-100 shadow-md"
                                >
                                    {!mapLoaded && (
                                        <div className="w-full h-full flex flex-col items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                                            <p className="text-gray-500 text-sm">Loading Map...</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700 mb-1">Selected Coordinates</p>
                                            <p className="text-sm font-mono text-gray-900 bg-white px-3 py-1.5 rounded-lg inline-block">
                                                {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Google Maps URL (Optional)
                                </label>
                                <input
                                    type="url"
                                    name="googleMapsUrl"
                                    value={formData.googleMapsUrl}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow"
                                    placeholder="https://maps.google.com/..."
                                />
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                                        resetForm();
                                        setSelectedLocation(null);
                                    }}
                                    className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            {showAddModal ? 'Add Location' : 'Update Location'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageLocations;