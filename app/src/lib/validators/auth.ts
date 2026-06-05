import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('이메일 형식이 아닙니다'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
});

export const signInSchema = z.object({
  email: z.string().email('이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, '이름을 입력하세요').max(80, '이름은 80자 이하로 입력하세요'),
  country: z.string().trim().max(80, '국가는 80자 이하로 입력하세요').optional(),
  preferredLanguage: z
    .string()
    .trim()
    .min(2, '언어 코드를 입력하세요')
    .max(20, '언어 코드는 20자 이하로 입력하세요'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
