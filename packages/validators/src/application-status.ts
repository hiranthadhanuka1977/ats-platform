import { z } from "zod";

const pipelineStatusSchema = z.enum([
  "submitted",
  "under_review",
  "shortlisted",
  "interview",
  "interview_scheduled",
  "interview_completed",
  "offered",
  "hired",
  "rejected",
  "withdrawn",
]);

export const applicationStatusPatchSchema = z.object({
  status: pipelineStatusSchema,
  reason: z.string().trim().optional(),
  note: z.string().trim().optional(),
  notifyCandidate: z.boolean().optional(),
  withdrawalSource: z.string().trim().optional(),
  offerAccepted: z.boolean().optional(),
  cancelInterview: z.boolean().optional(),
  expectedUpdatedAt: z.string().datetime().optional(),
});

export const applicationReopenSchema = z.object({
  targetStatus: z.enum(["under_review", "shortlisted"]),
  reason: z.string().trim().min(1, "Reopen reason is required."),
  note: z.string().trim().optional(),
  expectedUpdatedAt: z.string().datetime().optional(),
});

export const applicationStatusUndoSchema = z.object({
  previousStatus: pipelineStatusSchema,
  currentStatus: pipelineStatusSchema,
  expectedUpdatedAt: z.string().datetime(),
});

export type ApplicationStatusPatchInput = z.infer<typeof applicationStatusPatchSchema>;
export type ApplicationReopenInput = z.infer<typeof applicationReopenSchema>;
export type ApplicationStatusUndoInput = z.infer<typeof applicationStatusUndoSchema>;
