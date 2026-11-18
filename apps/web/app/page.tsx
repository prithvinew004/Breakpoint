export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-20 sm:px-10 lg:px-16">
      <section aria-labelledby="foundation-heading" className="max-w-3xl">
        <p className="mb-6 font-mono text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Phase 0 repository foundation
        </p>
        <h1
          id="foundation-heading"
          className="text-5xl font-semibold tracking-[-0.04em] text-foreground sm:text-7xl"
        >
          Breakpoint
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
          Evidence-first web security testing, built on explicit boundaries and
          reproducible checks.
        </p>
      </section>

      <section
        aria-labelledby="scope-heading"
        className="mt-20 border-t border-border pt-8"
      >
        <h2 id="scope-heading" className="text-sm font-medium text-foreground">
          Foundation scope
        </h2>
        <ul className="mt-5 grid gap-3 text-sm leading-6 text-muted-foreground sm:grid-cols-3">
          <li>Strict workspace contracts</li>
          <li>Validated service configuration</li>
          <li>Deterministic browser quality</li>
        </ul>
      </section>
    </main>
  );
}
