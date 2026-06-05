import { desc, eq } from 'drizzle-orm';
import { db } from './index';
import { medicalCases } from './schema';
import type { MedicalCaseRequestInput } from '../validators/cases';

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
