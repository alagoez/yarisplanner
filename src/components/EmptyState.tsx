export default function EmptyState({ children }: { children: string }) {
  return <p className="rounded-2xl bg-surface-2/60 px-4 py-3 text-[14px] text-muted">{children}</p>
}
