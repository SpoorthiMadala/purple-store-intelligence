import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, ShoppingBag, Percent, LogOut, 
  AlertTriangle, ShieldAlert, Clock, RefreshCw, Layers, Map 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';

export default function App() {
  const [metrics, setMetrics] = useState(null);
  const [funnel, setFunnel] = useState([]);
  const [events, setEvents] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [cameraFilter, setCameraFilter] = useState('');

  const fetchData = async () => {
    try {
      const [resMetrics, resFunnel, resEvents, resAnomalies] = await Promise.all([
        fetch('/api/metrics'),
        fetch('/api/funnel'),
        fetch('/api/events?limit=50'),
        fetch('/api/anomalies')
      ]);

      const dataMetrics = await resMetrics.json();
      const dataFunnel = await resFunnel.json();
      const dataEvents = await resEvents.json();
      const dataAnomalies = await resAnomalies.json();

      setMetrics(dataMetrics);
      setFunnel(dataFunnel.funnel_stages || []);
      setEvents(dataEvents);
      setAnomalies(dataAnomalies);
      setLoading(false);
    } catch (e) {
      console.error("Error fetching dashboard data:", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <RefreshCw className="w-12 h-12 text-purplle animate-spin mb-4" />
        <p className="text-lg font-medium text-slate-400">Loading Intelligence Dashboard...</p>
      </div>
    );
  }

  // Find max engagement to normalize heatmap colors
  const maxEngagement = metrics ? Math.max(...metrics.brand_engagement.map(b => b.engagement_count), 1) : 1;

  // Helper to color brand spots based on engagement density
  const getSpotColor = (brandName) => {
    if (!metrics) return 'rgba(139, 92, 246, 0.2)';
    const brand = metrics.brand_engagement.find(b => b.brand.toLowerCase() === brandName.toLowerCase());
    if (!brand) return 'rgba(255, 255, 255, 0.05)';
    const ratio = brand.engagement_count / maxEngagement;
    // Map ratio to violet/indigo scale
    return `rgba(139, 92, 246, ${Math.max(0.25, ratio * 0.95)})`;
  };

  const getBrandStats = (brandName) => {
    if (!metrics) return null;
    return metrics.brand_engagement.find(b => b.brand.toLowerCase() === brandName.toLowerCase());
  };

  const filteredEvents = cameraFilter 
    ? events.filter(e => e.camera_id === cameraFilter)
    : events;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-purplle-dark to-purplle p-2 rounded-xl shadow-lg shadow-purplle/20">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-purplle-light bg-clip-text text-transparent">
              Purplle Store Intelligence
            </h1>
            <p className="text-xs text-slate-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>Live Feed: ST1008 - Brigade Road, Bangalore</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <nav className="flex space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-purplle text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('map')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'map' ? 'bg-purplle text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Interactive Map
            </button>
          </nav>

          <button 
            onClick={fetchData} 
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto space-y-6">
        
        {/* Metric Cards Row */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            <div className="glass-panel glass-panel-hover p-5 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Footfall</span>
                <Users className="w-5 h-5 text-purplle-light" />
              </div>
              <h3 className="text-3xl font-bold">{metrics.summary.total_footfall}</h3>
              <p className="text-xs text-slate-500 mt-2 flex items-center">
                <span className="text-emerald-500 mr-1">↑ 12.3%</span> vs yesterday
              </p>
            </div>

            <div className="glass-panel glass-panel-hover p-5 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Store Exits</span>
                <LogOut className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-3xl font-bold">{metrics.summary.total_exits}</h3>
              <p className="text-xs text-slate-500 mt-2">Active checkout tracking</p>
            </div>

            <div className="glass-panel glass-panel-hover p-5 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Unique Purchases</span>
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-3xl font-bold">{metrics.summary.unique_transactions}</h3>
              <p className="text-xs text-slate-500 mt-2">POS synced orders</p>
            </div>

            <div className="glass-panel glass-panel-hover p-5 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Conversion Rate</span>
                <Percent className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-3xl font-bold text-emerald-400">{metrics.summary.conversion_rate}%</h3>
              <p className="text-xs text-slate-500 mt-2 flex items-center">
                <span className="text-emerald-500 mr-1">↑ 4.2%</span> vs last hour
              </p>
            </div>

            <div className="glass-panel glass-panel-hover p-5 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Sales</span>
                <TrendingUp className="w-5 h-5 text-purplle" />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purplle-light to-white bg-clip-text text-transparent">
                ₹{metrics.summary.total_sales_val.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-500 mt-2">Gross NMV valuation</p>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Funnel chart card */}
            <div className="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center space-x-2 text-slate-200 mb-1">
                  <Layers className="w-4 h-4 text-purplle" />
                  <span>Visitor Journey Funnel</span>
                </h3>
                <p className="text-xs text-slate-400 mb-6">Session-based conversion stages (no double-counting)</p>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnel} layout="vertical" margin={{ left: 30, right: 30 }}>
                    <XAxis type="number" stroke="#64748b" hide />
                    <YAxis dataKey="stage" type="category" stroke="#94a3b8" width={120} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-800 text-center">
                {funnel.map((item, idx) => (
                  <div key={idx}>
                    <p className="text-xs text-slate-500 uppercase">{item.stage.split(' ')[0]}</p>
                    <p className="text-base font-bold mt-0.5">{item.count}</p>
                    {idx > 0 && <span className="text-[10px] text-rose-400">-{item.drop_off_pct}% Drop</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Anomalies Card */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center space-x-2 text-slate-200 mb-1">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>Real-Time Anomalies</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4">Detected policy violations and path warnings</p>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[290px] pr-2 space-y-3">
                {anomalies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10">
                    <ShieldAlert className="w-8 h-8 text-slate-700 mb-2" />
                    <p className="text-sm">No critical anomalies detected</p>
                  </div>
                ) : (
                  anomalies.map((anom, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-xl border flex items-start space-x-3 ${anom.severity === 'HIGH' ? 'bg-rose-500/10 border-rose-500/35 text-rose-200' : 'bg-amber-500/10 border-amber-500/35 text-amber-200'}`}
                    >
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider">{anom.type}</h4>
                        <p className="text-xs mt-1 text-slate-300">{anom.description}</p>
                        <span className="text-[10px] text-slate-500 mt-2 block">Relative seconds: {new Date(anom.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Events Stream Card */}
            <div className="glass-panel p-6 rounded-2xl lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold flex items-center space-x-2 text-slate-200 mb-1">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>Real-Time Detections Stream</span>
                  </h3>
                  <p className="text-xs text-slate-400">Structured event queue extracted from CCTV feeds</p>
                </div>
                
                <select 
                  value={cameraFilter} 
                  onChange={(e) => setCameraFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-1.5 outline-none focus:border-purplle"
                >
                  <option value="">All Cameras</option>
                  <option value="CAM 1">CAM 1 - Skin Care</option>
                  <option value="CAM 2">CAM 2 - Makeup</option>
                  <option value="CAM 3">CAM 3 - Entrance</option>
                  <option value="CAM 4">CAM 4 - Backroom</option>
                  <option value="CAM 5">CAM 5 - Checkout</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-medium">
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Camera</th>
                      <th className="py-2.5 px-3">Person ID</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Details / Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    {filteredEvents.slice(0, 10).map((evt, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/30 transition">
                        <td className="py-2.5 px-3 text-slate-500">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[10px]">
                            {evt.camera_id}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-purplle-light">
                          #{evt.person_id}
                        </td>
                        <td className="py-2.5 px-3 capitalize">
                          {evt.action.replace('_', ' ')}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {evt.details.section} {evt.details.group_entry && <span className="bg-indigo-500/10 text-indigo-300 text-[9px] px-1 rounded ml-1">Group</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : (
          /* Spatial Layout Heatmap View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Heatmap overlay Panel */}
            <div className="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-bold flex items-center space-x-2 text-slate-200 mb-1">
                  <Map className="w-4 h-4 text-purplle" />
                  <span>Store Layout & Spatial Engagement Heatmap</span>
                </h3>
                <p className="text-xs text-slate-400">Dwell density mapped directly onto the store coordinates (hover for details)</p>
              </div>

              {/* Blueprint Layout Drawing SVG */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex-1 flex items-center justify-center relative overflow-hidden min-h-[380px]">
                <svg viewBox="0 0 1000 500" className="w-full h-auto text-slate-600 max-w-[850px]">
                  {/* Outer boundaries */}
                  <rect x="10" y="10" width="980" height="480" rx="8" fill="none" stroke="currentColor" strokeWidth="3" />
                  
                  {/* Doors (Left wall) */}
                  <path d="M 10 100 Q 80 150 10 200" fill="none" stroke="#a78bfa" strokeWidth="3" strokeDasharray="5,5" />
                  <text x="30" y="140" fill="#a78bfa" fontSize="12" className="italic font-medium">Entrance</text>

                  {/* Top wall display boxes (EB Korean, Face Shop, Good Vibes, DermDoc, Minimalist, Aqualogica, Lakme Skin, Accessories) */}
                  <g stroke="currentColor" strokeWidth="2" fill="none">
                    <rect x="80" y="10" width="100" height="40" onClick={() => setSelectedBrand("EB Korean")} className="cursor-pointer hover:stroke-purplle" />
                    <rect x="190" y="10" width="100" height="40" onClick={() => setSelectedBrand("The Face Shop")} className="cursor-pointer hover:stroke-purplle" />
                    <rect x="300" y="10" width="100" height="40" onClick={() => setSelectedBrand("Good Vibes")} className="cursor-pointer hover:stroke-purplle" />
                    <rect x="410" y="10" width="100" height="40" onClick={() => setSelectedBrand("DermDoc")} className="cursor-pointer hover:stroke-purplle" />
                    <rect x="520" y="10" width="100" height="40" onClick={() => setSelectedBrand("Minimalist")} className="cursor-pointer hover:stroke-purplle" />
                    <rect x="630" y="10" width="100" height="40" onClick={() => setSelectedBrand("Aqualogica")} className="cursor-pointer hover:stroke-purplle" />
                    <rect x="740" y="10" width="100" height="40" onClick={() => setSelectedBrand("Lakme Skin")} className="cursor-pointer hover:stroke-purplle" />
                    <rect x="850" y="10" width="100" height="40" onClick={() => setSelectedBrand("Accessories")} className="cursor-pointer hover:stroke-purplle" fill="rgba(56, 189, 248, 0.1)" stroke="#38bdf8" />
                  </g>
                  <text x="130" y="34" fill="currentColor" fontSize="10" textAnchor="middle">EB Korean</text>
                  <text x="240" y="34" fill="currentColor" fontSize="10" textAnchor="middle">Face Shop</text>
                  <text x="350" y="34" fill="currentColor" fontSize="10" textAnchor="middle">Good Vibes</text>
                  <text x="460" y="34" fill="currentColor" fontSize="10" textAnchor="middle">DermDoc</text>
                  <text x="570" y="34" fill="currentColor" fontSize="10" textAnchor="middle">Minimalist</text>
                  <text x="680" y="34" fill="currentColor" fontSize="10" textAnchor="middle">Aqualogica</text>
                  <text x="790" y="34" fill="currentColor" fontSize="10" textAnchor="middle">Lakme Skin</text>
                  <text x="900" y="34" fill="#38bdf8" fontSize="10" textAnchor="middle">Accessories</text>

                  {/* Bottom wall shelves (Maybelline, Faces Canada, Lakme, Sugar, Swiss Beauty, Renee, Alps, Streax) */}
                  <g stroke="currentColor" strokeWidth="2" fill="none">
                    <rect x="80" y="450" width="100" height="40" onClick={() => setSelectedBrand("Maybelline")} className="cursor-pointer hover:stroke-purplle" />
                    <rect x="190" y="450" width="100" height="40" onClick={() => setSelectedBrand("Faces Canada")} className="cursor-pointer hover:stroke-purplle" />
                    <rect x="300" y="450" width="100" height="40" onClick={() => setSelectedBrand("Lakme")} className="cursor-pointer hover:stroke-purplle" />
                    <rect x="410" y="450" width="100" height="40" onClick={() => setSelectedBrand("Colorbar + Sugar")} className="cursor-pointer hover:stroke-purplle" />
                    <rect x="520" y="450" width="100" height="40" onClick={() => setSelectedBrand("Swiss Beauty")} className="cursor-pointer hover:stroke-purplle" />
                    <rect x="630" y="450" width="100" height="40" onClick={() => setSelectedBrand("Renee NY Bae")} className="cursor-pointer hover:stroke-purplle" />
                    <rect x="740" y="450" width="100" height="40" onClick={() => setSelectedBrand("Alps Goodness")} className="cursor-pointer hover:stroke-purplle" fill="rgba(245, 158, 11, 0.1)" stroke="#f59e0b" />
                    <rect x="850" y="450" width="100" height="40" onClick={() => setSelectedBrand("Streax")} className="cursor-pointer hover:stroke-purplle" fill="rgba(245, 158, 11, 0.1)" stroke="#f59e0b" />
                  </g>
                  <text x="130" y="474" fill="currentColor" fontSize="10" textAnchor="middle">Maybelline</text>
                  <text x="240" y="474" fill="currentColor" fontSize="10" textAnchor="middle">Faces Canada</text>
                  <text x="350" y="474" fill="currentColor" fontSize="10" textAnchor="middle">Lakme</text>
                  <text x="460" y="474" fill="currentColor" fontSize="10" textAnchor="middle">Sugar</text>
                  <text x="570" y="474" fill="currentColor" fontSize="10" textAnchor="middle">Swiss Beauty</text>
                  <text x="680" y="474" fill="currentColor" fontSize="10" textAnchor="middle">Renee</text>
                  <text x="790" y="474" fill="#f59e0b" fontSize="10" textAnchor="middle">Alps Goodness</text>
                  <text x="900" y="474" fill="#f59e0b" fontSize="10" textAnchor="middle">Streax</text>

                  {/* Cash counter & desk on the right side */}
                  <rect x="880" y="160" width="80" height="150" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
                  <text x="920" y="240" fill="currentColor" fontSize="10" textAnchor="middle" transform="rotate(-90 920 240)">CASH COUNTER</text>

                  {/* Center Gondolas */}
                  <rect x="300" y="200" width="90" height="100" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
                  <text x="345" y="254" fill="currentColor" fontSize="10" textAnchor="middle">Nail Unit</text>

                  <rect x="520" y="180" width="110" height="140" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
                  <text x="575" y="254" fill="currentColor" fontSize="10" textAnchor="middle">Makeup Unit</text>

                  {/* F.O.H text */}
                  <text x="450" y="255" fill="currentColor" fontSize="24" fontWeight="bold" opacity="0.1" textAnchor="middle">F.O.H</text>

                  {/* Dynamic Heatmap Overlays (Pulsing Rings on active zones) */}
                  <g pointerEvents="none">
                    {/* Top wall spots */}
                    <circle cx="130" cy="30" r="25" fill={getSpotColor("EB Korean")} />
                    <circle cx="240" cy="30" r="25" fill={getSpotColor("The Face Shop")} />
                    <circle cx="350" cy="30" r="25" fill={getSpotColor("Good Vibes")} />
                    <circle cx="460" cy="30" r="25" fill={getSpotColor("DermDoc")} />
                    <circle cx="570" cy="30" r="25" fill={getSpotColor("Minimalist")} />
                    <circle cx="680" cy="30" r="25" fill={getSpotColor("Aqualogica")} />
                    <circle cx="790" cy="30" r="25" fill={getSpotColor("Lakme Skin")} />
                    {/* Bottom wall spots */}
                    <circle cx="130" cy="470" r="25" fill={getSpotColor("Maybelline")} />
                    <circle cx="240" cy="470" r="25" fill={getSpotColor("Faces Canada")} />
                    <circle cx="350" cy="470" r="25" fill={getSpotColor("Lakme")} />
                    <circle cx="460" cy="470" r="25" fill={getSpotColor("Colorbar + Sugar")} />
                    <circle cx="570" cy="470" r="25" fill={getSpotColor("Swiss Beauty")} />
                    <circle cx="680" cy="470" r="25" fill={getSpotColor("Renee NY Bae")} />
                    <circle cx="790" cy="470" r="25" fill={getSpotColor("Alps Goodness")} />
                    <circle cx="900" cy="470" r="25" fill={getSpotColor("Streax")} />
                  </g>
                </svg>
              </div>
            </div>

            {/* Selection details sidebar */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center space-x-2 text-slate-200 mb-1">
                  <span>Section Details</span>
                </h3>
                <p className="text-xs text-slate-400 mb-6">Click on any brand shelf on the map to inspect metrics</p>
                
                {selectedBrand ? (
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-purplle-light">Selected Brand</span>
                      <h4 className="text-2xl font-bold mt-1 text-white">{selectedBrand}</h4>
                    </div>

                    {getBrandStats(selectedBrand) ? (
                      <div className="space-y-4">
                        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                          <p className="text-xs text-slate-400">Total Browsing Visits</p>
                          <p className="text-3xl font-bold mt-1 text-slate-100">
                            {getBrandStats(selectedBrand).engagement_count}
                          </p>
                        </div>

                        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                          <p className="text-xs text-slate-400">Average Dwell Time</p>
                          <p className="text-3xl font-bold mt-1 text-emerald-400">
                            {getBrandStats(selectedBrand).avg_dwell_seconds} sec
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl text-slate-500 text-xs text-center py-10">
                        No active browsing events detected for this shelf in this CCTV session.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-600 text-xs">
                    <Map className="w-12 h-12 text-slate-800 mb-2" />
                    <p>Select a location shelf on the layout map to view engagement statistics.</p>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-900 pt-4">
                Note: Spots are color-coded based on visit frequency. Glowing purple circles represent the high-density sections in the store.
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-600 mt-10">
        Purplle Store Intelligence System &copy; 2026. Made for assessment guidelines.
      </footer>
    </div>
  );
}
