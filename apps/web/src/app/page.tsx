export default function Home() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center px-6">
      <div className="max-w-sm space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">
          Nomi
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Workspace scaffold ready
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Task 1 bootstraps the app shell. Task 2 will replace this with the
          first product surface.
        </p>
      </div>
    </main>
  );
}
