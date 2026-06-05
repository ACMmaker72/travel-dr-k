import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ensureUserProfile } from '@/lib/db/profiles';

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user ? await ensureUserProfile(user) : null;

  return (
    <main className="flex flex-1 justify-center p-6">
      <div className="grid w-full max-w-4xl gap-4">
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
            <CardTitle>상담 신청</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              다음 단계에서 의료 상담 신청 폼과 케이스 상태 추적을 연결합니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
