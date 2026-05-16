import { cn } from "@/lib/utils";

type VisitorAvatarProps = {
  name: string;
  className?: string;
};

export const VisitorAvatar = ({ name, className }: VisitorAvatarProps) => {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-cs-line bg-cs-accent-pale font-bold text-cs-accent",
        className,
      )}
      aria-hidden
    >
      {initials || "?"}
    </span>
  );
};
