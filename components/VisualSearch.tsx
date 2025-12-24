
import React, { useState } from 'react';
import { analyzeImage } from '../services/geminiService';

const VisualSearch: React.FC = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSearching(true);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const analysis = await analyzeImage(base64, "Analyze this image and identify what kind of product it is. Suggest a matching product from our catalog of premium watches, electronics, and accessories. Be descriptive.");
        setResult(analysis);
      } catch (err) {
        setResult("Sorry, I couldn't analyze the image at this time.");
      } finally {
        setIsSearching(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white text-center mb-12 shadow-lg">
      <h2 className="text-3xl font-bold mb-4">Find with Vision</h2>
      <p className="mb-6 opacity-90">Upload a photo of something you love, and let our AI find the match.</p>
      
      <div className="relative inline-block">
        <label className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold cursor-pointer hover:bg-gray-100 transition-colors shadow-md inline-flex items-center gap-2">
          <i className="fas fa-camera"></i>
          {isSearching ? 'Analyzing...' : 'Upload Photo'}
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      </div>

      {result && (
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-6 text-left max-w-2xl mx-auto border border-white/20">
          <h4 className="font-bold mb-2 flex items-center gap-2">
            <i className="fas fa-sparkles text-yellow-300"></i> AI Match Analysis
          </h4>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
};

export default VisualSearch;
