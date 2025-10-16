import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

export const askAI = async (prompt: string): Promise<string> => {
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error en askAI:", error);
    throw error;
  }
};

export const askAIWithHistory = async (
  prompt: string,
  history: { role: string; parts: string }[],
): Promise<string> => {
  try {
    const chat = model.startChat({
      history: history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.parts }],
      })),
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error en askAIWithHistory:", error);
    throw error;
  }
};
