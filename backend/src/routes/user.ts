import express, { type Request, type Response } from "express";
import { z } from "zod";

import { authenticateJWT } from "../middleWare/authMiddleware";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";
import type { Prisma } from "../generated/prisma/client";
import { ParsedResume } from "../models/parsedResume";

const userRouter = express.Router();

const educationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
});

const experienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.array(z.string()).optional(),
});

const projectSchema = z.object({
  name: z.string(),
  link: z.string().optional(),
  duration: z.string().optional(),
  description: z.array(z.string()).optional(),
});

const professionalSchema = z.object({
  education: z.array(educationSchema).optional(),
  experience: z.array(experienceSchema).optional(),
  projects: z.array(projectSchema).optional(),
  skills: z.array(z.string()).optional(),
  additionalInfo: z.array(z.string()).optional(),
});

const summaryAndSkillsSchema = z.object({
  summary: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

const professionalRequestSchema = z.object({
  professional: professionalSchema,
  summaryAndSkills: summaryAndSkillsSchema,
});


userRouter.get("/profile", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) {
      logger.fatal(`User missing in the database User ID ::: ${userId}`);
      return res.status(401).json({ message: "User not found!" });
    }

    res.status(200).json({ user });
  } catch (err: unknown) {
    logger.error(`Internal Error : ${err}`);
    res.status(500).json({ message: "Internal Error" });
  }
});

userRouter.put("/profile", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const allowedFields = ["name"];
    const sentFields = Object.keys(req.body);
    const invalidFields = sentFields.filter((field) => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `You cannot update these fields: ${invalidFields.join(", ")}`,
      });
    }

    const updateData: Prisma.UserUpdateInput = {};

    if ("name" in req.body) {
      if (typeof req.body.name !== "string" || req.body.name.trim().length === 0) {
        return res.status(400).json({ message: "Name must be a non-empty string." });
      }
      updateData.name = req.body.name.trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, name: true, createdAt: true },
    });

    res.status(200).json({ updatedUser });
  } catch (err: unknown) {
    logger.error(err);
    res.status(500).json({ message: "Internal Server error!" });
  }
});

userRouter.get("/professional", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const professionalDetails = await prisma.userProfessionalDetails.findUnique({
      where: { userId },
      select: { summary: true, topSkills: true },
    });

    const parsedResume = await ParsedResume.findOne({ userId });

    const response = {
      professional: {
        education: parsedResume?.education || [],
        experience: parsedResume?.experience || [],
        projects: parsedResume?.projects || [],
        skills: parsedResume?.skills || [],
        additionalInfo: parsedResume?.additionalInfo || [],
      },
      summaryAndSkills: {
        summary: professionalDetails?.summary || "",
        skills: professionalDetails?.topSkills || [],
        additionalInfo: parsedResume?.additionalInfo || [],
      },
    };

    res.status(200).json(response);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

userRouter.put("/professional", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Zod validation
    const parsedBody = professionalRequestSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ message: "Invalid input", errors: parsedBody.error.format() });
    }

    const { professional, summaryAndSkills } = parsedBody.data;

    // Postgres upsert
    const pgData = {
      summary: summaryAndSkills.summary || "",
      topSkills: summaryAndSkills.skills || [],
    };

    const pgResult = await prisma.userProfessionalDetails.upsert({
      where: { userId },
      create: { userId, ...pgData },
      update: pgData,
    });

    // MongoDB upsert
    const mongoData = {
      userId,
      education: professional.education || [],
      experience: professional.experience || [],
      projects: professional.projects || [],
      skills: professional.skills || [],
      additionalInfo: professional.additionalInfo || [],
      rawText: JSON.stringify(professional),
    };

    const mongoResult = await ParsedResume.findOneAndUpdate({ userId }, mongoData, {
      upsert: true,
      new: true,
    });

    res.json({
      message: "Profile updated successfully",
      postgres: pgResult,
      mongo: mongoResult,
    });
  } catch (err) {
    logger.error(err);
    res.status(400).json({ message: "Invalid input" });
  }
});

export default userRouter;
