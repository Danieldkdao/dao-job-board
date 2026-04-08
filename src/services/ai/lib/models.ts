import { envServer } from "@/data/env/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const google = createGoogleGenerativeAI({
  apiKey: envServer.GEMINI_API_KEY,
});
