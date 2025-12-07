import mongoose, { Schema, type Document } from "mongoose";

export interface IEducation {
  degree: string;
  institution: string;
  startDate?: string;
  endDate?: string;
}

export interface IExperience {
  title: string;
  company: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface IProject {
  name: string;
  description?: string;
  link?: string;
}

export interface IParsedResume extends Document {
  userId: number;
  education: IEducation[];
  experience: IExperience[];
  projects: IProject[];
  skills: string[];
  additionalInfo?: string[];
  rawText?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema<IEducation>({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  startDate: String,
  endDate: String,
});

const ExperienceSchema = new Schema<IExperience>({
  title: { type: String, required: true },
  company: { type: String, required: true },
  startDate: String,
  endDate: String,
  description: { type: [String], default: [] },
});

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  description: { type: [String], default: [] },
  link: String,
});

const ParsedResumeSchema = new Schema<IParsedResume>(
  {
    userId: { type: Number, required: true, index: true },

    education: { type: [EducationSchema], default: [] },
    experience: { type: [ExperienceSchema], default: [] },
    projects: { type: [ProjectSchema], default: [] },

    skills: { type: [String], default: [] },
    additionalInfo: { type: [String], default: [] },

    rawText: { type: String },
  },
  { timestamps: true },
);

export const ParsedResume =
  mongoose.models.ParsedResume || mongoose.model<IParsedResume>("ParsedResume", ParsedResumeSchema);
