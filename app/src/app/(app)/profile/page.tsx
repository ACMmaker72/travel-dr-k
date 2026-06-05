import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ensureUserProfile, updateUserProfile } from '@/lib/db/profiles';
import { createServerClient } from '@/lib/supabase/server';
import { profileSchema } from '@/lib/validators/auth';

async function updateProfileAction(formData: FormData) {
  'use server';

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  await ensureUserProfile(user);

  const parsed = profileSchema.safeParse({
    fullName: formData.get('fullName'),
    country: formData.get('country') || undefined,
    preferredLanguage: formData.get('preferredLanguage'),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? '프로필 정보를 확인하세요';
    redirect(`/profile?error=${encodeURIComponent(message)}`);
  }

  await updateUserProfile(user.id, parsed.data);
  redirect('/profile?updated=1');
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; updated?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await ensureUserProfile(user);

  return (
    <main className="flex flex-1 justify-center p-6">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>프로필 설정</CardTitle>
            <CardDescription>
              상담 신청과 병원 매칭에 사용할 기본 환자 정보를 관리합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateProfileAction} className="grid gap-5">
              {params?.error && (
                <Alert variant="destructive">
                  <AlertDescription>{params.error}</AlertDescription>
                </Alert>
              )}
              {params?.updated && (
                <Alert>
                  <AlertDescription>프로필이 저장되었습니다.</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-1.5">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" value={user.email ?? ''} disabled />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="fullName">이름</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={profile?.fullName ?? ''}
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="country">국가</Label>
                <Input
                  id="country"
                  name="country"
                  defaultValue={profile?.country ?? ''}
                  placeholder="United States"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="preferredLanguage">선호 언어</Label>
                <select
                  id="preferredLanguage"
                  name="preferredLanguage"
                  defaultValue={profile?.preferredLanguage ?? 'en'}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="en">English</option>
                  <option value="ko">한국어</option>
                  <option value="ja">日本語</option>
                  <option value="zh">中文</option>
                  <option value="es">Español</option>
                  <option value="ar">العربية</option>
                </select>
              </div>

              <div className="flex justify-end">
                <Button type="submit">저장</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
