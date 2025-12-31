
import { GoogleGenAI, Type } from "@google/genai";

const AI_MODEL_REASONING = 'gemini-3-flash-preview'; // Switched to Flash for higher rate limits
const AI_MODEL_DOCUMENT = 'gemini-3-flash-preview';
const AI_MODEL_VISION = 'gemini-2.5-flash-image';

export class AIService {
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Helper to execute AI calls with exponential backoff on 429 errors.
   */
  private async withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        // Check for 429 Rate Limit error
        if (error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED' || error?.message?.includes('quota')) {
          const waitTime = Math.pow(2, i) * 2000 + Math.random() * 1000;
          console.warn(`Rate limit hit. Retrying in ${Math.round(waitTime)}ms... (Attempt ${i + 1}/${maxRetries})`);
          await this.delay(waitTime);
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }

  private optimizeHtml(html: string): string {
    if (!html) return "";
    return html
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  }

  private safeParseJSON(text: string) {
    try {
      const cleaned = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (e2) {
          console.error("Failed to parse JSON even with regex match", e2);
          throw new Error("Malformed JSON response from AI");
        }
      }
      throw e;
    }
  }

  async generateDynamicQuestions(data: any) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return this.withRetry(async () => {
      const prompt = `You are a Senior Legal Counsel at Orange. Based on this context:
      - Object: ${data.object}
      - Purpose: ${data.purpose}
      - Client: ${data.clientName}
      - Strategic Context: ${data.context}
      
      Generate exactly 5 critical, specific, and short follow-up questions for the contract template. 
      Focus on business risks, SLAs, and liability.
      Return ONLY a valid JSON array of strings.`;

      const response = await ai.models.generateContent({
        model: AI_MODEL_REASONING,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      });
      return this.safeParseJSON(response.text);
    });
  }

  async generateTemplate(data: any) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return this.withRetry(async () => {
      const prompt = `Generate a professional Orange Business contract template in HTML.
      Inputs:
      - Object: ${data.object}
      - Client: ${data.clientName}
      - Format: ${data.format}
      - Details: ${JSON.stringify(data.dynamicAnswers)}

      Requirements:
      1. Orange #FF7900 branding and professional legal structure.
      2. Use xxxx_VARIABLE placeholders for all specific details.
      3. Return JSON: { "title": "...", "category": "...", "html": "..." }.`;

      const response = await ai.models.generateContent({
        model: AI_MODEL_DOCUMENT,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              html: { type: Type.STRING }
            },
            required: ['title', 'category', 'html']
          }
        }
      });
      return this.safeParseJSON(response.text);
    });
  }

  async analyzeDocumentChunk(base64: string, mimeType: string, chunkIndex: number) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return this.withRetry(async () => {
      const response = await ai.models.generateContent({
        model: AI_MODEL_VISION,
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType } },
            { text: `This is part ${chunkIndex + 1} of a larger contract. Reconstruct the text exactly as seen but in clean HTML tags. Replace specific details (names, dates, amounts) with descriptive xxxx_VARIABLE_NAME placeholders. Focus only on structure and content extraction. Return ONLY the HTML snippet.` }
          ]
        }
      });
      return response.text;
    });
  }

  async synthesizeContract(chunks: string[]) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return this.withRetry(async () => {
      const combinedContent = chunks.join('\n\n');
      
      const prompt = `You have analyzed a legacy contract in parts. Here is the raw extracted HTML content from all parts:
      
      ${combinedContent}

      Task:
      1. Stitch these parts into a single, cohesive, and professional Orange Business Services contract template.
      2. Standardize the HTML structure. Use Orange branding (Headings in #FF7900).
      3. Ensure all placeholders follow the xxxx_VARIABLE_NAME format consistently.
      4. Remove duplicate headers/footers that might have appeared in multiple parts.
      5. Return JSON: { "title": "A descriptive title", "html": "The full synthesized HTML" }.`;

      const response = await ai.models.generateContent({
        model: AI_MODEL_DOCUMENT,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              html: { type: Type.STRING }
            },
            required: ['title', 'html']
          }
        }
      });
      return this.safeParseJSON(response.text);
    });
  }

  async processOCR(base64: string, mimeType: string) {
    const chunk = await this.analyzeDocumentChunk(base64, mimeType, 0);
    return this.synthesizeContract([chunk]);
  }

  async editContract(html: string, instruction: string, selection?: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const optimizedHtml = this.optimizeHtml(html);
    
    return this.withRetry(async () => {
      const prompt = `Task: Modify the contract HTML based on the following instruction.
      Instruction: "${instruction}"
      ${selection ? `Scope: Only change this specific text within the document: "${selection}"` : "Scope: Apply the change to the whole document where relevant."}
      
      Document HTML:
      ${optimizedHtml}

      Return ONLY the updated HTML. Do not include markdown blocks.`;

      const response = await ai.models.generateContent({
        model: AI_MODEL_DOCUMENT,
        contents: prompt
      });
      
      return response.text.replace(/```html|```/g, '').trim();
    });
  }
}

export const aiService = new AIService();
