import { z } from "zod";

const allowedDurations = [15, 30, 45, 60, 90, 120] as const;

export const scheduleInterviewSchema = z.object({
  interviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Interview date is required."),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time is required."),
  durationMinutes: z.coerce
    .number()
    .int()
    .refine(
      (value): value is (typeof allowedDurations)[number] =>
        (allowedDurations as readonly number[]).includes(value),
      { message: "Duration must be 15, 30, 45, 60, 90, or 120 minutes." },
    ),
  schedulingTimeZone: z.string().trim().min(1).max(64),
  notifyCandidateEmail: z.boolean().optional(),
});

export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;
