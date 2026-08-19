import { Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { UserButton } from "@/lib/auth/gates";

export function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="h-8 w-24 animate-pulse rounded-sm bg-surface-2" />;
  }
  if (user) {
    return (
      <div className="text-fg [&_button]:text-muted [&_button]:hover:text-gold [&_span]:text-xs [&_span]:uppercase [&_span]:tracking-wider">
        <UserButton />
      </div>
    );
  }
  return (
    <Link
      to="/login"
      className="inline-flex h-9 items-center border border-border px-3 text-[11px] font-medium uppercase tracking-[0.16em] text-fg transition-colors hover:border-gold hover:text-gold"
    >
      Sign in
    </Link>
  );
}
