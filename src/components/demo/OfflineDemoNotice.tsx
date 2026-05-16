import Link from "next/link";
import {
  CsAuthCard,
  CsBrandMark,
  CsStandaloneShell,
} from "@/components/ui/cs-standalone-shell";

type OfflineDemoNoticeProps = {
  title: string;
  description: string;
};

export function OfflineDemoNotice({ title, description }: OfflineDemoNoticeProps) {
  return (
    <CsStandaloneShell maxWidth="480px">
      <CsAuthCard className="text-center">
        <div className="mx-auto mb-4 flex justify-center">
          <CsBrandMark />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-cs-accent">CypherSec Check-In</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-cs-text-primary">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cs-text-secondary">{description}</p>
        <Link
          href="/"
          className="cs-btn-accent mt-8 inline-flex min-h-[48px] min-w-[200px] items-center justify-center rounded-2xl px-6"
        >
          Back to home
        </Link>
        <Link href="/login" className="mt-4 block text-sm font-semibold text-cs-accent hover:underline">
          Sign in
        </Link>
      </CsAuthCard>
    </CsStandaloneShell>
  );
}
