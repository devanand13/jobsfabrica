import { OpenAI } from "openai";
import dotenv from "dotenv";
import { logger } from "../lib/logger";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ParsedResume {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    github?: string;
  };
  summary?: string;
  education?: {
    institution: string;
    degree: string;
    gpa?: string;
    startDate?: string;
    endDate?: string;
  }[];
  experience?: {
    title: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string[];
  }[];
  projects?: {
    name: string;
    link?: string;
    duration?: string;
    description?: string[];
  }[];
  skills?: string[];
  additionalInfo?: string[];
}

export async function safeParseResume(resumeText: string) {
  try {
    return await parseResumeWithAI(resumeText);
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "status" in err && err.status === 429) {
      logger.error("OpenAI rate limit exceeded. Try later.");
    }
    throw err;
  }
}

async function parseResumeWithAI(resumeText: string): Promise<ParsedResume> {
  const prompt = `
You are a resume parser. 
Extract the following fields from the resume text I provide. 
Return only JSON with the following structure:

{
  "personalInfo": {
    "name": "...",
    "email": "...",
    "phone": "...",
    "github": "..."
  },
  "summary": "...",
  "education": [{"institution":"...","degree":"...","gpa":"...","startDate":"...","endDate":"..."}],
  "experience": [{"title":"...","company":"...","location":"...","startDate":"...","endDate":"...","description":["..."]}],
  "projects": [{"name":"...","link":"...","duration":"...","description":["..."]}],
  "skills": ["..."],
  "additionalInfo": ["..."]
}

Resume text:
${resumeText}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) throw new Error("AI did not return any content");

  try {
    return JSON.parse(content) as ParsedResume;
  } catch (err) {
    logger.error(`Failed to parse AI response: ${content}`);
    throw err;
  }
}
