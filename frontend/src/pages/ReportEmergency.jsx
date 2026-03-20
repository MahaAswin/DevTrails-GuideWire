import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Send, CheckCircle2, Upload, FileText, File, Image as ImageIcon, AlertCircle, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

// Helper to center map and fix size issues
const MapRefresher = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
      // Ensure the map fills the container correctly
      setTimeout(() => {
        map.invalidateSize();
      }, 500);
    }
  }, [center, map]);
  return null;
};

const ReportEmergency = () => {
  const [status, setStatus] = useState('idle'); // idle, submitting, success
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    location: '',
    landmark: '',
    problem_type: '',
    description: ''
  });
  const [position, setPosition] = useState([12.9716, 77.5946]); // Bangalore
  const [mapLoading, setMapLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('shieldgig_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      // Try to geocode user's city if possible or use default
    }
  }, []);

  const detectLocation = () => {
    setMapLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setMapLoading(false);
      }, () => setMapLoading(false));
    } else {
      setMapLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location || !formData.problem_type) {
      alert("Please select a location and problem type.");
      return;
    }

    setStatus('submitting');
    
    const data = new FormData();
    data.append('worker_email', user.email);
    data.append('report_type', formData.problem_type);
    data.append('description', formData.description);
    data.append('location', formData.location);
    data.append('landmark', formData.landmark);
    files.forEach(file => {
      data.append('files', file);
    });

    try {
      const res = await fetch('http://localhost:8000/claims-evidence/submit', {
        method: 'POST',
        body: data
      });
      
      if (!res.ok) throw new Error('Failed to submit report');
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('idle');
      alert('Failed to submit. Please check your connection.');
    }
  };

  if (!user) return <div className="p-12 text-center animate-pulse font-medium">Authenticating Report Portal...</div>;

  const platformColor = user.platform.toLowerCase() === 'zomato' ? 'rose' : 
                        user.platform.toLowerCase() === 'swiggy' ? 'amber' :
                        user.platform.toLowerCase() === 'zepto' ? 'emerald' :
                        user.platform.toLowerCase() === 'amazon' ? 'blue' : 'emerald';

  if (status === 'success') {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 text-center px-4">
        <div className="w-24 h-24 bg-[#FF6B00] rounded-full flex items-center justify-center mb-6 shadow-xl shadow-orange-500/25">
          <CheckCircle2 size={48} className="text-white" />
        </div>
        <h2 className="text-4xl font-black tracking-tighter text-slate-50 mb-4 uppercase">Report & Evidence Logged.</h2>
        <p className="text-slate-400 text-lg max-w-md">Our AI system will verify your report via live data channels and physical evidence to process your claim payout.</p>
        <button 
          onClick={() => { setStatus('idle'); setFormData({location: '', landmark: '', problem_type: '', description: ''}); setFiles([]); }}
          className="mt-8 text-slate-300 font-semibold hover:text-slate-50"
        >
          Submit another report
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 pb-20">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Incident<br/>Report Center</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">File an emergency report or submit evidence for insurance compensation.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Essential Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-10 shadow-sm relative overflow-hidden flex flex-col gap-8">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <AlertTriangle size={150} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Worker Profile</label>
                <div className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-slate-600 font-bold">
                  {user.name} ({user.platform})
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Incident Category</label>
                <select 
                  required 
                  value={formData.problem_type}
                  onChange={e => setFormData({...formData, problem_type: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 outline-none focus:border-[#FF6B00] transition-all font-bold"
                >
                  <option value="">Select type...</option>
                  {['Severe Weather', 'Vehicle Repair', 'Medical Emergency', 'Road Block', 'Police Curfew', 'Platform Outage', 'Accident', 'Other'].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-6 relative z-10 w-full mt-2">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1"><MapPin size={12}/> Primary Zone</label>
                    <select 
                      required 
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 outline-none focus:border-[#FF6B00] transition-all font-bold"
                    >
                      <option value="">Select zone...</option>
                      <option value="Koramangala, Bangalore">Koramangala, Bangalore</option>
                      <option value="Indiranagar, Bangalore">Indiranagar, Bangalore</option>
                      <option value="HSR Layout, Bangalore">HSR Layout, Bangalore</option>
                      <option value="Andheri West, Mumbai">Andheri West, Mumbai</option>
                      <option value="Bandra, Mumbai">Bandra, Mumbai</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Exact Landmark</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Near HSR BDA Complex"
                      value={formData.landmark}
                      onChange={e => setFormData({...formData, landmark: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 outline-none focus:border-[#FF6B00] transition-all font-bold"
                    />
                  </div>
               </div>

               <div className="h-64 bg-slate-200 dark:bg-[#0B0F19] rounded-3xl overflow-hidden relative border-2 border-slate-100 dark:border-slate-800 group">
                  <div className="relative h-full w-full">
                    <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={position} />
                      <MapRefresher center={position} />
                    </MapContainer>
                  </div>
                  
                  <div className="absolute top-4 right-4 z-[1000]">
                    <button 
                      type="button"
                      onClick={detectLocation}
                      className="p-3 bg-white dark:bg-[#111827] text-emerald-500 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 hover:scale-110 transition-transform active:scale-95"
                    >
                      {mapLoading ? <div className="animate-spin">◌</div> : <Navigation size={20} />}
                    </button>
                  </div>

                  <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none">
                      <div className="bg-white/90 dark:bg-[#111827]/90 p-2 px-3 rounded-lg shadow-2xl flex items-center gap-2 border border-slate-100 dark:border-slate-800 backdrop-blur-sm">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                         <MapPin className="text-emerald-500" size={14} />
                         <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live GPS Verified</span>
                      </div>
                  </div>
               </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Detailed Description</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Explain exactly what happened..."
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 outline-none focus:border-[#FF6B00] transition-all font-medium"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Evidence & Submit */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <h3 className="font-bold flex items-center justify-between">
              <span className="flex items-center gap-2 italic uppercase tracking-tighter"><Upload size={20} className="text-[#FF6B00]"/> Physical Evidence</span>
              <span className="text-[10px] font-black bg-slate-100 dark:bg-[#111827] px-2 py-0.5 rounded text-[#FF6B00] uppercase">{files.length} Files</span>
            </h3>

            <div 
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-800/30 hover:border-[#FF6B00]/50 transition-all cursor-pointer relative group"
            >
              <input 
                type="file" 
                multiple 
                accept="image/*,.pdf" 
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                  <Upload size={24} className="text-slate-400" />
                </div>
                <p className="font-bold text-slate-600 dark:text-slate-300">Upload documents</p>
                <p className="text-[10px] text-slate-500">Required for non-parametric claims (bills, photos, receipts)</p>
              </div>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 group">
                  <div className="flex items-center gap-2 truncate">
                    {file.type.includes('image') ? <ImageIcon size={14} className="text-[#FF6B00]"/> : <File size={14} className="text-slate-400"/>}
                    <span className="text-[11px] font-bold truncate max-w-[150px]">{file.name}</span>
                  </div>
                  <button type="button" onClick={() => removeFile(i)} className="text-slate-400 hover:text-rose-500">&times;</button>
                </div>
              ))}
            </div>

            <button 
              type="submit" 
              disabled={status === 'submitting'}
              className={`w-full bg-[#FF6B00] hover:bg-[#FF8C42] text-white font-black uppercase italic tracking-widest py-4 rounded-2xl shadow-xl shadow-orange-500/25 transition-all active:scale-95 flex justify-center items-center gap-3 disabled:opacity-50`}
            >
              {status === 'submitting' ? 'Submitting...' : <><Send size={20}/> Submit Incident</>}
            </button>
          </div>

          <div className="bg-[#111827] p-6 rounded-3xl border border-[#1F2937] flex gap-4">
             <AlertCircle className="text-slate-400 shrink-0" size={24} />
             <div className="text-sm">
                <p className="font-bold text-slate-200 uppercase tracking-tight">Verified Coverage</p>
                <p className="text-slate-400 mt-1 leading-relaxed">Parametric triggers like 'Severe Weather' are verified automatically. Manual evidence helps speed up complex claims.</p>
             </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReportEmergency;
