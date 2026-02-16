import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ProjectFile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = 'gemini-3-flash-preview';

export const generatePythonCode = async (prompt: string, currentFile: ProjectFile): Promise<string> => {
  const systemPrompt = `
    You are an expert Python Developer.
    Your task is to generate or modify Python code based on the user's request.
    
    Context:
    File Name: ${currentFile.name}
    Current Content: ${currentFile.content}
    
    Instructions:
    1. If the user asks for a new feature, provide the full updated code for the file.
    2. If the user asks for a new file, provide the code for that file (the user will manually create it, you just provide text).
    3. Return ONLY the raw code/content. Do not use markdown backticks.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Error generating Python code:", error);
    throw new Error("Failed to generate code.");
  }
};

export const simulatePythonExecution = async (files: ProjectFile[]): Promise<string> => {
  const mainFile = files.find(f => f.name === 'main.py') || files[0];
  const otherFiles = files.filter(f => f.name !== mainFile.name).map(f => `--- ${f.name} ---\n${f.content}`).join('\n\n');

  const systemPrompt = `
    You are a Python Runtime Simulator.
    Your task is to predict the console output of the provided Python project.
    
    Project Context:
    The user is running: python ${mainFile.name}
    
    Supporting Files (virtual filesystem):
    ${otherFiles}
    
    Rules:
    1. Simulate the execution of ${mainFile.name}.
    2. If it imports pandas/matplotlib, simulate their typical text output (e.g., DataFrame printouts).
    3. For plots (plt.show()), output a text placeholder like [Graph: Bar Chart displayed].
    4. Return ONLY the raw console output.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: `Execute this code:\n\n${mainFile.content}`,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "Execution finished with no output.";
  } catch (error) {
    return "Error: Runtime simulation failed.";
  }
};

export const getTutorExplanation = async (query: string, files: ProjectFile[]): Promise<string> => {
    const context = files.map(f => `File: ${f.name}\n${f.content}`).join('\n\n');
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: modelName,
            contents: `Question: ${query}\n\nProject Context:\n${context}`,
            config: {
                systemInstruction: "You are a helpful Senior Python Data Engineer. Answer questions about the code, libraries (pandas, matplotlib), or data concepts."
            }
        });
        return response.text || "I couldn't generate an explanation.";
    } catch (e) {
        return "Error connecting to tutor service.";
    }
}