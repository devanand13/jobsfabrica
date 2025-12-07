import express, { type Request, type Response } from "express";
import { parseResumeFromS3 } from "../services/resumeParser";
import multer from "multer";
import { uploadFileToS3 } from "../services/s3upload";
import { authenticateJWT } from "../middleWare/authMiddleware";
import { logger } from "../lib/logger";
import { prisma } from "../lib/prisma";
import { ParsedResume } from "../models/parsedResume";
import OpenAI from "openai";
import { resumeTemplate } from "../templates/resumeTemplate";
import { generatePDF } from "../utils/pdfGenerator";

const resumeRouter = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const upload = multer({ storage: multer.memoryStorage() });

resumeRouter.get("/parse", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const bucket = "jobfabricaresumes";
    const key = req.body.key;
    const mimeType = "application/pdf";

    const text = await parseResumeFromS3(bucket, key, mimeType);

    res.json({ extractedText: text });
  } catch (err) {
    req.log.error(err, "Failed to parse resume");
    res.status(500).json({ error: "Failed to parse resume from S3" });
  }
});

resumeRouter.post("/upload", authenticateJWT, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { buffer, originalname, mimetype } = req.file;

    if (
      ![
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(mimetype)
    ) {
      return res.status(400).json({ error: "Invalid file type" });
    }

    const key = await uploadFileToS3(buffer, originalname, mimetype);

    res.json({
      message: "Upload successful",
      key,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

resumeRouter.post('/tailor', authenticateJWT, async (req,res)=>{
  try{
    const userId = req.user?.userId;

    const {jobDescription, sections} = req.body;


    if (!jobDescription || !sections) {
      return res.status(400).json({ message: "Missing job description or sections" });
    }

    const pgData = await prisma.userProfessionalDetails.findUnique({
      where: { userId }
    });
    
    const mongoData = await ParsedResume.findOne({ userId });

    const userResume = { ...pgData, ...mongoData };

    const prompt = `
    You are an expert resume writer and ATS optimizer.
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    USER RESUME:
    ${JSON.stringify(userResume, null, 2)}
    
    SECTIONS TO REWRITE:
    ${sections.join(", ")}
    
    RULES:
    - Do NOT invent fake experience
    - Use action verbs
    - Make bullets concise
    - Match job description language
    - Return valid JSON only

    OUTPUT FORMAT:
    {
      "summary": "",
      "experience": [],
      "projects": [],
      "skills": [],
      "atsAnalysis": {
        "score": 0,
        "matchedKeywords": [],
        "missingKeywords": []
      }
    }
    `;    

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      response_format: { type: "json_object" },
      messages: [
        { role: "user", content: prompt }
      ]
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      throw new Error("OpenAI returned empty content");
    }

    const tailored = JSON.parse(content);

    res.json({ tailored });

  }catch(err: unknown){
    logger.error(err);
    res.status(500).json({message:"Internal Server Error!"});
  }
})

resumeRouter.post('/generate', authenticateJWT, async (req, res)=>{
  try{
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tailored = req.body.tailored;
    if (!tailored) {
      return res.status(400).json({ message: "Tailored resume data missing" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const html = resumeTemplate(user, tailored);

    const pdfBuffer = await generatePDF(html);
  
    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=resume.pdf",
        "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }catch(err:unknown){
    logger.error(err);
    res.status(500).json({ message: "PDF generation failed" });
  }
})


export default resumeRouter;