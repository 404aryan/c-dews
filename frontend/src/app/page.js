'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Leaf, UploadCloud, Heart, Shield, CheckCircle, Droplets, MapPin, TrendingUp, Users, Award, Globe, ChevronRight, Menu, X, TestTube2, Calculator, LogOut, Send } from 'lucide-react';

// --- Reusable Components (Keep all your existing components like SectionTitle, CropCard, etc.) ---
const SectionTitle = ({ children }) => (
  <h2 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent mb-12">
    {children}
  </h2>
);

const CropCard = ({ name, imageUrl, description }) => (
  <div className="group bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-3 transition-all duration-500 hover:shadow-2xl border border-gray-100">
    <div className="relative overflow-hidden">
      <img src={imageUrl} alt={name} className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"/>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
    <div className="p-5">
      <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">{name}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  </div>
);

const AdviceSection = ({ title, steps, icon }) => (
  <div className="mb-8 bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border-l-4 border-emerald-500 shadow-sm">
    <h4 className="flex items-center text-xl font-bold text-gray-800 mb-4">
      {icon}
      {title}
    </h4>
    <ul className="space-y-3 text-gray-700 leading-relaxed">
      {steps.map((step, index) => (
        <li key={index} className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          </div>
          <span dangerouslySetInnerHTML={{ __html: step }} className="flex-1"></span>
        </li>
      ))}
    </ul>
  </div>
);

const StatCard = ({ icon, number, label, gradient }) => (
  <div className={`p-6 rounded-xl text-white ${gradient} transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}>
    <div className="flex items-center justify-between">
      <div>
        <div className="text-2xl font-bold mb-1">{number}</div>
        <div className="text-sm opacity-90">{label}</div>
      </div>
      <div className="text-3xl opacity-80">{icon}</div>
    </div>
  </div>
);

const CropPlanner = () => {
  const [plannerData, setPlannerData] = useState({ landSize: '', cropType: '', soilType: 'loamy', climate: 'temperate' });
  const [planResult, setPlanResult] = useState(null);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const cropOptions = [ { value: 'tomato', label: 'Tomato', season: 'Kharif/Rabi' }, { value: 'potato', label: 'Potato', season: 'Rabi' }, { value: 'wheat', label: 'Wheat', season: 'Rabi' }, { value: 'rice', label: 'Rice', season: 'Kharif' } ];
  const cropRequirements = { tomato: { waterPerAcre: '2000-2500 liters/day', fertilizer: { nitrogen: '120-150 kg/acre', phosphorus: '60-80 kg/acre', potassium: '80-100 kg/acre' }, chemicals: ['Copper Oxychloride for blight', 'Neem oil for pests'], expectedYield: '15-20 tons/acre', investment: '₹80,000-1,20,000', profit: '₹1,50,000-2,50,000' }, potato: { waterPerAcre: '1800-2200 liters/day', fertilizer: { nitrogen: '100-120 kg/acre', phosphorus: '50-70 kg/acre', potassium: '60-80 kg/acre' }, chemicals: ['Mancozeb for blight', 'Imidacloprid for insects'], expectedYield: '12-18 tons/acre', investment: '₹60,000-90,000', profit: '₹1,20,000-2,00,000' }, wheat: { waterPerAcre: '1500-2000 liters/day', fertilizer: { nitrogen: '80-100 kg/acre', phosphorus: '40-60 kg/acre', potassium: '20-40 kg/acre' }, chemicals: ['2,4-D for weeds', 'Propiconazole for rust'], expectedYield: '25-35 quintals/acre', investment: '₹40,000-60,000', profit: '₹80,000-1,20,000' }, rice: { waterPerAcre: '3000-4000 liters/day', fertilizer: { nitrogen: '100-120 kg/acre', phosphorus: '50-60 kg/acre', potassium: '40-60 kg/acre' }, chemicals: ['Butachlor for weeds', 'Carbendazim for blast'], expectedYield: '20-30 quintals/acre', investment: '₹50,000-70,000', profit: '₹90,000-1,40,000' } };

  const calculatePlan = () => {
    if (!plannerData.landSize || !plannerData.cropType) { alert('Please fill in all required fields'); return; }
    setPlannerLoading(true);
    setTimeout(() => {
      const crop = cropRequirements[plannerData.cropType] || cropRequirements.tomato;
      const multiplier = parseFloat(plannerData.landSize);
      setPlanResult({ crop: plannerData.cropType, landSize: plannerData.landSize, waterNeeded: crop.waterPerAcre, totalWater: `${(multiplier * 2000).toLocaleString()}-${(multiplier * 2500).toLocaleString()} liters/day`, fertilizer: crop.fertilizer, chemicals: crop.chemicals, expectedYield: crop.expectedYield, totalInvestment: crop.investment, expectedProfit: crop.profit, recommendations: [ 'Start soil preparation 15-20 days before planting', 'Ensure proper drainage system', 'Use certified seeds from authorized dealers', 'Follow integrated pest management practices', 'Monitor weather conditions regularly' ] });
      setPlannerLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <div className="flex items-center gap-3 mb-6"><div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white"><Calculator size={24} /></div><h3 className="text-2xl font-bold text-gray-800">Crop Planning Calculator</h3></div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div><label className="block text-sm font-semibold text-gray-700 mb-2">Land Size (in acres) *</label><input type="number" placeholder="e.g., 5" value={plannerData.landSize} onChange={(e) => setPlannerData({...plannerData, landSize: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"/></div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-2">Crop Type *</label><select value={plannerData.cropType} onChange={(e) => setPlannerData({...plannerData, cropType: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"><option value="">Select a crop</option>{cropOptions.map(crop => (<option key={crop.value} value={crop.value}>{crop.label} ({crop.season})</option>))}</select></div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-2">Soil Type</label><select value={plannerData.soilType} onChange={(e) => setPlannerData({...plannerData, soilType: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"><option value="loamy">Loamy Soil</option><option value="clay">Clay Soil</option><option value="sandy">Sandy Soil</option><option value="black">Black Soil</option></select></div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-2">Climate Zone</label><select value={plannerData.climate} onChange={(e) => setPlannerData({...plannerData, climate: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"><option value="temperate">Temperate</option><option value="tropical">Tropical</option><option value="arid">Arid</option><option value="semi-arid">Semi-Arid</option></select></div>
      </div>
      <button onClick={calculatePlan} disabled={plannerLoading} className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">{plannerLoading ? 'Calculating...' : 'Generate Crop Plan'}</button>
      {planResult && (<div className="mt-8 space-y-6"> <div className="grid md:grid-cols-3 gap-4"><StatCard icon={<Droplets />} number={planResult.totalWater} label="Daily Water Need" gradient="bg-gradient-to-r from-blue-500 to-cyan-500"/> <StatCard icon={<TrendingUp />} number={planResult.expectedYield} label="Expected Yield" gradient="bg-gradient-to-r from-green-500 to-emerald-500"/> <StatCard icon={<Award />} number={planResult.expectedProfit} label="Expected Profit" gradient="bg-gradient-to-r from-purple-500 to-pink-500"/></div><div className="grid md:grid-cols-2 gap-6"><div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200"><h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2"><TestTube2 size={20} />Fertilizer Requirements</h4><div className="space-y-2 text-green-700"><p><strong>Nitrogen (N):</strong> {planResult.fertilizer.nitrogen}</p><p><strong>Phosphorus (P):</strong> {planResult.fertilizer.phosphorus}</p><p><strong>Potassium (K):</strong> {planResult.fertilizer.potassium}</p></div></div><div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200"><h4 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2"><Shield size={20} />Chemical Requirements</h4><div className="space-y-2 text-orange-700">{planResult.chemicals.map((chemical, index) => (<p key={index}>• {chemical}</p>))}</div></div></div><div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200"><h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2"><CheckCircle size={20} />Expert Recommendations</h4><div className="grid md:grid-cols-2 gap-4">{planResult.recommendations.map((rec, index) => (<div key={index} className="flex items-start gap-3 text-blue-700"><ChevronRight size={16} className="text-blue-500 mt-0.5 flex-shrink-0" /><span>{rec}</span></div>))}</div></div></div>)}
    </div>
  );
};

// --- Main Page Component ---
export default function Home() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('diagnose');

  useEffect(() => {
    // Check if a token exists in localStorage to determine login status
    const token = localStorage.getItem('userToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);
  
  const handleLogout = () => { 
    localStorage.removeItem('userToken'); 
    setIsLoggedIn(false); 
    // No need to reload, the UI will update automatically
  };

  const supportedCrops = [
    { name: 'Tomato', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400', description: 'Frequently affected by blights and mosaic virus.' },
    { name: 'Potato', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', description: 'Susceptible to early and late blight diseases.' },
    { name: 'Strawberry', imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400', description: 'Commonly suffers from leaf scorch and grey mold.' },
    { name: 'Wheat', imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', description: 'Vulnerable to rust, downy mildew, and septoria.' },
    { name: 'Mango', imageUrl: 'https://images.unsplash.com/photo-1605027990121-cbae9ff2d5d4?w=400', description: 'Often sees bacterial spots and powdery mildew.' }
  ];

  const handleFileChange = (file) => { if (file && file.type.startsWith('image/')) { setImage(file); setPreview(URL.createObjectURL(file)); setResult(null); setError(''); } };
  const handleDragEvents = (e, dragOver) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(dragOver); };
  const handleDrop = (e) => { handleDragEvents(e, false); if (e.dataTransfer.files && e.dataTransfer.files[0]) { handleFileChange(e.dataTransfer.files[0]); } };
  const handleSubmit = async () => {
    if (!image) { setError('Please select an image first.'); return; }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      setLoading(true); setResult(null); setError('');
      const formData = new FormData();
      formData.append('file', image);
      try {
        const response = await axios.post('http://127.0.0.1:8000/predict', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setResult(response.data);
      } catch (err) {
        setError('Failed to get a prediction. Is the backend server running?');
      } finally {
        setLoading(false);
      }
    }, () => { setError('GPS permission is required to submit a report.'); });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 font-sans">
      <header className="w-full bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-lg border-b border-gray-200">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <a href="/" className="flex items-center space-x-3 cursor-pointer group">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">CDEWS</span>
            </a>
            
            <div className="hidden lg:flex items-center space-x-8">
              <div className="flex items-center space-x-6 font-medium">
                <a href="/forum" className="text-gray-600 hover:text-emerald-600 transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-emerald-50">Community Forum</a>
                <a href="/map" className="text-gray-600 hover:text-emerald-600 transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-emerald-50">Outbreak Map</a>
                <a href="#about" className="text-gray-600 hover:text-emerald-600 transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-emerald-50">About</a>
                <a href="#crops" className="text-gray-600 hover:text-emerald-600 transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-emerald-50">Crops</a>
                <a href="#contact" className="text-gray-600 hover:text-emerald-600 transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-emerald-50">Contact</a>
              </div>
              {isLoggedIn ? (
                <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 text-red-600 font-semibold rounded-full hover:bg-red-50 transition-all duration-300 transform hover:scale-105">
                  <LogOut size={18} />Logout
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <a href="/login" className="px-6 py-3 text-emerald-600 font-semibold rounded-full hover:bg-emerald-50 transition-all duration-300 transform hover:scale-105">Login</a>
                  <a href="/signup" className="px-6 py-3 text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-full hover:from-emerald-700 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">Sign Up</a>
                </div>
              )}
            </div>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200">
              <div className="flex flex-col space-y-2 pt-4">
                <a href="/forum" className="px-4 py-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">Community Forum</a>
                <a href="/map" className="px-4 py-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">Outbreak Map</a>
                <a href="#about" className="px-4 py-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">About</a>
                <a href="#crops" className="px-4 py-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">Crops</a>
                <a href="#contact" className="px-4 py-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">Contact</a>
                <div className="pt-4 border-t border-gray-200 flex flex-col space-y-2">
                  {isLoggedIn ? (
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-lg transition-colors">
                      <LogOut size={18} />Logout
                    </button>
                  ) : (
                    <>
                      <a href="/login" className="px-4 py-2 text-emerald-600 font-semibold hover:bg-emerald-50 rounded-lg transition-colors">Login</a>
                      <a href="/signup" className="px-4 py-2 text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg font-semibold transition-colors">Sign Up</a>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>
      
      <main className="flex-grow">
        <section className="relative text-center py-32 md:py-48 text-white overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=2787&auto=format&fit=crop')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
          <div className="relative container mx-auto px-6 z-10">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-2xl mb-6 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">Detect Crop Diseases<span className="block text-4xl md:text-6xl text-emerald-300">in Seconds</span></h1>
              <p className="mt-6 text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto drop-shadow-lg leading-relaxed">Snap a photo of a leaf — our AI identifies plant diseases, provides confidence scores, and offers expert farming advice to protect your harvest.</p>
              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button onClick={() => document.getElementById('tools-section').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-full hover:from-emerald-700 hover:to-green-700 transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25 flex items-center gap-2"><TestTube2 size={20} />Start Diagnosis</button>
                <button onClick={() => { setActiveTab('planner'); document.getElementById('tools-section').scrollIntoView({ behavior: 'smooth' }); }} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full hover:from-blue-700 hover:to-purple-700 transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 flex items-center gap-2"><Calculator size={20} />Plan Your Crop</button>
              </div>
            </div>
          </div>
        </section>
        
        <section id="tools-section" className="py-20 bg-gray-50 relative">
          <div className="container mx-auto px-6">
            <div className="max-w-md mx-auto mb-12"><div className="bg-white p-2 rounded-xl shadow-lg border border-gray-200"><div className="grid grid-cols-2 gap-2"><button onClick={() => setActiveTab('diagnose')} className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'diagnose' ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'}`}><TestTube2 size={18} />Disease Detection</button><button onClick={() => setActiveTab('planner')} className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'planner' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'}`}><Calculator size={18} />Crop Planner</button></div></div></div>
            {activeTab === 'diagnose' && (
              <div className="w-full max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center mb-8"><div className="inline-flex items-center gap-3 mb-4"><div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg text-white"><TestTube2 size={24} /></div><h2 className="text-2xl font-bold text-gray-700">AI Disease Detection</h2></div><p className="text-gray-600">Upload a clear image of your plant leaf for instant disease diagnosis</p></div>
                <div className={`p-8 border-2 border-dashed rounded-xl text-center transition-all duration-300 ${isDragOver ? 'border-emerald-500 bg-emerald-50 scale-105' : 'border-gray-300 hover:border-emerald-400'}`} onDragOver={(e) => handleDragEvents(e, true)} onDragLeave={(e) => handleDragEvents(e, false)} onDrop={handleDrop}>
                  <div className="mb-6"><UploadCloud className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${isDragOver ? 'text-emerald-500' : 'text-gray-400'}`}/></div>
                  <input type="file" id="file-upload" accept="image/*" onChange={(e) => handleFileChange(e.target.files[0])} className="hidden" />
                  <label htmlFor="file-upload" className="cursor-pointer inline-block px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105">{preview ? 'Change Image' : 'Choose an Image'}</label>
                  <p className="text-sm text-gray-500 mt-3">or drag and drop your image here</p>
                  {preview && (<div className="mt-6 inline-block"><div className="relative bg-gradient-to-r from-gray-100 to-gray-50 p-4 rounded-xl shadow-inner"><img src={preview} alt="Image Preview" className="w-auto h-48 mx-auto rounded-lg shadow-lg" /><div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full"><CheckCircle size={16} /></div></div></div>)}
                </div>
                <button onClick={handleSubmit} disabled={loading || !image} className="w-full mt-8 py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 transform bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl">{loading ? (<div className="flex items-center justify-center gap-3"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Analyzing Plant...</div>) : (<div className="flex items-center justify-center gap-2"><TestTube2 size={20} />Diagnose Plant Disease</div>)}</button>
                {error && (<div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg"><p className="text-red-700 font-semibold flex items-center gap-2"><X size={16} />{error}</p></div>)}
                {result && result.details && (<div className="mt-8 border-t-2 border-gray-100 pt-8"><div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-r-xl mb-8 shadow-sm"><div className="flex items-start justify-between mb-4"><div><h3 className="text-2xl font-bold text-gray-800 mb-2">{result.details.title}</h3><div className="flex items-center gap-4"><div className="flex items-center gap-2"><span className="font-semibold text-gray-700">Confidence:</span><div className="flex items-center gap-2"><div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000" style={{ width: `${result.confidence * 100}%` }}></div></div><span className="text-blue-800 font-bold">{(result.confidence * 100).toFixed(1)}%</span></div></div></div></div><div className="p-3 bg-blue-100 rounded-full"><CheckCircle className="text-blue-600" size={24} /></div></div><p className="text-gray-700 leading-relaxed">{result.details.overview}</p></div><div className="grid md:grid-cols-2 gap-8"><AdviceSection title={result.details.prevention.title} steps={result.details.prevention.steps} icon={<Shield size={22} className="mr-3 text-green-600"/>}/><AdviceSection title={result.details.cure.title} steps={result.details.cure.steps} icon={<CheckCircle size={22} className="mr-3 text-orange-600"/>}/></div></div>)}
              </div>
            )}
            {activeTab === 'planner' && (<div className="w-full max-w-6xl mx-auto"><CropPlanner /></div>)}
          </div>
        </section>

        <section id="about" className="py-20 bg-white"><div className="container mx-auto px-6"><SectionTitle>About The Project</SectionTitle><div className="max-w-4xl mx-auto text-center"><div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"><div className="grid md:grid-cols-3 gap-8 mb-8"><StatCard icon={<Users />} number="10,000+" label="Farmers Helped" gradient="bg-gradient-to-r from-emerald-500 to-green-500"/><StatCard icon={<Globe />} number="5 States" label="Coverage Area" gradient="bg-gradient-to-r from-blue-500 to-indigo-500"/><StatCard icon={<Award />} number="95%" label="Success Rate" gradient="bg-gradient-to-r from-purple-500 to-pink-500"/></div><p className="text-lg text-gray-600 leading-relaxed mb-6">The Crop Disease Early Warning System (CDEWS) is a revolutionary platform designed to empower farmers with cutting-edge technology. By combining artificial intelligence, machine learning, and agricultural expertise, we provide instant, accurate diagnoses and comprehensive crop planning tools.</p><p className="text-lg text-gray-600 leading-relaxed">Our mission is to prevent crop loss, improve yields, and support sustainable agriculture practices while making advanced agricultural knowledge accessible to farmers everywhere.</p></div></div></div></section>
        
        <section id="crops" className="py-20 bg-gray-50"><div className="container mx-auto px-6"><SectionTitle>Supported Crops & Diseases</SectionTitle><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">{supportedCrops.map((crop) => (<CropCard key={crop.name} {...crop} />))}</div></div></section>

        <section id="contact" className="py-20 bg-gradient-to-r from-gray-900 via-emerald-900 to-green-900 text-white relative overflow-hidden"><div className="container mx-auto px-6 relative"><SectionTitle><span className="text-white">Get In Touch</span></SectionTitle><div className="max-w-4xl mx-auto"><div className="grid md:grid-cols-2 gap-12 items-center"><div><h3 className="text-2xl font-bold mb-6">Connect With Our Team</h3><p className="text-gray-300 text-lg mb-8 leading-relaxed">Have questions? Need support? Want to partner with us? Our team is here to help you succeed.</p><div className="space-y-4"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center"><Send size={20} /></div><div><p className="font-semibold">Email Support</p><p className="text-gray-300">contact@cdews-project.org</p></div></div><div className="flex items-center gap-4"><div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center"><MapPin size={20} /></div><div><p className="font-semibold">Service Areas</p><p className="text-gray-300">Pan-India Coverage</p></div></div></div></div><div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20"><h4 className="text-xl font-bold mb-6">Quick Contact Form</h4><form className="space-y-4"><input type="text" placeholder="Your Name" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"/><input type="email" placeholder="Your Email" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"/><textarea placeholder="Your Message" rows="4" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"></textarea><button className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105">Send Message</button></form></div></div></div></div></section>
      </main>

      <footer className="w-full bg-gray-900 text-white"><div className="container mx-auto px-6 py-12"><div className="grid md:grid-cols-4 gap-8"><div><div className="flex items-center space-x-3 mb-6"><div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg"><Leaf className="w-6 h-6 text-white" /></div><span className="text-xl font-bold">CDEWS</span></div><p className="text-gray-400 leading-relaxed">Empowering farmers with AI-driven tools.</p></div><div><h5 className="font-bold mb-4">Quick Links</h5><ul className="space-y-2 text-gray-400"><li><a href="#about" className="hover:text-emerald-400">About</a></li><li><a href="#crops" className="hover:text-emerald-400">Crops</a></li><li><a href="/map" className="hover:text-emerald-400">Map</a></li><li><a href="#contact" className="hover:text-emerald-400">Contact</a></li></ul></div><div><h5 className="font-bold mb-4">Tools</h5><ul className="space-y-2 text-gray-400"><li><a href="#tools-section" className="hover:text-emerald-400">Disease Detection</a></li><li><a href="#tools-section" className="hover:text-emerald-400">Crop Planner</a></li><li><a href="/login" className="hover:text-emerald-400">Login</a></li><li><a href="/signup" className="hover:text-emerald-400">Sign Up</a></li></ul></div><div><h5 className="font-bold mb-4">Support</h5><ul className="space-y-2 text-gray-400"><li>Email: contact@cdews-project.org</li><li>Coverage: Pan-India</li></ul></div></div><div className="border-t border-gray-800 mt-12 pt-8 text-center"><p className="text-gray-400">&copy; {new Date().getFullYear()} CDEWS. Built with <Heart className="inline-block text-red-500 h-4 w-4 mx-1"/> for farmers.</p></div></div></footer>
    </div>
  );
}