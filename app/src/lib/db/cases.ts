import { and, desc, eq } from 'drizzle-orm';
import { db } from './index';
import { medicalCases, proposals, userProfiles } from './schema';
import type { MedicalCaseRequestInput } from '../validators/cases';
import type { CaseReviewInput, ProposalInput } from '../validators/backoffice';

export async function createMedicalCase(patientId: string, values: MedicalCaseRequestInput) {
  const [created] = await db
    .insert(medicalCases)
    .values({
      patientId,
      category: values.category,
      symptomsDescription: values.symptomsDescription,
      preferredVisitDate: values.preferredVisitDate || null,
      budgetRange: values.budgetRange || null,
      maxStayDays: values.maxStayDays ?? null,
      status: 'submitted',
    })
    .returning();

  return created;
}

export async function listPatientMedicalCases(patientId: string) {
  return db
    .select()
    .from(medicalCases)
    .where(eq(medicalCases.patientId, patientId))
    .orderBy(desc(medicalCases.createdAt));
}

export async function listPatientCasesWithProposals(patientId: string) {
  const rows = await db
    .select({
      case: medicalCases,
      proposal: proposals,
    })
    .from(medicalCases)
    .leftJoin(proposals, eq(proposals.caseId, medicalCases.id))
    .where(eq(medicalCases.patientId, patientId))
    .orderBy(desc(medicalCases.createdAt), desc(proposals.createdAt));

  const grouped = new Map<
    string,
    {
      case: typeof medicalCases.$inferSelect;
      proposals: (typeof proposals.$inferSelect)[];
    }
  >();

  for (const row of rows) {
    const existing = grouped.get(row.case.id);
    if (existing) {
      if (row.proposal) existing.proposals.push(row.proposal);
      continue;
    }

    grouped.set(row.case.id, {
      case: row.case,
      proposals: row.proposal ? [row.proposal] : [],
    });
  }

  return Array.from(grouped.values());
}

export async function acceptPatientProposal(patientId: string, proposalId: string) {
  const [proposal] = await db
    .select({ proposal: proposals, medicalCase: medicalCases })
    .from(proposals)
    .innerJoin(medicalCases, eq(proposals.caseId, medicalCases.id))
    .where(and(eq(proposals.id, proposalId), eq(medicalCases.patientId, patientId)))
    .limit(1);

  if (!proposal) return null;

  await db
    .update(proposals)
    .set({ isAccepted: false })
    .where(eq(proposals.caseId, proposal.medicalCase.id));

  const [accepted] = await db
    .update(proposals)
    .set({ isAccepted: true })
    .where(eq(proposals.id, proposalId))
    .returning();

  await db
    .update(medicalCases)
    .set({ status: 'confirmed' })
    .where(eq(medicalCases.id, proposal.medicalCase.id));

  return accepted;
}

export async function listAllMedicalCasesForBackoffice() {
  return db
    .select({
      case: medicalCases,
      patient: userProfiles,
    })
    .from(medicalCases)
    .innerJoin(userProfiles, eq(medicalCases.patientId, userProfiles.id))
    .orderBy(desc(medicalCases.createdAt));
}

export async function updateCaseReview(caseId: string, values: CaseReviewInput) {
  const [updated] = await db
    .update(medicalCases)
    .set({
      status: values.status,
      doctorSeverity: values.doctorSeverity || null,
      doctorNotes: values.doctorNotes || null,
    })
    .where(eq(medicalCases.id, caseId))
    .returning();

  return updated;
}

export async function createCaseProposal(caseId: string, values: ProposalInput) {
  const [created] = await db
    .insert(proposals)
    .values({
      caseId,
      hospitalName: values.hospitalName,
      estimatedCost: values.estimatedCost ? values.estimatedCost.toFixed(2) : null,
      itineraryDetails: {
        checklist: values.checklist
          ?.split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        dates: {
          treatment: values.treatmentDate || undefined,
        },
        accommodation: {
          notes: values.accommodationNotes || undefined,
        },
        transfers: values.transferNotes
          ? [
              {
                type: 'other' as const,
                notes: values.transferNotes,
              },
            ]
          : undefined,
      },
      adminNotes: values.adminNotes || null,
      isAccepted: false,
    })
    .returning();

  await db
    .update(medicalCases)
    .set({ status: 'proposed' })
    .where(eq(medicalCases.id, caseId));

  return created;
}
