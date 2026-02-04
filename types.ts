export interface MaterialLocation {
  name: string;
  stock: number;
  lastUsed: string;
}

export interface DuplicateItem {
  materialCode: string;
  manufacturer: string;
  description: string;
  stockInHand: number;
  annualUsage: number;
  lastUsed: string;
  location: string;
  unitCost: number;
}

export interface ObsolescenceData {
  riskLevel: 'Low' | 'Medium' | 'High';
  yearsInStock: number;
  marketAvailability: string;
}

export interface ROPCalculation {
  suggestedROP: number;
  suggestedMAX: number;
  suggestedEOQ: number;
  requestedROP: number;
  requestedMAX: number;
  inputParameters: {
    annualUsage: number;
    leadTime: number;
    criticality: string;
    unitPrice: number;
  };
  baseCalculations: {
    baseROP: number;
    baseEOQ: number;
    baseMAX: number;
  };
  adjustments: {
    reason: string;
    duplicateDeduction: number;
    obsolescenceDeduction: number;
    totalDeduction: number;
  };
}

export interface MaterialProfile {
  materialName: string;
  materialCode: string;
  description: string;
  totalQuantity: number;
  averageUnitCost: number;
  locations: MaterialLocation[];
  equipmentParent: string[];
  lastUsedDate: string;
  
  // New fields for Bulk View
  materialType: string;
  stockingStatus: 'Stock Normally' | 'Do not Stock' | 'Stock Minimal';
  criticality: 'A' | 'B' | 'C' | 'D';
  estimatedAnnualUsage: number;

  duplicateAnalysis: {
    totalDuplicates: number;
    totalStockAcrossDuplicates: number;
    potentialSavings: number;
    duplicates: DuplicateItem[];
  };
  obsolescence: ObsolescenceData;
  ropMax: {
    reorderPoint: number;
    maxStock: number;
    currentStatus: 'Reorder' | 'Overstock' | 'Optimal';
  };
  ropCalculation: ROPCalculation;
}

export enum ViewState {
  HOME = 'HOME',
  PROFILE = 'PROFILE',
  BULK = 'BULK',
}

export type HistoryType = 'SEARCH' | 'UPLOAD';

export interface HistoryItem {
  id: string;
  type: HistoryType;
  label: string;
  timestamp: number;
  data: string | string[]; // Code for search, Codes array for upload
}