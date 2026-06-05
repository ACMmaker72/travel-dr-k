import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ensureUserProfile } from '@/lib/db/profiles';
import { acceptPatientProposal, listPatientCasesWithProposals } from '@/lib/db/cases';
import { medicalCategoryLabels, type MedicalCategory } from '@/lib/validators/cases';

const statusLabels = {
  submitted: 'Submitted',
  under_review: 'Medical Review',
  proposed: 'Matching Proposal',
  confirmed: 'Confirmed Itinerary',
  completed: 'Post-Care',
};

const statusFlow = [
  'submitted',
  'under_review',
  'proposed',
  'confirmed',
  'completed',
] as const;

async function acceptProposalAction(formData: FormData) {
  'use server';

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const proposalId = String(formData.get('proposalId') ?? '');
  if (!proposalId) {
    return;
  }

  await acceptPatientProposal(user.id, proposalId);
  redirect('/dashboard?proposal=accepted');
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ case?: string; error?: string; proposal?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user ? await ensureUserProfile(user) : null;
  const cases = user ? await listPatientCasesWithProposals(user.id) : [];

  return (
    <main className="flex flex-1 justify-center p-6">
      <div className="grid w-full max-w-4xl gap-4">
        {params?.case === 'submitted' && (
          <Alert>
            <AlertDescription>상담 신청이 접수되었습니다. 의료 검토 단계로 이동합니다.</AlertDescription>
          </Alert>
        )}
        {params?.error === 'backoffice' && (
          <Alert variant="destructive">
            <AlertDescription>백오피스는 doctor 또는 admin 권한이 필요합니다.</AlertDescription>
          </Alert>
        )}
        {params?.proposal === 'accepted' && (
          <Alert>
            <AlertDescription>제안서를 수락했습니다. 일정 확정 단계로 이동합니다.</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>대시보드</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  로그인 사용자: <span className="font-medium text-foreground">{user?.email}</span>
                </p>
              </div>
              <Badge variant="outline">{profile?.role ?? 'patient'}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">이름</p>
                <p className="mt-1 font-medium">{profile?.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">국가</p>
                <p className="mt-1 font-medium">{profile?.country || '미입력'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">선호 언어</p>
                <p className="mt-1 font-medium">{profile?.preferredLanguage}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Link href="/profile">
                <Button variant="outline">프로필 수정</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <CardTitle>내 상담 신청</CardTitle>
              <Link href="/request">
                <Button>새 상담 신청</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {cases.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  아직 상담 신청이 없습니다. 첫 케이스를 접수하세요.
                </p>
                <Link href="/request" className="mt-4 inline-flex">
                  <Button variant="outline">상담 신청하기</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {cases.map(({ case: medicalCase, proposals }) => {
                  const currentStatusIndex = statusFlow.indexOf(medicalCase.status);
                  return (
                    <div key={medicalCase.id} className="rounded-lg border p-4">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium">
                              {medicalCategoryLabels[medicalCase.category as MedicalCategory]}
                            </h3>
                            <Badge variant="outline">{statusLabels[medicalCase.status]}</Badge>
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {medicalCase.symptomsDescription}
                          </p>
                        </div>
                        <div className="shrink-0 text-sm text-muted-foreground">
                          {medicalCase.createdAt.toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Link href={`/cases/${medicalCase.id}/attachments`}>
                          <Button variant="outline" size="sm">
                            첨부파일 관리
                          </Button>
                        </Link>
                      </div>
                      <div className="mt-4 grid gap-2 sm:grid-cols-5">
                        {statusFlow.map((status, index) => (
                          <div
                            key={status}
                            className={
                              index <= currentStatusIndex
                                ? 'rounded-md border border-primary/20 bg-primary/5 p-2'
                                : 'rounded-md border bg-muted/30 p-2'
                            }
                          >
                            <p className="text-xs font-medium">{statusLabels[status]}</p>
                          </div>
                        ))}
                      </div>
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
                      {proposals.length > 0 && (
                        <div className="mt-4 grid gap-3">
                          <h4 className="text-sm font-medium">제안서</h4>
                          {proposals.map((proposal) => {
                            const details = proposal.itineraryDetails;
                            return (
                              <div key={proposal.id} className="rounded-lg border bg-muted/20 p-4">
                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="font-medium">{proposal.hospitalName}</p>
                                      {proposal.isAccepted && <Badge>Accepted</Badge>}
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      예상 비용:{' '}
                                      {proposal.estimatedCost
                                        ? `$${Number(proposal.estimatedCost).toLocaleString()}`
                                        : '미입력'}
                                    </p>
                                  </div>
                                  {!proposal.isAccepted && (
                                    <form action={acceptProposalAction}>
                                      <input type="hidden" name="proposalId" value={proposal.id} />
                                      <Button type="submit" variant="outline">
                                        제안 수락
                                      </Button>
                                    </form>
                                  )}
                                </div>

                                {details?.dates?.treatment && (
                                  <p className="mt-3 text-sm">
                                    <span className="text-muted-foreground">치료 일정: </span>
                                    {details.dates.treatment}
                                  </p>
                                )}
                                {details?.accommodation?.notes && (
                                  <p className="mt-2 text-sm">
                                    <span className="text-muted-foreground">숙박: </span>
                                    {details.accommodation.notes}
                                  </p>
                                )}
                                {details?.transfers?.[0]?.notes && (
                                  <p className="mt-2 text-sm">
                                    <span className="text-muted-foreground">이동: </span>
                                    {details.transfers[0].notes}
                                  </p>
                                )}
                                {details?.checklist && details.checklist.length > 0 && (
                                  <div className="mt-3">
                                    <p className="text-xs font-medium text-muted-foreground">
                                      준비 체크리스트
                                    </p>
                                    <ul className="mt-1 list-inside list-disc text-sm">
                                      {details.checklist.map((item) => (
                                        <li key={item}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {proposal.adminNotes && (
                                  <p className="mt-3 text-sm text-muted-foreground">
                                    {proposal.adminNotes}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
