import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

// 1. Read .env manualy to avoid dependency issues with dotenv
const envPath = path.resolve(process.cwd(), ".env");
const envFile = fs.readFileSync(envPath, "utf-8");

// Parse VITE_GEMINI_API_KEY
// Handles lines like: VITE_GEMINI_API_KEY= AIza...
const match = envFile.match(/VITE_GEMINI_API_KEY=\s*(.*)/);
if (!match) {
    console.error("Could not find VITE_GEMINI_API_KEY in .env");
    process.exit(1);
}

const apiKey = match[1].trim(); // trim removes the leading space if present
console.log("Using API Key (last 4 chars):", apiKey.slice(-4));

const ai = new GoogleGenAI({ apiKey });

(async () => {
    try {
        console.log("Checking available models via REST API...");
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const resp = await fetch(url);
        const data = await resp.json();

        if (data.models) {
            console.log("Available models:");
            data.models.forEach(m => {
                if (m.name.includes("flash")) {
                    console.log(` - ${m.name} (Supported methods: ${m.supportedGenerationMethods})`);
                }
            });
        } else {
            console.log("No models returned or error:", JSON.stringify(data));
        }


        console.log("\nRetrying generation with model: gemini-flash-latest...");
        const ai2 = new GoogleGenAI({ apiKey });
        const response = await ai2.models.generateContent({
            model: "gemini-flash-latest",
            contents: "Say hello from Gemini Flash Latest!",
        });
        console.log("Success! Response:", response.text?.substring(0, 100));

    } catch (error) {
        console.error("Error/Exception:", error);
    }
})();
