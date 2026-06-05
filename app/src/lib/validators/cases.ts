import { z } from 'zod';

export const medicalCategoryOptions = [
  'screening',
  'dental',
  'dermatology_aesthetics',
  'orthopedics',
  'fertility',
  'advanced_therapeutics',
] as const;

export type MedicalCategory = (typeof medicalCategoryOptions)[number];

export const medicalCaseRequestSchema = z.object({
  category: z.enum(medicalCategoryOptions, {
    message: '진료 카테고리를 선택하세요',
  }),
  symptomsDescription: z
    .string()
    .trim()
    .min(20, '증상과 목표를 20자 이상 입력하세요')
    .max(3000, '증상과 목표는 3000자 이하로 입력하세요'),
  preferredVisitDate: z.string().trim().max(80, '방문 희망 시기는 80자 이하로 입력하세요').optional(),
  budgetRange: z.string().trim().max(80, '예산 범위는 80자 이하로 입력하세요').optional(),
  maxStayDays: z.coerce
    .number()
    .int('체류 가능 기간은 정수로 입력하세요')
    .min(1, '체류 가능 기간은 1일 이상이어야 합니다')
    .max(180, '체류 가능 기간은 180일 이하로 입력하세요')
    .optional(),
});

export type MedicalCaseRequestInput = z.infer<typeof medicalCaseRequestSchema>;

export const medicalCategoryLabels: Record<MedicalCategory, string> = {
  screening: 'Health Screening',
  dental: 'Dental Care',
  dermatology_aesthetics: 'Dermatology & Aesthetics',
  orthopedics: 'Orthopedics',
  fertility: 'Fertility',
  advanced_therapeutics: 'Advanced Therapeutics',
};
