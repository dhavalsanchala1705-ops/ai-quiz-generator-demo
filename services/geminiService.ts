
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Question, QuestionType } from "../types";

export const generateQuizQuestions = async (
  subject: string,
  chapter: string,
  difficulty: Difficulty,
  count: number = 5,
  apiKey?: string
): Promise<Question[]> => {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: key });
  const prompt = `Generate ${count} mixed-format questions for the subject "${subject}", chapter "${chapter}". 
  Difficulty: "${difficulty}". 
  Provide a mix of these types:
  1. "mcq": Multiple choice with 4 options.
  2. "tf": True or False question.
  3. "fitb": Fill in the blank (short answer).
  
  Each "mcq" and "tf" must have a "correctAnswerIndex". 
  Each "fitb" must have a "correctAnswerText". 
  Include an explanation for all questions.`;


  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  let attempts = 0;
  const maxAttempts = 3;
  let response;

  while (attempts < maxAttempts) {
    try {
      response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ["mcq", "tf", "fitb"],
                  description: "The format of the question."
                },
                text: { type: Type.STRING, description: "The quiz question text." },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Options for mcq (4) or tf (2). Leave empty for fitb."
                },
                correctAnswerIndex: {
                  type: Type.INTEGER,
                  description: "Zero-based index of the correct option for mcq/tf."
                },
                correctAnswerText: {
                  type: Type.STRING,
                  description: "The exact correct string for fitb."
                },
                explanation: {
                  type: Type.STRING,
                  description: "A short explanation of the correct answer."
                }
              },
              required: ["type", "text", "explanation"],
              propertyOrdering: ["type", "text", "options", "correctAnswerIndex", "correctAnswerText", "explanation"]
            }
          }
        }
      });
      break; // Success
    } catch (error: any) {
      console.error(`Attempt ${attempts + 1} failed:`, error);
      if (error.status === 429 || (error.message && error.message.includes("429"))) {
        attempts++;
        if (attempts >= maxAttempts) throw new Error("Our AI is currently busy (Quota Exceeded). Please try again in a minute.");
        console.log(`Waiting ${attempts * 2} seconds before retrying...`);
        await delay(attempts * 2000); // 2s, 4s wait
      } else {
        throw error; // Other errors, rethrow immediately
      }
    }
  }

  try {
    let rawJson = response.text?.trim();
    if (!rawJson) {
      if (response.data && typeof response.data === 'object') { // Fallback if direct text isn't available
        rawJson = JSON.stringify(response.data);
      } else {
        throw new Error("Empty response from AI");
      }
    }

    // Remove markdown code blocks if present (common behavior of Gemini)
    if (rawJson.startsWith("```")) {
      rawJson = rawJson.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "");
    }
    const questions: any[] = JSON.parse(rawJson);
    return questions.map((q, idx) => ({
      ...q,
      id: `q-${Date.now()}-${idx}`
    }));
  } catch (error) {
    console.error("AI Generation failed, switching to backup questions:", error);
    // Fallback to static questions
    const { getFallbackQuestions } = await import("./questionBank");
    return getFallbackQuestions(count, subject);
  }
};
