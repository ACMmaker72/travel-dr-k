'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

const STORAGE_BUCKET = 'medical-records';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function buildSafeFileName(fileName: string) {
  const safeName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return safeName || 'medical-record';
}

export function AttachmentUploadForm({
  caseId,
  recordAttachment,
}: {
  caseId: string;
  recordAttachment: (values: { fileUrl: string; fileType: string }) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setError('업로드할 파일을 선택하세요.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('파일 크기는 10MB 이하만 업로드할 수 있습니다.');
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setError('로그인 세션을 확인할 수 없습니다. 다시 로그인하세요.');
          return;
        }

        const filePath = `${user.id}/${caseId}/${Date.now()}-${buildSafeFileName(file.name)}`;
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            contentType: file.type || 'application/octet-stream',
            upsert: false,
          });

        if (uploadError) {
          setError(uploadError.message);
          return;
        }

        await recordAttachment({
          fileUrl: filePath,
          fileType: file.type || 'application/octet-stream',
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        setMessage('파일이 업로드되었습니다.');
        router.refresh();
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : '파일 업로드에 실패했습니다.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border bg-muted/20 p-4">
      <div className="grid gap-2">
        <Label htmlFor="medical-record">의료 기록 파일</Label>
        <Input
          ref={fileInputRef}
          id="medical-record"
          name="medical-record"
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          이미지, PDF, Word 문서를 업로드할 수 있습니다. 최대 10MB.
        </p>
      </div>

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? '업로드 중...' : '파일 업로드'}
        </Button>
      </div>
    </form>
  );
}
