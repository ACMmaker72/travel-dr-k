import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-2xl w-full flex flex-col gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Vibecoding</h1>
        <p className="text-muted-foreground text-lg">
          Next.js 16 · React 19 · Drizzle · Supabase · Tailwind 4
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/login">
            <Button>로그인</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline">회원가입</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
