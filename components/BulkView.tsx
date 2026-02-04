import React, { useState, useMemo } from 'react';
import { MaterialProfile } from '../types';
import { ArrowLeft, Search, Filter, ChevronDown, ChevronRight, Eye, AlertCircle } from 'lucide-react';

interface Props {
  data: MaterialProfile[];
  onBack: () => void;
  onSelect: (code: string) => void;
}

const BulkView: React.FC<Props> = ({ data, onBack, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    criticality: '',
    stockMin: '',
    duplicatesMin: '',
    usageMin: '',
    ropMin: '',
    maxMin: ''
  });

  // Unique values for dropdown filters
  const uniqueTypes = useMemo(() => Array.from(new Set(data.map(item => item.materialType))), [data]);
  const uniqueStatuses = useMemo(() => Array.from(new Set(data.map(item => item.stockingStatus))), [data]);
  const uniqueCriticalities = useMemo(() => Array.from(new Set(data.map(item => item.criticality))).sort(), [data]);

  const toggleRow = (code: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(code)) {
      newSet.delete(code);
    } else {
      newSet.add(code);
    }
    setExpandedRows(newSet);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Global Search (Code & Name)
      const matchesSearch = 
        item.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.materialName.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Column Filters
      if (filters.type && item.materialType !== filters.type) return false;
      if (filters.status && item.stockingStatus !== filters.status) return false;
      if (filters.criticality && item.criticality !== filters.criticality) return false;
      
      if (filters.stockMin && item.totalQuantity < Number(filters.stockMin)) return false;
      if (filters.duplicatesMin && item.duplicateAnalysis.totalDuplicates < Number(filters.duplicatesMin)) return false;
      if (filters.usageMin && item.estimatedAnnualUsage < Number(filters.usageMin)) return false;
      if (filters.ropMin && item.ropMax.reorderPoint < Number(filters.ropMin)) return false;
      if (filters.maxMin && item.ropMax.maxStock < Number(filters.maxMin)) return false;

      return true;
    });
  }, [data, searchTerm, filters]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 animate-fade-in">
      <button 
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bulk Analysis Results</h1>
          <p className="text-slate-500 mt-1">Found {data.length} materials from your upload.</p>
        </div>
        
        {/* Global Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Code or Name..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider w-[120px]">Material Code</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider min-w-[200px]">Name</th>
                
                {/* Filters Row integrated into headers or below? Standard design: Header text, then input below */}
                <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider w-[120px]">
                  <div className="mb-2">Type</div>
                  <select 
                    className="w-full p-1 text-xs border border-slate-300 rounded focus:border-blue-500 outline-none bg-white font-normal"
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  >
                    <option value="">All</option>
                    {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </th>

                <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider w-[80px]">
                  <div className="mb-2">Stock</div>
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="w-full p-1 text-xs border border-slate-300 rounded focus:border-blue-500 outline-none font-normal"
                    value={filters.stockMin}
                    onChange={(e) => handleFilterChange('stockMin', e.target.value)}
                  />
                </th>

                <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider w-[100px]">
                  <div className="mb-2">Duplicates</div>
                  <input 
                    type="number" 
                    placeholder="Min #" 
                    className="w-full p-1 text-xs border border-slate-300 rounded focus:border-blue-500 outline-none font-normal"
                    value={filters.duplicatesMin}
                    onChange={(e) => handleFilterChange('duplicatesMin', e.target.value)}
                  />
                </th>

                <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider w-[140px]">
                  <div className="mb-2">Status</div>
                  <select 
                    className="w-full p-1 text-xs border border-slate-300 rounded focus:border-blue-500 outline-none bg-white font-normal"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                     <option value="">All</option>
                     {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </th>

                <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider w-[80px]">
                  <div className="mb-2">Crit.</div>
                  <select 
                    className="w-full p-1 text-xs border border-slate-300 rounded focus:border-blue-500 outline-none bg-white font-normal"
                    value={filters.criticality}
                    onChange={(e) => handleFilterChange('criticality', e.target.value)}
                  >
                     <option value="">All</option>
                     {uniqueCriticalities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </th>

                <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider w-[90px]">
                  <div className="mb-2">Usage (Est)</div>
                   <input 
                    type="number" 
                    placeholder="Min" 
                    className="w-full p-1 text-xs border border-slate-300 rounded focus:border-blue-500 outline-none font-normal"
                    value={filters.usageMin}
                    onChange={(e) => handleFilterChange('usageMin', e.target.value)}
                  />
                </th>

                <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider w-[70px]">
                  <div className="mb-2">ROP</div>
                   <input 
                    type="number" 
                    placeholder=">" 
                    className="w-full p-1 text-xs border border-slate-300 rounded focus:border-blue-500 outline-none font-normal"
                    value={filters.ropMin}
                    onChange={(e) => handleFilterChange('ropMin', e.target.value)}
                  />
                </th>

                <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider w-[70px]">
                   <div className="mb-2">MAX</div>
                   <input 
                    type="number" 
                    placeholder=">" 
                    className="w-full p-1 text-xs border border-slate-300 rounded focus:border-blue-500 outline-none font-normal"
                    value={filters.maxMin}
                    onChange={(e) => handleFilterChange('maxMin', e.target.value)}
                  />
                </th>

                <th className="px-4 py-4 text-xs font-bold text-slate-700 uppercase tracking-wider w-[100px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <React.Fragment key={item.materialCode}>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-mono font-medium text-slate-700 text-sm align-top">
                      {item.materialCode}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="text-sm font-medium text-slate-800">{item.materialName}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 align-top">{item.materialType}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-800 align-top">{item.totalQuantity}</td>
                    
                    {/* Expandable Duplicates Cell */}
                    <td className="px-4 py-4 align-top">
                       {item.duplicateAnalysis.totalDuplicates > 0 ? (
                         <button 
                           onClick={() => toggleRow(item.materialCode)}
                           className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition-all ${expandedRows.has(item.materialCode) ? 'bg-indigo-100 text-indigo-700' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                         >
                           {item.duplicateAnalysis.totalDuplicates} Found
                           {expandedRows.has(item.materialCode) ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                         </button>
                       ) : (
                         <span className="text-slate-400 text-sm pl-2">-</span>
                       )}
                    </td>

                    <td className="px-4 py-4 align-top">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${item.stockingStatus === 'Stock Normally' ? 'bg-green-100 text-green-700' : 
                          item.stockingStatus === 'Do not Stock' ? 'bg-red-100 text-red-700' : 
                          'bg-amber-100 text-amber-700'}`}>
                        {item.stockingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold border
                         ${item.criticality === 'A' ? 'bg-red-50 border-red-200 text-red-700' :
                           item.criticality === 'B' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                           'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        {item.criticality}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 align-top">{item.estimatedAnnualUsage}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 align-top">{item.ropMax.reorderPoint}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 align-top">{item.ropMax.maxStock}</td>
                    <td className="px-4 py-4 align-top">
                      <button 
                        onClick={() => onSelect(item.materialCode)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase tracking-wide flex items-center hover:underline"
                      >
                        <Eye size={14} className="mr-1" /> View
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Row for Duplicates */}
                  {expandedRows.has(item.materialCode) && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={11} className="px-4 py-4 border-b border-slate-100 shadow-inner">
                        <div className="bg-white border border-slate-200 rounded-lg p-4 ml-8 max-w-4xl">
                          <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                            <AlertCircle size={16} className="text-indigo-500 mr-2" />
                            Duplicate Materials Identified
                          </h4>
                          <table className="w-full text-xs text-left">
                            <thead className="text-slate-400 font-medium border-b border-slate-100">
                               <tr>
                                 <th className="pb-2 pl-2">Material Code</th>
                                 <th className="pb-2">Manufacturer</th>
                                 <th className="pb-2">Description</th>
                                 <th className="pb-2">Stock</th>
                                 <th className="pb-2">Location</th>
                               </tr>
                            </thead>
                            <tbody className="text-slate-600">
                               {item.duplicateAnalysis.duplicates.map((dup, idx) => (
                                 <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                    <td className="py-2 pl-2 font-mono font-medium">{dup.materialCode}</td>
                                    <td className="py-2">{dup.manufacturer}</td>
                                    <td className="py-2 text-slate-500">{dup.description}</td>
                                    <td className="py-2 font-semibold text-slate-800">{dup.stockInHand}</td>
                                    <td className="py-2">{dup.location}</td>
                                 </tr>
                               ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-slate-500">
                    No materials match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BulkView;
