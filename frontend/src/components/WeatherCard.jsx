import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Cloud, AlertTriangle, CheckCircle, Wallet, MapPin } from 'lucide-react';
import LocationPickerModal from './LocationPickerModal';
import { BASE_URL } from "../api/config";

const WeatherCard = ({ city, userEmail, onClaimSuccess, onCityChange }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const fetchWeather = async (targetCity = city) => {
    try {
      setLoading(true);
      const cityName = typeof targetCity === 'object' ? (targetCity.name || targetCity.city || "Unknown") : (targetCity || "Unknown");
      const res = await fetch(`${BASE_URL}/weather/current?city=${encodeURIComponent(cityName)}`);
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data = await res.json();
      setWeatherData(data);
      setError(null);
    } catch (err) {
      setError("Unable to load weather data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (city) {
      fetchWeather();
      // Refresh every 5 minutes
      const interval = setInterval(fetchWeather, 300000);
      return () => clearInterval(interval);
    }
  }, [city]);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await fetch(`${BASE_URL}/weather/weather-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, city: city })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        if (onClaimSuccess) onClaimSuccess(data.payout);
        fetchWeather(); // Refresh to check daily claim status implicitly or update state
      } else {
        alert(data.detail || "Claim failed");
      }
    } catch (err) {
      alert("Error processing claim");
      console.error(err);
    } finally {
      setClaiming(false);
    }
  };

  const handleSelectCity = async (newCity) => {
    try {
      const res = await fetch(`${BASE_URL}/workers/update-city`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_email: userEmail, new_city: newCity })
      });
      if (res.ok) {
        if (onCityChange) onCityChange(newCity);
        fetchWeather(newCity);
      } else {
        alert("Failed to update city on server");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating location");
    }
  };

  const displayCity = typeof city === 'object' ? (city.name || city.city || "Unknown") : (city || "Unknown");

  if (loading && !weatherData) return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm animate-pulse">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
    </div>
  );

  if (error || !weatherData) return (
    <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-800 rounded-3xl p-6 text-rose-600 dark:text-rose-400">
      <p>{error || "Weather data unavailable"}</p>
      <button onClick={() => fetchWeather()} className="text-sm font-bold underline mt-2">Try Again</button>
    </div>
  );

  const isRainy = weatherData.weather === 'Rain' || weatherData.rain_level > 0;
  const isHighRisk = weatherData.safety_risk_score > 70;
  
  return (
    <div className={`bg-white dark:bg-[#111827] border ${isHighRisk ? 'border-orange-500/50' : isRainy ? 'border-blue-500/50' : 'border-emerald-500/30'} dark:border-slate-800 rounded-3xl p-6 shadow-lg transition-all overflow-hidden relative group`}>
      {/* Background Glow */}
      <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl opacity-20 ${isHighRisk ? 'bg-orange-500' : isRainy ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Service City</h3>
            <button 
              onClick={() => setIsMapOpen(true)}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white rounded-lg text-slate-500 transition-all font-black uppercase text-[9px] tracking-widest flex items-center gap-2 border border-slate-200 dark:border-slate-700"
            >
              <MapPin size={10} />
              {displayCity} (Change)
            </button>
          </div>
          
          <button 
            onClick={() => setIsMapOpen(true)}
            className="flex items-center gap-4 group/weather hover:translate-x-1 transition-transform cursor-pointer"
          >
            <div className={`p-3 rounded-2xl ${isHighRisk ? 'bg-orange-500/10 text-orange-500' : isRainy ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'} group-hover/weather:scale-110 transition-transform`}>
              {isRainy ? <CloudRain size={32} /> : 
               weatherData.weather === 'Clear' ? <Sun size={32} /> : 
               <Cloud size={32} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black italic tracking-tighter uppercase dark:text-white">
                  {weatherData.weather}
                </span>
                <span className="text-xs font-bold text-slate-400 group-hover/weather:text-emerald-500 transition-colors">Change location</span>
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">{weatherData.temperature}°C In {displayCity}</p>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
          <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Wind Speed</p>
          <p className="text-sm font-black italic text-slate-700 dark:text-slate-300">{weatherData.wind_speed} km/h</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
          <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Humidity</p>
          <p className="text-sm font-black italic text-slate-700 dark:text-slate-300">{weatherData.humidity}%</p>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6 relative z-10">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Environmental Risk</p>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isHighRisk ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'}`}>
             {weatherData.safety_risk_score}/100
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
           <div 
             className={`h-full transition-all duration-1000 ${isHighRisk ? 'bg-orange-500' : 'bg-emerald-500'}`}
             style={{ width: `${weatherData.safety_risk_score}%` }}
           ></div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          {weatherData.eligible_for_claim ? 
            <AlertTriangle size={14} className="text-orange-500" /> : 
            <CheckCircle size={14} className="text-emerald-500" />}
          <p className={`text-[11px] font-black uppercase tracking-tight ${weatherData.eligible_for_claim ? 'text-orange-500' : 'text-emerald-500'}`}>
            {weatherData.eligible_for_claim ? 'Hazard Detected: Claim Eligible' : 'Conditions Optimal for Delivery'}
          </p>
        </div>
      </div>

      <div className="relative z-10">
        {weatherData.eligible_for_claim ? (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-black uppercase italic tracking-tighter rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
          >
            {claiming ? 'Processing...' : (
              <>
                <Wallet size={18} />
                Claim ₹{weatherData.payout} Now
              </>
            )}
          </button>
        ) : (
          <div className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 font-bold uppercase italic tracking-tighter text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            No claim available
          </div>
        )}
      </div>

      <LocationPickerModal 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
        currentCity={displayCity}
        onSelect={handleSelectCity}
      />
    </div>
  );
};

export default WeatherCard;
