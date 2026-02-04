import { GoogleGenAI, Type } from "@google/genai";
import { MaterialProfile } from "../types";

const apiKey = process.env.API_KEY;
// Using a safe fallback if env is missing during certain dev flows, though usually injected
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const MATERIAL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    materialName: { type: Type.STRING },
    materialCode: { type: Type.STRING },
    description: { type: Type.STRING },
    totalQuantity: { type: Type.NUMBER },
    averageUnitCost: { type: Type.NUMBER },
    
    // New fields
    materialType: { type: Type.STRING },
    stockingStatus: { type: Type.STRING, enum: ['Stock Normally', 'Do not Stock', 'Stock Minimal'] },
    criticality: { type: Type.STRING, enum: ['A', 'B', 'C', 'D'] },
    estimatedAnnualUsage: { type: Type.NUMBER },

    locations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          stock: { type: Type.NUMBER },
          lastUsed: { type: Type.STRING },
        },
      },
    },
    equipmentParent: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    lastUsedDate: { type: Type.STRING },
    duplicateAnalysis: {
      type: Type.OBJECT,
      properties: {
        totalDuplicates: { type: Type.NUMBER },
        totalStockAcrossDuplicates: { type: Type.NUMBER },
        potentialSavings: { type: Type.NUMBER },
        duplicates: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              materialCode: { type: Type.STRING },
              manufacturer: { type: Type.STRING },
              description: { type: Type.STRING },
              stockInHand: { type: Type.NUMBER },
              annualUsage: { type: Type.NUMBER },
              lastUsed: { type: Type.STRING },
              location: { type: Type.STRING },
              unitCost: { type: Type.NUMBER },
            },
          },
        },
      },
    },
    obsolescence: {
      type: Type.OBJECT,
      properties: {
        riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
        yearsInStock: { type: Type.NUMBER },
        marketAvailability: { type: Type.STRING },
      },
    },
    ropMax: {
      type: Type.OBJECT,
      properties: {
        reorderPoint: { type: Type.NUMBER },
        maxStock: { type: Type.NUMBER },
        currentStatus: { type: Type.STRING, enum: ['Reorder', 'Overstock', 'Optimal'] },
      },
    },
    ropCalculation: {
      type: Type.OBJECT,
      properties: {
        suggestedROP: { type: Type.NUMBER },
        suggestedMAX: { type: Type.NUMBER },
        suggestedEOQ: { type: Type.NUMBER },
        requestedROP: { type: Type.NUMBER },
        requestedMAX: { type: Type.NUMBER },
        inputParameters: {
          type: Type.OBJECT,
          properties: {
            annualUsage: { type: Type.NUMBER },
            leadTime: { type: Type.NUMBER },
            criticality: { type: Type.STRING },
            unitPrice: { type: Type.NUMBER },
          }
        },
        baseCalculations: {
          type: Type.OBJECT,
          properties: {
            baseROP: { type: Type.NUMBER },
            baseEOQ: { type: Type.NUMBER },
            baseMAX: { type: Type.NUMBER },
          }
        },
        adjustments: {
          type: Type.OBJECT,
          properties: {
            reason: { type: Type.STRING },
            duplicateDeduction: { type: Type.NUMBER },
            obsolescenceDeduction: { type: Type.NUMBER },
            totalDeduction: { type: Type.NUMBER },
          }
        }
      }
    }
  },
};

export const analyzeMaterialCode = async (code: string): Promise<MaterialProfile> => {
  try {
    const prompt = `
      Generate a realistic material profile for a mining company inventory item with code "${code}".
      Assume this item might be a mechanical part (bearing, belt, filter, hydraulic pump) used in heavy mining equipment.
      
      CRITICAL INSTRUCTIONS:
      1. 'equipmentParent' MUST be a list of NUMERIC EQUIPMENT CODES (e.g., "600000236064", "500000129982").
      2. 'stockingStatus' MUST be one of: 'Stock Normally', 'Do not Stock', 'Stock Minimal'.
      3. 'criticality' MUST be 'A', 'B', 'C', or 'D'.
      4. Populate 'estimatedAnnualUsage'.
      5. CREATE DATA about POTENTIAL DUPLICATES in 'duplicateAnalysis'.
      6. GENERATE DETAILED ROP CALCULATIONS in 'ropCalculation'.
      
      Ensure the response is valid JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: MATERIAL_SCHEMA,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as MaterialProfile;
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback mock data in case of API failure or missing key
    return getMockData(code);
  }
};

export const generateBulkAnalysis = async (codes: string[]): Promise<MaterialProfile[]> => {
    // Generate 3 unique mock items for the demo based on the codes provided
    const demoCodes = codes.length > 0 ? codes.slice(0, 3) : ['401121145', '401121146', '401121147'];
    
    // We want slightly different data for each to show filtering
    return demoCodes.map((code, index) => {
        const base = getMockData(code);
        if (index === 1) {
            base.materialType = "Consumable";
            base.criticality = "C";
            base.stockingStatus = "Do not Stock";
            base.totalQuantity = 1200;
            base.duplicateAnalysis.totalDuplicates = 0;
            base.duplicateAnalysis.duplicates = [];
        } else if (index === 2) {
             base.materialType = "Hydraulic";
             base.criticality = "A";
             base.stockingStatus = "Stock Minimal";
             base.totalQuantity = 5;
        }
        return base;
    });
}

// Fallback logic for robust demo
const getMockData = (code: string): MaterialProfile => ({
  materialName: "Spherical Roller Bearing 22216",
  materialCode: code,
  description: "Heavy duty spherical roller bearing for conveyor pulley",
  totalQuantity: 45,
  averageUnitCost: 250,
  materialType: "Spare Part",
  stockingStatus: "Stock Normally",
  criticality: "B",
  estimatedAnnualUsage: 120,
  locations: [
    { name: "Site A - Warehouse 1", stock: 20, lastUsed: "2023-10-15" },
    { name: "Site B - Central", stock: 25, lastUsed: "2022-05-20" },
  ],
  equipmentParent: ["600000236064", "600000998877", "500200112233"],
  lastUsedDate: "2023-10-15",
  duplicateAnalysis: {
    totalDuplicates: 2,
    totalStockAcrossDuplicates: 120,
    potentialSavings: 30000,
    duplicates: [
      {
        materialCode: "998877665",
        manufacturer: "SKF",
        description: "Bearing 22216 EK",
        stockInHand: 80,
        annualUsage: 5,
        lastUsed: "2021-01-10",
        location: "Site A - Warehouse 1",
        unitCost: 280
      },
      {
        materialCode: "112233445",
        manufacturer: "Timken",
        description: "Roller Bearing 22216-E1",
        stockInHand: 40,
        annualUsage: 12,
        lastUsed: "2023-11-01",
        location: "Site C",
        unitCost: 240
      }
    ]
  },
  obsolescence: {
    riskLevel: "High",
    yearsInStock: 2.5,
    marketAvailability: "Readily Available"
  },
  ropMax: {
    reorderPoint: 10,
    maxStock: 50,
    currentStatus: "Overstock"
  },
  ropCalculation: {
    suggestedROP: 10,
    suggestedMAX: 50,
    suggestedEOQ: 15,
    requestedROP: 12,
    requestedMAX: 60,
    inputParameters: {
      annualUsage: 120,
      leadTime: 30,
      criticality: "B",
      unitPrice: 250
    },
    baseCalculations: {
      baseROP: 12,
      baseEOQ: 15,
      baseMAX: 60
    },
    adjustments: {
      reason: "High duplication detected across sites",
      duplicateDeduction: 2,
      obsolescenceDeduction: 0,
      totalDeduction: 2
    }
  }
});
