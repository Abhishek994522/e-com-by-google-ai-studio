
import React, { useState, useMemo } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { INITIAL_PRODUCTS } from './constants';
import { Product, CartItem, AspectRatio } from './types';
import ChatBot from './components/ChatBot';
import VisualSearch from './components/VisualSearch';
import VoiceAssistant from './components/VoiceAssistant';
import { getSearchGrounding, findNearbyStores, complexReasoning, generateProductLifestyle, animateImageWithVeo } from './services/geminiService';

// --- Shared Components ---

const Navbar: React.FC<{ cartCount: number }> = ({ cartCount }) => (
  <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 px-6 py-4">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <Link to="/" className="text-2xl font-black tracking-tighter text-indigo-600 flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
        </div>
        NOVASPHERE
      </Link>
      <div className="hidden md:flex gap-8 font-medium text-gray-600">
        <Link to="/" className="hover:text-indigo-600 transition-colors">Shop</Link>
        <Link to="/stores" className="hover:text-indigo-600 transition-colors">Stores</Link>
        <Link to="/trends" className="hover:text-indigo-600 transition-colors">Trends</Link>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-gray-600 hover:text-indigo-600"><i className="fas fa-search"></i></button>
        <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600">
          <i className="fas fa-shopping-bag"></i>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  </nav>
);

// --- Pages ---

const Home: React.FC<{ addToCart: (p: Product) => void }> = ({ addToCart }) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h1 className="text-6xl font-black leading-tight mb-6">Future Living, <br /><span className="text-indigo-600">Delivered.</span></h1>
          <p className="text-xl text-gray-500 mb-8 max-w-lg">Curated technology and design for those who live in the sphere of tomorrow.</p>
          <div className="flex gap-4">
            <button className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">Shop Collection</button>
            <button className="border border-gray-200 px-8 py-4 rounded-full font-bold hover:bg-gray-50 transition-all">Learn More</button>
          </div>
        </div>
        <div className="relative">
          <img src="https://picsum.photos/seed/tech/800/600" className="rounded-3xl shadow-2xl" alt="Hero" />
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <i className="fas fa-check"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">In Stock</p>
              <p className="text-xs text-gray-500">Fast AI Logistics</p>
            </div>
          </div>
        </div>
      </div>

      <VisualSearch />

      <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {INITIAL_PRODUCTS.map(p => (
          <div key={p.id} className="group">
            <Link to={`/product/${p.id}`}>
              <div className="relative overflow-hidden rounded-2xl aspect-square mb-4 bg-gray-100">
                <img src={p.image} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">{p.category}</span>
                </div>
              </div>
            </Link>
            <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{p.name}</h3>
            <p className="text-sm text-gray-500 mb-2 truncate">{p.description}</p>
            <div className="flex justify-between items-center">
              <span className="font-bold text-indigo-600">${p.price}</span>
              <button 
                onClick={() => addToCart(p)}
                className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-indigo-600 transition-all"
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductDetail: React.FC<{ addToCart: (p: Product) => void }> = ({ addToCart }) => {
  const [product] = useState(INITIAL_PRODUCTS[0]); // Mock selector
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [lifestyleImage, setLifestyleImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  const handleReasoning = async () => {
    setReasoning("Thinking...");
    const ans = await complexReasoning(`Explain why the ${product.name} is a good investment for a professional living in a smart city. Compare its features like ${product.description} to industry standards.`);
    setReasoning(ans);
  };

  const handleGenerateLifestyle = async () => {
    setIsGenerating(true);
    try {
      const url = await generateProductLifestyle(`A high-end lifestyle shot of a ${product.name}, placed on a minimalist marble desk with futuristic lighting, extremely high detail, cinematic.`, aspectRatio);
      setLifestyleImage(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnimate = async () => {
    if (!lifestyleImage) return;
    setIsVideoLoading(true);
    try {
      const isPortrait = aspectRatio === AspectRatio.PORTRAIT_9_16 || aspectRatio === AspectRatio.PORTRAIT_3_4 || aspectRatio === AspectRatio.PORTRAIT_2_3;
      const url = await animateImageWithVeo(lifestyleImage, "The lights gently pulse and the camera pans smoothly around the product.", isPortrait);
      setVideoUrl(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsVideoLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid lg:grid-cols-2 gap-16">
        <div>
          <div className="rounded-3xl overflow-hidden shadow-xl mb-6 bg-gray-100">
            {videoUrl ? (
              <video src={videoUrl} autoPlay loop muted className="w-full object-cover" />
            ) : (
              <img src={lifestyleImage || product.image} className="w-full object-cover" alt={product.name} />
            )}
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleGenerateLifestyle}
              disabled={isGenerating}
              className="flex-1 bg-purple-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 disabled:opacity-50"
            >
              <i className="fas fa-wand-magic-sparkles"></i>
              {isGenerating ? 'Generating...' : 'Generate Lifestyle View'}
            </button>
            {lifestyleImage && !videoUrl && (
              <button 
                onClick={handleAnimate}
                disabled={isVideoLoading}
                className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
              >
                <i className="fas fa-video"></i>
                {isVideoLoading ? 'Animating...' : 'Animate with Veo'}
              </button>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.values(AspectRatio).map(ratio => (
              <button 
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-3 py-1 text-xs rounded-full border transition-all ${aspectRatio === ratio ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-900'}`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col">
          <h1 className="text-5xl font-black mb-4">{product.name}</h1>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => <i key={i} className={`fas fa-star ${i < Math.floor(product.rating) ? '' : 'text-gray-200'}`}></i>)}
            </div>
            <span className="text-gray-500 font-medium">({product.rating} / 5.0)</span>
          </div>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">{product.description}</p>
          <div className="text-4xl font-black text-indigo-600 mb-8">${product.price}</div>
          
          <button 
            onClick={() => addToCart(product)}
            className="w-full bg-gray-900 text-white py-6 rounded-2xl text-xl font-bold hover:bg-indigo-600 transition-all mb-4"
          >
            Add to Bag
          </button>

          <div className="border-t border-gray-100 pt-8 mt-4 space-y-6">
            <button onClick={handleReasoning} className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700">
              <i className="fas fa-brain"></i> Ask AI why this fits your lifestyle
            </button>
            {reasoning && (
              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-sm leading-relaxed whitespace-pre-wrap">
                <h4 className="font-bold text-indigo-900 mb-2">Deep Insights Thinking Result:</h4>
                {reasoning}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Trends: React.FC = () => {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<{text: string, sources: any[]} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setIsLoading(true);
    try {
      const result = await getSearchGrounding(query);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-4xl font-black mb-4">Market Grounding</h2>
      <p className="text-gray-500 mb-8">Search for real-time trends, price fluctuations, and global availability using Google Search-powered Gemini.</p>
      
      <div className="flex gap-4 mb-12">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Latest smart watch releases 2024"
          className="flex-1 bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button 
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-indigo-600 text-white px-8 rounded-2xl font-bold hover:bg-indigo-700 transition-all"
        >
          {isLoading ? 'Scanning...' : 'Search'}
        </button>
      </div>

      {data && (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: data.text.replace(/\n/g, '<br/>') }} />
          </div>
          {data.sources.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h4 className="font-bold text-sm text-gray-400 uppercase tracking-widest mb-4">Sources</h4>
              <div className="flex flex-wrap gap-3">
                {data.sources.map((s, i) => (
                  <a key={i} href={s.web?.uri} target="_blank" rel="noreferrer" className="text-xs bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 hover:border-indigo-300 transition-colors flex items-center gap-2">
                    <i className="fas fa-link text-indigo-400"></i> {s.web?.title || 'External Link'}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Stores: React.FC = () => {
  const [data, setData] = useState<{text: string, sources: any[]} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLocate = () => {
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const result = await findNearbyStores(pos.coords.latitude, pos.coords.longitude);
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-4xl font-black mb-4">Visit Us</h2>
      <p className="text-gray-500 mb-8">Locate NovaSphere showrooms using Google Maps grounding.</p>
      
      {!data ? (
        <div className="bg-gray-100 rounded-3xl p-20 text-center">
            <button 
                onClick={handleLocate}
                disabled={isLoading}
                className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-indigo-600 transition-all flex items-center gap-2 mx-auto"
            >
                <i className="fas fa-location-arrow"></i>
                {isLoading ? 'Locating...' : 'Use My Current Location'}
            </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="prose max-w-none mb-8">
            <div dangerouslySetInnerHTML={{ __html: data.text.replace(/\n/g, '<br/>') }} />
          </div>
          <div className="flex flex-wrap gap-3">
            {data.sources.map((s: any, i: number) => (
              <a key={i} href={s.maps?.uri} target="_blank" rel="noreferrer" className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 text-sm flex items-center gap-2 hover:bg-blue-100 transition-colors">
                <i className="fas fa-map-marker-alt"></i> View on Maps
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App ---

function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const cartCount = useMemo(() => cart.reduce((acc, curr) => acc + curr.quantity, 0), [cart]);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar cartCount={cartCount} />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} />} />
            <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/cart" element={
              <div className="max-w-3xl mx-auto px-6 py-12">
                <h2 className="text-3xl font-black mb-8">Your Bag</h2>
                {cart.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl">
                    <p className="text-gray-400 mb-6">Your bag is empty.</p>
                    <Link to="/" className="text-indigo-600 font-bold hover:underline">Continue Shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-6 items-center bg-white p-4 rounded-2xl border border-gray-100">
                        <img src={item.image} className="w-20 h-20 rounded-xl object-cover" alt={item.name} />
                        <div className="flex-1">
                          <h4 className="font-bold">{item.name}</h4>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="font-bold text-indigo-600">${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                    <div className="border-t pt-6 flex justify-between items-center">
                        <span className="text-xl font-bold">Total</span>
                        <span className="text-3xl font-black text-indigo-600">
                            ${cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0).toFixed(2)}
                        </span>
                    </div>
                    <button className="w-full bg-gray-900 text-white py-6 rounded-2xl text-xl font-bold hover:bg-indigo-600 transition-all">
                        Checkout with NovaPay
                    </button>
                  </div>
                )}
              </div>
            } />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-100 py-12 px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
            <div className="col-span-2">
              <h3 className="text-xl font-black mb-4">NOVASPHERE</h3>
              <p className="text-gray-500 max-w-sm mb-6">The future of high-end consumer technology and lifestyle essentials, powered by Gemini Intelligence.</p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"><i className="fab fa-instagram"></i></a>
                <a href="#" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"><i className="fab fa-twitter"></i></a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-indigo-600">Contact Us</a></li>
                <li><a href="#" className="hover:text-indigo-600">Shipping Policy</a></li>
                <li><a href="#" className="hover:text-indigo-600">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">AI Features</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-indigo-600">Visual Search</a></li>
                <li><a href="#" className="hover:text-indigo-600">Voice Assistant</a></li>
                <li><a href="#" className="hover:text-indigo-600">Market Grounding</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
            &copy; 2024 NovaSphere AI. All Rights Reserved.
          </div>
        </footer>

        <ChatBot />
        <VoiceAssistant />
      </div>
    </HashRouter>
  );
}

export default App;
