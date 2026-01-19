import React, { useState, useEffect, useRef } from 'react';
import { Store, Plus, Edit2, Trash2, Search, X, Check, AlertCircle, Navigation, Loader2, Upload, Phone, User, Tag, DollarSign, MapPin } from 'lucide-react';
import usePublicAxios from '../../Hooks/usePublicAxios';
import Swal from 'sweetalert2';
import imageCompression from 'browser-image-compression';

const WallateShopManage = () => {
    const axiosPublic = usePublicAxios();
    const IMG_BB_API_KEY = import.meta.env.VITE_IMAGE_HOSTING_KEY;

    const [shops, setShops] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedShopId, setSelectedShopId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapSearchQuery, setMapSearchQuery] = useState('');

    // Cascading Location States (5 Levels)
    const [selectedDivision, setSelectedDivision] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedThana, setSelectedThana] = useState('');
    const [selectedUnion, setSelectedUnion] = useState('');
    const [selectedArea, setSelectedArea] = useState('');

    const mapRef = useRef(null);
    const searchInputRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerInstanceRef = useRef(null);
    const autocompleteInstanceRef = useRef(null);

    const [formData, setFormData] = useState({
        shopName: '',
        shopImage: '',
        shopCategory: '',
        shopLocationId: '',
        paymentPercentage: '',
        mapLocation: { lat: 23.8103, lng: 90.4125 },
        shopOwnerName: '',
        contactNumber: ''
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
        script.onload = () => setMapLoaded(true);
        document.head.appendChild(script);
        return () => { };
    }, []);

    // Initialize Map
    useEffect(() => {
        if (!mapLoaded || !mapRef.current || !showModal) return;

        const timer = setTimeout(() => {
            try {
                const map = new window.google.maps.Map(mapRef.current, {
                    center: formData.mapLocation,
                    zoom: 13,
                    streetViewControl: false,
                    mapTypeControl: false,
                });

                const marker = new window.google.maps.Marker({
                    position: formData.mapLocation,
                    map: map,
                    draggable: true,
                });

                map.addListener('click', (e) => {
                    const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                    marker.setPosition(newPos);
                    setFormData(prev => ({ ...prev, mapLocation: newPos }));
                });

                marker.addListener('dragend', (e) => {
                    const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                    setFormData(prev => ({ ...prev, mapLocation: newPos }));
                });

                if (searchInputRef.current) {
                    const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
                        componentRestrictions: { country: 'bd' },
                        fields: ['geometry', 'formatted_address', 'name'],
                    });

                    autocomplete.addListener('place_changed', () => {
                        const place = autocomplete.getPlace();
                        if (place.geometry && place.geometry.location) {
                            const newPos = {
                                lat: place.geometry.location.lat(),
                                lng: place.geometry.location.lng()
                            };
                            map.setCenter(newPos);
                            map.setZoom(15);
                            marker.setPosition(newPos);
                            setFormData(prev => ({ ...prev, mapLocation: newPos }));
                            setMapSearchQuery(place.formatted_address || place.name || '');
                        }
                    });
                    autocompleteInstanceRef.current = autocomplete;
                }

                mapInstanceRef.current = map;
                markerInstanceRef.current = marker;

            } catch (error) {
                console.error('Map init error:', error);
            }
        }, 100);

        return () => {
            clearTimeout(timer);
            if (markerInstanceRef.current) markerInstanceRef.current.setMap(null);
            if (autocompleteInstanceRef.current && autocompleteInstanceRef.current.remove) autocompleteInstanceRef.current.remove();
        };
    }, [mapLoaded, showModal]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [shopsRes, locationsRes] = await Promise.all([
                axiosPublic.get('/api/shops'),
                axiosPublic.get('/api/locations')
            ]);
            setShops(shopsRes.data.data || []);
            setLocations(locationsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            Swal.fire('Error', 'Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Derive Location Options based on fetched locationsCollection
    const availableDivisions = [...new Set(locations.map(loc => loc.division))].sort();

    const availableDistricts = selectedDivision
        ? [...new Set(locations.filter(loc => loc.division === selectedDivision).map(loc => loc.district))].sort()
        : [];

    const availableThanas = selectedDistrict
        ? [...new Set(locations.filter(loc => loc.district === selectedDistrict).map(loc => loc.thana))].sort()
        : [];

    const availableUnions = selectedThana
        ? [...new Set(locations
            .filter(loc => loc.thana === selectedThana && loc.district === selectedDistrict)
            .map(loc => loc.union || "N/A")
        )].sort()
        : [];

    const availableAreas = selectedUnion
        ? [...new Set(locations
            .filter(loc => (loc.union || "N/A") === selectedUnion && loc.thana === selectedThana)
            .map(loc => loc.area || "N/A")
        )].sort()
        : [];

    const handleDivisionChange = (e) => {
        setSelectedDivision(e.target.value);
        setSelectedDistrict('');
        setSelectedThana('');
        setSelectedUnion('');
        setSelectedArea('');
        setFormData(prev => ({ ...prev, shopLocationId: '' }));
    };

    const handleDistrictChange = (e) => {
        setSelectedDistrict(e.target.value);
        setSelectedThana('');
        setSelectedUnion('');
        setSelectedArea('');
        setFormData(prev => ({ ...prev, shopLocationId: '' }));
    };

    const handleThanaChange = (e) => {
        setSelectedThana(e.target.value);
        setSelectedUnion('');
        setSelectedArea('');
        setFormData(prev => ({ ...prev, shopLocationId: '' }));
    };

    const handleUnionChange = (e) => {
        setSelectedUnion(e.target.value);
        setSelectedArea('');
        setFormData(prev => ({ ...prev, shopLocationId: '' }));
    };

    const handleAreaChange = (e) => {
        const area = e.target.value;
        setSelectedArea(area);

        // Final Document Identification
        const matchedLoc = locations.find(loc =>
            loc.division === selectedDivision &&
            loc.district === selectedDistrict &&
            loc.thana === selectedThana &&
            (loc.union || "N/A") === selectedUnion &&
            (loc.area || "N/A") === area
        );

        if (matchedLoc) {
            setFormData(prev => ({ ...prev, shopLocationId: matchedLoc._id }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsSubmitting(true);
        try {
            const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true };
            const compressedFile = await imageCompression(file, options);

            const uploadFormData = new FormData();
            uploadFormData.append('image', compressedFile);

            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`, {
                method: 'POST',
                body: uploadFormData
            });
            const result = await response.json();

            if (result.success) {
                setFormData(prev => ({ ...prev, shopImage: result.data.url }));
                Swal.fire({ icon: 'success', title: 'Image Uploaded', timer: 1000, showConfirmButton: false });
            } else {
                throw new Error(result.error.message);
            }
        } catch (error) {
            console.error('Upload error:', error);
            Swal.fire('Error', 'Image upload failed', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.shopLocationId) return Swal.fire('Error', 'Please complete the 5-level location selection', 'error');

        setIsSubmitting(true);
        try {
            if (editMode) {
                await axiosPublic.put(`/api/shops/${selectedShopId}`, formData);
                Swal.fire('Updated!', 'Shop updated successfully', 'success');
            } else {
                await axiosPublic.post('/api/shops', formData);
                Swal.fire('Success!', 'Shop added successfully', 'success');
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Submit error:', error);
            Swal.fire('Error', error.response?.data?.message || 'Operation failed', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            shopName: '',
            shopImage: '',
            shopCategory: '',
            shopLocationId: '',
            paymentPercentage: '',
            mapLocation: { lat: 23.8103, lng: 90.4125 },
            shopOwnerName: '',
            contactNumber: ''
        });
        setSelectedDivision('');
        setSelectedDistrict('');
        setSelectedThana('');
        setSelectedUnion('');
        setSelectedArea('');
        setMapSearchQuery('');
        setEditMode(false);
        setSelectedShopId(null);
    };

    const openEditModal = (shop) => {
        const loc = shop.locationDetails;
        if (loc) {
            setSelectedDivision(loc.division || '');
            setSelectedDistrict(loc.district || '');
            setSelectedThana(loc.thana || '');
            setSelectedUnion(loc.union || "N/A");
            setSelectedArea(loc.area || "N/A");
        }

        setFormData({
            shopName: shop.shopName,
            shopImage: shop.shopImage,
            shopCategory: shop.shopCategory || '',
            shopLocationId: shop.shopLocationId,
            paymentPercentage: shop.paymentPercentage,
            mapLocation: shop.mapLocation,
            shopOwnerName: shop.shopOwnerName || '',
            contactNumber: shop.contactNumber || ''
        });
        setSelectedShopId(shop._id);
        setEditMode(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axiosPublic.delete(`/api/shops/${id}`);
                setShops(prev => prev.filter(shop => shop._id !== id));
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Shop has been deleted.',
                    timer: 1500,
                    showConfirmButton: false
                });
                // fetchData(); // No longer strictly needed for deletion but good for sync
            } catch (error) {
                Swal.fire('Error', 'Failed to delete shop', 'error');
            }
        }
    };

    const filteredShops = shops.filter(shop =>
        shop.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.shopCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.shopOwnerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="bg-indigo-600 p-2 rounded-xl">
                                <Store className="w-8 h-8 text-white" />
                            </div>
                            Wallet Shop Management
                        </h1>
                        <p className="text-gray-600 mt-1">Manage partner shops and payment percentages</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Add New Shop
                    </button>
                </div>

                {/* Search & Stats */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, category, or owner..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                {/* Shops List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-20 text-center"><Loader2 className="animate-spin w-12 h-12 text-indigo-600 mx-auto" /></div>
                    ) : filteredShops.length === 0 ? (
                        <div className="p-20 text-center text-gray-500">No shops found matching your search.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-700">Shop Info</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700">Location</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700">Payment %</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700">Contact</th>
                                        <th className="px-6 py-4 font-semibold text-center text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredShops.map(shop => (
                                        <tr key={shop._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <img src={shop.shopImage} alt={shop.shopName} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                                                    <div>
                                                        <div className="font-bold text-gray-900">{shop.shopName}</div>
                                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                                            <Tag className="w-3 h-3" /> {shop.shopCategory || 'No Category'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 font-medium">
                                                    {shop.locationDetails?.thana}, {shop.locationDetails?.district}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {shop.locationDetails?.union && `Union: ${shop.locationDetails.union}`}
                                                    {shop.locationDetails?.area && ` | Area: ${shop.locationDetails.area}`}
                                                </div>
                                                <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                                                    <MapPin className="w-2.5 h-2.5" /> {shop.mapLocation?.lat.toFixed(4)}, {shop.mapLocation?.lng.toFixed(4)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                                                    {shop.paymentPercentage}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="text-gray-900 font-medium">{shop.shopOwnerName}</div>
                                                <div className="text-gray-500">{shop.contactNumber}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => openEditModal(shop)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(shop._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h2 className="text-2xl font-bold text-gray-900">{editMode ? 'Edit' : 'Add New'} Shop</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Side: Basic Info */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Shop Name *</label>
                                            <div className="relative">
                                                <Store className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <input name="shopName" value={formData.shopName} onChange={handleInputChange} required className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter shop name" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Shop Category</label>
                                            <div className="relative">
                                                <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <input name="shopCategory" value={formData.shopCategory} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Restaurant" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Payment % *</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <input type="number" name="paymentPercentage" value={formData.paymentPercentage} onChange={handleInputChange} required className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Full 5-Level Cascading Location Selection */}
                                    <div className="bg-gray-50 p-5 rounded-2xl space-y-5 border border-gray-100 shadow-inner">
                                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-indigo-600" /> Precise Location Selection
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Division</label>
                                                <select value={selectedDivision} onChange={handleDivisionChange} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm">
                                                    <option value="">Select Division</option>
                                                    {availableDivisions.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">District</label>
                                                <select disabled={!selectedDivision} value={selectedDistrict} onChange={handleDistrictChange} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100 text-sm">
                                                    <option value="">Select District</option>
                                                    {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Thana</label>
                                                <select disabled={!selectedDistrict} value={selectedThana} onChange={handleThanaChange} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100 text-sm">
                                                    <option value="">Select Thana</option>
                                                    {availableThanas.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Union</label>
                                                <select disabled={!selectedThana} value={selectedUnion} onChange={handleUnionChange} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100 text-sm">
                                                    <option value="">Select Union</option>
                                                    {availableUnions.map(u => <option key={u} value={u}>{u}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Area</label>
                                                <select disabled={!selectedUnion} value={selectedArea} onChange={handleAreaChange} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100 text-sm">
                                                    <option value="">Select Area</option>
                                                    {availableAreas.map(a => <option key={a} value={a}>{a}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        {!formData.shopLocationId && selectedArea && (
                                            <div className="flex items-center gap-2 text-red-500 text-xs mt-2 animate-pulse">
                                                <AlertCircle className="w-3 h-3" /> No matching location document found in Database
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Owner Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <input name="shopOwnerName" value={formData.shopOwnerName} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Owner name" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Contact Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <input name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Phone" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Image & Map */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Shop Image *</label>
                                        <div className="relative group cursor-pointer border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-indigo-400 transition-colors bg-gray-50/50">
                                            {formData.shopImage ? (
                                                <div className="relative inline-block w-full h-40">
                                                    <img src={formData.shopImage} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                                                    <button type="button" onClick={() => setFormData(p => ({ ...p, shopImage: '' }))} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"><X className="w-4 h-4" /></button>
                                                </div>
                                            ) : (
                                                <div className="py-8">
                                                    <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <Upload className="w-6 h-6 text-indigo-600" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-600">Click or drag to upload shop photo</span>
                                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                                </div>
                                            )}
                                            <input type="file" onChange={handleImageUpload} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Precise Map Location *</label>
                                        <div className="relative mb-3">
                                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                            <input
                                                ref={searchInputRef}
                                                type="text"
                                                value={mapSearchQuery}
                                                onChange={(e) => setMapSearchQuery(e.target.value)}
                                                placeholder="Search specific address or landmark..."
                                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                                            />
                                        </div>
                                        <div ref={mapRef} className="h-[280px] w-full rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden shadow-inner relative">
                                            {!mapLoaded && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Loader2 className="animate-spin text-indigo-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-gray-400 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                            <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> LAT: {formData.mapLocation.lat.toFixed(6)}</span>
                                            <span>LNG: {formData.mapLocation.lng.toFixed(6)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 pt-6 flex justify-end gap-4 border-t border-gray-100 bg-white sticky bottom-0 z-10">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3 rounded-xl border border-gray-300 font-semibold text-gray-600 hover:bg-gray-50 transition-all active:scale-95">Cancel</button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !formData.shopImage}
                                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                        {editMode ? 'Update Shop Details' : 'Save New Shop'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WallateShopManage;