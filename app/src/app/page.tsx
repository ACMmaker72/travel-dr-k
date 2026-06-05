import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ClipboardCheck,
  Clock3,
  FileText,
  HeartPulse,
  Languages,
  Plane,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const medicalCategories = [
  {
    title: 'Health Screening',
    description: 'Executive checkups, imaging, and risk-focused screenings.',
    price: 'From $480',
    stay: '1-2 days',
    documents: 'Prior results optional',
    care: 'Post-report review',
  },
  {
    title: 'Dental Care',
    description: 'Implants, prosthetics, cosmetic dentistry, and treatment planning.',
    price: 'From $750',
    stay: '3-7 days',
    documents: 'X-ray or CT',
    care: 'Follow-up plan',
  },
  {
    title: 'Dermatology & Aesthetics',
    description: 'Skin treatment, minimally invasive procedures, and recovery guidance.',
    price: 'From $320',
    stay: '1-5 days',
    documents: 'Photos, history',
    care: 'Remote check-ins',
  },
  {
    title: 'Orthopedics',
    description: 'Joint, spine, pain, and rehabilitation-oriented case review.',
    price: 'From $1,200',
    stay: '5-14 days',
    documents: 'MRI/CT reports',
    care: 'Rehab guidance',
  },
  {
    title: 'Fertility',
    description: 'Fertility consultation coordination and timeline preparation.',
    price: 'From $1,800',
    stay: '7-21 days',
    documents: 'Hormone tests',
    care: 'Cycle planning',
  },
  {
    title: 'Advanced Therapeutics',
    description: 'Specialized hospital matching for complex treatment inquiries.',
    price: 'Case review',
    stay: 'Doctor advised',
    documents: 'Full records',
    care: 'Curator follow-up',
  },
];

const processSteps = [
  {
    icon: FileText,
    title: 'Submit your case',
    text: 'Share goals, symptoms, timeline, budget, stay limits, and available records.',
  },
  {
    icon: Stethoscope,
    title: 'Doctor-led screening',
    text: 'A Korean medical curator reviews suitability, risk, missing tests, and urgency.',
  },
  {
    icon: ClipboardCheck,
    title: 'Receive a proposal',
    text: 'Get matched hospital options, preparation checklists, cost ranges, and itinerary details.',
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <section className="relative flex min-h-[88vh] overflow-hidden">
        <Image
          src="/medical-travel-hero.png"
          alt="Korean doctor and coordinator reviewing a medical travel plan with an international patient"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.88)_38%,rgba(255,255,255,0.28)_68%,rgba(255,255,255,0.08)_100%)]" />
        <div className="relative z-10 flex w-full flex-col justify-between">
          <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
            <Link href="/" className="text-lg font-semibold tracking-normal">
              Travel DR.K
            </Link>
            <nav className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost">로그인</Button>
              </Link>
              <Link href="/signup">
                <Button>상담 시작</Button>
              </Link>
            </nav>
          </header>

          <div className="mx-auto grid w-full max-w-7xl flex-1 items-center px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(320px,0.55fr)]">
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-5 h-7 rounded-md bg-white/70 px-3">
                Doctor-guided medical travel in Korea
              </Badge>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl lg:text-6xl">
                Medical travel planning with clinical review before you fly.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Travel DR.K helps international patients understand suitable Korean
                medical options, expected costs, required documents, stay duration,
                and pre/post-care steps before committing to a visit.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    상담 신청하기
                    <ArrowRight />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full bg-white/70 sm:w-auto">
                    내 케이스 보기
                  </Button>
                </Link>
              </div>
              <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-border/70 pt-5">
                <div>
                  <dt className="text-xs text-muted-foreground">Review</dt>
                  <dd className="mt-1 text-sm font-semibold">Doctor-led</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Scope</dt>
                  <dd className="mt-1 text-sm font-semibold">Pre & post-care</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Support</dt>
                  <dd className="mt-1 text-sm font-semibold">EN/KR routing</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/30 px-5 py-14 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {processSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">{step.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Explore care categories</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Start with clear costs, timing, and document requirements.
              </h2>
            </div>
            <Link href="/signup">
              <Button variant="outline">
                케이스 검토 요청
                <ArrowRight />
              </Button>
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {medicalCategories.map((category) => (
              <Card key={category.title} className="rounded-lg">
                <CardHeader>
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md border bg-muted/30 p-3">
                      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <HeartPulse className="size-3.5" />
                        Cost
                      </dt>
                      <dd className="mt-1 font-medium">{category.price}</dd>
                    </div>
                    <div className="rounded-md border bg-muted/30 p-3">
                      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock3 className="size-3.5" />
                        Stay
                      </dt>
                      <dd className="mt-1 font-medium">{category.stay}</dd>
                    </div>
                    <div className="rounded-md border bg-muted/30 p-3">
                      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FileText className="size-3.5" />
                        Documents
                      </dt>
                      <dd className="mt-1 font-medium">{category.documents}</dd>
                    </div>
                    <div className="rounded-md border bg-muted/30 p-3">
                      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Plane className="size-3.5" />
                        Care
                      </dt>
                      <dd className="mt-1 font-medium">{category.care}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-foreground px-5 py-14 text-background sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="text-sm text-background/70">Built for safer coordination</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              Separate patient exploration from medical case management.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-background/15 p-4">
              <ShieldCheck className="size-5" />
              <h3 className="mt-3 text-sm font-semibold">Case filtering</h3>
              <p className="mt-1 text-sm text-background/70">Routine, specialized, critical, or ineligible.</p>
            </div>
            <div className="rounded-lg border border-background/15 p-4">
              <Languages className="size-5" />
              <h3 className="mt-3 text-sm font-semibold">Coordination</h3>
              <p className="mt-1 text-sm text-background/70">Language, documents, dates, and logistics.</p>
            </div>
            <div className="rounded-lg border border-background/15 p-4">
              <ClipboardCheck className="size-5" />
              <h3 className="mt-3 text-sm font-semibold">Proposal loop</h3>
              <p className="mt-1 text-sm text-background/70">Hospital, cost, itinerary, and checklist.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
