import { redirect } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  createCaseProposal,
  listAllMedicalCasesForBackoffice,
  updateCaseReview,
} from '@/lib/db/cases';
import { ensureUserProfile } from '@/lib/db/profiles';
import { createServerClient } from '@/lib/supabase/server';
import {
  caseReviewSchema,
  caseStatusOptions,
  doctorSeverityOptions,
  proposalSchema,
} from '@/lib/validators/backoffice';
import { medicalCategoryLabels, type MedicalCategory } from '@/lib/validators/cases';

const statusLabels = {
  submitted: 'Submitted',
  under_review: 'Medical Review',
  proposed: 'Matching Proposal',
  confirmed: 'Confirmed Itinerary',
  completed: 'Post-Care',
};

async function requireBackofficeAccess() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await ensureUserProfile(user);
  if (!profile || !['doctor', 'admin'].includes(profile.role)) {
    redirect('/dashboard?error=backoffice');
  }

  return { user, profile };
}

async function updateReviewAction(formData: FormData) {
  'use server';

  await requireBackofficeAccess();

  const caseId = String(formData.get('caseId') ?? '');
  const parsed = caseReviewSchema.safeParse({
    status: formData.get('status'),
    doctorSeverity: formData.get('doctorSeverity') || undefined,
    doctorNotes: formData.get('doctorNotes') || undefined,
  });

  if (!caseId || !parsed.success) {
    const message = parsed.success
      ? '케이스를 찾지 못했습니다'
      : parsed.error.issues[0]?.message ?? '검토 내용을 확인하세요';
    redirect(`/admin/cases?error=${encodeURIComponent(message)}`);
  }

  await updateCaseReview(caseId, parsed.data);
  redirect('/admin/cases?updated=review');
}

async function createProposalAction(formData: FormData) {
  'use server';

  await requireBackofficeAccess();

  const caseId = String(formData.get('caseId') ?? '');
  const rawEstimatedCost = formData.get('estimatedCost');
  const parsed = proposalSchema.safeParse({
    hospitalName: formData.get('hospitalName'),
    estimatedCost: rawEstimatedCost ? rawEstimatedCost : undefined,
    treatmentDate: formData.get('treatmentDate') || undefined,
    accommodationNotes: formData.get('accommodationNotes') || undefined,
    transferNotes: formData.get('transferNotes') || undefined,
    checklist: formData.get('checklist') || undefined,
    adminNotes: formData.get('adminNotes') || undefined,
  });

  if (!caseId || !parsed.success) {
    const message = parsed.success
      ? '케이스를 찾지 못했습니다'
      : parsed.error.issues[0]?.message ?? '제안서 내용을 확인하세요';
    redirect(`/admin/cases?error=${encodeURIComponent(message)}`);
  }

  await createCaseProposal(caseId, parsed.data);
  redirect('/admin/cases?updated=proposal');
}

export default async function AdminCasesPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; updated?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireBackofficeAccess();
  const cases = await listAllMedicalCasesForBackoffice();

  return (
    <main className="flex flex-1 justify-center p-6">
      <div className="grid w-full max-w-6xl gap-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm text-muted-foreground">Backoffice</p>
            <h1 className="text-3xl font-semibold tracking-normal">의료 케이스 검토</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              현재 권한: <span className="font-medium text-foreground">{profile.role}</span>
            </p>
          </div>
          <Badge variant="outline">{cases.length} cases</Badge>
        </div>

        {params?.error && (
          <Alert variant="destructive">
            <AlertDescription>{params.error}</AlertDescription>
          </Alert>
        )}
        {params?.updated === 'review' && (
          <Alert>
            <AlertDescription>의료 검토 내용이 저장되었습니다.</AlertDescription>
          </Alert>
        )}
        {params?.updated === 'proposal' && (
          <Alert>
            <AlertDescription>제안서가 저장되고 케이스 상태가 Matching Proposal로 변경되었습니다.</AlertDescription>
          </Alert>
        )}

        {cases.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>접수된 케이스가 없습니다</CardTitle>
              <CardDescription>환자가 상담 신청을 제출하면 이곳에 표시됩니다.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          cases.map(({ case: medicalCase, patient }) => (
            <Card key={medicalCase.id}>
              <CardHeader>
                <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle>
                        {medicalCategoryLabels[medicalCase.category as MedicalCategory]}
                      </CardTitle>
                      <Badge variant="outline">{statusLabels[medicalCase.status]}</Badge>
                      {medicalCase.doctorSeverity && (
                        <Badge variant="secondary">{medicalCase.doctorSeverity}</Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1">
                      {patient.fullName} · {patient.country || 'country unset'} ·{' '}
                      {patient.preferredLanguage}
                    </CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {medicalCase.createdAt.toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm leading-6">{medicalCase.symptomsDescription}</p>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                    <div>
                      <span className="text-muted-foreground">방문 시기: </span>
                      {medicalCase.preferredVisitDate || '미입력'}
                    </div>
                    <div>
                      <span className="text-muted-foreground">예산: </span>
                      {medicalCase.budgetRange || '미입력'}
                    </div>
                    <div>
                      <span className="text-muted-foreground">체류: </span>
                      {medicalCase.maxStayDays ? `${medicalCase.maxStayDays}일` : '미입력'}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <form action={updateReviewAction} className="grid gap-3 rounded-lg border p-4">
                    <input type="hidden" name="caseId" value={medicalCase.id} />
                    <h2 className="font-medium">Doctor review</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="grid gap-1.5">
                        <Label htmlFor={`status-${medicalCase.id}`}>상태</Label>
                        <select
                          id={`status-${medicalCase.id}`}
                          name="status"
                          defaultValue={medicalCase.status}
                          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {caseStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {statusLabels[status]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor={`severity-${medicalCase.id}`}>Severity</Label>
                        <select
                          id={`severity-${medicalCase.id}`}
                          name="doctorSeverity"
                          defaultValue={medicalCase.doctorSeverity ?? ''}
                          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">Unassigned</option>
                          {doctorSeverityOptions.map((severity) => (
                            <option key={severity} value={severity}>
                              {severity}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor={`notes-${medicalCase.id}`}>Doctor notes</Label>
                      <Textarea
                        id={`notes-${medicalCase.id}`}
                        name="doctorNotes"
                        defaultValue={medicalCase.doctorNotes ?? ''}
                        rows={5}
                        placeholder="Clinical suitability, missing tests, preferred hospital type..."
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" variant="outline">검토 저장</Button>
                    </div>
                  </form>

                  <form action={createProposalAction} className="grid gap-3 rounded-lg border p-4">
                    <input type="hidden" name="caseId" value={medicalCase.id} />
                    <h2 className="font-medium">Proposal draft</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="grid gap-1.5">
                        <Label htmlFor={`hospital-${medicalCase.id}`}>병원명</Label>
                        <Input id={`hospital-${medicalCase.id}`} name="hospitalName" />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor={`cost-${medicalCase.id}`}>예상 비용 USD</Label>
                        <Input id={`cost-${medicalCase.id}`} name="estimatedCost" type="number" min="1" step="0.01" />
                      </div>
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor={`date-${medicalCase.id}`}>치료 일정</Label>
                      <Input id={`date-${medicalCase.id}`} name="treatmentDate" placeholder="예: 2026년 7월 12일-14일" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor={`accommodation-${medicalCase.id}`}>숙박 메모</Label>
                      <Textarea id={`accommodation-${medicalCase.id}`} name="accommodationNotes" rows={3} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor={`transfer-${medicalCase.id}`}>이동 메모</Label>
                      <Textarea id={`transfer-${medicalCase.id}`} name="transferNotes" rows={3} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor={`checklist-${medicalCase.id}`}>준비 체크리스트</Label>
                      <Textarea
                        id={`checklist-${medicalCase.id}`}
                        name="checklist"
                        rows={4}
                        placeholder="한 줄에 하나씩 입력"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor={`admin-${medicalCase.id}`}>관리자 메모</Label>
                      <Textarea id={`admin-${medicalCase.id}`} name="adminNotes" rows={3} />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">제안서 저장</Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
