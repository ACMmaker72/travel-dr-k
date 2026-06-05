import { redirect } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createMedicalCase } from '@/lib/db/cases';
import { ensureUserProfile } from '@/lib/db/profiles';
import { createServerClient } from '@/lib/supabase/server';
import { medicalCaseRequestSchema, medicalCategoryLabels, medicalCategoryOptions } from '@/lib/validators/cases';

async function createMedicalCaseAction(formData: FormData) {
  'use server';

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  await ensureUserProfile(user);

  const rawMaxStayDays = formData.get('maxStayDays');
  const parsed = medicalCaseRequestSchema.safeParse({
    category: formData.get('category'),
    symptomsDescription: formData.get('symptomsDescription'),
    preferredVisitDate: formData.get('preferredVisitDate') || undefined,
    budgetRange: formData.get('budgetRange') || undefined,
    maxStayDays: rawMaxStayDays ? rawMaxStayDays : undefined,
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? '상담 신청 내용을 확인하세요';
    redirect(`/request?error=${encodeURIComponent(message)}`);
  }

  await createMedicalCase(user.id, parsed.data);
  redirect('/dashboard?case=submitted');
}

export default async function RequestPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex flex-1 justify-center p-6">
      <div className="w-full max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>의료 상담 신청</CardTitle>
            <CardDescription>
              의료 목표, 방문 가능 일정, 예산, 체류 기간을 남기면 의사 검토와 병원 매칭의 기준 케이스로 저장됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createMedicalCaseAction} className="grid gap-5">
              {params?.error && (
                <Alert variant="destructive">
                  <AlertDescription>{params.error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-1.5">
                <Label htmlFor="category">진료 카테고리</Label>
                <select
                  id="category"
                  name="category"
                  required
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue=""
                >
                  <option value="" disabled>
                    카테고리 선택
                  </option>
                  {medicalCategoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {medicalCategoryLabels[category]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="symptomsDescription">증상, 목표, 현재 상황</Label>
                <Textarea
                  id="symptomsDescription"
                  name="symptomsDescription"
                  required
                  rows={8}
                  placeholder="예: 치과 임플란트 상담을 원합니다. 최근 X-ray가 있고, 한국 방문 가능 기간은 6월 중 7일 정도입니다."
                />
                <p className="text-xs text-muted-foreground">
                  진단을 대신하지 않습니다. 의사 검토와 병원 매칭을 위한 사전 정보로 사용됩니다.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="preferredVisitDate">방문 희망 시기</Label>
                  <Input
                    id="preferredVisitDate"
                    name="preferredVisitDate"
                    placeholder="예: 2026년 7월 중"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="budgetRange">예산 범위</Label>
                  <Input id="budgetRange" name="budgetRange" placeholder="예: $2,000-$4,000" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="maxStayDays">최대 체류일</Label>
                  <Input id="maxStayDays" name="maxStayDays" type="number" min="1" max="180" placeholder="7" />
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                파일 업로드는 다음 단계에서 연결합니다. 현재는 케이스 기본 정보를 먼저 저장합니다.
              </div>

              <div className="flex justify-end">
                <Button type="submit">상담 신청 제출</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
