
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, Question, QuestionType } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const generateQuizQuestions = async (
  subject: string,
  chapter: string,
  difficulty: Difficulty,
  count: number = 5
): Promise<Question[]> => {
  const prompt = `Generate ${count} mixed-format questions for the subject "${subject}", chapter "${chapter}". 
  Difficulty: "${difficulty}". 
  Provide a mix of these types:
  1. "mcq": Multiple choice with 4 options.
  2. "tf": True or False question.
  3. "fitb": Fill in the blank (short answer).
  
  Each "mcq" and "tf" must have a "correctAnswerIndex". 
  Each "fitb" must have a "correctAnswerText". 
  Include an explanation for all questions.`;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
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

  try {
    let rawJson = response.text().trim();
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
    console.error("Failed to parse AI response:", error);
    console.log("Raw Response was:", response.text());
    throw new Error("The AI returned an invalid response format. Please try again.");
  }
};
