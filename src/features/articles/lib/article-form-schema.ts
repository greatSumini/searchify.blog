import { z } from "zod";
import {
  CreateArticleRequestSchema,
  ContentToneSchema,
  ContentLengthSchema,
  ReadingLevelSchema,
} from "./dto";

export const ArticleFormSchema = CreateArticleRequestSchema;

export type ArticleFormData = z.infer<typeof ArticleFormSchema>;

export const defaultArticleFormValues: ArticleFormData = {
  title: "",
  slug: "",
  keywords: [],
  description: "",
  content: "",
  styleGuideId: undefined,
  tone: undefined,
  contentLength: undefined,
  readingLevel: undefined,
  metaTitle: "",
  metaDescription: "",
};

// Export enums for use in form components
export { ContentToneSchema, ContentLengthSchema, ReadingLevelSchema };

// Helper to generate slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s가-힣-]/g, "") // Remove special chars except Korean
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove consecutive hyphens
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
};
