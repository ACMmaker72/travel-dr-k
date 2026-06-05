import { z } from 'zod';

export const caseStatusOptions = [
  'submitted',
  'under_review',
  'proposed',
  'confirmed',
  'completed',
] as const;

export const doctorSeverityOptions = [
  'routine',
  'specialized',
  'critical',
  'ineligible',
] as const;

export const caseReviewSchema = z.object({
  status: z.enum(caseStatusOptions),
  doctorSeverity: z.enum(doctorSeverityOptions).optional(),
  doctorNotes: z.string().trim().max(3000, '의료 검토 메모는 3000자 이하로 입력하세요').optional(),
});

export const proposalSchema = z.object({
  hospitalName: z.string().trim().min(1, '병원명을 입력하세요').max(160, '병원명은 160자 이하로 입력하세요'),
  estimatedCost: z.coerce
    .number()
    .positive('예상 비용은 0보다 커야 합니다')
    .max(10000000, '예상 비용이 너무 큽니다')
    .optional(),
  treatmentDate: z.string().trim().max(80, '치료 일정은 80자 이하로 입력하세요').optional(),
  accommodationNotes: z.string().trim().max(1000, '숙박 메모는 1000자 이하로 입력하세요').optional(),
  transferNotes: z.string().trim().max(1000, '이동 메모는 1000자 이하로 입력하세요').optional(),
  checklist: z.string().trim().max(2000, '체크리스트는 2000자 이하로 입력하세요').optional(),
  adminNotes: z.string().trim().max(3000, '관리자 메모는 3000자 이하로 입력하세요').optional(),
});

export type CaseReviewInput = z.infer<typeof caseReviewSchema>;
export type ProposalInput = z.infer<typeof proposalSchema>;
