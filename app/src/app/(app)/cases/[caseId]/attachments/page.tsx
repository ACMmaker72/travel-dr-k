import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createServerClient } from '@/lib/supabase/server';
import { addCaseAttachment, listCaseAttachments } from '@/lib/db/cases';
import { medicalCategoryLabels, type MedicalCategory } from '@/lib/validators/cases';
import { AttachmentUploadForm } from './upload-form';

const statusLabels = {
  submitted: 'Submitted',
  under_review: 'Medical Review',
  proposed: 'Matching Proposal',
  confirmed: 'Confirmed Itinerary',
  completed: 'Post-Care',
};

export default async function CaseAttachmentsPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const caseWithAttachments = await listCaseAttachments(user.id, caseId);

  if (!caseWithAttachments) {
    notFound();
  }

  async function recordAttachment(values: { fileUrl: string; fileType: string }) {
    'use server';

    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    await addCaseAttachment(user.id, caseId, values);
    revalidatePath(`/cases/${caseId}/attachments`);
    revalidatePath('/dashboard');
  }

  const { medicalCase, attachments } = caseWithAttachments;

  return (
    <main className="flex flex-1 justify-center p-6">
      <div className="grid w-full max-w-4xl gap-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-muted-foreground">Medical records</p>
            <h1 className="text-2xl font-semibold">첨부파일 관리</h1>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">대시보드로 이동</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <CardTitle>
                  {medicalCategoryLabels[medicalCase.category as MedicalCategory]}
                </CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  {medicalCase.symptomsDescription}
                </p>
              </div>
              <Badge variant="outline">{statusLabels[medicalCase.status]}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <AttachmentUploadForm caseId={caseId} recordAttachment={recordAttachment} />

            <div className="grid gap-3">
              <h2 className="text-sm font-medium">업로드된 파일</h2>
              {attachments.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  아직 업로드된 파일이 없습니다.
                </div>
              ) : (
                <div className="grid gap-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="grid gap-1 rounded-lg border bg-muted/20 p-3 sm:grid-cols-[1fr_auto]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{attachment.fileUrl}</p>
                        <p className="text-xs text-muted-foreground">{attachment.fileType}</p>
                      </div>
                      <p className="text-xs text-muted-foreground sm:text-right">
                        {attachment.uploadedAt.toLocaleString('ko-KR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
