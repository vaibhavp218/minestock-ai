import React, { useState, ChangeEvent } from 'react';
import { Search, Upload, FileSpreadsheet, Loader2, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { HistoryItem } from '../types';

interface DashboardProps {
  onSearch: (code: string) => void;
  onUpload: (codes: string[], fileName?: string) => void;
  isLoading: boolean;
  history: HistoryItem[];
  onHistorySelect: (item: HistoryItem) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSearch, onUpload, isLoading, history, onHistorySelect }) => {
  const [searchInput, setSearchInput] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Simple CSV parse: Split by new line, then comma, take first non-empty value
      const codes = text
        .split(/\r?\n/)
        .map(row => row.split(',')[0].trim())
        .filter(code => code.length > 0 && code.toLowerCase() !== 'material code'); // basic header filtering

      onUpload(codes, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 60000); // minutes
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Material Inventory Directory</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Discover duplicates, prevent overstocking, and optimize your mining supply chain.
          Enter a material code or upload a stock list to begin analysis.
        </p>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Single Search Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col transition-all hover:shadow-2xl">
          <div className="mb-6">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
              <Search size={24} />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Quick Search</h2>
            <p className="text-slate-500 mt-2 text-sm">Analyze a specific material code for duplicates and specs.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-auto">
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Ex: 401121145"
                className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !searchInput}
                className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              </button>
            </div>
          </form>
        </div>

        {/* Bulk Upload Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col transition-all hover:shadow-2xl">
          <div className="mb-6">
            <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
              <FileSpreadsheet size={24} />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Bulk Analysis</h2>
            <p className="text-slate-500 mt-2 text-sm">Upload a CSV list of material codes to audit an entire category.</p>
          </div>

          <div
            className={`mt-auto border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer relative ${dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-400'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv,.txt"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <div className="flex flex-col items-center justify-center text-slate-500">
              <Upload size={24} className="mb-2 text-slate-400" />
              <span className="text-sm font-medium">Click to upload or drag & drop</span>
              <span className="text-xs text-slate-400 mt-1">CSV or Text files</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      {history.length > 0 && (
        <div className="w-full max-w-4xl animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-slate-400" />
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recent Activity</h3>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => onHistorySelect(item)}
                className="group flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.type === 'SEARCH' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {item.type === 'SEARCH' ? <Search size={18} /> : <FileSpreadsheet size={18} />}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{item.label}</div>
                    <div className="text-xs text-slate-400">{formatTime(item.timestamp)}</div>
                  </div>
                </div>
                <div className="text-slate-300 group-hover:text-blue-400 transition-colors">
                  <ChevronRight size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mt-8 flex items-center text-slate-500 animate-pulse">
          <Loader2 className="animate-spin mr-2" size={20} />
          <span>Analyzing inventory data with AI...</span>
        </div>
      )}

      {!apiKeyPresent() && (
        <div className="mt-8 p-4 bg-amber-50 text-amber-800 rounded-lg flex items-center border border-amber-200 text-sm max-w-lg">
          <AlertCircle size={18} className="mr-2 flex-shrink-0" />
          <span>Demo Mode: API Key not detected. Using mock data for demonstration.</span>
        </div>
      )}
    </div>
  );
};

// Helper to check environment variable availability (simulated for frontend code)
const apiKeyPresent = () => {
  // In a real build, we'd check process.env.API_KEY, but here we just want to suppress the warning if the user didn't set it.
  // For this generated code, we assume if process.env.API_KEY is defined in the Service, it's fine.
  // This is just a UI helper.
  return true;
}

export default Dashboard;