import React, { useState } from 'react';
import { MaterialProfile as MaterialProfileType } from '../types';
import { 
  AlertTriangle, 
  MapPin, 
  Package, 
  History, 
  Box, 
  Wrench,
  Activity,
  ArrowLeft,
  BarChart2,
  List,
  Calculator,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

interface Props {
  data: MaterialProfileType;
  onBack: () => void;
  isSheet?: boolean;
}

const MaterialProfile: React.FC<Props> = ({ data, onBack, isSheet = false }) => {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [showCalc, setShowCalc] = useState(false);

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 animate-fade-in relative ${isSheet ? 'pb-24' : ''}`}>
      {!isSheet && (
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Search
        </button>
      )}

      {/* Header Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <div className="flex items-center gap-3 mb-3">
              {data.ropMax.currentStatus === 'Overstock' && (
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase flex items-center">
                  <AlertTriangle size={12} className="mr-1" /> Overstocked
                </span>
              )}
               {data.obsolescence.riskLevel === 'High' && (
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase flex items-center">
                   High Obsolescence Risk
                </span>
              )}
            </div>
            {/* Hierarchy Update: Code is H1, Name is H2/Sub */}
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{data.materialCode}</h1>
            <h2 className="text-xl text-slate-500 mt-2 font-medium">{data.materialName}</h2>
          </div>
          
          <div className="mt-6 md:mt-0 flex gap-8">
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Unit Cost</div>
              <div className="text-2xl font-bold text-slate-800">${data.averageUnitCost}</div>
            </div>
            <div className="text-right border-l border-slate-100 pl-8">
               <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Total Value</div>
               <div className="text-2xl font-bold text-slate-800">
                 ${(data.totalQuantity * data.averageUnitCost).toLocaleString()}
               </div>
            </div>
          </div>
        </div>

        {/* Equipment Codes Section */}
        <div className="mt-8 pt-6 border-t border-slate-100">
           <div className="flex items-center text-slate-400 mb-3">
             <Wrench size={16} className="mr-2" />
             <span className="text-xs font-bold uppercase tracking-wider">Associated Equipment Codes</span>
           </div>
           <div className="flex flex-wrap gap-2">
            {data.equipmentParent.map((eq, idx) => (
              <div key={idx} className="flex items-center bg-slate-50 text-slate-600 px-3 py-1.5 rounded-md text-sm border border-slate-200 font-mono">
                {eq}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* KPI Cards */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Stock</h3>
            <Package className="text-blue-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-6">{data.totalQuantity} <span className="text-sm font-normal text-slate-400">units</span></div>
          
          {/* ROP and Max Cap with increased font size and Calculation Button */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
             <div>
                <span className="block text-sm text-slate-500 font-medium uppercase mb-1">Reorder Point</span>
                <div className="flex flex-col items-start">
                   <span className="block text-2xl font-bold text-slate-800">{data.ropMax.reorderPoint}</span>
                   <button 
                      onClick={() => setShowCalc(true)}
                      className="mt-1 flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                   >
                     <Calculator size={12} className="mr-1" />
                     Show Calculation
                   </button>
                </div>
             </div>
             <div className="text-right">
                <span className="block text-sm text-slate-500 font-medium uppercase mb-1">Max Cap</span>
                <span className="block text-2xl font-bold text-slate-800">{data.ropMax.maxStock}</span>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Obsolescence</h3>
             <Activity className="text-orange-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-slate-800">{data.obsolescence.riskLevel}</div>
          <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between text-base">
             <span className="text-slate-500">Years in Stock</span>
             <span className="font-bold text-lg text-slate-800">{data.obsolescence.yearsInStock} Years</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Last Activity</h3>
             <History className="text-purple-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-slate-800">{new Date(data.lastUsedDate).toLocaleDateString()}</div>
          <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between text-base">
             <span className="text-slate-500">Market Availability</span>
             <span className="font-bold text-lg text-slate-800">{data.obsolescence.marketAvailability}</span>
          </div>
        </div>
      </div>

      {/* Main Analysis Section (Full Width) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
             <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mr-4">
                <Box size={20} />
             </div>
             <div>
                <h3 className="text-lg font-bold text-slate-800">Duplicate Material Analysis</h3>
                <p className="text-sm text-slate-500">Identify and consolidate redundant inventory items.</p>
             </div>
          </div>
          
          {/* Toggle for View */}
          <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button 
              onClick={() => setViewMode('table')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List size={16} className="mr-2" />
              Duplicates List
            </button>
            <button 
              onClick={() => setViewMode('chart')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'chart' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <BarChart2 size={16} className="mr-2" />
              Location Dist.
            </button>
          </div>
        </div>

        <div className="p-6">
           <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
                 <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Duplicates Found</div>
                 <div className="text-2xl font-bold text-slate-900">{data.duplicateAnalysis.totalDuplicates}</div>
              </div>
              <div className="flex-1 bg-red-50 rounded-xl p-5 border border-red-100">
                 <div className="text-red-600 text-xs font-bold uppercase tracking-wider mb-1">Stock Across Duplicates</div>
                 <div className="text-2xl font-bold text-slate-900">{data.duplicateAnalysis.totalStockAcrossDuplicates}</div>
              </div>
              <div className="flex-1 bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                 <div className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">Potential Capital Recovery</div>
                 <div className="text-2xl font-bold text-slate-900">${data.duplicateAnalysis.potentialSavings.toLocaleString()}</div>
              </div>
           </div>

           {/* Dynamic Content Area based on View Mode */}
           <div className="min-h-[300px]">
             {viewMode === 'table' ? (
                <>
                  {data.duplicateAnalysis.duplicates.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-slate-100">
                     <table className="w-full text-sm text-left">
                       <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                         <tr>
                           <th className="px-6 py-4 font-semibold">Material Code</th>
                           <th className="px-6 py-4 font-semibold">Manufacturer</th>
                           <th className="px-6 py-4 font-semibold">Stock</th>
                           <th className="px-6 py-4 font-semibold">Annual Usage</th>
                           <th className="px-6 py-4 font-semibold">Last Used</th>
                           <th className="px-6 py-4 font-semibold">Location</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {data.duplicateAnalysis.duplicates.map((item, index) => (
                           <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                             <td className="px-6 py-4 font-mono font-medium text-slate-700">{item.materialCode}</td>
                             <td className="px-6 py-4 text-slate-600">{item.manufacturer}</td>
                             <td className="px-6 py-4 font-bold text-slate-800">{item.stockInHand}</td>
                             <td className="px-6 py-4 text-slate-600">{item.annualUsage}</td>
                             <td className="px-6 py-4 text-slate-500">{item.lastUsed}</td>
                             <td className="px-6 py-4 flex items-center text-slate-600">
                                <MapPin size={14} className="mr-1.5 text-slate-400"/> {item.location}
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                    </div>
                   ) : (
                     <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
                       <Box size={48} className="mb-4 opacity-20" />
                       <p>No duplicates found for this material code.</p>
                     </div>
                   )}
                </>
             ) : (
                <div className="h-[400px] w-full pt-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-6 ml-4">Current Stock Distribution by Location</h4>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={data.locations} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b', fontSize: 12}} 
                        dy={10} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b', fontSize: 12}} 
                      />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      />
                      <Bar dataKey="stock" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             )}
           </div>
        </div>
      </div>
      
      {/* Calculation Modal */}
      {showCalc && data.ropCalculation && (
        <div className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in ${isSheet ? 'absolute' : 'fixed'}`}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2 text-slate-800">
                 <Calculator className="text-blue-600" />
                 <h2 className="text-xl font-bold">Calculation Details</h2>
              </div>
              <button onClick={() => setShowCalc(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-8 bg-slate-50/50">
              
              {/* Suggested Values */}
              <section>
                <h3 className="text-sm font-bold text-slate-800 mb-3">Suggested Stocking Values</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                     <span className="text-xs text-slate-500 uppercase font-semibold">Suggested ROP</span>
                     <div className="text-2xl font-bold text-emerald-500">{data.ropCalculation.suggestedROP}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                     <span className="text-xs text-slate-500 uppercase font-semibold">Suggested MAX</span>
                     <div className="text-2xl font-bold text-emerald-500">{data.ropCalculation.suggestedMAX}</div>
                  </div>
                   <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                     <span className="text-xs text-slate-500 uppercase font-semibold">Suggested EOQ</span>
                     <div className="text-xl font-medium text-slate-700">{data.ropCalculation.suggestedEOQ}</div>
                  </div>
                </div>
              </section>

              {/* Requested vs Suggested */}
              <section>
                 <h3 className="text-sm font-bold text-slate-800 mb-3">MDG Requested vs Suggested</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex justify-between items-center">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Requested ROP</div>
                          <div className="text-lg font-bold text-slate-800">{data.ropCalculation.requestedROP}</div>
                        </div>
                        <div className="text-right">
                           <div className="text-xs text-slate-500 mb-1">Difference</div>
                           <div className={`text-lg font-bold ${data.ropCalculation.suggestedROP - data.ropCalculation.requestedROP === 0 ? 'text-emerald-500' : 'text-orange-500'}`}>
                              {data.ropCalculation.suggestedROP - data.ropCalculation.requestedROP}
                           </div>
                        </div>
                    </div>
                     <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex justify-between items-center">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Requested MAX</div>
                          <div className="text-lg font-bold text-slate-800">{data.ropCalculation.requestedMAX}</div>
                        </div>
                        <div className="text-right">
                           <div className="text-xs text-slate-500 mb-1">Difference</div>
                           <div className={`text-lg font-bold ${data.ropCalculation.suggestedMAX - data.ropCalculation.requestedMAX === 0 ? 'text-emerald-500' : 'text-orange-500'}`}>
                              {data.ropCalculation.suggestedMAX - data.ropCalculation.requestedMAX}
                           </div>
                        </div>
                    </div>
                 </div>
              </section>

              {/* Input Parameters */}
              <section>
                <h3 className="text-sm font-bold text-slate-800 mb-3">Input Parameters</h3>
                <div className="grid grid-cols-4 gap-4">
                   <div className="bg-slate-100 p-3 rounded-lg">
                      <div className="text-xs text-slate-500 mb-1">Annual Usage</div>
                      <div className="font-bold text-slate-800">{data.ropCalculation.inputParameters.annualUsage}</div>
                   </div>
                   <div className="bg-slate-100 p-3 rounded-lg">
                      <div className="text-xs text-slate-500 mb-1">Lead Time (days)</div>
                      <div className="font-bold text-slate-800">{data.ropCalculation.inputParameters.leadTime}</div>
                   </div>
                   <div className="bg-slate-100 p-3 rounded-lg">
                      <div className="text-xs text-slate-500 mb-1">Criticality</div>
                      <div className="font-bold text-slate-800">{data.ropCalculation.inputParameters.criticality}</div>
                   </div>
                   <div className="bg-slate-100 p-3 rounded-lg">
                      <div className="text-xs text-slate-500 mb-1">Unit Price</div>
                      <div className="font-bold text-slate-800">${data.ropCalculation.inputParameters.unitPrice}</div>
                   </div>
                </div>
              </section>
              
              {/* Base Calculations */}
              <section>
                <h3 className="text-sm font-bold text-slate-800 mb-3">Base Calculations</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                     <span className="text-xs text-slate-500 block mb-1">Base ROP</span>
                     <span className="font-bold text-slate-800 text-lg">{data.ropCalculation.baseCalculations.baseROP}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                     <span className="text-xs text-slate-500 block mb-1">EOQ</span>
                     <span className="font-medium text-slate-600">{data.ropCalculation.baseCalculations.baseEOQ}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                     <span className="text-xs text-slate-500 block mb-1">Base MAX</span>
                     <span className="font-medium text-slate-600">{data.ropCalculation.baseCalculations.baseMAX}</span>
                  </div>
                </div>
              </section>

              {/* Adjustments */}
              <section>
                 <h3 className="text-sm font-bold text-slate-800 mb-3">Adjustments</h3>
                 <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 p-3 text-sm text-slate-700 font-medium border-b border-slate-200">
                       Reason: {data.ropCalculation.adjustments.reason}
                    </div>
                    <div className="p-4 grid grid-cols-3 gap-6">
                       <div>
                          <div className="text-xs text-slate-500 mb-1">Duplicate Deduction</div>
                          <div className="font-bold text-slate-800">{data.ropCalculation.adjustments.duplicateDeduction}</div>
                       </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Obsolescence Deduction</div>
                          <div className="font-bold text-slate-800">{data.ropCalculation.adjustments.obsolescenceDeduction}</div>
                       </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Total Deduction</div>
                          <div className="font-bold text-slate-800">{data.ropCalculation.adjustments.totalDeduction}</div>
                       </div>
                    </div>
                 </div>
              </section>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialProfile;