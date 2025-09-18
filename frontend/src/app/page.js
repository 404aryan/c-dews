'use client'; 

import { useState } from 'react';
import axios from 'axios';
import { Leaf, Sprout, TestTube2, UploadCloud, Heart, Send, Wheat, Shield, CheckCircle } from 'lucide-react';

// --- Reusable Component for Section Titles ---
const SectionTitle = ({ children }) => (
  <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">{children}</h2>
);

// --- Reusable Component for Crop Cards ---
const CropCard = ({ name, imageUrl, description }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
    <img src={imageUrl} alt={name} className="w-full h-40 object-cover"/>
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  </div>
);

// --- NEW: Reusable Component for Advice Sections ---
const AdviceSection = ({ title, steps, icon }) => (
    <div className="mb-6">
        <h4 className="flex items-center text-xl font-bold text-gray-800 mb-3">
            {icon}
            {title}
        </h4>
        <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
            {steps.map((step, index) => <li key={index} dangerouslySetInnerHTML={{ __html: step }}></li>)}
        </ul>
    </div>
);


export default function Home() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const supportedCrops = [
    { name: 'Tomato', imageUrl: 'https://i.imgur.com/f70h5aE.jpeg', description: 'Frequently affected by blights and mosaic virus.' },
    { name: 'Potato', imageUrl: 'https://i.imgur.com/nOy1g0r.jpeg', description: 'Susceptible to early and late blight diseases.' },
    { name: 'Strawberry', imageUrl: 'https://i.imgur.com/k2n32y0.jpeg', description: 'Commonly suffers from leaf scorch and grey mold.' },
    { name: 'Soybean', imageUrl: 'https://i.imgur.com/X42aJ9a.jpeg', description: 'Vulnerable to rust, downy mildew, and septoria.' },
    { name: 'Pepper', imageUrl: 'https://i.imgur.com/0s6sS02.jpeg', description: 'Often sees bacterial spots and powdery mildew.' }
  ];

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null); 
      setError('');
    }
  };

  const handleDragEvents = (e, dragOver) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(dragOver);
  };

  const handleDrop = (e) => {
    handleDragEvents(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!image) { setError('Please select an image first.'); return; }
    setLoading(true); setResult(null); setError('');
    const formData = new FormData();
    formData.append('file', image);
    try {
      const response = await axios.post('http://127.0.0.1:8000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (err) {
      console.error("Error making prediction:", err);
      setError('Failed to get a prediction. Is the backend server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Leaf className="w-8 h-8 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-800">CDEWS</span>
          </div>
          <div className="flex items-center space-x-8">
            <div className="hidden md:flex items-center space-x-8 font-medium">
              <a href="#about" className="text-gray-600 hover:text-emerald-600 transition-colors">About</a>
              <a href="#crops" className="text-gray-600 hover:text-emerald-600 transition-colors">Crops</a>
              <a href="#contact" className="text-gray-600 hover:text-emerald-600 transition-colors">Contact</a>
            </div>
            <a href="#diagnose" className="px-5 py-2 text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition-colors duration-300 font-semibold shadow-sm hover:shadow-md">Diagnose Now</a>
          </div>
        </nav>
      </header>
      <main className="flex-grow">
        <section className="relative text-center py-24 md:py-40 text-white bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=2787&auto=format&fit=crop')" }}>
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative container mx-auto px-6"><h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">Detect Crop Diseases in Seconds.</h1><p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto drop-shadow-md">Snap a photo of a leaf — our AI identifies common plant diseases, gives clear confidence scores, and helps protect your harvest.</p></div>
        </section>
        <section id="diagnose" className="py-20 bg-gray-50">
          <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border -mt-48 md:-mt-56 z-10 relative">
            <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Upload an Image to Get Started</h2>
            <div className={`p-8 border-2 border-dashed rounded-lg text-center transition-colors duration-300 ${isDragOver ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'}`} onDragOver={(e) => handleDragEvents(e, true)} onDragLeave={(e) => handleDragEvents(e, false)} onDrop={handleDrop}>
              <UploadCloud className="w-12 h-12 mx-auto text-gray-400 mb-4"/><input type="file" id="file-upload" accept="image/*" onChange={(e) => handleFileChange(e.target.files[0])} className="hidden" /><label htmlFor="file-upload" className="cursor-pointer text-emerald-600 font-semibold hover:underline">{preview ? 'Change Image' : 'Choose an Image'}</label><p className="text-sm text-gray-500 mt-1">or drag and drop</p>
              {preview && <div className="mt-4 bg-gray-100 p-2 rounded-lg inline-block"><img src={preview} alt="Image Preview" className="w-auto h-32 mx-auto rounded" /></div>}
            </div>
            <button onClick={handleSubmit} disabled={loading || !image} className="w-full mt-6 py-3 px-4 rounded-full font-bold text-white transition-all duration-300 transform bg-emerald-600 hover:bg-emerald-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100">{loading ? 'Analyzing...' : 'Diagnose Plant'}</button>
            {error && <p className="mt-4 text-red-500 text-center font-semibold">{error}</p>}
            
            {/* --- UPDATED: Detailed Result Display --- */}
            {result && result.details && (
              <div className="mt-6 border-t pt-6 text-left">
                {/* Main Diagnosis Box */}
                <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">{result.details.title}</h3>
                  <p className="text-lg mt-1"><span className="font-semibold text-gray-700">Confidence:</span> <span className="text-blue-800">{(result.confidence * 100).toFixed(2)}%</span></p>
                  <p className="mt-2 text-gray-600">{result.details.overview}</p>
                </div>

                {/* Prevention and Cure Sections */}
                <AdviceSection 
                    title={result.details.prevention.title} 
                    steps={result.details.prevention.steps} 
                    icon={<Shield size={22} className="mr-2 text-green-600"/>}
                />
                <AdviceSection 
                    title={result.details.cure.title} 
                    steps={result.details.cure.steps} 
                    icon={<CheckCircle size={22} className="mr-2 text-orange-600"/>}
                />
              </div>
            )}
          </div>
        </section>
        <section id="about" className="py-20"><div className="container mx-auto px-6 text-center"><SectionTitle>About The Project</SectionTitle><p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">The Crop Disease Early Warning System (CDEWS) is a hackathon project designed to empower farmers with accessible technology. By leveraging machine learning, we provide instant, on-the-field diagnoses to help prevent crop loss, improve yields, and support sustainable agriculture. Our goal is to make agricultural knowledge universally available.</p></div></section>
        <section id="crops" className="py-20 bg-emerald-50/50"><div className="container mx-auto px-6"><SectionTitle>Initially Supported Crops</SectionTitle><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">{supportedCrops.map((crop) => (<CropCard key={crop.name} name={crop.name} imageUrl={crop.imageUrl} description={crop.description}/>))}</div><p className="mt-12 text-center text-gray-600">Our model is constantly learning. More crops and diseases will be added over time!</p></div></section>
        <section id="contact" className="py-20"><div className="container mx-auto px-6 text-center"><SectionTitle>Get In Touch</SectionTitle><p className="max-w-2xl mx-auto text-lg text-gray-600 mb-8">Have questions, feedback, or want to partner with us? We'd love to hear from you.</p><a href="mailto:contact@cdews-project.org" className="inline-flex items-center gap-2 px-8 py-3 text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition-colors duration-300 font-semibold shadow-sm hover:shadow-md"><Send size={20}/><span>Email Us</span></a></div></section>
      </main>
      <footer className="w-full bg-white border-t"><div className="container mx-auto px-6 py-6 text-center text-gray-600"><p>&copy; {new Date().getFullYear()} CDEWS. Built with <Heart className="inline-block text-red-500 h-4 w-4"/> for the Hackathon.</p></div></footer>
    </div>
  );
}