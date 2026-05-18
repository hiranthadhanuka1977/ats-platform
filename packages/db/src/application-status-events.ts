import type { ApplicationStatus, PrismaClient } from "@prisma/client";

export type RecordApplicationStatusEventInput = {
  applicationId: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  changedAt?: Date;
  changedByStaffId?: string | null;
};

export async function recordApplicationStatusEvent(
  prisma: PrismaClient,
  input: RecordApplicationStatusEventInput,
): Promise<void> {
  if (input.fromStatus === input.toStatus) return;

  await prisma.applicationStatusEvent.create({
    data: {
      applicationId: input.applicationId,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      changedAt: input.changedAt ?? new Date(),
      changedByStaffId: input.changedByStaffId ?? null,
    },
  });
}
