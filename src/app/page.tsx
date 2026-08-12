import { site } from '@/lib/site';

// Phase A: structure only, no styling. The real home page is built in Phase C.
export default function HomePage() {
  return (
    <main>
      <h1>{site.name}</h1>
    </main>
  );
}
