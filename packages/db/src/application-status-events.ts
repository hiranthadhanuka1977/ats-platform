import type { ApplicationStatus, Prisma } from "@prisma/client";

/** Prisma client or interactive transaction delegate. */
export type ApplicationStatusEventDb = Pick<Prisma.TransactionClient, "applicationStatusEvent">;

export type RecordApplicationStatusEventInput = {
  applicationId: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  reason?: string | null;
  note?: string | null;
  changeSource?: string | null;
  changedAt?: Date;
  changedByStaffId?: string | null;
};

export async function recordApplicationStatusEvent(
  prisma: ApplicationStatusEventDb,
  input: RecordApplicationStatusEventInput,
): Promise<void> {
  if (input.fromStatus === input.toStatus) return;

  const data: Prisma.ApplicationStatusEventUncheckedCreateInput = {
    applicationId: input.applicationId,
    fromStatus: input.fromStatus,
    toStatus: input.toStatus,
    reason: input.reason ?? null,
    note: input.note ?? null,
    changeSource: input.changeSource ?? null,
    changedAt: input.changedAt ?? new Date(),
    changedByStaffId: input.changedByStaffId ?? null,
  };

  await prisma.applicationStatusEvent.create({ data });
}
