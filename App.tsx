import React, { useState, useEffect } from 'react';
import { ViewState, MaterialProfile, HistoryItem } from './types';
import Dashboard from './components/Dashboard';
import MaterialProfileView from './components/MaterialProfile';
import BulkView from './components/BulkView';
import { analyzeMaterialCode, generateBulkAnalysis } from './services/geminiService';
import { LayoutGrid, HelpCircle, Bell, Maximize2, Minimize2, X } from 'lucide-react';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.HOME);
  const [currentMaterial, setCurrentMaterial] = useState<MaterialProfile | null>(null);
  const [bulkData, setBulkData] = useState<MaterialProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Side Sheet State
  const [sheetMode, setSheetMode] = useState<'hidden' | 'partial' | 'full'>('hidden');

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('minestock_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const addToHistory = (type: 'SEARCH' | 'UPLOAD', label: string, data: string | string[]) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      type,
      label,
      timestamp: Date.now(),
      data
    };

    setHistory(prev => {
      // Add new item to top, limit to 10
      const updated = [newItem, ...prev].slice(0, 10);
      localStorage.setItem('minestock_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSearch = async (code: string, fromHistory = false) => {
    setIsLoading(true);
    setSheetMode('hidden'); // Close sheet if searching globally
    try {
      const data = await analyzeMaterialCode(code);
      setCurrentMaterial(data);
      setViewState(ViewState.PROFILE);
      if (!fromHistory) {
        addToHistory('SEARCH', `Searched: ${code}`, code);
      }
    } catch (error) {
      alert("Failed to fetch material data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUpload = async (codes: string[], fileName?: string, fromHistory = false) => {
    setIsLoading(true);
    setSheetMode('hidden'); // Reset sheet
    try {
      // Logic to handle bulk processing. 
      const results = await generateBulkAnalysis(codes);
      setBulkData(results);
      setViewState(ViewState.BULK);

      if (!fromHistory) {
        const label = fileName ? `File: ${fileName}` : `Bulk Upload (${codes.length} items)`;
        addToHistory('UPLOAD', label, codes);
      }
    } catch (error) {
      alert("Error processing file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSelectFromBulk = (code: string) => {
    const selected = bulkData.find(m => m.materialCode === code);
    if (selected) {
      setCurrentMaterial(selected);
      // Open as Side Sheet instead of changing full view state
      setSheetMode('partial');
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setSheetMode('hidden');
    if (item.type === 'SEARCH') {
      handleSearch(item.data as string, true);
    } else {
      handleBulkUpload(item.data as string[], item.label.replace('File: ', ''), true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-x-hidden">

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => { setViewState(ViewState.HOME); setCurrentMaterial(null); setSheetMode('hidden'); }}
        >
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <LayoutGrid size={20} />
          </div>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Freeport-McMoRan_Logo.svg/1200px-Freeport-McMoRan_Logo.svg.png" alt="PT Freeport Indonesia" className="h-12" />
        </div>

        <div className="flex items-center gap-6">
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <HelpCircle size={20} />
          </button>
          <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
            JD
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        {viewState === ViewState.HOME && (
          <Dashboard
            onSearch={handleSearch}
            onUpload={handleBulkUpload}
            isLoading={isLoading}
            history={history}
            onHistorySelect={handleHistorySelect}
          />
        )}

        {viewState === ViewState.PROFILE && currentMaterial && (
          <MaterialProfileView
            data={currentMaterial}
            onBack={() => {
              if (bulkData.length > 0) {
                setViewState(ViewState.BULK);
              } else {
                setViewState(ViewState.HOME);
                setCurrentMaterial(null);
              }
            }}
          />
        )}

        {viewState === ViewState.BULK && (
          <>
            <BulkView
              data={bulkData}
              onBack={() => {
                setViewState(ViewState.HOME);
                setBulkData([]);
                setSheetMode('hidden');
              }}
              onSelect={handleProfileSelectFromBulk}
            />

            {/* Side Sheet Overlay */}
            <div
              className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 ${sheetMode === 'hidden' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              onClick={() => setSheetMode('hidden')}
            />

            {/* Side Sheet Content */}
            <div className={`fixed top-0 right-0 h-full bg-white z-50 shadow-2xl transform transition-all duration-300 ease-in-out border-l border-slate-200 overflow-hidden flex flex-col
              ${sheetMode === 'hidden' ? 'translate-x-full' : 'translate-x-0'}
              ${sheetMode === 'full' ? 'w-full' : 'w-[85vw] md:w-[70vw] lg:w-[60vw]'}
            `}>
              {/* Sheet Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white flex-shrink-0">
                <h2 className="text-lg font-bold text-slate-800">Quick View</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSheetMode(sheetMode === 'full' ? 'partial' : 'full')}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                    title={sheetMode === 'full' ? "Collapse" : "Expand"}
                  >
                    {sheetMode === 'full' ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                  </button>
                  <button
                    onClick={() => setSheetMode('hidden')}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                    title="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto bg-slate-50">
                {currentMaterial && (
                  <MaterialProfileView
                    data={currentMaterial}
                    onBack={() => { }} // Not used in sheet mode
                    isSheet={true}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="py-6 text-center text-slate-400 text-sm border-t border-slate-200 bg-white z-0">
        &copy; 2026 Neuralix.Ai
      </footer>
    </div>
  );
};

export default App;