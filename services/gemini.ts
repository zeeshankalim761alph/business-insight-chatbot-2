import { GoogleGenAI, Chat } from "@google/genai";
import { BusinessContext, Message, Sender } from "../types";

const createSystemInstruction = (context: BusinessContext): string => {
  return `
You are an expert Business Analyst and Strategy Consultant AI named "BizInsight". 
Your goal is to help users understand their business data, analyze trends, and provide actionable strategic advice.

CURRENT BUSINESS CONTEXT:
- Industry: ${context.industry}
- Monthly Revenue: $${context.monthlyRevenue}
- Monthly Expenses: $${context.monthlyExpenses}
- Net Profit: $${context.monthlyRevenue - context.monthlyExpenses}
- Customer Base: ${context.customerCount}
- Recent Trend: ${context.trend}
- Key Goals: ${context.goals || 'General growth and stability'}

RESPONSE GUIDELINES:
1. **Tone:** Professional, encouraging, and objective.
2. **Structure:**
   - Start with a direct answer or summary.
   - Use Bullet points for key insights.
   - Provide "Actionable Recommendations" at the end.
3. **Content:**
   - Focus on Sales, Marketing, Cost Optimization, SWOT, and Growth Strategies.
   - If the user asks about their specific numbers, refer to the "Current Business Context" data provided above.
   - If the user asks "Why are sales decreasing?", analyze potential causes relevant to the ${context.industry} industry (e.g., seasonality, competition, market shifts) and suggest specific remedies.
4. **Formatting:**
   - Use simple Markdown (bolding **text** for emphasis).
   - Keep paragraphs concise.

Always prioritize practical, high-impact advice over generic business jargon.
`;
};

export const generateResponse = async (
  history: Message[],
  currentInput: string,
  context: BusinessContext
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Transform history for the Chat model
    // Note: We only take the last few turns to keep context relevant and avoid token limits,
    // though Gemini has a large window, it's good practice for snappy chat apps.
    const validHistory = history.map(msg => ({
      role: msg.sender === Sender.USER ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const chat: Chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      history: validHistory,
      config: {
        systemInstruction: createSystemInstruction(context),
        temperature: 0.7, // Balance between creativity and analytical precision
      },
    });

    const result = await chat.sendMessage({ message: currentInput });
    
    return result.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to get response from AI service.");
  }
};