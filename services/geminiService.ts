
import { GoogleGenAI } from "@google/genai";
import { BusinessSummary } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateBusinessInsights = async (
  summary: BusinessSummary
): Promise<string> => {
  try {
    const ai = getClient();
    
    // Prepare data context
    const dataContext = JSON.stringify(summary, null, 2);

    const prompt = `
      You are a strategic business consultant for a home-based food business.
      The business operates on a revenue-share model: 
      - "Total Sales Value" is what the customer pays.
      - "My Share" is the revenue the business owner actually gets.
      - "Shero Share" is the commission paid to the platform.
      
      Data Context:
      ${dataContext}

      Provide a strategic analysis:
      1. **Profitability Health**: Analyze 'Net Profit' (My Share - Expenses). Is the margin on 'My Share' sustainable?
      2. **Menu Optimization**: Look at top items. Are they high-margin items? Suggest focusing on items where 'My Share' is higher relative to effort.
      3. **Cost Control**: Suggest generic ways to reduce 'Expenses' based on the total expense value.
      4. **Growth**: Should they expand?
      
      Keep the tone professional, encouraging, and actionable. Use markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Error generating insights:", error);
    return "Error connecting to AI Consultant. Please check your internet connection.";
  }
};
