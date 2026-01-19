import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Star, Store, Phone, Clock, ChevronRight, Search, Loader2, User, Navigation, AlertTriangle, Route, Coins, ArrowRightLeft, Download, X, Camera, Copy, CheckCircle2, TrendingUp, History } from 'lucide-react';
import { GoogleMap, MarkerF, InfoWindow, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import usePublicAxios from '../../Hooks/usePublicAxios';
import useUser from '../../Hooks/useUser';
import Swal from 'sweetalert2';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from "html5-qrcode";
import Navbar from '../../Components/Navbar/Navbar';
import DownNav from '../../Components/DownNav/DownNav';

const mapContainerStyle = {
    width: '100%',
    height: '100%'
};

const defaultCenter = { lat: 23.8103, lng: 90.4125 };

const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};

const WallateShop = () => {
    const axiosPublic = usePublicAxios();
    const { user: profileUser, refetch: refetchUser } = useUser();
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [isFetchingHistory, setIsFetchingHistory] = useState(false);
    const [transferData, setTransferData] = useState({ receiverUsername: '', amount: '' });
    const [isScanning, setIsScanning] = useState(false);
    const [copied, setCopied] = useState(false);
    const scannerRef = useRef(null);
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const [selectedDivision, setSelectedDivision] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedThana, setSelectedThana] = useState('');
    const [selectedUnion, setSelectedUnion] = useState('');
    const [selectedArea, setSelectedArea] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [locationData, setLocationData] = useState(null);
    const [allShops, setAllShops] = useState([]);
    const [filteredShops, setFilteredShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detectingLocation, setDetectingLocation] = useState(false);
    const [activeShop, setActiveShop] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState(defaultCenter);

    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [routeInfo, setRouteInfo] = useState(null);
    const [targetShop, setTargetShop] = useState(null);

    const watchId = useRef(null);
    const mapRef = useRef(null);

    const fetchHistory = async () => {
        setIsFetchingHistory(true);
        try {
            const response = await axiosPublic.get('/api/transfer-history');
            if (response.data.success) {
                setHistoryData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setIsFetchingHistory(false);
        }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosPublic.post('/api/transfer-coins', transferData);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Transfer Successful',
                    text: `Coins sent successfully to ${transferData.receiverUsername}`,
                    confirmButtonColor: '#4f46e5'
                });
                setIsTransferModalOpen(false);
                setTransferData({ receiverUsername: '', amount: '' });
                refetchUser();
                stopScanner();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Transfer Failed',
                text: error.response?.data?.error || 'Something went wrong',
                confirmButtonColor: '#4f46e5'
            });
        }
    };

    const startScanner = useCallback(async () => {
        setIsScanning(true);
        setTimeout(async () => {
            try {
                const html5QrCode = new Html5Qrcode("reader");
                scannerRef.current = html5QrCode;

                const qrConfig = { fps: 10, qrbox: { width: 250, height: 250 } };

                try {
                    await html5QrCode.start(
                        { facingMode: "environment" },
                        qrConfig,
                        (decodedText) => {
                            setTransferData(prev => ({ ...prev, receiverUsername: decodedText }));
                            stopScanner();
                            Swal.fire({
                                icon: 'success',
                                title: 'QR Scanned',
                                text: `Address: ${decodedText}`,
                                timer: 1500,
                                showConfirmButton: false
                            });
                        }
                    );
                } catch (err) {
                    console.error("Camera start error:", err);
                    let errorMessage = "Could not access camera";
                    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                        errorMessage = "Camera access requires HTTPS (Secure Connection)";
                    }
                    Swal.fire({
                        icon: 'error',
                        title: 'Camera Error',
                        text: errorMessage,
                        footer: 'Please ensure camera permissions are granted'
                    });
                    setIsScanning(false);
                }
            } catch (err) {
                console.error("Scanner initialization error:", err);
                setIsScanning(false);
            }
        }, 300);
    }, []);

    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
            } catch (e) {
                console.error("Error stopping scanner:", e);
            }
            scannerRef.current = null;
            setIsScanning(false);
        }
    }, []);

    const handleCopyAddress = () => {
        const address = profileUser?.userName;
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [locRes, shopRes] = await Promise.all([
                    axiosPublic.get('/api/locations'),
                    axiosPublic.get('/api/shops')
                ]);

                if (locRes.data.success) setLocationData(locRes.data.data);
                if (shopRes.data.success) setAllShops(shopRes.data.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [axiosPublic]);

    useEffect(() => {
        if (!loading && allShops.length > 0) {
            handleLocationDetection(true);
        }
        return () => {
            if (watchId.current) {
                navigator.geolocation.clearWatch(watchId.current);
                watchId.current = null;
            }
        };
    }, [loading, allShops.length]);

    const handleLocationDetection = (silent = false) => {
        if (!navigator.geolocation) {
            if (!silent) alert("Geolocation is not supported by your browser");
            return;
        }

        if (!silent) setDetectingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const userPos = { lat: latitude, lng: longitude };
                setUserLocation(userPos);
                setMapCenter(userPos);

                const nearby = allShops.filter(shop => {
                    if (!shop.mapLocation || !shop.mapLocation.lat || !shop.mapLocation.lng) return false;
                    const dist = getDistance(latitude, longitude, shop.mapLocation.lat, shop.mapLocation.lng);
                    return dist <= 3;
                });

                if (nearby.length > 0) {
                    setFilteredShops(nearby);
                    setShowResults(true);
                } else if (!silent) {
                    setFilteredShops([]);
                    setShowResults(true);
                }
                setDetectingLocation(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                setDetectingLocation(false);
                if (!silent) alert("Please enable location permissions to find shops near you.");
            }
        );
    };

    const startLiveTracking = useCallback((shop) => {
        if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }

        setIsTracking(true);
        setTargetShop(shop);

        watchId.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const userPos = { lat: latitude, lng: longitude };
                setUserLocation(userPos);
                setMapCenter(userPos);

                if (window.google && shop) {
                    updateDirections(userPos, shop);
                }
            },
            (error) => {
                console.error('Tracking error:', error);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            }
        );
    }, []);

    const updateDirections = useCallback((fromPos, toShop) => {
        if (!window.google || !fromPos || !toShop) return;

        const service = new window.google.maps.DirectionsService();
        service.route(
            {
                origin: fromPos,
                destination: toShop.mapLocation,
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === 'OK' && result) {
                    setDirectionsResponse(result);
                    setRouteInfo({
                        distance: result.routes[0].legs[0].distance.text,
                        duration: result.routes[0].legs[0].duration.text
                    });
                } else {
                    console.error("Directions update failed", status);
                }
            }
        );
    }, []);

    const getDirections = useCallback((shop) => {
        if (!userLocation) {
            alert("Getting your location...");
            handleLocationDetection();
            return;
        }

        if (!window.google) {
            alert("Google Maps is still loading...");
            return;
        }

        setActiveShop(shop);
        setMapCenter(userLocation);
        startLiveTracking(shop);

        setTimeout(() => {
            document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }, [userLocation, startLiveTracking]);

    const stopNavigation = useCallback(() => {
        if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
        setDirectionsResponse(null);
        setRouteInfo(null);
        setActiveShop(null);
        setIsTracking(false);
        setTargetShop(null);
    }, []);

    const handleDivisionChange = (e) => {
        setSelectedDivision(e.target.value);
        setSelectedDistrict('');
        setSelectedThana('');
        setShowResults(false);
        stopNavigation();
    };

    const handleDistrictChange = (e) => {
        setSelectedDistrict(e.target.value);
        setSelectedThana('');
        setShowResults(false);
        stopNavigation();
    };

    const handleThanaChange = (e) => {
        setSelectedThana(e.target.value);
        setSelectedUnion('');
        setSelectedArea('');
        setShowResults(false);
        stopNavigation();
    };

    const handleUnionChange = (e) => {
        setSelectedUnion(e.target.value);
        setSelectedArea('');
        setShowResults(false);
        stopNavigation();
    };

    const handleAreaChange = (e) => {
        setSelectedArea(e.target.value);
        setShowResults(false);
        stopNavigation();
    };

    const handleProceed = () => {
        if (!selectedDivision || !selectedDistrict || !selectedThana) return;

        stopNavigation();

        const filtered = allShops.filter(shop => {
            const matchBase = shop.locationDetails?.division === selectedDivision &&
                shop.locationDetails?.district === selectedDistrict &&
                shop.locationDetails?.thana === selectedThana;

            if (!matchBase) return false;

            const matchUnion = selectedUnion ? shop.locationDetails?.union === selectedUnion : true;
            const matchArea = selectedArea ? shop.locationDetails?.area === selectedArea : true;

            return matchUnion && matchArea;
        });

        setFilteredShops(filtered);
        setShowResults(true);

        const matchedLoc = locationData.find(loc =>
            loc.division === selectedDivision &&
            loc.district === selectedDistrict &&
            loc.thana === selectedThana &&
            (!selectedUnion || loc.union === selectedUnion) &&
            (!selectedArea || loc.area === selectedArea)
        );

        if (matchedLoc && matchedLoc.coordinates) {
            setMapCenter({ lat: Number(matchedLoc.coordinates.lat), lng: Number(matchedLoc.coordinates.lng) });
        }

        setTimeout(() => {
            document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const availableDivisions = locationData ? [...new Set(locationData.map(loc => loc.division))].sort() : [];
    const availableDistricts = selectedDivision
        ? [...new Set(locationData.filter(loc => loc.division === selectedDivision).map(loc => loc.district))].sort()
        : [];
    const availableThanas = selectedDistrict
        ? [...new Set(locationData.filter(loc => loc.district === selectedDistrict).map(loc => loc.thana))].sort()
        : [];
    const availableUnions = selectedThana
        ? [...new Set(locationData
            .filter(loc => loc.thana === selectedThana && loc.district === selectedDistrict)
            .map(loc => loc.union)
            .filter(Boolean)
        )].sort()
        : [];
    const availableAreas = selectedUnion
        ? [...new Set(locationData
            .filter(loc => loc.union === selectedUnion && loc.thana === selectedThana)
            .map(loc => loc.area)
            .filter(Boolean)
        )].sort()
        : [];

    const isFormComplete = selectedDivision && selectedDistrict && selectedThana;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mx-auto mb-4" />
                        <div className="absolute inset-0 h-16 w-16 mx-auto rounded-full bg-indigo-100 blur-xl opacity-50 animate-pulse"></div>
                    </div>
                    <p className="text-gray-700 text-lg font-semibold">Loading shops...</p>
                    <p className="text-gray-500 text-sm mt-1">Please wait</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <Navbar />

            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-bold mb-4 border border-white/30">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Exclusive Partner Network
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 text-white tracking-tight">
                            Discover Local Shops
                        </h1>
                        <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto font-medium">
                            Find the best partner shops and enjoy exclusive benefits
                        </p>
                    </div>

                    {/* Wallet Card */}
                    <div className="max-w-4xl mx-auto mb-6">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"></div>

                                <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Available Balance</p>
                                        </div>
                                        <div className="flex items-baseline gap-3 mb-2">
                                            <Coins className="w-8 h-8 text-yellow-400" />
                                            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                                                {profileUser?.flyWallet || 0}
                                            </span>
                                            <span className="text-gray-400 font-bold text-lg">Coins</span>
                                            <button
                                                onClick={() => {
                                                    setIsHistoryModalOpen(true);
                                                    fetchHistory();
                                                }}
                                                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold transition-all border border-white/20 active:scale-95"
                                            >
                                                <History className="w-3.5 h-3.5" />
                                                History
                                            </button>
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                            <span className="text-gray-400 text-xs">≈</span>
                                            <span className="text-emerald-400 font-bold text-sm">
                                                ৳{(parseFloat(profileUser?.flyWallet || 0) / 100).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                        <button
                                            onClick={() => setIsTransferModalOpen(true)}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl transition-all border border-white/20 font-bold text-white shadow-lg hover:shadow-xl active:scale-95"
                                        >
                                            <ArrowRightLeft className="w-4 h-4" />
                                            <span>Transfer</span>
                                        </button>
                                        <button
                                            onClick={() => setIsReceiveModalOpen(true)}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-2xl transition-all shadow-xl hover:shadow-2xl font-bold text-white active:scale-95"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Receive</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Selector */}
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-4 sm:p-6 border border-white/50">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                                        <MapPin className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Select Location</h2>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    {isTracking && (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg animate-pulse">
                                            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                                            Live Tracking
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleLocationDetection()}
                                        disabled={detectingLocation}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold text-sm hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                    >
                                        {detectingLocation ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="hidden sm:inline">Detecting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Navigation className="w-4 h-4" />
                                                <span className="hidden sm:inline">Near Me (3KM)</span>
                                                <span className="sm:hidden">Near Me</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider px-1">Division *</label>
                                    <select
                                        value={selectedDivision}
                                        onChange={handleDivisionChange}
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all bg-white text-gray-900 font-semibold text-sm shadow-sm hover:border-gray-300"
                                    >
                                        <option value="">Choose Division</option>
                                        {availableDivisions.map(div => (
                                            <option key={div} value={div}>{div}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider px-1">District *</label>
                                    <select
                                        value={selectedDistrict}
                                        onChange={handleDistrictChange}
                                        disabled={!selectedDivision}
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all bg-white disabled:bg-gray-100 disabled:text-gray-400 text-gray-900 font-semibold text-sm shadow-sm hover:border-gray-300"
                                    >
                                        <option value="">Choose District</option>
                                        {availableDistricts.map(dist => (
                                            <option key={dist} value={dist}>{dist}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider px-1">Thana *</label>
                                    <select
                                        value={selectedThana}
                                        onChange={handleThanaChange}
                                        disabled={!selectedDistrict}
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all bg-white disabled:bg-gray-100 disabled:text-gray-400 text-gray-900 font-semibold text-sm shadow-sm hover:border-gray-300"
                                    >
                                        <option value="">Choose Thana</option>
                                        {availableThanas.map(thana => (
                                            <option key={thana} value={thana}>{thana}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Union (Optional)</label>
                                    <select
                                        value={selectedUnion}
                                        onChange={handleUnionChange}
                                        disabled={!selectedThana}
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all bg-white disabled:bg-gray-50 disabled:text-gray-300 text-gray-800 font-semibold text-sm shadow-sm"
                                    >
                                        <option value="">Choose Union</option>
                                        {availableUnions.map(union => (
                                            <option key={union} value={union}>{union}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Area (Optional)</label>
                                    <select
                                        value={selectedArea}
                                        onChange={handleAreaChange}
                                        disabled={!selectedUnion}
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all bg-white disabled:bg-gray-50 disabled:text-gray-300 text-gray-800 font-semibold text-sm shadow-sm"
                                    >
                                        <option value="">Choose Area</option>
                                        {availableAreas.map(area => (
                                            <option key={area} value={area}>{area}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handleProceed}
                                disabled={!isFormComplete}
                                className={`w-full mt-6 px-6 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg ${isFormComplete
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl active:scale-[0.98]'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <Search className="w-5 h-5" />
                                <span>Find Available Shops</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {showResults && (
                <div id="results-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex-1">
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">Available Shops</h2>
                            <p className="text-gray-600 text-sm sm:text-base font-medium">
                                {userLocation && filteredShops.length > 0 && !selectedThana
                                    ? `Showing shops within 3km of your current location`
                                    : `Showing shops in ${selectedArea || selectedUnion || selectedThana || 'this area'}`}
                            </p>
                        </div>

                        {routeInfo && (
                            <div className="w-full lg:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 sm:gap-6 animate-in slide-in-from-right">
                                <div className="flex flex-col flex-1">
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">Distance</span>
                                    <span className="text-lg sm:text-xl font-black">{routeInfo.distance}</span>
                                </div>
                                <div className="w-px h-10 bg-white/30"></div>
                                <div className="flex flex-col flex-1">
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">ETA</span>
                                    <span className="text-lg sm:text-xl font-black">{routeInfo.duration}</span>
                                </div>
                                <button
                                    onClick={stopNavigation}
                                    className="p-2 hover:bg-white/20 rounded-xl transition-colors active:scale-95"
                                    title="Stop Navigation"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        <div className="flex gap-3 text-sm font-bold">
                            <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg">
                                {filteredShops.length} Shops
                            </div>
                        </div>
                    </div>

                    {/* Map Section */}
                    <div className="mb-8 sm:mb-12 bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="h-[400px] sm:h-[500px] w-full relative">
                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={mapCenter}
                                    zoom={15}
                                    options={{
                                        streetViewControl: false,
                                        mapTypeControl: false,
                                        zoomControl: true,
                                        fullscreenControl: false
                                    }}
                                    onLoad={map => mapRef.current = map}
                                >
                                    {directionsResponse && (
                                        <DirectionsRenderer
                                            options={{
                                                directions: directionsResponse,
                                                suppressMarkers: true,
                                                polylineOptions: {
                                                    strokeColor: '#4f46e5',
                                                    strokeWeight: 6,
                                                    strokeOpacity: 0.8
                                                }
                                            }}
                                        />
                                    )}

                                    {userLocation && userLocation.lat && userLocation.lng && (
                                        <MarkerF
                                            position={{
                                                lat: Number(userLocation.lat),
                                                lng: Number(userLocation.lng)
                                            }}
                                            icon={{
                                                url: "https://i.ibb.co.com/fdYB74jZ/man.png",
                                                scaledSize: { width: 35, height: 35 },
                                                origin: { x: 0, y: 0 },
                                                anchor: { x: 17, y: 34 }
                                            }}
                                            label={{
                                                text: "You",
                                                className: "bg-white px-2 py-0.5 rounded-full shadow-lg text-blue-600 text-[10px] font-black mt-14"
                                            }}
                                        />
                                    )}

                                    {filteredShops.map((shop) => (
                                        shop.mapLocation && shop.mapLocation.lat && shop.mapLocation.lng && (
                                            <MarkerF
                                                key={shop._id}
                                                position={{
                                                    lat: Number(shop.mapLocation.lat),
                                                    lng: Number(shop.mapLocation.lng)
                                                }}
                                                onClick={() => setActiveShop(shop)}
                                                icon={{
                                                    url: 'https://i.ibb.co.com/0VcjY11T/store.png',
                                                    scaledSize: { width: 30, height: 30 },
                                                    origin: { x: 0, y: 0 },
                                                    anchor: { x: 15, y: 15 }
                                                }}
                                                label={{
                                                    text: shop.shopName,
                                                    className: `bg-white/95 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-md transform -translate-y-10 border border-gray-100 ${activeShop?._id === shop._id ? 'scale-110 !bg-indigo-600 !text-white z-10' : ''}`
                                                }}
                                            />
                                        )
                                    ))}

                                    {activeShop && !directionsResponse && (
                                        <InfoWindow
                                            position={activeShop.mapLocation}
                                            onCloseClick={() => setActiveShop(null)}
                                        >
                                            <div className="p-3 max-w-[200px]">
                                                <img src={activeShop.shopImage} alt={activeShop.shopName} className="w-full h-24 object-cover rounded-lg mb-2" />
                                                <h3 className="font-bold text-gray-900 text-sm mb-1">{activeShop.shopName}</h3>
                                                <p className="text-xs text-indigo-600 font-bold mb-2">{activeShop.paymentPercentage}% Cash Benefit</p>
                                                <button
                                                    onClick={() => getDirections(activeShop)}
                                                    className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                                                >
                                                    <Route className="w-3 h-3" /> Start Navigation
                                                </button>
                                            </div>
                                        </InfoWindow>
                                    )}
                                </GoogleMap>
                            ) : (
                                <div className="flex h-full items-center justify-center bg-gray-50">
                                    <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shop Cards Grid */}
                    {filteredShops.length === 0 ? (
                        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <AlertTriangle className="w-32 sm:w-64 h-32 sm:h-64 text-yellow-500" />
                            </div>
                            <Store className="w-16 sm:w-20 h-16 sm:h-20 text-gray-300 mx-auto mb-6" />
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">No shops found here yet!</h3>
                            <p className="text-gray-500 max-w-md mx-auto text-sm sm:text-base">
                                We haven't listed any partner shops in this area yet. Try searching in a different district or thana.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {filteredShops.map((shop) => (
                                <div
                                    key={shop._id}
                                    className={`bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col ${activeShop?._id === shop._id ? 'ring-2 ring-indigo-600 shadow-2xl scale-[1.02]' : ''}`}
                                >
                                    <div className="relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                        <img
                                            src={shop.shopImage}
                                            alt={shop.shopName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md shadow-xl px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl flex flex-col items-center border border-white/50">
                                            <span className="text-lg sm:text-xl font-black text-indigo-600 leading-none">{shop.paymentPercentage}%</span>
                                            <span className="text-[8px] sm:text-[9px] font-black tracking-widest text-indigo-400 uppercase">Cashback</span>
                                        </div>

                                        {userLocation && (
                                            <div className="absolute bottom-3 left-3 bg-gradient-to-r from-indigo-600 to-purple-600 backdrop-blur-md text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg">
                                                <Navigation className="w-3 h-3" />
                                                {(getDistance(userLocation.lat, userLocation.lng, shop.mapLocation.lat, shop.mapLocation.lng)).toFixed(1)} km
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 sm:p-6 flex-1 flex flex-col">
                                        <div className="mb-4">
                                            <h3 className="font-bold text-gray-900 text-lg sm:text-xl group-hover:text-indigo-600 transition-colors mb-1 line-clamp-1">
                                                {shop.shopName}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest line-clamp-1">
                                                    {shop.shopCategory || 'Exclusive Partner'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2.5 sm:space-y-3 mb-6 flex-1">
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center flex-shrink-0">
                                                    <User className="w-4 h-4 text-indigo-600" />
                                                </div>
                                                <span className="font-medium line-clamp-1">{shop.shopOwnerName || 'Verified Partner'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center flex-shrink-0">
                                                    <Phone className="w-4 h-4 text-green-600" />
                                                </div>
                                                <span className="font-medium">{shop.contactNumber}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => {
                                                    setActiveShop(shop);
                                                    setMapCenter(shop.mapLocation);
                                                    document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className="py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-wide hover:bg-gray-100 transition-all border border-gray-200 active:scale-95"
                                            >
                                                View Info
                                            </button>
                                            <button
                                                onClick={() => getDirections(shop)}
                                                className="py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs uppercase tracking-wide hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95"
                                            >
                                                <Route className="w-3.5 h-3.5" /> Navigate
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Receive Modal */}
            {isReceiveModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 text-white text-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                            </div>
                            <button
                                onClick={() => setIsReceiveModalOpen(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors z-10 active:scale-95"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30">
                                    <Download className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black mb-1">Receive Coins</h3>
                                <p className="text-white/80 text-sm font-medium">Scan this QR code to receive coins</p>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 flex flex-col items-center bg-gradient-to-br from-gray-50 to-white">
                            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-lg border-4 border-gray-100 mb-6">
                                {profileUser?.userName && (
                                    <QRCodeSVG
                                        value={profileUser.userName}
                                        size={200}
                                        level="H"
                                        includeMargin={true}
                                        imageSettings={{
                                            height: 40,
                                            width: 40,
                                            excavate: true,
                                        }}
                                    />
                                )}
                            </div>

                            <div className="w-full text-center">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Your Address</p>
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 py-4 rounded-2xl border-2 border-gray-200 flex items-center justify-between gap-3">
                                    <span className="font-mono font-bold text-base sm:text-lg text-indigo-600 truncate">
                                        {profileUser?.userName}
                                    </span>
                                    <button
                                        onClick={handleCopyAddress}
                                        className="p-2.5 hover:bg-indigo-50 rounded-xl text-indigo-600 transition-all flex-shrink-0 active:scale-95 border border-indigo-100"
                                        title="Copy Address"
                                    >
                                        {copied ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <Copy className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {copied && (
                                    <p className="text-xs text-green-600 font-bold mt-2 animate-in fade-in">Copied to clipboard!</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {isTransferModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                            </div>
                            <button
                                onClick={() => {
                                    setIsTransferModalOpen(false);
                                    stopScanner();
                                }}
                                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors z-10 active:scale-95"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/30">
                                    <ArrowRightLeft className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black mb-1">Transfer Coins</h3>
                                <p className="text-white/80 text-sm font-medium">Send coins instantly to anyone</p>
                            </div>
                        </div>

                        <form onSubmit={handleTransfer} className="p-6 space-y-5 bg-gradient-to-br from-gray-50 to-white">
                            {!isScanning ? (
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Receiver Address</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={transferData.receiverUsername}
                                                onChange={(e) => setTransferData({ ...transferData, receiverUsername: e.target.value })}
                                                className="w-full px-4 py-4 pr-14 bg-white border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-semibold text-gray-800 placeholder:text-gray-400"
                                                placeholder="Enter username"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={startScanner}
                                                className="absolute right-2 top-2 p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg active:scale-95"
                                                title="Scan QR Code"
                                            >
                                                <Camera className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Amount</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={transferData.amount}
                                                onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                                                className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-semibold text-gray-800 placeholder:text-gray-400"
                                                placeholder="0"
                                                required
                                                min="1"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                                <Coins className="w-4 h-4 text-yellow-500" />
                                                <span className="font-bold text-gray-500 text-sm">Coins</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between px-1">
                                            <p className="text-xs text-gray-500 font-medium">
                                                Available: <span className="font-bold text-indigo-600">{profileUser?.wallet?.coins || 0}</span> Coins
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                ≈ ৳{((profileUser?.wallet?.coins || 0) / 100).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl font-black text-base shadow-xl shadow-indigo-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        <ArrowRightLeft className="w-5 h-5" />
                                        Send Coins Now
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-center mb-4">
                                        <p className="text-sm font-bold text-gray-700 mb-1">Scanning Live...</p>
                                        <p className="text-xs text-gray-500">Center the QR code in the frame</p>
                                    </div>
                                    <div className="relative">
                                        <div id="reader" className="overflow-hidden rounded-2xl border-4 border-indigo-600 shadow-xl bg-black aspect-square"></div>
                                        <div className="absolute inset-0 border-2 border-white/20 rounded-2xl pointer-events-none"></div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={stopScanner}
                                        className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <X className="w-5 h-5" />
                                        Cancel Scanning
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {isHistoryModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
                    <div className="bg-white/95 backdrop-blur-2xl w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                                    <History className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Transaction History</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Wallet Activity</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsHistoryModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-90"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {isFetchingHistory ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                                    <div className="relative">
                                        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                                        <div className="absolute inset-0 h-10 w-10 bg-indigo-100 blur-xl opacity-50 animate-pulse"></div>
                                    </div>
                                    <p className="text-gray-500 font-bold text-sm">Fetching your records...</p>
                                </div>
                            ) : historyData.length > 0 ? (
                                historyData.map((tx, index) => {
                                    const isSent = tx.senderUsername === profileUser?.username;
                                    return (
                                        <div
                                            key={tx._id}
                                            className="group relative bg-white border border-gray-100 p-4 rounded-3xl hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-3 rounded-2xl ${isSent ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                        <ArrowRightLeft className={`w-5 h-5 ${isSent ? 'rotate-45' : '-rotate-45'}`} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 text-sm">
                                                            {isSent ? `To: ${tx.receiverUsername}` : `From: ${tx.senderUsername}`}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                                            {
                                                                tx.date
                                                            }
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                                            {
                                                                tx.time
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-base font-black tracking-tight ${isSent ? 'text-red-600' : 'text-green-600'}`}>
                                                        {isSent ? '-' : '+'}{tx.amount}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-bold italic">Coins</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                                        <History className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-gray-900 font-black text-lg">No history yet</p>
                                    <p className="text-gray-500 text-sm mt-1 max-w-[200px] mx-auto">Your transfer records will appear here.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-gray-50/50 border-t border-gray-100 text-center">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">End of transaction history</p>
                        </div>
                    </div>
                </div>
            )}

            <DownNav />
        </div>
    );
};

export default WallateShop;