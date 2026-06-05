import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ensureUserProfile } from '@/lib/db/profiles';
import { createServerClient } from '@/lib/supabase/server';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }
  const profile = await ensureUserProfile(user);
  const canUseBackoffice = profile?.role === 'doctor' || profile?.role === 'admin';

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/dashboard" className="font-semibold">
            Travel DR.K
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost">대시보드</Button>
            </Link>
            <Link href="/request">
              <Button variant="ghost">상담 신청</Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost">프로필</Button>
            </Link>
            {canUseBackoffice && (
              <Link href="/admin/cases">
                <Button variant="ghost">백오피스</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
