
import { Question, QuestionType, Difficulty } from "../types";

// Placeholder for the 150+ questions. 
// You can paste your questions here in this format.
export const STATIC_QUESTION_BANK: Question[] = [
    {
        id: "static-1",
        type: QuestionType.MCQ,
        text: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswerIndex: 2,
        explanation: "Paris is the capital and most populous city of France."
    },
    {
        id: "static-2",
        type: QuestionType.TF,
        text: "Water boils at 100 degrees Celsius at sea level.",
        correctAnswerIndex: 0, // 0 for True, 1 for False usually, or handle specifically
        options: ["True", "False"],
        explanation: "This is a standard physical property of water."
    },
    {
        id: "static-3",
        type: QuestionType.FITB,
        text: "The powerhouse of the cell is the ____.",
        correctAnswerText: "mitochondria",
        explanation: "Mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions."
    },
    // ... Add more questions here or ask me to convert your PDF content
];

export const getFallbackQuestions = (count: number, subject?: string): Question[] => {
    // Simple filter or random selection
    // If we had subject tags on questions, we could filter by subject
    const shuffled = [...STATIC_QUESTION_BANK].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
