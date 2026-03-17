import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, X, Check, Navigation, Target, Loader2 } from 'lucide-react';

// Fix for leaflet default icon issue in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to handle map flies/zooms and rendering fixes
const MapHandler = ({ center, isOpen }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { duration: 1.5 });
    }
  }, [center, map]);

  // CRITICAL: Leaflet needs to re-calculate its size when inside a modal/hidden container
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }
  }, [isOpen, map]);

  return null;
};

const LocationPickerModal = ({ isOpen, onClose, onSelect, currentCity }) => {
  const [selectedCity, setSelectedCity] = useState(currentCity);
  const [position, setPosition] = useState([11.0168, 76.9558]); // Default to Coimbatore
  const [loading, setLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Notable cities for easy selection
  const MAJOR_CITIES = [
    { name: "Coimbatore", lat: 11.0168, lng: 76.9558 },
    { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
    { name: "Chennai", lat: 13.0827, lng: 80.2707 },
    { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
    { name: "Delhi", lat: 28.6139, lng: 77.2090 },
    { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
    { name: "Pune", lat: 18.5204, lng: 73.8567 },
    { name: "Kolkata", lat: 22.5726, lng: 88.3639 }
  ];

  // 1. LOCK BODY SCROLL WHEN MODAL IS OPEN
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 2. REVERSE GEOCODING (COORD -> CITY)
  const reverseGeocode = async (lat, lng) => {
    setIsGeocoding(true);
    try {
      // Using OpenWeatherMap Reverse Geocoding API
      // Note: We use the same key pattern as backend if possible or a placeholder
      const API_KEY = "7dbf5d0705f15951d8d21226ee6cddcf"; // Sample Key
      const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${API_KEY}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setSelectedCity(data[0].name);
        }
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // 3. DETECT MY LOCATION (GPS)
  const handleDetectLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = [latitude, longitude];
        setPosition(newPos);
        reverseGeocode(latitude, longitude);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        alert("Unable to retrieve your location. Make sure GPS is enabled.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      },
    });

    return position === null ? null : (
      <Marker position={position}></Marker>
    );
  };

  const handleConfirm = () => {
    onSelect(selectedCity);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0B0F19] w-full max-w-3xl rounded-[2.5rem] shadow-2xl shadow-emerald-500/10 flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800 overflow-y-auto custom-scrollbar">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white dark:from-[#0B0F19] dark:to-[#111827]">
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase dark:text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                 <MapPin className="text-emerald-500" size={24} />
              </div>
              Set Your Area
            </h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2 opacity-70">Parametric insurance requires accurate city-level weather data</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-all active:scale-95">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative min-h-[450px] bg-slate-100 dark:bg-slate-800">
          <MapContainer 
            center={position} 
            zoom={13} 
            style={{ height: '100%', width: '100%', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker />
            <MapHandler center={position} isOpen={isOpen} />
          </MapContainer>
          
          {/* Controls Floating */}
          <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3 w-56">
             <button 
               onClick={handleDetectLocation}
               disabled={loading}
               className="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-2xl shadow-xl shadow-emerald-500/20 font-black uppercase italic tracking-tighter text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
             >
               {loading ? <Loader2 className="animate-spin" size={16} /> : <Navigation size={16} />}
               Detect My Location
             </button>

             <div className="bg-white/95 dark:bg-[#0B0F19]/95 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden backdrop-blur-md">
                <p className="text-[9px] font-black uppercase text-slate-400 px-4 py-3 border-b border-slate-100 dark:border-slate-800 tracking-[0.2em]">Quick Selection</p>
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                  {MAJOR_CITIES.map((c) => (
                    <button 
                      key={c.name}
                      onClick={() => { setPosition([c.lat, c.lng]); setSelectedCity(c.name); }}
                      className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-emerald-500/10 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 ${selectedCity === c.name ? 'text-emerald-500 bg-emerald-500/5' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
             </div>
          </div>
        </div>

        <div className="p-8 bg-white dark:bg-[#0B0F19] border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-6">
            <div className="flex-1 relative">
              <label className="text-[10px] font-black uppercase text-slate-500 block mb-2 tracking-widest">Selected Service City</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={selectedCity} 
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-[13px] font-black dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all uppercase placeholder:text-slate-400"
                  placeholder="Fetching city details..."
                />
                {isGeocoding && (
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                      <Loader2 size={16} className="animate-spin" />
                   </div>
                )}
              </div>
            </div>
            <button 
              onClick={handleConfirm}
              disabled={!selectedCity || isGeocoding}
              className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase italic tracking-tighter rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50 hover:-translate-y-1"
            >
              <Check size={20} />
              Confirm Choice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
