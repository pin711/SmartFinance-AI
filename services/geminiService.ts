import { GoogleGenAI } from "@google/genai";
import { StockHolding, Transaction, Account } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchStockPrice = async (symbol: string): Promise<{ price: number; currency: string } | null> => {
  try {
    const ai = getAI();
    // Using gemini-2.5-flash which supports googleSearch
    // Note: responseSchema and responseMimeType are not supported with googleSearch tool
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find the latest real-time stock price for ${symbol}. Return ONLY a valid JSON object with keys "price" (number) and "currency" (string). Do not use markdown code blocks.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    let text = response.text;
    if (!text) return null;
    
    // Clean up any potential markdown formatting
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return null;
  }
};

export const generateFinancialAdvice = async (
  accounts: Account[], 
  transactions: Transaction[], 
  stocks: StockHolding[]
): Promise<string> => {
  try {
    const ai = getAI();
    
    // Summarize data to send to LLM to avoid token limits if data is huge
    const accountSummary = accounts.map(a => `${a.name}: ${a.currency} ${a.balance}`).join(', ');
    const stockSummary = stocks.map(s => `${s.symbol} (${s.shares} shares @ ${s.averageCost})`).join(', ');
    const recentTransactions = transactions.slice(0, 20).map(t => `${t.date}: ${t.type} ${t.amount} (${t.category})`).join('\n');

    const prompt = `
      Analyze this personal financial data:
      Accounts: ${accountSummary}
      Holdings: ${stockSummary}
      Recent Transactions:
      ${recentTransactions}

      Provide a concise 3-bullet point summary of the financial health and 1 specific actionable advice.
      Keep the tone professional yet encouraging.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to generate advice at this time.";
  } catch (error) {
    console.error("Error generating advice:", error);
    return "AI service is currently unavailable. Please check your API key.";
  }
};