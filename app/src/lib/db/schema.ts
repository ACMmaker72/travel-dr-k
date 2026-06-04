import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['patient', 'doctor', 'admin']);
export const medicalCaseStatusEnum = pgEnum('medical_case_status', [
  'submitted',
  'under_review',
  'proposed',
  'confirmed',
  'completed',
]);
export const doctorSeverityEnum = pgEnum('doctor_severity', [
  'routine',
  'specialized',
  'critical',
  'ineligible',
]);

export type ItineraryDetails = {
  dates?: {
    arrival?: string;
    treatment?: string;
    departure?: string;
  };
  accommodation?: {
    name?: string;
    nights?: number;
    notes?: string;
  };
  transfers?: Array<{
    type: 'airport' | 'hospital' | 'hotel' | 'other';
    date?: string;
    notes?: string;
  }>;
  checklist?: string[];
};

export const userProfiles = pgTable(
  'user_profiles',
  {
    id: uuid('id').primaryKey(),
    role: userRoleEnum('role').notNull().default('patient'),
    fullName: text('full_name').notNull(),
    country: text('country'),
    preferredLanguage: text('preferred_language').notNull().default('en'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => ({
    roleIdx: index('user_profiles_role_idx').on(t.role),
    countryIdx: index('user_profiles_country_idx').on(t.country),
  }),
);

export const medicalCases = pgTable(
  'medical_cases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => userProfiles.id, { onDelete: 'cascade' }),
    category: text('category').notNull(),
    symptomsDescription: text('symptoms_description').notNull(),
    preferredVisitDate: text('preferred_visit_date'),
    budgetRange: text('budget_range'),
    maxStayDays: integer('max_stay_days'),
    status: medicalCaseStatusEnum('status').notNull().default('submitted'),
    doctorSeverity: doctorSeverityEnum('doctor_severity'),
    doctorNotes: text('doctor_notes'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => ({
    patientIdx: index('medical_cases_patient_idx').on(t.patientId),
    statusIdx: index('medical_cases_status_idx').on(t.status, t.createdAt),
    categoryIdx: index('medical_cases_category_idx').on(t.category),
    severityIdx: index('medical_cases_severity_idx').on(t.doctorSeverity),
  }),
);

export const caseAttachments = pgTable(
  'case_attachments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    caseId: uuid('case_id')
      .notNull()
      .references(() => medicalCases.id, { onDelete: 'cascade' }),
    fileUrl: text('file_url').notNull(),
    fileType: text('file_type').notNull(),
    uploadedAt: timestamp('uploaded_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    caseIdx: index('case_attachments_case_idx').on(t.caseId),
    fileTypeIdx: index('case_attachments_file_type_idx').on(t.fileType),
  }),
);

export const proposals = pgTable(
  'proposals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    caseId: uuid('case_id')
      .notNull()
      .references(() => medicalCases.id, { onDelete: 'cascade' }),
    hospitalName: text('hospital_name').notNull(),
    estimatedCost: numeric('estimated_cost', { precision: 12, scale: 2 }),
    itineraryDetails: jsonb('itinerary_details').$type<ItineraryDetails>(),
    adminNotes: text('admin_notes'),
    isAccepted: boolean('is_accepted').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => ({
    caseIdx: index('proposals_case_idx').on(t.caseId),
    acceptedIdx: index('proposals_accepted_idx').on(t.isAccepted),
  }),
);

export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
  medicalCases: many(medicalCases),
}));

export const medicalCasesRelations = relations(medicalCases, ({ one, many }) => ({
  patient: one(userProfiles, {
    fields: [medicalCases.patientId],
    references: [userProfiles.id],
  }),
  attachments: many(caseAttachments),
  proposals: many(proposals),
}));

export const caseAttachmentsRelations = relations(caseAttachments, ({ one }) => ({
  medicalCase: one(medicalCases, {
    fields: [caseAttachments.caseId],
    references: [medicalCases.id],
  }),
}));

export const proposalsRelations = relations(proposals, ({ one }) => ({
  medicalCase: one(medicalCases, {
    fields: [proposals.caseId],
    references: [medicalCases.id],
  }),
}));

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type MedicalCase = typeof medicalCases.$inferSelect;
export type NewMedicalCase = typeof medicalCases.$inferInsert;
export type CaseAttachment = typeof caseAttachments.$inferSelect;
export type NewCaseAttachment = typeof caseAttachments.$inferInsert;
export type Proposal = typeof proposals.$inferSelect;
export type NewProposal = typeof proposals.$inferInsert;
