import { Nav } from "@/components/nav";

export default function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <Nav />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
