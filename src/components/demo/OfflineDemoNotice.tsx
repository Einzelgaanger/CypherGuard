import Link from "next/link";

type OfflineDemoNoticeProps = {
  title: string;
  description: string;
};

export function OfflineDemoNotice({ title, description }: OfflineDemoNoticeProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cs-base px-6 py-16 text-center text-cs-text-primary homestead-pattern">
      <p className="text-xs font-semibold uppercase tracking-widest text-cs-accent">CypherSec · demo</p>
      <h1 className="mt-4 max-w-md font-display text-2xl font-bold text-cs-text-primary">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cs-text-secondary">{description}</p>
      <Link
        href="/"
        className="mt-8 min-h-[48px] min-w-[200px] rounded-2xl bg-cs-accent px-6 py-3 text-sm font-semibold text-white shadow-md hover:brightness-105"
      >
        Back to home
      </Link>
      <Link href="/login" className="mt-4 text-sm font-medium text-cs-accent hover:underline">
        Role picker
      </Link>
    </div>
  );
}
