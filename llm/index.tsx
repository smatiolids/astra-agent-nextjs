import OpenAI from "openai";

let llm: OpenAI | null = null;

export function getLLM(): OpenAI {
  if (!llm) {
    llm = new OpenAI({
        apiKey: process.env.OPEN_AI_KEY!,
    });
    return llm;
  } else {
    return llm;
  }
}

export default llm;
